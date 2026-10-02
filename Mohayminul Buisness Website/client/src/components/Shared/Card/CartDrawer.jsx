import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import { FiPlus, FiMinus, FiTrash2, FiX, FiShoppingBag } from "react-icons/fi";
import useCart from "../../../hooks/useCart";

const CartDrawer = () => {
  const navigate = useNavigate();
  const {
    cartItems,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    cartTotal,
    isCartOpen,
    closeCart,
  } = useCart();

  if (!isCartOpen) return null;

  const handlePurchase = () => {
    closeCart();
    navigate("/checkout");
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999999]">
      {/* ================= OVERLAY ================= */}
      <div onClick={closeCart} className="absolute inset-0 bg-black/50" />

      {/* =================================================
          DRAWER
          Mobile  -> top e, full width
          Desktop -> right side e, full height
      ================================================= */}
      <div
        className="
          absolute
          top-0 left-0 right-0
          sm:left-auto sm:right-0
          w-full sm:w-[420px]
          max-h-[85vh] sm:max-h-full sm:h-full
          bg-white
          shadow-2xl
          rounded-b-2xl sm:rounded-none
          flex flex-col
          overflow-hidden
        "
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-5 py-4 border-b bg-gray-900 text-white flex-shrink-0">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <FiShoppingBag /> My Cart
          </h2>

          <button
            type="button"
            onClick={closeCart}
            className="text-2xl leading-none hover:text-yellow-400"
          >
            <FiX />
          </button>
        </div>

        {/* ITEMS */}
        <div className="flex-1 overflow-y-auto">
          {cartItems.length === 0 ? (
            <div className="p-10 text-center">
              <FiShoppingBag size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">Your cart is empty</p>
              <Link
                to="/products"
                onClick={closeCart}
                className="inline-block mt-4 text-yellow-600 font-medium hover:underline"
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="divide-y">
              {cartItems.map((item) => (
                <div key={item._id} className="flex gap-3 p-4">
                  <Link
                    to={`/product/${item._id}`}
                    onClick={closeCart}
                    className="w-16 h-16 flex-shrink-0 rounded-md overflow-hidden bg-gray-50"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </Link>

                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/product/${item._id}`}
                      onClick={closeCart}
                      className="text-sm font-medium text-gray-900 hover:text-yellow-600 line-clamp-2"
                    >
                      {item.name}
                    </Link>

                    <p className="text-yellow-600 font-semibold text-sm mt-1">
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
          )}
        </div>

        {/* FOOTER */}
        {cartItems.length > 0 && (
          <div className="border-t p-4 flex-shrink-0 bg-white">
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-600 font-medium">Subtotal</span>
              <span className="text-lg font-bold text-gray-800">
                ৳{cartTotal.toLocaleString()}
              </span>
            </div>

            <button
              type="button"
              onClick={handlePurchase}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 rounded-md transition"
            >
              Purchase
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
};

export default CartDrawer;
