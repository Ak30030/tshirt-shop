import { useState, useEffect } from "react";
import "./Productspage.css";
import{useNavigate} from "react-router-dom";
import { useCart } from "../context/useCart";
import api from "../utils/api";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");

  const categories = ["all", ...new Set(products.map((p) => p.category))];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        console.log("Fetching products...");
        const response = await api(`/api/products`);
        console.log("Response:", response);
        if (!response.ok) throw new Error("Failed to fetch products");
        const data = await response.json();
        console.log("Products received:", data);
        setProducts(data);
        setFiltered(data);
      } catch (error) {
        console.error("Error fetching products:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleFilter = (category) => {
    setActiveFilter(category);
    if (category === "all") {
      setFiltered(products);
    } else {
      setFiltered(products.filter((p) => p.category === category));
    }
  };

  return (
    <>
    
      <div className="products-root">
        <nav className="navbar">
          <div className="nav-brand">
            DICES<span>HUB</span>
          </div>
          <div className="nav-links">
            <button className="nav-link" onClick ={() => navigate("/")}>Home</button>
            <button className="nav-link active">Shop</button>
            <button className="nav-link" onClick={() => navigate('/profile')}>My Account</button>
            <button className="nav-cart" onClick={() => navigate('/cart')}>
              Cart ({cartCount})
            </button>
          </div>
        </nav>
      

      <div className="products-hero">
        <div className="hero-left">
          <div className="hero-eyebrow">Our Collection</div>
          <div className="hero-title">
            Premium <em>T-Shirts</em>
          </div>
          {!loading && (
            <div className="hero-count">
              {filtered.length} {filtered.length === 1 ? "piece" : "pieces"} available
            </div>
          )}
        </div>
        </div>
        <div className="filters-bar">
          <span className="filter-label">Filter</span>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`filter-btn ${activeFilter === cat ? "active" : ""}`}
              onClick={() => handleFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="products-container">
        {loading && (
          <div className="loading-wrap">
            <div className="loading-spinner"></div>
            <div className="loading-text">Loading Collections...</div>
          </div>
        )}

        {error && (
          <div className="error-wrap">
            <div className="error-text">Could not load products</div>
            <div className="error-sub">{error} - Please try again later.</div>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="empty-wrap">
            <div className="empty-text">No products found</div>
            <div className="empty-sub">Try adjusting your filters.</div>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="products-grid">
            {filtered.map((product, index) => (
              <div
                className="products-card"
                key={product._id}
                style={{ animationDelay: `${index * 0.1}ms` }}
                onClick={() => navigate(`/products/${product._id}`)}
              >
                <div className="product-image-wrap">
                  <img
                    className="product-image"
                    src={product.image}
                    alt={product.name}
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/400x500?text=T-Shirt";
                    }}
                  />
                  <div className="product-badge">{product.badge}</div>
                  <div className="product-overlay">Add to Cart</div>
                </div>

                <div className="product-info">
                  <div className="product-category">{product.category}</div>
                  <div className="product-name">{product.name}</div>
                  <div className="product-desc">{product.description}</div>
                  <div className="product-footer">
                    <div className="product-price">₵{product.price.toFixed(2)}</div>
                    <div className="product-sizes">
                      {product.sizes?.slice(0, 6).map((size) => (
                        <span key={size} className="size-tag">
                          {size}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
