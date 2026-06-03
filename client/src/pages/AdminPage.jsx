import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminPage.css";
import api from '../utils/api';

const EMPTY_FROM = { name: "", description: "", price: "", category: "", image: "", sizes: "", stock: "" };

export default function AdminPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState(EMPTY_FROM);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState('products');
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderFilter, setOrderFilter] = useState('all');

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');
  const isAdmin = user?.isAdmin;

  const fetchProducts = useCallback(async () => {
    try {
      const res = await api(`/api/products`);
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const res = await api(`/api/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      console.log('Orders data:',data);
      console.log('first order item:',data[0]?.items);
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setOrdersLoading(false);
    }
  }, [token]);

  useEffect(() => {
    (async () => {
      await fetchProducts();
      await fetchOrders();
    })();
  }, [fetchProducts, fetchOrders]);

  const filtered = useMemo(() => {
    if (search.trim() === "") return products;
    return products.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, products]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    console.log('updating order:',orderId,'to', newStatus);
    console.log('Token:',token);
    try {
      const res = await api(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setMessage({ type: 'success', text: '✅ Order status updated!' });
      fetchOrders();
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const openAdd = () => {
    setEditProduct(null);
    setForm(EMPTY_FROM);
    setShowModal(true);
  };

  const openEdit = (product) => {
    setEditProduct(product);
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      image: product.image,
      sizes: Array.isArray(product.sizes) ? product.sizes.join(', ') : product.sizes || '',
      stock: product.stock
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditProduct(null);
    setForm(EMPTY_FROM);
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        stock: parseInt(form.stock),
        sizes: form.sizes.split(',').map(s => s.trim()).filter(Boolean),
      };
      const urlPath = editProduct ? `/api/products/${editProduct._id}` : `/api/products`;
      const method = editProduct ? 'PUT' : 'POST';
      const res = await api(urlPath, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to save product');
      setMessage({ type: 'success', text: `Product ${editProduct ? 'updated' : 'added'} successfully` });
      closeModal();
      fetchProducts();
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await api(`/api/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete product');
      setMessage({ type: 'success', text: 'Product deleted successfully' });
      fetchProducts();
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  const getStockBadge = (stock) => {
    if (stock === 0) return <span className="stock-badge out-stock">Out of Stock</span>;
    if (stock < 20) return <span className="stock-badge low-stock">Low - {stock}</span>;
    return <span className="stock-badge in-stock">In Stock - {stock}</span>;
  };

  if (!token) {
    return (
      <div className="access-denied">
        <div className="denied-title">Access Denied</div>
        <div className="denied-sub">Please login to access this panel</div>
        <button className="denied-btn" onClick={() => navigate('/')}>Go to Login</button>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="access-denied">
        <div className="denied-title">Admin Only</div>
        <div className="denied-sub">You do not have permission to access this page</div>
        <button className="denied-btn" onClick={() => navigate('/products')}>Back to Shop</button>
      </div>
    );
  }

  const totalStock = products.reduce((t, p) => t + p.stock, 0);
  const categories = [...new Set(products.map(p => p.category))].length;
  const filteredOrders = orderFilter === 'all' ? orders : orders.filter(o => o.status === orderFilter);

  return (
    <div className="admin-root">

      {/* NAVBAR */}
      <nav className="admin-nav">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div className="nav-brand">DICES<span>HUB</span></div>
          <span className="nav-badge">Admin</span>
        </div>
        <div className="nav-right">
          <button className="nav-link" onClick={() => navigate('/products')}>View Shop</button>
          <button className="nav-link" onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/'); }}>Logout</button>
        </div>
      </nav>

      {/* HEADER */}
      <div className="admin-header">
        <div className="header-left">
          <div className="header-eyebrow">Dashboard</div>
          <h1 className="header-title">
            {activeTab === 'products' ? 'Product Management' : 'Order Management'}
          </h1>
        </div>
        {activeTab === 'products' && (
          <button className="add-btn" onClick={openAdd}>+ Add Product</button>
        )}
      </div>

      {/* TABS */}
      <div className="admin-tabs">
        <button
          className={`admin-tab ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          Products ({products.length})
        </button>
        <button
          className={`admin-tab ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          Orders ({orders.length})
        </button>
      </div>

      {/* STATS */}
      <div className="admin-stats">
        {activeTab === 'products' ? (
          <>
            <div className="stat-card">
              <div className="stat-label">Total Products</div>
              <div className="stat-value">{products.length}</div>
              <div className="stat-sub">in collection</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Categories</div>
              <div className="stat-value">{categories}</div>
              <div className="stat-sub">product types</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Low Stock</div>
              <div className="stat-value">{products.filter(p => p.stock < 20).length}</div>
              <div className="stat-sub">need restocking</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total Stock</div>
              <div className="stat-value">{totalStock}</div>
              <div className="stat-sub">units available</div>
            </div>
          </>
        ) : (
          <>
            <div className="stat-card">
              <div className="stat-label">Total Orders</div>
              <div className="stat-value">{orders.length}</div>
              <div className="stat-sub">all time</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Pending</div>
              <div className="stat-value">{orders.filter(o => o.status === 'pending').length}</div>
              <div className="stat-sub">need attention</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Delivered</div>
              <div className="stat-value">{orders.filter(o => o.status === 'delivered').length}</div>
              <div className="stat-sub">completed</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total Revenue</div>
              <div className="stat-value">₵{orders.reduce((t, o) => t + (o.totalAmount || 0), 0).toFixed(0)}</div>
              <div className="stat-sub">from all orders</div>
            </div>
          </>
        )}
      </div>

      {/* CONTENT */}
      <div className="admin-content">
        {message && (
          <div className={message.type === 'success' ? 'success-msg' : 'error-msg'}>
            {message.text}
          </div>
        )}

        {/* PRODUCTS TAB */}
        {activeTab === 'products' && (
          <>
            <div className="table-header">
              <div className="table-title">All Products ({filtered.length})</div>
              <input
                className="search-input"
                placeholder="Search products..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            {loading ? (
              <div className="loading-wrap">
                <div className="spinner"></div>
                <div className="loading-text">Loading products...</div>
              </div>
            ) : (
              <table className="products-table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Sizes</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(product => (
                    <tr key={product._id}>
                      <td>
                        <img className="product-thumb" src={product.image} alt={product.name}
                          onError={e => { e.target.src = 'https://via.placeholder.com/48x56?text=T'; }} />
                      </td>
                      <td><div className="product-name-cell">{product.name}</div></td>
                      <td><span className="category-tag">{product.category}</span></td>
                      <td>₵{product.price.toFixed(2)}</td>
                      <td>{getStockBadge(product.stock)}</td>
                      <td>{product.sizes?.join(', ')}</td>
                      <td>
                        <div className="action-btns">
                          <button className="edit-btn" onClick={() => openEdit(product)}>Edit</button>
                          <button className="delete-btn" onClick={() => handleDelete(product._id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}

        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
          <>
            {/* FILTER BUTTONS */}
            <div className="order-filters">
              {['all', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map(f => (
                <button
                  key={f}
                  className={`filter-btn ${orderFilter === f ? 'active' : ''}`}
                  onClick={() => setOrderFilter(f)}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                  {f !== 'all' && ` (${orders.filter(o => o.status === f).length})`}
                </button>
              ))}
            </div>

            {ordersLoading ? (
              <div className="loading-wrap">
                <div className="spinner"></div>
                <div className="loading-text">Loading orders...</div>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="empty-orders">No orders found</div>
            ) : (
              <table className="products-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Date & Time</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Payment</th>
                    <th>Delivery</th>
                    <th>Status</th>
                    <th>Update</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map(order => (
                    <tr key={order._id}>
                      <td>
                        <div className="product-name-cell">
                          #{order._id.slice(-8).toUpperCase()}
                        </div>
                      </td>
                      <td>
                        <div>{order.userId?.name || 'Customer'}</div>
                        <div style={{ fontSize: '13px', color: '#999', fontStyle: 'italic' }}>
                          {order.userId?.email || ''}
                        </div>
                      </td>
                      <td>
                        <div>{new Date(order.createdAt).toLocaleDateString('en-GH', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}</div>
                        <div style={{ fontSize: '13px', color: '#999' }}>
                          {new Date(order.createdAt).toLocaleTimeString('en-GH', {
                            hour: '2-digit', minute: '2-digit', hour12: true
                          })}
                        </div>
                      </td>
                      <td>{order.items?.map((item,index) => (
                        <div key={index} style={{marginBottom:'6px',fontSize:'13px'}}>
                          <div style={{fontWeight:'600',color:'#1a1a1a'}}>{item.name}</div>
                          <div style={{color:'#999',fontStyle:'italic'}}>
                            Size: {item.size} . Qty: {item.quantity} . ₵{(item.price * item.quantity).toFixed(2)}

                          </div>
                        </div>
                      ))}
                        </td>
                      <td><strong>₵{(order.totalAmount || 0).toFixed(2)}</strong></td>
                      <td>
                        <span className="category-tag">
                          {order.paymentMethod === 'cash' ? '💵 Cash' : '📱 MoMo'}
                        </span>
                      </td>
                      <td>
                        <span className="category-tag">
                          {order.deliveryMethod === 'delivery' ? '🚚 Delivery' : '🏪 Pickup'}
                        </span>
                      </td>
                      <td>
                        <span className={`stock-badge ${
                          order.status === 'delivered' ? 'in-stock' :
                          order.status === 'cancelled' ? 'out-stock' : 'low-stock'
                        }`}>
                          {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                        </span>
                      </td>
                      <td>
                        <select
                          className="status-select"
                          value={order.status}
                          onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">{editProduct ? 'Edit Product' : 'Add Product'}</div>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="field">
                  <label>Product Name</label>
                  <input name="name" value={form.name} onChange={handleChange} placeholder="Classic White Tee" />
                </div>
                <div className="field">
                  <label>Category</label>
                  <input name="category" value={form.category} onChange={handleChange} placeholder="Basics" />
                </div>
              </div>
              <div className="field full">
                <label>Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} placeholder="Product description..." />
              </div>
              <div className="form-row">
                <div className="field">
                  <label>Price (₵)</label>
                  <input name="price" value={form.price} onChange={handleChange} placeholder="29.99" />
                </div>
                <div className="field">
                  <label>Stock</label>
                  <input name="stock" value={form.stock} onChange={handleChange} placeholder="100" />
                </div>
              </div>
              <div className="field full">
                <label>Image URL</label>
                <input name="image" value={form.image} onChange={handleChange} placeholder="https://images.unsplash.com/..." />
              </div>
              <div className="form-row">
                <div className="field">
                  <label>Sizes (comma separated)</label>
                  <input name="sizes" value={form.sizes} onChange={handleChange} placeholder="S, M, L, XL, XXL" />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={closeModal}>Cancel</button>
              <button className="save-btn" onClick={handleSave}>{editProduct ? 'Update' : 'Add Product'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}