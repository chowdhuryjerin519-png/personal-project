import { createContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import CartDrawer from "./CartDrawer";

const CartContext = createContext(null);
const CART_STORAGE_KEY = "easybuy-cart";

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false); // NEW: drawer open/close

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  // ================= DRAWER CONTROL =================
  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen((prev) => !prev);

  // ================= ADD TO CART =================
  const addToCart = (product, qty = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item._id === product._id);
      const stock = product.quantity ?? 99;

      if (existing) {
        return prev.map((item) =>
          item._id === product._id
            ? { ...item, quantity: Math.min(item.quantity + qty, stock) }
            : item,
        );
      }

      return [
        ...prev,
        {
          _id: product._id,
          name: product.name,
          image: product.image,
          price: product.price,
          originalPrice: product.originalPrice || null,
          category: product.category,
          mainCategory: product.mainCategory,
          stock,
          quantity: Math.min(qty, stock),
        },
      ];
    });
  };

  // ================= QUANTITY +/- =================
  const increaseQuantity = (id) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item._id === id
          ? { ...item, quantity: Math.min(item.quantity + 1, item.stock || 99) }
          : item,
      ),
    );
  };

  const decreaseQuantity = (id) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item._id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item,
      ),
    );
  };

  // ================= REMOVE =================
  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter((item) => item._id !== id));
  };

  const clearCart = () => setCartItems([]);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        clearCart,
        cartCount,
        cartTotal,
        isCartOpen,
        openCart,
        closeCart,
        toggleCart,
      }}
    >
      {children}
      <CartDrawer /> {/* drawer sob page e available thakbe */}
    </CartContext.Provider>
  );
};

CartProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default CartContext;
