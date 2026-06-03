import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/useCart";
import './Checkoutpage.css';
import api from "../utils/api";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, cartTotal, clearCart } = useCart();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [order, setOrder] = useState(null);
  

  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    region: '',
    deliveryMethod: 'delivery',
    paymentMethod: 'cash',
    momoNumber: '',
    notes: ''
  });

  const token = localStorage.getItem("token");
console.log('Token:', token);

  const deliveryFee =form.deliveryMethod === 'pickup' ? 0 : (cartTotal > 210 ? 0 : 15);
  const totalAmount = cartTotal + deliveryFee;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(null);
  };

  const validateStep1 = () => {
    if (!form.fullName) return 'Please enter your full name';
    if (!form.phone) return 'Please enter your phone number';
    if (form.deliveryMethod === 'delivery' && !form.address) return 'Please enter your delivery address';
    if (form.deliveryMethod === 'delivery' && !form.city) return 'Please enter your city';
    if (form.deliveryMethod === 'delivery' && !form.region) return 'Please select your region';
    return null;
  };

  const validateStep2 = () => {
    if (form.paymentMethod === 'momo' && !form.momoNumber) return 'Please enter your Momo number';
    return null;
  };

  const handleNext = () => {
    const err = validateStep1();
    if (err) { setError(err); return; }
    setStep(2);
    setError(null);
  };

  const handlePlaceOrder = async () => {
    console.log('Token:', token);
    console.log('Cart:', cart);
    const err = validateStep2();
    if (err) { setError(err); return; }
    setLoading(true);
    try {
      const res = await api('/orders', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          items: cart,
          totalAmount,
          paymentMethod: form.paymentMethod,
          deliveryMethod: form.deliveryMethod,
          deliveryAddress: {
            fullName: form.fullName,
            phone: form.phone,
            address: form.address,
            city: form.city,
            region: form.region
          },
          momoNumber: form.momoNumber,
          notes: form.notes
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to place order');
      setOrder(data.order);
      await clearCart();
      setStep(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="checkout-root">
        <div className="checkout-denied">
          <div className="denied-title">Please Login</div>
          <div className="denied-sub">You need to be logged in to checkout</div>
          <button className="denied-btn" onClick={() => navigate('/')}>Go to Login</button>
        </div>
      </div>
    );
  }

  if (cart.length === 0 && step !== 3) {
    return (
      <div className="checkout-root">
        <div className="checkout-denied">
          <div className="denied-title">Your Cart is Empty</div>
          <div className="denied-sub">Add some products before checking out</div>
          <button className="denied-btn" onClick={() => navigate('/products')}>Browse Products</button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-root">

      {/* NAVBAR */}
      <nav className="checkout-nav">
        <div className="nav-brand" onClick={() => navigate('/products')}>DICES<span>HUB</span></div>
        <div className="nav-steps">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>
            <div className="step-num">1</div>
            <div className="step-label">Delivery</div>
          </div>
          <div className="step-line"></div>
          <div className={`step ${step >= 2 ? 'active' : ''}`}>
            <div className="step-num">2</div>
            <div className="step-label">Payment</div>
          </div>
          <div className="step-line"></div>
          <div className={`step ${step >= 3 ? 'active' : ''}`}>
            <div className="step-num">3</div>
            <div className="step-label">Confirmed</div>
          </div>
        </div>
      </nav>

      {/* STEP 3 — CONFIRMED */}
      {step === 3 && (
        <div className="confirmed-wrap">
          <div className="confirmed-card">
            <div className="confirmed-icon">✅</div>
            <h1 className="confirmed-title">Order Placed!</h1>
            <p className="confirmed-sub">Thank you for your purchase. We will contact you shortly.</p>
            {order && (
              <div className="confirmed-details">
                <div className="confirmed-row">
                  <span>Order ID</span>
                  <span>#{order._id.slice(-8).toUpperCase()}</span>
                </div>
                <div className="confirmed-row">
                  <span>Payment</span>
                  <span>{order.paymentMethod === 'cash' ? 'Cash on Delivery' : 'Mobile Money'}</span>
                </div>
                <div className="confirmed-row">
                  <span>Delivery</span>
                  <span>{order.deliveryMethod === 'delivery' ? 'Home Delivery' : 'Store Pickup'}</span>
                </div>
                <div className="confirmed-row total">
                  <span>Total</span>
                  <span>₵{order.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            )}
            {form.paymentMethod === 'momo' && (
              <div className="momo-instruction">
                Your order is confirmed and will be ready for pickup soon.
              </div>
            )}
            <div className="confirmed-btns">
              <button className="primary-btn" onClick={() => navigate('/products')}>Continue Shopping</button>
            </div>
          </div>
        </div>
      )}

      {/* STEPS 1 & 2 */}
      {step !== 3 && (
        <div className="checkout-layout">

          {/* LEFT — FORM */}
          <div className="checkout-form-wrap">

            {/* STEP 1 */}
            {step === 1 && (
              <div className="form-section">
                <div className="section-eyebrow">Step 1 of 2</div>
                <h2 className="section-title">Delivery Information</h2>
                {error && <div className="error-msg">{error}</div>}

                <div className="method-selector">
                  <div className="method-label">Delivery Method</div>
                  <div className="method-options">
                    <div
                      className={`method-card ${form.deliveryMethod === 'delivery' ? 'active' : ''}`}
                      onClick={() => setForm({ ...form, deliveryMethod: 'delivery' })}
                    >
                  
                      <div className="method-name">Home Delivery</div>
                      <div className="method-sub">Delivered to your doorstep</div>
                    </div>
                    <div
                      className={`method-card ${form.deliveryMethod === 'pickup' ? 'active' : ''}`}
                      onClick={() => setForm({ ...form, deliveryMethod: 'pickup' })}
                    >
                    
                      <div className="method-name">Store Pickup</div>
                      <div className="method-sub">Pick up from our shop</div>
                    </div>
                  </div>
                </div>

                <div className="form-grid">
                  <div className="field full">
                    <label>Full Name</label>
                    <input name="fullName" value={form.fullName} onChange={handleChange} placeholder="Enter your full name" />
                  </div>
                  <div className="field full">
                    <label>Phone Number</label>
                    <input name="phone" value={form.phone} onChange={handleChange} placeholder="0XX XXX XXXX" />
                  </div>

                  {form.deliveryMethod === 'delivery' && (
                    <>
                      <div className="field full">
                        <label>Delivery Address</label>
                        <input name="address" value={form.address} onChange={handleChange} placeholder="Street address, house number" />
                      </div>
                      <div className="field">
                        <label>City</label>
                        <input name="city" value={form.city} onChange={handleChange} placeholder="Kumasi" />
                      </div>
                      <div className="field">
                        <label>Region</label>
                        <select name="region" value={form.region} onChange={handleChange}>
                          <option value="">Select Region</option>
                          <option>Ashanti</option>
                          <option>Greater Accra</option>
                          <option>Eastern</option>
                          <option>Western</option>
                          <option>Central</option>
                          <option>Volta</option>
                          <option>Brong-Ahafo</option>
                          <option>Northern</option>
                          <option>Upper East</option>
                          <option>Upper West</option>
                        </select>
                      </div>
                    </>
                  )}

                  <div className="field full">
                    <label>Order Notes (Optional)</label>
                    <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Any special instructions..." />
                  </div>
                </div>

                <button className="next-btn" onClick={handleNext}>Continue to Payment →</button>
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <div className="form-section">
                <div className="section-eyebrow">Step 2 of 2</div>
                <h2 className="section-title">Payment Method</h2>
                {error && <div className="error-msg">{error}</div>}

                <div className="method-selector">
                  <div className="method-options">
                    <div
                      className={`method-card ${form.paymentMethod === 'cash' ? 'active' : ''}`}
                      onClick={() => setForm({ ...form, paymentMethod: 'cash' })}
                    >
                      
                      <div className="method-name">Cash on Delivery</div>
                      <div className="method-sub">Pay with cash upon delivery</div>
                    </div>
                    <div
                      className={`method-card ${form.paymentMethod === 'momo' ? 'active' : ''}`}
                      onClick={() => setForm({ ...form, paymentMethod: 'momo' })}
                    >
                      
                      <div className="method-name">Mobile Money</div>
                      <div className="method-sub">MTN / TELECEL</div>
                    </div>
                  </div>
                </div>

                {form.paymentMethod === 'momo' && (
                  <div className="field full" style={{ marginTop: '20px' }}>
                    <label>Mobile Money Number</label>
                    <input name="momoNumber" value={form.momoNumber} onChange={handleChange} placeholder="0XX XXX XXXX" />
                  </div>
                )}

                <div className="step2-btns">
                  <button className="back-btn" onClick={() => setStep(1)}>← Back</button>
                  <button className="place-btn" onClick={handlePlaceOrder} disabled={loading}>
                    {loading ? 'Placing Order...' : 'Place Order'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT — ORDER SUMMARY */}
          <div className="checkout-summary">
            <div className="summary-title">Order Summary</div>
            <div className="summary-items">
              {cart.map(item => (
                <div className="summary-item" key={item._id}>
                  <img className="summary-img" src={item.image} alt={item.name}
                    onError={e => { e.target.src = 'https://via.placeholder.com/60x70?text=T'; }} />
                  <div className="summary-item-details">
                    <div className="summary-item-name">{item.name}</div>
                    <div className="summary-item-meta">Size: {item.size} · Qty: {item.quantity}</div>
                    <div className="summary-item-price">₵{(item.price * item.quantity).toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="summary-divider"></div>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₵{cartTotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Delivery Fee</span>
              <span>{deliveryFee === 0 ? 'Free' :'₵' + deliveryFee.toFixed(2)}</span>
            </div>
            <div className="summary-divider"></div>
            <div className="summary-total">
              <span>Total</span>
              <span>₵{totalAmount.toFixed(2)}</span>
            </div>
            {cartTotal < 210 && (
              <div className="free-shipping-note">
                Add ₵{(210 - cartTotal).toFixed(2)} more for free delivery!
              </div>
            )}
            <div className="delivery-info">
              {form.deliveryMethod === 'pickup'
                ? 'Store Pickup — No delivery fee'
                : deliveryFee === 0
                  ? ' Free delivery on this order!'
                  : ' Delivery within 2-3 business days'}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}