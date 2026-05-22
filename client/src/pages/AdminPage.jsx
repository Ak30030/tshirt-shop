import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminPage.css";

const EMPTY_FROM = {name:"",description:"",price:"",category:"",image:"",sizes:"",colors:"",stock:""};

export default function AdminPage() {
  const navigate = useNavigate();
  const[products,setproducts] = useState([]);
  const[filtered,setfiltered] = useState([]);
  const[loading,setloading] = useState(true);
  const[message,setMessage] = useState(null);
  const[showModal,setshowModal] = useState(false);
  const[editProduct,setEditProduct] = useState(null);
  const[form,setForm] = useState(EMPTY_FROM);
  const[search,setSearch] = useState("");

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');

  const isAdmin= user?.isAdmin;

  const fetchProducts = async () => {
    try {
      const response = await fetch(`/api/products`);
      const data = await response.json();
      setproducts(data);
      setfiltered(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setloading(false);
    } 
  };

  useEffect(() => {
    // eslint-disable-next-line
    fetchProducts();
  }, []);

  useEffect(() => {
    if (search.trim() === "") {
      // eslint-disable-next-line
      setfiltered(products);
    } else {
      setfiltered(products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase())));
    }
  }, [search, products]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const openAdd=() => {
    setEditProduct(null);
    setForm(EMPTY_FROM);
    setshowModal(true);
  };

  const openEdit=(product) => {
    setEditProduct(product);
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      image: product.image,
      sizes: Array.isArray(product.sizes) ? product.sizes.join(", ") : product.sizes,
      colors: Array.isArray(product.colors) ? product.colors.join(", ") : product.colors,
      stock: product.stock
    });
    setshowModal(true);
  };

  const closeModal = () => {
    setshowModal(false);
    setEditProduct(null);
    setForm(EMPTY_FROM);
    setEditProduct(null);
  };

  const handleSave = async () => {
    try{
      const playload = {
        ...form,
        price: parseFloat(form.price),
        stock: parseInt(form.stock),
        sizes: form.sizes.split(",").map(s => s.trim()).filter(Boolean),
        colors: form.colors.split(",").map(c => c.trim()).filter(Boolean),
      };

      const url = editProduct ? `/api/products/${editProduct._id}` : `/api/products`;
      const method = editProduct ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(playload)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to save product");

      setMessage({ type: "success", text: `Product ${editProduct ? "updated" : "Product added"} successfully` });

      closeModal();
      fetchProducts();
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    }
  };

  const handleDelete = async (Id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      const response = await fetch(`/api/products/${Id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to delete product");

      setMessage({ type: "success", text: "Product deleted successfully" });
      fetchProducts();
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    }
  };

  const getStockBadge = (stock) => {
    if (stock === 0) return <span className="stock-badge out-stock">Out of Stock</span>;
    if (stock < 20) return <span className="stock-badge low-stock">Low - {stock}</span>;
    return <span className="stock-badge in-stock">In Stock - {stock}</span>;
  };

  if(!token) {
    return (
      <>
        <div className="access-denied">
          <div className="denied-title">Access Denied</div>
          <div className="denied-sub">Please login to acess this panel</div>
          <button className="denied-btn" onClick={() => navigate('/')}>Go to Login</button>
        </div>
      </>
    );
  }

    if(!isAdmin) {
      return (
        <>
          <div className="access-denied">
            <div className="denied-title">Admin Only</div>
            <div className="denied-sub">You do not have permission to access this page</div>
            <button className="denied-btn" onClick={() => navigate('/products')}> Back to Shop</button>
          </div>
        </>
      );
    }

    // Stock statistics for display
    const totalStock = products.reduce((t, p) => t + p.stock, 0);
    const categories = [...new Set(products.map(p => p.category))].length;
    // totalStock displayed in UI: {totalStock}

    return (
      <>
      <div className="admin-root">

        <nav className="admin-nav">
          <div style={{display:"flex",alignItems:"center"}}>
            <div className="nav-brand">DICES<span>HUB</span></div>
            <span className="nav-badge">Admin</span>
          </div>
          <div className="nav-right">
            <button className="nav-link" onClick={() => navigate('/products')}>View Shop</button>

            <button className="nav-link" onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              navigate('/');
            }}>Logout</button>
          </div>
        </nav>

        <div className="admin-header">
          <div className="header-left">
            <div className="header-eyebrow"> Dashboard</div>
            <h1 className="header-title">Product Management</h1>
          </div>
          <button className="add-btn" onClick={openAdd}>+ Add Product</button>
        </div>

        <div className="admin-stats">
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
            <div className="stat-value">₵{totalStock.toFixed(2)}</div>
            <div className="stat-sub">units available</div>
          </div>
          </div>

          <div className="admin-content">
            {message && (
            <div className={message.type === 'success' ? 'success-msg' : 'error-msg'}>
              {message.text}
            </div>
            )}

            <div className="table-header">
              <div className="table-title">ALL Products({filtered.length})</div>
              <input
              className="search-input"
              placeholder="search products..."
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
                        <td>{product.sizes.join(", ")}</td>
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
          </div>

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
            <input name="name" value={form.name} onChange={handleChange} placeholder="classic White Tee" />

            </div>
            <div className="field">
            <label>Category</label>
            <input name="category" value={form.category} onChange={handleChange} placeholder="Basics" />

            </div>
            </div>
            <div className="field full">
            <label>Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} placeholder="A classic white t-shirt made from 100% cotton. Soft, comfortable, and perfect for everyday wear. Features a timeless crew neck design and a relaxed fit." />
            </div>
            <div className="form-row">
            <div className="field">
            <label>Price ($)</label>
            <input name="price" value={form.price} onChange={handleChange} placeholder="29.99" />
            </div>
            <div className="field">
            <label>Stock</label>
            <input name="stock" value={form.stock} onChange={handleChange} placeholder="100" />
            </div>
            </div>
            <div className="field full">
            <label>Image URL</label>
            <input name="image" value={form.image} onChange={handleChange} placeholder="https://images.unsplash.com/..."  />
            </div>
            <div className="form-row">
            <div className="field">
            <label>Sizes (comma separated)</label>
            <input name="sizes" value={form.sizes} onChange={handleChange} placeholder="S, M, L, XL" />
            </div>
            </div>
            </div>
            <div className="modal-footer">
            <button className="cancel-btn" onClick={closeModal}>Cancel</button>
            <button className="save-btn" onClick={handleSave}>{editProduct ? 'Update' : 'Add product'}</button>
            </div>
             </div>
          </div>
        )}
      </div>
    </>
  );
}