import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProfilePage.css';
import api from '../utils/api';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const user = JSON.parse(localStorage.getItem("user") || '{}');
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) { navigate('/'); return; }
    const fetchOrders = async () => {
      try {
        const res = await api('/api/orders/myorders', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch orders');
        const data = await res.json();
        setOrders(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [navigate, token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate('/');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'confirmed': return '#3b82f6';
      case 'shipped': return '#8b5cf6';
      case 'delivered': return '#10b981';
      case 'cancelled': return '#ef4444';
      default: return '#999';
    }
  };

  return (
    <div className="profile-root">

      {/* NAVBAR */}
      <nav className="profile-nav">
        <div className="nav-brand" onClick={() => navigate('/products')}>
          DICES<span>HUB</span>
        </div>
        <div className="nav-right">
          <button className="nav-link" onClick={() => navigate('/products')}>Shop</button>
          <button className="nav-link" onClick={() => navigate('/cart')}>Cart</button>
          {user?.isAdmin && (
            <button className="nav-link" onClick={() => navigate('/admin')}>Admin</button>
          )}
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      {/* CONTAINER */}
      <div className="profile-container">

        {/* PROFILE CARD */}
        <div className="profile-card">
          <div className="profile-avatar">
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div className="profile-details">
            <div className="profile-name">{user?.name}</div>
            <div className="profile-email">{user?.email}</div>
            {user?.isAdmin && <span className="admin-badge">Admin</span>}
          </div>
          <button className="logout-btn-card" onClick={handleLogout}>Logout</button>
        </div>

        {/* ORDERS SECTION */}
        <div className="orders-section">
          <div className="orders-header">
            <h2 className="orders-title">My Orders</h2>
            <div className="orders-count">
              {orders.length} {orders.length === 1 ? 'order' : 'orders'}
            </div>
          </div>

          {loading && (
            <div className="loading-wrap">
              <div className="spinner"></div>
              <div className="loading-text">Loading Orders</div>
            </div>
          )}

          {error && <div className="error-msg">{error}</div>}

          {!loading && !error && orders.length === 0 && (
            <div className="empty-orders">
              <div className="empty-icon">📦</div>
              <div className="empty-title">No orders yet</div>
              <div className="empty-sub">Start shopping to see your orders here</div>
              <button className="shop-btn" onClick={() => navigate('/products')}>
                Browse Products
              </button>
            </div>
          )}

          {!loading && orders.map(order => (
            <div className="order-card" key={order._id}>

              {/* ORDER HEADER */}
              <div className="order-header">
                <div className="order-left">
                  <div className="order-id">Order #{order._id.slice(-8).toUpperCase()}</div>
                  <div className="order-date">
                    {new Date(order.createdAt).toLocaleDateString('en-GH', {
                      year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </div>
                </div>
                <div className="order-right">
                  <span
                    className="order-status"
                    style={{
                      background: getStatusColor(order.status) + '20',
                      color: getStatusColor(order.status),
                      border: `1px solid ${getStatusColor(order.status)}`
                    }}
                  >
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
              </div>

              {/* ORDER ITEMS */}
              <div className="order-items">
                {order.items.map((item, index) => (
                  <div className="order-item" key={index}>
                    <img
                      className="order-item-img"
                      src={item.image}
                      alt={item.name}
                      onError={e => { e.target.src = 'https://via.placeholder.com/60x70?text=T'; }}
                    />
                    <div className="order-item-details">
                      <div className="order-item-name">{item.name}</div>
                      <div className="order-item-meta">Size: {item.size} · Qty: {item.quantity}</div>
                    </div>
                    <div className="order-item-price">
                      ₵{((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              {/* ORDER FOOTER */}
              <div className="order-footer">
                <div className="order-info">
                  <span>{order.deliveryMethod === 'delivery' ? '🚚 Home Delivery' : '🏪 Store Pickup'}</span>
                  <span>·</span>
                  <span>{order.paymentMethod === 'cash' ? '💵 Cash on Delivery' : '📱 Mobile Money'}</span>
                </div>
                <div className="order-total">
                  Total: <strong>₵{(order.totalAmount || 0).toFixed(2)}</strong>
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>
    </div>
  );
}