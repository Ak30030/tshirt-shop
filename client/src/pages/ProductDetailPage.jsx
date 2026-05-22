import { useState,useEffect } from "react";
import { useParams,useNavigate } from "react-router-dom";
import './ProductDetailPage.css';
import { useCart } from "../context/useCart";

export default function ProductDetailPage() {
  const { id } = useParams();
  const { cartCount, addToCart } = useCart();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const[selectedColor, setSelectedColor] = useState("");
  const[added, setAdded] = useState(false);


  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res =await fetch(`/api/products/${id}`);
        if (!res.ok) throw new Error("Failed to fetch product");
        const data = await res.json();
        setProduct(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!selectedSize ) {
      alert("Please select size ");
      return;
    }
    await addToCart(product, selectedSize, selectedColor);
    // Here you would normally add the product to the cart in your app's state or backend
    setAdded(true);
    setTimeout(() => setAdded(false), 2000); // Reset added state after 2 seconds
  };

  if(loading) return (
  <div className="detail-loading">
    <div className="loading-spinner">
      <div className="loading-text">Loading Product</div>
    </div>

  </div>
  );

  if (error) return(
    <div className="detail-error">
      <div className="error-text">{error}</div>
      <button onClick={() => navigate('/products')} >Back to Products</button>
    </div>
  );

  return(
    <div className="detail-root">

      <nav className="navbar">
        <div className="nav-brand">DICES<span>HUB</span></div>
        <div className="nav-links">
          <button className="nav-link" onClick={() => navigate('/products')}>back to Shop</button>
          <button className="nav-cart" onClick={() => navigate('/cart')}>
            Cart ({cartCount})
          </button>
        </div>
      </nav>

      <div className="breadcrumb">
        <button onClick={() => navigate('/products')}>Shop</button>
        <span>/</span>
        <span>{product?.name}</span>
      </div>

      <div className="detail-content">

        <div className="detail-image-wrap">
          <img
          className="detail-image"
          src={product?.image}
          alt={product?.name}
          onError={(e) => { e.target.src = "https://via.placeholder.com/600x700?text=T-Shirt"; }}
          />
        <div className="detail-badge">{product.category}</div>
        </div>
        <div className="words-info">

        <div className="detail-info">
          <div className="detail-eyebrow">{product.category}</div>
          <div className="detail-name">{product.name}</div>
          <div className="detail-price">₵{product.price.toFixed(2)}</div>
          <p className="detail-desc">{product.description}</p>

          <div className="detail-divider"></div>

          <div className="detail-section">
            <div className="detail-label">Select Size</div>
            <div className="detail-sizes">
              {product?.sizes?.map((size) => (
                <button
                  key={size}
                  className={`size-button ${selectedSize === size ? "selected" : ""}`}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="detail-section">
            <div className="detail-label">Color - <span>{selectedColor}</span></div>
            <div className="color-options">
              {product?.colors?.map((color) => (
                <button
                  key={color}
                  className={`color-btn ${selectedColor === color ? 'active' : ""}`}
                  style={{background:color === 'white' ? '#f5f5f5' : color}}
                  onClick={() => setSelectedColor(color)}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          <div className="detail-divider"></div>

          <div className="detail-stock">
            {product.stock > 0 ? `In stock - ${product.stock} available` : 'Out of stock'}
          </div>
          <div style={{marginTop:12}}>
            <button className="add-btn" onClick={handleAddToCart}>{added ? 'Added' : 'Add to Cart'}</button>
          </div>
          
          <button className="back-btn" onClick={() => navigate('/products')}>Back to Products</button>
        </div>
      </div>
    </div>
    </div>
  );
}