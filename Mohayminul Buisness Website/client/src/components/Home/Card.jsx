import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useCart from "../../hooks/useCart";

const Card = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const {
    name,
    category,
    mainCategory,
    price,
    originalPrice,
    image,
    quantity,
    _id,
  } = product || {};

  const hasDiscount = originalPrice && Number(originalPrice) > Number(price);
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  const goToDetails = () => navigate(`/product/${_id}`);

  const handleAddToCart = (e) => {
    e.stopPropagation();

    if (quantity <= 0) {
      toast.error("Out of stock");
      return;
    }

    addToCart(product, 1);
    toast.success("Added to cart");
  };

  return (
    <div
      onClick={goToDetails}
      className="relative bg-white border border-gray-200 rounded-md overflow-hidden hover:shadow-lg transition cursor-pointer"
    >
      {/* Discount Ribbon */}
      {hasDiscount && (
        <div className="absolute top-2 left-2 z-10 w-11 h-11 rounded-full bg-red-500 text-white flex flex-col items-center justify-center text-[10px] font-bold leading-tight shadow">
          <span>{discountPercent}%</span>
          <span>OFF</span>
        </div>
      )}

      {/* Image */}
      <div className="h-52 w-full overflow-hidden">
        <img
          src={image}
          alt={name}
          className="h-full w-full object-cover hover:scale-105 transition duration-300"
        />
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="text-base font-medium text-gray-900 hover:text-yellow-600 line-clamp-2">
          {name}
        </h3>

        <p className="text-xs text-gray-400 mt-2">
          {mainCategory} {category && `› ${category}`}
        </p>

        {/* Price */}
        <div className="mt-3 flex items-center gap-2">
          {hasDiscount && (
            <span className="text-sm text-gray-400 line-through">
              ৳{Number(originalPrice).toLocaleString()}
            </span>
          )}
          <span className="text-lg font-semibold text-yellow-600">
            ৳{Number(price).toLocaleString()}
          </span>
        </div>

        {/* Add To Cart */}
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={quantity <= 0}
          className="w-full mt-2 border border-yellow-500 text-yellow-600 hover:bg-yellow-500 hover:text-white py-2.5 rounded-md transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {quantity > 0 ? "Add To Cart" : "Out Of Stock"}
        </button>

        {/* Buy Now */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/checkout/${_id}`);
          }}
          disabled={quantity <= 0}
          className="w-full mt-2 bg-yellow-500 text-white hover:bg-yellow-600 py-2.5 rounded-md transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Buy Now
        </button>
      </div>
    </div>
  );
};

Card.propTypes = {
  product: PropTypes.shape({
    name: PropTypes.string,
    category: PropTypes.string,
    mainCategory: PropTypes.string,
    quantity: PropTypes.number,
    price: PropTypes.number,
    originalPrice: PropTypes.number,
    image: PropTypes.string,
    previewPdfUrl: PropTypes.string,
    _id: PropTypes.string,
  }).isRequired,
};

export default Card;
