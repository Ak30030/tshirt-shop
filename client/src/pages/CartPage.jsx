import { useNavigate } from "react-router-dom";
import { useCart } from "../context/useCart";
import './CartPage.css';

export default function CartPage() {
  const navigate = useNavigate();
  const { cart, cartCount, cartTotal, removeFromCart, updateQuantity, clearCart, loading, error } = useCart();

  if (loading) return (
    <div className="cart-loading">
      <div className="loading-spinner">
        <div className="loading-text">Loading cart...</div>
      </div>
    </div>
  );

  if (error) return (
    <div className="cart-error">
      <div className="error-text">{error}</div>
      <button className="shop-btn" onClick={() => navigate('/products')}>Back to Products</button>
    </div>
  );

  return (
    <div className="cart-root">
      <nav className="navbar">
        <div className="nav-brand" onClick={() => navigate('/products')}>DICES<span>HUB</span></div>
        <div className="nav-links">
          <button className="nav-link" onClick={() => navigate('/')}>Back to Shop</button>
        </div>
      </nav>

      <div className="cart-header">
        <div className="cart-eyebrow">Your Selection</div>
        <h1 className="cart-title">Shopping Cart</h1>
        <p className="cart-subtitle">{cartCount} {cartCount === 1 ? 'item' : 'items'}</p>
      </div>

      <div className="cart-container">
        {!Array.isArray(cart) || cart.length === 0 ? (
          <div className="empty-cart">
            <div className="empty-icon">🛒</div>
            <h2 className="empty-title">Your cart is empty.</h2>
            <p className="empty-sub">Add some t-shirts to get started</p>
            <button className="shop-btn" onClick={() => navigate('/products')}>Browse Collection</button>
          </div>
        ) : (
          <div className="cart-layout">
            <div className="cart-items">
              {Array.isArray(cart) && cart.map((item) => (
                <div className="cart-item" key={item._id}>
                  <img className="item-image" src={item.image} alt={item.name} />
                  <div className="items-details">
                    <div className="item-name">{item.name}</div>
                    <div className="item-meta">
                      Size: <span>{item.size}</span> · Color: <span>{item.color}</span>
                    </div>
                    <div className="item-price">₵{item.price.toFixed(2)}</div>
                    <div className="item-actions">
                      <div className="quantity-control">
                        <button
                          className="qty-btn"
                          onClick={() => item.quantity > 1 ? updateQuantity(item._id, item.quantity - 1) : removeFromCart(item._id)}
                        >
                          -
                        </button>
                        <span className="qty-value">{item.quantity}</span>
                        <button
                          className="qty-btn"
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                      <button
                        className="remove-btn"
                        onClick={() => removeFromCart(item._id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <div className="item-total">₵{(item.price * item.quantity).toFixed(2)}</div>
                </div>
              ))}

              <button className="clear-btn" onClick={clearCart}>Clear Cart</button>
            </div>

            <div className="cart-summary">
              <h2 className="summary-title">Order Summary</h2>

              <div className="summary-rows">
                {Array.isArray(cart) && cart.map((item) => (
                  <div className="summary-row" key={item._id}>
                    <span>{item.name} x {item.quantity}</span>
                    <span>₵{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="summary-divider"></div>

              <div className="summary-row">
                <span>Subtotal</span>
                <span>₵{cartTotal.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span>{cartTotal > 210 ? 'Free' : '₵5.99'}</span>
              </div>

              <div className="summary-divider"></div>

              <div className="summary-total">
                <span>Total</span>
                <span>₵{(cartTotal > 210 ? cartTotal : cartTotal + 15).toFixed(2)}</span>
              </div>

              {cartTotal > 210 && (
                <div className="shipping-note">Add ₵{(210 - cartTotal).toFixed(2)} more for free shipping!</div>
              )}

              <button className="checkout-btn">Proceed to Checkout</button>
              <button className="continue-btn" onClick={() => navigate('/products')}>
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
