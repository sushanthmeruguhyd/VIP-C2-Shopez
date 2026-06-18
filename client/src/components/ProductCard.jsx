import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, Plus } from 'lucide-react';
import { ShopContext } from '../context/ShopContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useContext(ShopContext);
  const navigate = useNavigate();

  const handleAddToCart = (e) => {
    e.preventDefault(); // Stop click from propagating to the Link
    e.stopPropagation();
    addToCart(product, 1);
  };

  // Generate star rating icons
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 !== 0;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<Star key={i} size={14} fill="currentColor" />);
      } else if (i === fullStars + 1 && hasHalf) {
        // Render half filled or simply a filled star for simplicity
        stars.push(<Star key={i} size={14} fill="currentColor" style={{ opacity: 0.7 }} />);
      } else {
        stars.push(<Star key={i} size={14} style={{ opacity: 0.2 }} />);
      }
    }
    return stars;
  };

  return (
    <Link to={`/product/${product._id}`} className="product-card animate-fade-in">
      {/* Product Image and Category Badge */}
      <div className="card-image-container">
        <span className="card-category-badge">{product.category}</span>
        <img
          src={product.image || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=600&auto=format&fit=crop'}
          alt={product.name}
          className="card-image"
          loading="lazy"
        />
      </div>

      {/* Info Area */}
      <div className="card-info">
        <span className="card-category-text">{product.category}</span>
        <h3 className="card-title">{product.name}</h3>

        {/* Star Rating */}
        <div className="rating-container">
          <div className="stars">{renderStars(product.rating || 4.0)}</div>
          <span className="reviews-count">({product.numReviews || 0})</span>
        </div>

        {/* Footer */}
        <div style={{ fontSize: '12px', color: 'hsl(var(--text-muted))', marginTop: '6px', marginBottom: '4px' }}>
          {product.countInStock > 0 ? (
            <span style={{ color: 'hsl(var(--success))' }}>{product.countInStock} in stock</span>
          ) : (
            <span style={{ color: 'hsl(var(--danger))' }}>Out of stock</span>
          )}
        </div>

        <div className="card-footer">
          <span className="card-price">₹{product.price.toLocaleString('en-IN')}</span>
          <button
            onClick={handleAddToCart}
            className="btn-add-cart"
            title="Add to Cart"
            aria-label="Add to Cart"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
