import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import "./HomePage.css";

export default function HomePage() {
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user") || '{}');
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        setProducts(data.slice(0, 3));
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate('/');
  };

  return (
    <div className="home-root">

      {/* NAVBAR */}
      <nav className="home-nav">
        <div className="nav-brand">DICES<span>HUB</span></div>
        <div className="nav-links">
          <button className="nav-link active">Home</button>
          <button className="nav-link" onClick={() => navigate('/products')}>Shop</button>
          <button className="nav-link" onClick={() => navigate('/profile')}>My Account</button>
          {user?.isAdmin && (
            <button className="nav-link" onClick={() => navigate("/admin")}>Admin</button>
          )}
        </div>
        <div className="nav-actions">
          {token ? (
            <>
              <button className="nav-cart" onClick={() => navigate("/cart")}>Cart ({cartCount})</button>
              <button className="nav-logout" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <button className="nav-signin" onClick={() => navigate('/login')}>Sign In</button>
          )}
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-overlay"></div>
          <div className="hero-pattern"></div>
        </div>
        <div className="hero-content">
          <div className="hero-eyebrow">New Collection 2026</div>
          <h1 className="hero-title">
            Wear What<br />
            <em>Speaks</em> For You
          </h1>
          <p className="hero-desc">
            Premium t-shirts crafted for those who appreciate quality, comfort, and timeless style. Made from 100% cotton.
          </p>
          <div className="hero-btns">
            <button className="hero-cta" onClick={() => navigate("/products")}>Shop Collection</button>
            <button className="hero-secondary" onClick={() => {
              document.getElementById('about').scrollIntoView({ behavior: 'smooth' });
            }}>Our Story</button>
          </div>
          <div className="hero-stats">
            <div className="stat">
              <div className="stat-number">500+</div>
              <div className="stat-label">Happy Customers</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat">
              <div className="stat-number">100%</div>
              <div className="stat-label">Pure Cotton</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat">
              <div className="stat-number">48hr</div>
              <div className="stat-label">Fast Delivery</div>
            </div>
          </div>
        </div>
        <div className="hero-scroll">
          <div className="scroll-line"></div>
          <span>Scroll</span>
        </div>
      </section>

      {/* FEATURES STRIP */}
      <section className="features-strip">
        <div className="feature-item">
          <span className="feature-icon"></span>
          <div>
            <div className="feature-title">Free Delivery</div>
            <div className="feature-sub">On orders over ₵210</div>
          </div>
        </div>
        <div className="feature-divider"></div>
        <div className="feature-item">
          <span className="feature-icon"></span>
          <div>
            <div className="feature-title">Premium Quality</div>
            <div className="feature-sub">100% pure cotton fabric</div>
          </div>
        </div>
        <div className="feature-divider"></div>
        <div className="feature-item">
          <span className="feature-icon"></span>
          <div>
            <div className="feature-title">Easy Payment</div>
            <div className="feature-sub">Cash & Mobile Money</div>
          </div>
        </div>
        <div className="feature-divider"></div>
        <div className="feature-item">
          <span className="feature-icon"></span>
          <div>
            <div className="feature-title"></div>
            <div className="feature-sub"></div>
          </div>
        </div>
      </section>

      {/* FEATURED SECTION */}
      <section className="featured-section">
        <div className="section-header">
          <div className="section-eyebrow">Hand Picked</div>
          <h2 className="section-title">Featured Collection</h2>
          <p className="section-sub">Our most loved pieces, carefully selected for you</p>
        </div>
        {loading ? (
          <div className="featured-loading">
            <div className="spinner"></div>
          </div>
        ) : (
          <div className="featured-grid">
            {products.map((product, index) => (
              <div
                className="featured-card"
                key={product._id}
                style={{ animationDelay: `${index * 0.15}s` }}
                onClick={() => navigate(`/products/${product._id}`)}
              >
                <div className="featured-img-wrap">
                  <img
                    className="featured-img"
                    src={product.image}
                    alt={product.name}
                    onError={e => { e.target.src = "https://via.placeholder.com/400x500?text=T-Shirt"; }}
                  />
                  <div className="featured-overlay">
                    <button className="view-btn">View Product</button>
                  </div>
                  <div className="featured-badge">{product.category}</div>
                </div>
                <div className="featured-info">
                  <div className="featured-category">{product.category}</div>
                  <div className="featured-name">{product.name}</div>
                  <div className="featured-price">₵{product.price.toFixed(2)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="view-all-wrap">
          <button className="view-all-btn" onClick={() => navigate("/products")}>
            View Full Collection →
          </button>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section className="about-section" id="about">
        <div className="about-content">
          <div className="about-left">
            <div className="about-eyebrow">Our Story</div>
            <h2 className="about-title">Designed With<br /><em>Passion</em></h2>
            <p className="about-text">
              DicesHub was born from a simple belief — that everyone deserves to wear
              something that feels as good as it looks. We source only the finest cotton
              fabrics and design it to bring you t-shirts that last.
            </p>
            <p className="about-text">
              Based in Ghana, we are proud to serve customers across the country with
              fast delivery and a personal touch. Every order is packed with care
              and delivered with love.
            </p>
            <div className="about-values">
              <div className="value-item">
                <div className="value-icon">🌿</div>
                <div>
                  <div className="value-title">Sustainable</div>
                  <div className="value-sub">Eco-friendly materials</div>
                </div>
              </div>
              <div className="value-item">
                <div className="value-icon">🇬🇭</div>
                <div>
                  <div className="value-title">Made for Ghana</div>
                  <div className="value-sub">Proudly local business</div>
                </div>
              </div>
              <div className="value-item">
                <div className="value-icon">💎</div>
                <div>
                  <div className="value-title">Premium Quality</div>
                  <div className="value-sub">Never compromise</div>
                </div>
              </div>
            </div>
            <button className="about-btn" onClick={() => navigate("/products")}>Shop Now</button>
          </div>
          <div className="about-right">
            <div className="about-img-wrap">
              <div className="about-img-card card-1">
                <img src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300" alt="t-shirt" />
              </div>
              <div className="about-img-card card-2">
                <img src="https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=300" alt="t-shirt" />
              </div>
              <div className="about-badge-float">
                <div className="badge-number">100%</div>
                <div className="badge-text">Cotton</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="cta-section">
        <div className="cta-content">
          <div className="cta-eyebrow">Limited Time</div>
          <h2 className="cta-title">Free Delivery on Orders Over ₵210</h2>
          <p className="cta-sub">Shop now and enjoy free delivery straight to your door anywhere in Ghana</p>
          <button className="cta-btn" onClick={() => navigate("/products")}>Start Shopping</button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="home-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="footer-logo">DICES<span>HUB</span></div>
            <div className="footer-tagline">T-shirt papa fie</div>
          </div>
          <div className="footer-links">
            <div className="footer-col">
              <div className="footer-col-title">Shop</div>
              <button onClick={() => navigate("/products")}>All Products</button>
              <button onClick={() => navigate("/cart")}>My Cart</button>
              <button onClick={() => navigate("/profile")}>My Orders</button>
            </div>
            <div className="footer-col">
              <div className="footer-col-title">Account</div>
              {token ? (
                <>
                  <button onClick={() => navigate("/profile")}>My Profile</button>
                  <button onClick={handleLogout}>Logout</button>
                </>
              ) : (
                <button onClick={() => navigate("/login")}>Sign In / Register</button>
              )}
            </div>

            
             <div className="media-platform">
              <div className="social-media">Contact Us</div>
              <a 
              target="_blank"rel="noopener noreferrer"
              >
                <img src="https://i.ibb.co/qLW0G2fC/Location-address-position-icon-vector-in-trendy.jpg" alt="Facebook" width="20" />
                Ghana,Atonso
              </a>

              <a 
              target="_blank"rel="noopener noreferrer"
              >
                <img src="https://i.ibb.co/VpgV9SnC/971088738383504183.jpg" alt="whatsapp" width="20" />
                0596863729
              </a>
              <a 
              target="_blank"rel="noopener noreferrer"
              >
                <img src="https://i.ibb.co/NdMzM99H/803892602253735695-1.jpg" alt="whatsapp" width="20" />
                akwasifredrico10@gmail.com
              </a>
              
            </div>

             <div className="media-platform">
              <div className="social-media">Our socials</div>
              <a href="https://facebook.com/akwasifredrico10"
              target="_blank"rel="noopener noreferrer"
              >
                <img src="https://i.ibb.co/tp97cpGq/facebook.jpg" alt="Facebook" width="20" />
                Facebook
              </a>

              <a href="https://whatsapp/akwasifredrico10"
              target="_blank"rel="noopener noreferrer"
              >
                <img src="https://i.ibb.co/p6LCsS41/whatsapp-1.jpg" alt="whatsapp" width="20" />
                Whatsapp
              </a>
              <a href="https://whatsapp/akwasifredrico10"
              target="_blank"rel="noopener noreferrer"
              >
                <img src="https://i.ibb.co/4R2V8P2P/tiktok.jpg" alt="whatsapp" width="20" />
                Ticktok
              </a>
              
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 DicesHub. All rights reserved.</span>
          <span>Made with ❤️ in Ghana</span>
        </div>
      </footer>

    </div>
  );
}