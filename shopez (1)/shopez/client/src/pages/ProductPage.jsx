import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { Star, ArrowLeft, ShieldAlert, ShoppingBag, Plus, Minus } from 'lucide-react';

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token, addToCart } = useContext(ShopContext);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [qty, setQty] = useState(1);

  // Review Form State
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/products/${id}`);
      if (res.ok) {
        const data = await res.json();
        setProduct(data);
      } else {
        const data = await res.json();
        setError(data.message || 'Product not found');
      }
    } catch (err) {
      setError('Error loading product details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  const handleQtyChange = (type) => {
    if (type === 'inc') {
      setQty((prev) => Math.min(prev + 1, product.countInStock));
    } else {
      setQty((prev) => Math.max(1, prev - 1));
    }
  };

  const handleAddToCart = () => {
    addToCart(product, qty);
    setReviewSuccess('Item added to cart!');
    setTimeout(() => setReviewSuccess(''), 2000);
  };

  const handleShopNow = async () => {
    // Adds item to cart and redirects to checkout directly
    await addToCart(product, qty);
    navigate('/checkout');
  };

  const submitReviewHandler = async (e) => {
    e.preventDefault();
    if (!comment) {
      setReviewError('Please enter a comment');
      return;
    }

    setReviewLoading(true);
    setReviewError('');
    setReviewSuccess('');

    try {
      const res = await fetch(`/api/products/${id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating, comment }),
      });

      const data = await res.json();

      if (res.ok) {
        setReviewSuccess('Review submitted successfully!');
        setComment('');
        setRating(5);
        fetchProductDetails(); // Refresh product info to show the new review
      } else {
        setReviewError(data.message || 'Failed to submit review');
      }
    } catch (err) {
      setReviewError('Network error, please try again');
    } finally {
      setReviewLoading(false);
    }
  };

  // Star rendering
  const renderStars = (ratingVal) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          size={16}
          fill={i <= ratingVal ? 'currentColor' : 'none'}
          className={i <= ratingVal ? 'primary-accent' : ''}
          style={{ color: i <= ratingVal ? '#ffb400' : 'rgba(255,255,255,0.2)' }}
        />
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="main-content empty-state" style={{ padding: '100px 0' }}>
        <p>Loading product details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="main-content empty-state" style={{ padding: '100px 0' }}>
        <ShieldAlert size={48} className="empty-icon" style={{ color: 'hsl(var(--danger))' }} />
        <h3>Error</h3>
        <p>{error}</p>
        <Link to="/" className="btn-secondary" style={{ marginTop: '20px' }}>
          <ArrowLeft size={16} /> Back to Shop
        </Link>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="main-content animate-fade-in">
      <Link to="/" className="btn-secondary" style={{ marginBottom: '24px', padding: '8px 16px' }}>
        <ArrowLeft size={16} /> Back to Catalog
      </Link>

      {reviewSuccess && (
        <div className="alert alert-success">{reviewSuccess}</div>
      )}

      <div className="detail-layout">
        {/* Product Image */}
        <div className="detail-img-container">
          <img src={product.image} alt={product.name} className="detail-img" />
        </div>

        {/* Product Details Info */}
        <div className="detail-info">
          <span className="detail-category-badge">{product.category}</span>
          <h1 className="detail-title">{product.name}</h1>

          {/* Rating */}
          <div className="rating-container" style={{ margin: 0 }}>
            <div className="stars">{renderStars(product.rating)}</div>
            <span className="reviews-count" style={{ fontSize: '14px' }}>
              ({product.numReviews} customer reviews)
            </span>
          </div>

          {/* Price */}
          <div className="detail-price">₹{product.price.toLocaleString('en-IN')}</div>

          {/* Description */}
          <p className="detail-desc">{product.description}</p>

          {/* Stock Info */}
          <div className="stock-status">
            Status:{' '}
            {product.countInStock > 0 ? (
              <span className="stock-in">In Stock ({product.countInStock} available)</span>
            ) : (
              <span className="stock-out">Out of Stock</span>
            )}
          </div>

          {/* Action Row */}
          {product.countInStock > 0 && (
            <div className="action-row">
              <div className="qty-selector">
                <button
                  className="qty-btn"
                  onClick={() => handleQtyChange('dec')}
                  disabled={qty <= 1}
                >
                  <Minus size={14} />
                </button>
                <input
                  type="number"
                  className="qty-val"
                  value={qty}
                  min="1"
                  max={product.countInStock}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (!isNaN(value)) {
                      setQty(Math.min(product.countInStock, Math.max(1, value)));
                    } else {
                      setQty('');
                    }
                  }}
                  onBlur={() => {
                    if (qty === '') {
                      setQty(1);
                    }
                  }}
                  style={{
                    width: '70px',
                    textAlign: 'center',
                    border: 'none',
                    background: 'transparent',
                    color: 'inherit',
                    fontWeight: 'bold',
                    outline: 'none',
                  }}
                />
                <button
                  className="qty-btn"
                  onClick={() => handleQtyChange('inc')}
                  disabled={qty >= product.countInStock}
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* Add to Cart */}
              <button onClick={handleAddToCart} className="btn-secondary">
                Add to Cart
              </button>

              {/* Shop Now (Direct Checkout) */}
              <button onClick={handleShopNow} className="btn-primary">
                <ShoppingBag size={18} />
                <span>Shop Now</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Reviews List & Write Review */}
      <div className="reviews-section">
        <h2 style={{ fontSize: '22px', borderBottom: '1px solid hsl(var(--border))', paddingBottom: '12px' }}>
          Customer Reviews
        </h2>

        <div className="reviews-grid">
          {/* Reviews List */}
          <div className="reviews-list-container">
            {product.reviews.length === 0 ? (
              <p style={{ color: 'hsl(var(--text-muted))', padding: '20px 0' }}>
                No reviews yet. Be the first to review this product!
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                {product.reviews.map((rev) => (
                  <div key={rev._id} className="review-list-card">
                    <div className="review-header">
                      <span className="review-author">{rev.name}</span>
                      <span className="review-date">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="stars" style={{ marginBottom: '8px' }}>
                      {renderStars(rev.rating)}
                    </div>
                    <p className="review-comment">{rev.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Write a Review */}
          <div className="write-review-container">
            <div className="review-list-card" style={{ marginTop: '16px' }}>
              <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Write a Customer Review</h3>
              {user ? (
                <form onSubmit={submitReviewHandler}>
                  {reviewError && <div className="alert alert-danger">{reviewError}</div>}

                  <div className="form-group">
                    <label className="form-label">Rating</label>
                    <select
                      className="form-select"
                      value={rating}
                      onChange={(e) => setRating(Number(e.target.value))}
                    >
                      <option value="5">5 - Excellent</option>
                      <option value="4">4 - Good</option>
                      <option value="3">3 - Average</option>
                      <option value="2">2 - Poor</option>
                      <option value="1">1 - Terrible</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Comment</label>
                    <textarea
                      className="form-textarea"
                      placeholder="Write your review here..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={reviewLoading}
                    style={{ width: '100%' }}
                  >
                    Submit Review
                  </button>
                </form>
              ) : (
                <p style={{ color: 'hsl(var(--text-muted))' }}>
                  Please <Link to="/login" style={{ color: 'hsl(var(--primary))', fontWeight: 600 }}>Login</Link> to write a review.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
