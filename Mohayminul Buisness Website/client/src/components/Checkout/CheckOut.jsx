import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { FiPlus, FiMinus, FiTrash2, FiCheckCircle } from "react-icons/fi";

import Container from "../../components/Shared/Container";
import LoadingSpinner from "../Shared/LoadingSpinner";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import useAuth from "../../hooks/useAuth";
import useCart from "../../hooks/useCart";
import { imageUpload } from "../../api/utils";

const CheckOut = () => {
  const { id } = useParams(); // ache = Buy Now mode (extra product), nai = shudhu Cart
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();
  const { user } = useAuth();
  const {
    cartItems,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const isBuyNow = !!id;

  const [paymentMethod, setPaymentMethod] = useState("cash"); // default cash
  const [loading, setLoading] = useState(false);
  const [screenshotUploading, setScreenshotUploading] = useState(false);
  const [screenshotUrl, setScreenshotUrl] = useState("");

  // Buy Now product er jonno local quantity (cart e nai, tai alada state)
  const [buyNowQty, setBuyNowQty] = useState(1);

  // ================= SUCCESS MODAL (guest user-der jonno) =================
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState("");

  // ================= BUY NOW: single product fetch =================
  const { data: product = {}, isLoading } = useQuery({
    queryKey: ["checkout-product", id],
    enabled: !!id, // shudhu Buy Now mode e chalbe
    queryFn: async () => {
      const { data } = await axios(
        `${import.meta.env.VITE_API_URL}/products/${id}`,
      );
      return data;
    },
  });

  if (isBuyNow && isLoading) {
    return <LoadingSpinner />;
  }

  // Kono product e nai (cart o khali, buy now o nai) hole checkout e kichu nai
  const totalItemsCount = cartItems.length + (isBuyNow ? 1 : 0);

  if (totalItemsCount === 0 && !showSuccessModal) {
    return (
      <Container>
        <div className="py-20 text-center">
          <h2 className="text-xl font-semibold text-gray-700">
            Your cart is empty
          </h2>
          <p className="text-gray-500 mt-2">
            Add products to your cart before checkout.
          </p>
        </div>
      </Container>
    );
  }

  // ================= SUBTOTAL (cart items + buy now product, sob mile) =================
  const cartTotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const buyNowTotal = isBuyNow ? (product.price || 0) * buyNowQty : 0;

  const subtotal = cartTotal + buyNowTotal;

  const baseShippingCost = 120;
  const shippingDiscount =
    paymentMethod === "instant" ? Math.round(baseShippingCost * 0.1) : 0;
  const shippingCost = baseShippingCost; // Order Summary-te full charge dekhabe
  const discount = shippingDiscount; // shudhu delivery charge er upor 10% discount
  const totalCost = subtotal + shippingCost - discount;

  // ================= BUY NOW QTY CONTROL =================
  const increaseBuyNowQty = () => {
    setBuyNowQty((prev) =>
      product.quantity ? Math.min(prev + 1, product.quantity) : prev + 1,
    );
  };

  const decreaseBuyNowQty = () => {
    setBuyNowQty((prev) => Math.max(prev - 1, 1));
  };

  // ================= SCREENSHOT UPLOAD (instant payment, optional) =================
  const handleScreenshotChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setScreenshotUploading(true);
      const url = await imageUpload(file);
      setScreenshotUrl(url);
      toast.success("Screenshot uploaded");
    } catch (error) {
      console.log(error);
      toast.error("Failed to upload screenshot");
    } finally {
      setScreenshotUploading(false);
    }
  };

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = e.target;

    // Instant payment hole transaction ID must lagbe
    if (paymentMethod === "instant" && !form.transactionId.value.trim()) {
      toast.error("Please enter your bKash/Nagad transaction ID");
      return;
    }

    setLoading(true);

    const customer = {
      name: form.name.value,
      phone: form.phone.value,
      email: form.email.value || user?.email,
    };

    const shipping = {
      address: form.address.value,
      district: form.district.value,
      thana: form.thana.value,
    };

    const paymentDetails =
      paymentMethod === "instant"
        ? {
            number: form.paymentNumber.value,
            transactionId: form.transactionId.value,
            screenshot: screenshotUrl || "",
          }
        : null;

    try {
      // Cart theke asa products
      const productsFromCart = cartItems.map((item) => ({
        productId: item._id,
        name: item.name,
        image: item.image,
        price: item.price,
        category: item.category,
        quantity: item.quantity,
      }));

      // Buy Now theke asa product (thakle)
      const productsFromBuyNow = isBuyNow
        ? [
            {
              productId: product._id,
              name: product.name,
              image: product.image,
              price: product.price,
              category: product.category,
              quantity: buyNowQty,
            },
          ]
        : [];

      const allProducts = [...productsFromBuyNow, ...productsFromCart];

      const orderData = {
        products: allProducts,
        customer,
        shipping,
        paymentMethod,
        paymentDetails,
        subtotal,
        shippingCost,
        discount,
        totalCost,
        status: "pending",
        createdAt: new Date(),
      };

      const { data } = await axiosSecure.post("/orders", orderData);

      if (data.insertedId) {
        // Order confirm howar por cart khali kore dao (buy now product cart e chilo na)
        if (cartItems.length > 0) clearCart();

        if (user) {
          // Login kora user -> direct My Orders page e, sekhaneo dekhte parbe
          toast.success("Order placed successfully!");
          navigate("/dashboard/my-orders");
        } else {
          // Guest user -> "My Orders" page nai dekhar moto, tai alert modal dekhabe
          setPlacedOrderId(data.insertedId);
          setShowSuccessModal(true);
        }
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Helmet>
        <title>Checkout | Web Developer BD</title>
      </Helmet>

      {/* ================= SUCCESS MODAL (guest order confirm) ================= */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[999999999] flex items-center justify-center px-4">
          <div
            onClick={() => {
              setShowSuccessModal(false);
              navigate("/");
            }}
            className="absolute inset-0 bg-black/60"
          />

          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <FiCheckCircle size={36} className="text-green-500" />
            </div>

            <h2 className="text-xl font-bold text-gray-800 mb-2">
              আপনার অর্ডার কনফার্ম হয়েছে!
            </h2>

            <p className="text-gray-500 text-sm mb-1">
              ধন্যবাদ! আমরা শীঘ্রই আপনার সাথে যোগাযোগ করে ডেলিভারি নিশ্চিত করবো।
            </p>

            {placedOrderId && (
              <p className="text-xs text-gray-400 mt-3 mb-5 break-all">
                Order ID: {placedOrderId}
              </p>
            )}

            <button
              type="button"
              onClick={() => {
                setShowSuccessModal(false);
                navigate("/");
              }}
              className="w-full mt-2 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 rounded-md transition"
            >
              হোম পেজে ফিরে যান
            </button>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8 py-10"
      >
        {/* ================= LEFT SIDE ================= */}
        <div className="lg:col-span-2 space-y-8">
          {/* Personal Details */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-5">
              Personal Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  name="name"
                  defaultValue={user?.displayName}
                  placeholder="Enter your name"
                  required
                  className="w-full h-11 border border-gray-300 rounded-md px-4 outline-none focus:border-yellow-400"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="Enter your phone number"
                  required
                  className="w-full h-11 border border-gray-300 rounded-md px-4 outline-none focus:border-yellow-400"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm text-gray-600 mb-2">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  name="email"
                  defaultValue={user?.email}
                  placeholder="Enter your email address (optional)"
                  className="w-full h-11 border border-gray-300 rounded-md px-4 outline-none focus:border-yellow-400"
                />
              </div>
            </div>
          </div>

          {/* Shipping Details */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-5">
              Shipping Details
            </h2>

            <div className="space-y-5">
              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  Village/Street Address
                </label>
                <input
                  type="text"
                  name="address"
                  placeholder="Enter your village/street address"
                  required
                  className="w-full h-11 border border-gray-300 rounded-md px-4 outline-none focus:border-yellow-400"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm text-gray-600 mb-2">
                    District
                  </label>
                  <select
                    name="district"
                    required
                    className="w-full h-11 border border-gray-300 rounded-md px-4 outline-none bg-white"
                  >
                    <option value="">Select District</option>
                    <option value="Dhaka">Dhaka</option>
                    <option value="Chittagong">Chittagong</option>
                    <option value="Rajshahi">Rajshahi</option>
                    <option value="Khulna">Khulna</option>
                    <option value="Sylhet">Sylhet</option>
                    <option value="Barisal">Barisal</option>
                    <option value="Rangpur">Rangpur</option>
                    <option value="Mymensingh">Mymensingh</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-2">
                    Thana/Upazilla
                  </label>
                  <input
                    type="text"
                    name="thana"
                    placeholder="Enter your thana"
                    required
                    className="w-full h-11 border border-gray-300 rounded-md px-4 outline-none focus:border-yellow-400"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-5">
              Payment Method
            </h2>

            <div className="border border-gray-300 rounded-md p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Cash on Delivery — default */}
                <label
                  className={`relative cursor-pointer border rounded-lg p-5 ${
                    paymentMethod === "cash"
                      ? "border-yellow-400 bg-yellow-50"
                      : "border-gray-200"
                  }`}
                >
                  <span className="absolute -top-3 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                    Charge - ৳120
                  </span>

                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Cash on Home Delivery</span>
                    <input
                      type="radio"
                      name="payment"
                      value="cash"
                      checked={paymentMethod === "cash"}
                      onChange={() => setPaymentMethod("cash")}
                    />
                  </div>
                </label>

                {/* Instant Payment */}
                <label
                  className={`relative cursor-pointer border rounded-lg p-5 ${
                    paymentMethod === "instant"
                      ? "border-yellow-400 bg-yellow-50"
                      : "border-gray-200"
                  }`}
                >
                  <span className="absolute -top-3 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                    10% Discount
                  </span>

                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Instant Payment</span>
                    <input
                      type="radio"
                      name="payment"
                      value="instant"
                      checked={paymentMethod === "instant"}
                      onChange={() => setPaymentMethod("instant")}
                    />
                  </div>
                </label>
              </div>

              {/* ================= INSTANT PAYMENT EXTRA FIELDS ================= */}
              {paymentMethod === "instant" && (
                <div className="mt-5 pt-5 border-t border-gray-200 space-y-4">
                  <p className="text-sm text-gray-600">
                    bKash/Nagad এ Send Money করুন{" "}
                    <span className="font-semibold text-yellow-600">
                      01XXXXXXXXX
                    </span>{" "}
                    নম্বরে, তারপর নিচের তথ্যগুলো দিন। স্ক্রিনশট দিলে ট্রানজাকশন
                    আইডি (Transaction ID) দেওয়া অপশনাল (ঐচ্ছিক)।
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-2">
                        Your bKash/Nagad Number
                      </label>
                      <input
                        type="text"
                        name="paymentNumber"
                        placeholder="e.g. 01XXXXXXXXX"
                        required
                        className="w-full h-11 border border-gray-300 rounded-md px-4 outline-none focus:border-yellow-400"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-600 mb-2">
                        Transaction ID
                      </label>
                      <input
                        type="text"
                        name="transactionId"
                        placeholder="e.g. 8N7A5X2K1P"
                        className="w-full h-11 border border-gray-300 rounded-md px-4 outline-none focus:border-yellow-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-2">
                      Payment Screenshot
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleScreenshotChange}
                      className="text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-yellow-500 file:text-white file:cursor-pointer hover:file:bg-yellow-600"
                    />
                    {screenshotUploading && (
                      <p className="text-xs text-gray-400 mt-1">Uploading...</p>
                    )}
                    {screenshotUrl && !screenshotUploading && (
                      <img
                        src={screenshotUrl}
                        alt="Payment screenshot"
                        className="w-24 h-24 object-cover rounded-md mt-2 border"
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ================= RIGHT SIDE ================= */}
        <div>
          <div className="border border-gray-300 rounded-lg p-6 sticky top-5">
            <h2 className="text-lg font-semibold mb-6">Order Summary</h2>

            {/* Products */}
            <div className="space-y-4 border-b pb-5 max-h-80 overflow-y-auto">
              {/* ============ BUY NOW PRODUCT (jodi thake) ============ */}
              {isBuyNow && (
                <div className="flex gap-3 pb-3 border-b border-dashed">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded-md flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-xs text-yellow-700 font-medium">
                      Buy Now
                    </p>
                    <p className="text-sm font-semibold text-yellow-600 mt-0.5">
                      ৳{Number(product.price).toLocaleString()}
                    </p>

                    <div className="flex items-center mt-2">
                      <div className="flex items-center border border-gray-300 rounded-md">
                        <button
                          type="button"
                          onClick={decreaseBuyNowQty}
                          disabled={buyNowQty <= 1}
                          className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <FiMinus size={12} />
                        </button>

                        <span className="w-7 text-center text-xs font-medium">
                          {buyNowQty}
                        </span>

                        <button
                          type="button"
                          onClick={increaseBuyNowQty}
                          disabled={
                            product.quantity
                              ? buyNowQty >= product.quantity
                              : false
                          }
                          className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <FiPlus size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ============ CART ITEMS (age theke add kora) ============ */}
              {cartItems.map((item) => (
                <div key={item._id} className="flex gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-md flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium line-clamp-1">
                      {item.name}
                    </h3>
                    <p className="text-sm font-semibold text-yellow-600 mt-0.5">
                      ৳{Number(item.price).toLocaleString()}
                    </p>

                    <div className="flex items-center justify-between mt-2">
                      {/* Quantity +/- */}
                      <div className="flex items-center border border-gray-300 rounded-md">
                        <button
                          type="button"
                          onClick={() => decreaseQuantity(item._id)}
                          disabled={item.quantity <= 1}
                          className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <FiMinus size={12} />
                        </button>

                        <span className="w-7 text-center text-xs font-medium">
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() => increaseQuantity(item._id)}
                          disabled={
                            item.stock ? item.quantity >= item.stock : false
                          }
                          className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <FiPlus size={12} />
                        </button>
                      </div>

                      {/* Remove */}
                      <button
                        type="button"
                        onClick={() => removeFromCart(item._id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="space-y-4 mt-6">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>৳{subtotal.toLocaleString()}</span>
              </div>

              <div className="flex justify-between">
                <span>Shipping Cost</span>
                <span>৳{shippingCost}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-৳{discount.toLocaleString()}</span>
                </div>
              )}

              <hr />

              <div className="flex justify-between font-bold text-lg">
                <span>TOTAL COST</span>
                <span>৳{totalCost.toLocaleString()}</span>
              </div>
            </div>

            {/* Confirm */}
            <button
              type="submit"
              disabled={loading || screenshotUploading}
              className="w-full mt-8 h-12 rounded-md bg-yellow-500 hover:bg-yellow-600 text-white font-semibold transition disabled:opacity-50"
            >
              {loading ? "Processing..." : "Confirm Order"}
            </button>
          </div>
        </div>
      </form>
    </Container>
  );
};

export default CheckOut;
