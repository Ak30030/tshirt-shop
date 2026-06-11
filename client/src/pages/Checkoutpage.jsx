import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/useCart";
import "./Checkoutpage.css";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, cartTotal, cartCount, clearCart, loading, error } = useCart();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "",
    payment: "card"
  });
  const [status, setStatus] = useState({
    submitting: false,
    submitted: false,
    message: ""
  });

  const deliveryFee = cartTotal > 210 ? 0 : 10;
  const orderTotal = cartTotal + deliveryFee;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (cartCount === 0) {
      setStatus({ submitting: false, submitted: false, message: "Your cart is empty. Add items before checkout." });
      return;
    }

    const requiredFields = ["fullName", "email", "phone", "address", "city", "zip", "country"];
    const missingField = requiredFields.find((field) => !form[field].trim());

    if (missingField) {
      setStatus({ submitting: false, submitted: false, message: "Please complete all required fields before placing your order." });
      return;
    }

    setStatus({ submitting: true, submitted: false, message: "" });

    setTimeout(() => {
      clearCart();
      setStatus({
        submitting: false,
        submitted: true,
        message: "Your order has been placed successfully! Thank you for shopping with us."
      });
    }, 900);
  };

  if (loading) {
    return (
      <div className="checkout-loading">
        <div className="checkout-spinner"></div>
        <div>Loading checkout...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="checkout-error">
        <h2>Unable to load checkout</h2>
        <p>{error}</p>
        <button className="checkout-action-btn" onClick={() => navigate('/cart')}>Return to Cart</button>
      </div>
    );
  }

  if (status.submitted) {
    return (
      <div className="checkout-root">
        <nav className="checkout-nav">
          <div className="nav-brand" onClick={() => navigate('/products')}>DICES<span>HUB</span></div>
        </nav>

        <div className="checkout-confirmation">
          <h1>Order Confirmed</h1>
          <p>{status.message}</p>
          <button className="place-order-btn" onClick={() => navigate('/products')}>Continue Shopping</button>
        </div>
      </div>
    );
  }

  if (!cartCount || cartCount === 0) {
    return (
      <div className="checkout-root">
        <nav className="checkout-nav">
          <div className="nav-brand" onClick={() => navigate('/products')}>DICES<span>HUB</span></div>
          <div className="nav-links">
            <button className="checkout-action-btn" onClick={() => navigate('/products')}>Browse Products</button>
          </div>
        </nav>

        <div className="checkout-empty">
          <h2>Your checkout is empty</h2>
          <p>Add a few items to your cart and return here to complete your purchase.</p>
          <button className="place-order-btn" onClick={() => navigate('/products')}>Shop Now</button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-root">
      <nav className="checkout-nav">
        <div className="nav-brand" onClick={() => navigate('/products')}>DICES<span>HUB</span></div>
        <div className="nav-links">
          <button className="checkout-action-btn" onClick={() => navigate('/cart')}>Back to Cart</button>
          <button className="checkout-action-btn" onClick={() => navigate('/products')}>Continue Shopping</button>
        </div>
      </nav>

      <header className="checkout-header">
        <div className="checkout-eyebrow">Final Step</div>
        <h1 className="checkout-title">Complete your order</h1>
        <p className="checkout-copy">Review your items, choose your shipping details, and place your order with confidence.</p>
      </header>

      <main className="checkout-main">
        <section className="checkout-card">
          <h2>Shipping Details</h2>
          {status.message && <p className="summary-note">{status.message}</p>}
          <form className="checkout-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <label htmlFor="fullName">Full Name</label>
              <input id="fullName" name="fullName" type="text" value={form.fullName} onChange={handleChange} />
            </div>

            <div className="form-grid-two">
              <div className="form-row">
                <label htmlFor="email">Email</label>
                <input id="email" name="email" type="email" value={form.email} onChange={handleChange} />
              </div>
              <div className="form-row">
                <label htmlFor="phone">Phone</label>
                <input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange} />
              </div>
            </div>

            <div className="form-row">
              <label htmlFor="address">Street Address</label>
              <input id="address" name="address" type="text" value={form.address} onChange={handleChange} />
            </div>

            <div className="form-grid-two">
              <div className="form-row">
                <label htmlFor="city">City</label>
                <input id="city" name="city" type="text" value={form.city} onChange={handleChange} />
              </div>
              <div className="form-row">
                <label htmlFor="state">State / Region</label>
                <input id="state" name="state" type="text" value={form.state} onChange={handleChange} />
              </div>
            </div>

            <div className="form-grid-three">
              <div className="form-row">
                <label htmlFor="zip">Postal Code</label>
                <input id="zip" name="zip" type="text" value={form.zip} onChange={handleChange} />
              </div>
              <div className="form-row">
                <label htmlFor="country">Country</label>
                <input id="country" name="country" type="text" value={form.country} onChange={handleChange} />
              </div>
            </div>

            <div className="form-row">
              <label>Payment Method</label>
              <div className="payment-options">
                <label>
                  <input type="radio" name="payment" value="card" checked={form.payment === "card"} onChange={handleChange} />
                  Credit / Debit Card
                </label>
                <label>
                  <input type="radio" name="payment" value="paypal" checked={form.payment === "paypal"} onChange={handleChange} />
                  PayPal
                </label>
                <label>
                  <input type="radio" name="payment" value="cod" checked={form.payment === "cod"} onChange={handleChange} />
                  Cash on Delivery
                </label>
              </div>
            </div>

            <button className="place-order-btn" type="submit" disabled={status.submitting}>
              {status.submitting ? "Placing Order..." : "Place Order"}
            </button>
          </form>
        </section>

        <aside className="checkout-summary-card">
          <h2>Order Summary</h2>
          <div className="summary-items">
            {cart.map((item) => (
              <div className="summary-item" key={item._id}>
                <div>
                  <div className="summary-name">{item.name}</div>
                  <div className="summary-meta">{item.quantity} × ₵{item.price.toFixed(2)} • {item.size}</div>
                </div>
                <div className="summary-price">₵{(item.price * item.quantity).toFixed(2)}</div>
              </div>
            ))}
          </div>

          <div className="summary-divider"></div>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>₵{cartTotal.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Delivery fee</span>
            <span>{deliveryFee === 0 ? "Free" : `₵${deliveryFee.toFixed(2)}`}</span>
          </div>
          <div className="summary-divider"></div>
          <div className="summary-total-row">
            <span>Total</span>
            <span>₵{orderTotal.toFixed(2)}</span>
          </div>
          <p className="summary-note">{deliveryFee === 0 ? "You qualify for free delivery." : "Orders over ₵210 get free delivery."}</p>
        </aside>
      </main>
    </div>
  );
}
