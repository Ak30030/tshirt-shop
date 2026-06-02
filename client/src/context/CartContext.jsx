import { useState, useEffect } from "react";
import { CartContext } from "./cart-context";

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);

  const getToken = () =>{
    const token = localStorage.getItem("token");
    if(!token) return null;
    return Array.from(token).filter(ch => ch.charCodeAt(0) <= 127).join("");
  };

  


  const addToCart = async (product, size,) => {
    const token = getToken();
    if (!token) {
      alert("Please login to add items to cart");
      return;
    }
    try {
      const res = await fetch(`/api/cart/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: product._id,
          name: product.name,
          price: product.price,
          image: product.image,
          size,
          quantity: 1
        })
      });
      const data = await res.json();
      console.log('Add to cart response:', data);
      setCart(Array.isArray(data.items) ? data.items : []);
    } catch (err) {
      console.error("Error adding to cart:", err);
    }
  };

  const removeFromCart = async (itemId) => {
    const token = getToken();
    try {
      const res = await fetch(`/api/cart/remove/${itemId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setCart(Array.isArray(data.items) ? data.items : []);
    } catch (err) {
      console.error("Error removing from cart:", err);
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    const token = getToken();
    try {
      const res = await fetch(`/api/cart/update/${itemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ quantity })
      });
      const data = await res.json();
      setCart(Array.isArray(data.items) ? data.items : []);
    } catch (err) {
      console.error("Error updating cart:", err);
    }
  };

  const clearCart = async () => {
    const token = getToken();
    try {
      await fetch(`/api/cart/clear`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      setCart([]);
    } catch (err) {
      console.error("Error clearing cart:", err);
    }
  };

  const cartCount = Array.isArray(cart) ? cart.reduce((total, item) => total + item.quantity, 0) : 0;
  const cartTotal = Array.isArray(cart) ? cart.reduce((total, item) => total + item.price * item.quantity, 0) : 0;

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    const doFetch = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/cart`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setCart(Array.isArray(data.items) ? data.items : []);
      } catch (err) {
        console.error("Error fetching cart:", err);
        setCart([]);
      } finally {
        setLoading(false);
      }
    };

    doFetch();
  }, []);

  return (
    <CartContext.Provider value={{
      cart, loading, cartCount, cartTotal,
      addToCart, removeFromCart, updateQuantity, clearCart
    }}>
      {children}
    </CartContext.Provider>
  );
}
// `useCart` hook is provided from `useCart.js` to avoid exporting non-component values