import { useContext } from "react";
import CartContext from "../components/Shared/Card/CartProvider";
// import { CartContext } from "../providers/CartProvider"; // path adjust koro

const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }

  return context;
};

export default useCart;