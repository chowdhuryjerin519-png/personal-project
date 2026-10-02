import Container from "../../components/Shared/Container";
import { Helmet } from "react-helmet-async";
import Heading from "../../components/Shared/Heading";
import Button from "../../components/Shared/Button/Button";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { FiShare2 } from "react-icons/fi";
import LoadingSpinner from "../../components/Shared/LoadingSpinner";
import useCart from "../../hooks/useCart";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("summary");
  const { addToCart, openCart } = useCart();

  const { data: product = [], isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data } = await axios(
        `${import.meta.env.VITE_API_URL}/products/${id}`,
      );
      return data;
    },
  });

  const {
    _id,
    category,
    description,
    image,
    price,
    originalPrice,
    name,
    quantity,
    seller,
    specifications = [],
    authorName,
    authorBio,
    publisher,
    previewPdfUrl,
  } = product;

  if (isLoading) return <LoadingSpinner></LoadingSpinner>;

  const hasDiscount = originalPrice && Number(originalPrice) > Number(price);
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  // ================= ADD TO CART =================
  const handleAddToCart = () => {
    if (quantity <= 0) {
      toast.error("Out of stock");
      return;
    }
    addToCart(product, 1);
    openCart();
  };

  // ================= SHARE =================
  const handleShare = async () => {
    const shareUrl = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title: name, url: shareUrl });
      } catch {
        // user cancelled share — kichu korar dorkar nai
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied!");
    }
  };

  const tabs = [
    { key: "summary", label: "Summary" },
    { key: "specification", label: "Specification" },
    { key: "author", label: "Author" },
  ];

  return (
    <Container>
      <Helmet>
        <title>{name || "Product"}</title>
      </Helmet>

      <div className="mx-auto py-6 md:py-14 flex flex-col lg:flex-row justify-between w-full gap-12">
        {/* ================= IMAGE ================= */}
        <div className="flex flex-col gap-6 flex-1">
          <div className="w-full overflow-hidden rounded-xl relative">
            {hasDiscount && (
              <div className="absolute top-3 left-3 z-10 w-14 h-14 rounded-full bg-red-500 text-white flex flex-col items-center justify-center text-xs font-bold leading-tight shadow">
                <span>{discountPercent}%</span>
                <span>OFF</span>
              </div>
            )}
            <img className="object-cover w-full" src={image} alt={name} />
          </div>
        </div>

        {/* ================= INFO ================= */}
        <div className="md:gap-10 flex-1">
          <Heading title={name} subtitle={`Category: ${category}`} />

          {/* By / Publisher line */}
          {(authorName || publisher) && (
            <p className="text-sm text-gray-500 mt-1">
              {authorName && (
                <span>
                  By:{" "}
                  <span className="text-yellow-600 font-medium">
                    {authorName}
                  </span>
                </span>
              )}
              {authorName && publisher && <span className="mx-2">•</span>}
              {publisher && (
                <span>
                  Publisher:{" "}
                  <span className="text-yellow-600 font-medium">
                    {publisher}
                  </span>
                </span>
              )}
            </p>
          )}

          <hr className="my-6" />

          <div className="flex flex-row items-center gap-2 text-xl font-semibold">
            <div>Seller: {seller?.name}</div>
            <img
              className="rounded-full"
              height="30"
              width="30"
              alt="Avatar"
              referrerPolicy="no-referrer"
              src={seller?.image}
            />
          </div>
          <hr className="my-6" />

          <p className="font-light text-neutral-500">
            Quantity: {quantity} Units Left Only!
          </p>
          <hr className="my-6" />

          {/* ================= PRICE ================= */}
          <div className="flex items-center gap-3">
            {hasDiscount && (
              <span className="text-lg text-gray-400 line-through">
                ৳{Number(originalPrice).toLocaleString()}
              </span>
            )}
            <p className="font-bold text-3xl text-gray-700">
              ৳{Number(price).toLocaleString()}
            </p>
          </div>

          {hasDiscount && (
            <p className="text-sm text-green-600 mt-1">
              You Save ৳{(originalPrice - price).toLocaleString()} (
              {discountPercent}%)
            </p>
          )}

          {/* ================= ACTION BUTTONS ================= */}
          <div className="flex items-center gap-3 mt-5">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={quantity <= 0}
              className="flex-1 border border-yellow-500 text-yellow-600 hover:bg-yellow-500 hover:text-white py-3 rounded-md transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add To Cart
            </button>

            <div className="flex-1">
              <Button
                onClick={() => navigate(`/checkout/${_id}`)}
                label={quantity > 0 ? "Buy Now" : "Out Of Stock"}
                disabled={quantity <= 0}
              />
            </div>

            <button
              type="button"
              onClick={handleShare}
              title="Share"
              className="w-11 h-11 flex items-center justify-center border border-gray-300 rounded-md text-gray-600 hover:border-yellow-500 hover:text-yellow-600 transition"
            >
              <FiShare2 size={18} />
            </button>
          </div>

          {/* ================= PREVIEW PDF ================= */}
          {previewPdfUrl && (
            <button
              type="button"
              onClick={() =>
                window.open(previewPdfUrl, "_blank", "noopener,noreferrer")
              }
              className="w-full mt-3 border border-gray-300 text-gray-600 hover:bg-gray-100 py-2.5 rounded-md transition text-sm"
            >
              একটু পড়ে দেখুন
            </button>
          )}

          <hr className="my-6" />

          {/* ================= TABS ================= */}
          <div>
            <div className="flex border-b border-gray-200">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-5 py-2.5 text-sm font-medium -mb-px border-b-2 transition ${
                    activeTab === tab.key
                      ? "border-yellow-500 text-yellow-600"
                      : "border-transparent text-gray-500 hover:text-yellow-600"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="py-6 text-neutral-600 text-base leading-relaxed">
              {/* Summary */}
              {activeTab === "summary" && (
                <p className="whitespace-pre-line">
                  {description || "No summary available."}
                </p>
              )}

              {/* Specification */}
              {activeTab === "specification" && (
                <>
                  {specifications.length > 0 ? (
                    <table className="w-full text-sm">
                      <tbody>
                        {specifications.map((spec, index) => (
                          <tr
                            key={index}
                            className={index % 2 === 0 ? "bg-gray-50" : ""}
                          >
                            <td className="py-2.5 px-3 font-medium text-gray-700 w-1/3">
                              {spec.label}
                            </td>
                            <td className="py-2.5 px-3 text-yellow-600">
                              {spec.value}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-gray-400">No specification available.</p>
                  )}
                </>
              )}

              {/* Author */}
              {activeTab === "author" && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {authorName || "Unknown Author"}
                  </h3>
                  <p className="whitespace-pre-line">
                    {authorBio || "No author information available."}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default ProductDetails;
