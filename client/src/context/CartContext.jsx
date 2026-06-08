import { useState, useEffect } from "react";
import { CartContext } from "./cart-context";
import api from "../utils/api";

const GUEST_CART_KEY = "guest_cart";

const getGuestCart = () => {
  try {
    return JSON.parse(localStorage.getItem(GUEST_CART_KEY)) || [];
  } catch {
    return [];
  }
};

const saveGuestCart = (cart) => {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
};

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);

  const getToken = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    return Array.from(token).filter(ch => ch.charCodeAt(0) <= 127).join("");
  };

  const isLoggedIn = () => !!getToken();

  // ─── ADD TO CART ───────────────────────────────────────────
  const addToCart = async (product, size) => {
    if (!isLoggedIn()) {
      // Guest: save to localStorage
      const guestCart = getGuestCart();
      const existing = guestCart.find(
        (item) => item.productId === product._id && item.size === size
      );
      if (existing) {
        existing.quantity += 1;
      } else {
        guestCart.push({
          productId: product._id,
          _id: product._id + size, // temp id
          name: product.name,
          price: product.price,
          image: product.image,
          size,
          quantity: 1
        });
      }
      saveGuestCart(guestCart);
      setCart([...guestCart]);
      return;
    }

    // Logged in: save to backend
    try {
      const res = await api(`/cart/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`
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
      setCart(Array.isArray(data.items) ? data.items : []);
    } catch (err) {
      console.error("Error adding to cart:", err);
    }
  };

  // ─── REMOVE FROM CART ──────────────────────────────────────
  const removeFromCart = async (itemId) => {
    if (!isLoggedIn()) {
      const updated = getGuestCart().filter(item => item._id !== itemId);
      saveGuestCart(updated);
      setCart(updated);
      return;
    }
    try {
      const res = await api(`/cart/remove/${itemId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      setCart(Array.isArray(data.items) ? data.items : []);
    } catch (err) {
      console.error("Error removing from cart:", err);
    }
  };

  // ─── UPDATE QUANTITY ───────────────────────────────────────
  const updateQuantity = async (itemId, quantity) => {
    if (!isLoggedIn()) {
      const guestCart = getGuestCart().map(item =>
        item._id === itemId ? { ...item, quantity } : item
      );
      saveGuestCart(guestCart);
      setCart(guestCart);
      return;
    }
    try {
      const res = await api(`/cart/update/${itemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({ quantity })
      });
      const data = await res.json();
      setCart(Array.isArray(data.items) ? data.items : []);
    } catch (err) {
      console.error("Error updating cart:", err);
    }
  };

  // ─── CLEAR CART ────────────────────────────────────────────
  const clearCart = async () => {
    if (!isLoggedIn()) {
      localStorage.removeItem(GUEST_CART_KEY);
      setCart([]);
      return;
    }
    try {
      await api(`/cart/clear`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setCart([]);
    } catch (err) {
      console.error("Error clearing cart:", err);
    }
  };

  // ─── SYNC GUEST CART → BACKEND ON LOGIN ───────────────────
  const syncGuestCartToBackend = async () => {
    const guestCart = getGuestCart();
    if (guestCart.length === 0) return;

    const token = getToken();
    for (const item of guestCart) {
      try {
        await api(`/cart/add`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            productId: item.productId,
            name: item.name,
            price: item.price,
            image: item.image,
            size: item.size,
            quantity: item.quantity
          })
        });
      } catch (err) {
        console.error("Error syncing guest cart:", err);
      }
    }
    localStorage.removeItem(GUEST_CART_KEY); // clear guest cart after sync
  };

  // ─── LOAD CART ON MOUNT 
  useEffect(() => {
    const token = getToken();

    if (!token) {
      // Load guest cart from localStorage
      setCart(getGuestCart());
      return;
    }

    const doFetch = async () => {
      try {
        setLoading(true);
        // Sync any guest items first
        await syncGuestCartToBackend();

        const res = await api(`/cart`, {
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

  const cartCount = Array.isArray(cart)
    ? cart.reduce((total, item) => total + item.quantity, 0)
    : 0;

  const cartTotal = Array.isArray(cart)
    ? cart.reduce((total, item) => total + item.price * item.quantity, 0)
    : 0;

  return (
    <CartContext.Provider value={{
      cart, loading, cartCount, cartTotal,
      addToCart, removeFromCart, updateQuantity, clearCart
    }}>
      {children}
    </CartContext.Provider>
  );
}