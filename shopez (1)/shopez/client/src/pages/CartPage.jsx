import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { Trash2, ShoppingCart, ArrowLeft, Minus, Plus } from 'lucide-react';

const CartPage = () => {
  const { cartItems, removeFromCart, updateQty, cartLoading } = useContext(ShopContext);
  const navigate = useNavigate();

  const totalItemsCount = cartItems.reduce((acc, item) => acc + item.qty, 0);
  const totalPriceSum = cartItems.reduce((acc, item) => acc + item.qty * item.price, 0);

  const handleQtyChange = (item, action) => {
    const newQty = action === 'inc' ? item.qty + 1 : item.qty - 1;
    if (newQty > item.countInStock) return;
    updateQty(item._id, newQty);
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (cartLoading) {
    return (
      <div className="main-content empty-state" style={{ padding: '100px 0' }}>
        <p>Loading your cart...</p>
      </div>
    );
  }

  return (
    <div className="main-content animate-fade-in">
      <h1 style={{ fontSize: '28px', marginBottom: '24px', fontFamily: 'var(--font-display)' }}>
        Your Shopping Cart
      </h1>

      {cartItems.length === 0 ? (
        <div className="empty-state" style={{ backgroundColor: 'hsl(var(--bg-card))', borderRadius: '16px', padding: '60px 20px', border: '1px solid hsl(var(--border))' }}>
          <ShoppingCart className="empty-icon" size={60} />
          <h2 style={{ fontSize: '20px', marginBottom: '10px' }}>Your Cart is Empty</h2>
          <p style={{ marginBottom: '24px' }}>It looks like you haven't added any products to your cart yet.</p>
          <Link to="/" className="btn-primary">
            <ArrowLeft size={16} /> Start Shopping
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          {/* Left: Cart Items List */}
          <div className="cart-items-list">
            {cartItems.map((item) => (
              <div key={item._id} className="cart-item-row">
                <img src={item.image} alt={item.name} className="cart-item-img" />

                <div className="cart-item-details">
                  <h3 className="cart-item-title">{item.name}</h3>
                  <p style={{ fontSize: '12px', color: 'hsl(var(--text-muted))', textTransform: 'uppercase', marginBottom: '4px' }}>
                    {item.category}
                  </p>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'baseline' }}>
                    <span className="cart-item-price">₹{item.price.toLocaleString('en-IN')}</span>
                    <span style={{ fontSize: '11px', color: 'hsl(var(--text-muted))' }}>
                      ({item.countInStock} available)
                    </span>
                  </div>
                </div>

                {/* Qty Selector */}
                <div className="qty-selector">
                  <button
                    className="qty-btn"
                    onClick={() => handleQtyChange(item, 'dec')}
                    disabled={item.qty <= 1}
                    aria-label="Decrease quantity"
                  >
                    <Minus size={12} />
                  </button>
                  <input
                    type="number"
                    value={item.qty}
                    min="1"
                    max={item.countInStock}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (!isNaN(value)) {
                        updateQty(item._id, Math.min(item.countInStock, Math.max(1, value)));
                      }
                    }}
                    style={{
                      width: '65px',
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
                    onClick={() => handleQtyChange(item, 'inc')}
                    disabled={item.qty >= item.countInStock}
                    aria-label="Increase quantity"
                  >
                    <Plus size={12} />
                  </button>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => removeFromCart(item._id)}
                  className="btn-remove-item"
                  title="Remove Item"
                  aria-label="Remove item"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          {/* Right: Cart Summary Box */}
          <div className="cart-summary">
            <h2 className="summary-title">Order Summary</h2>

            <div className="summary-row">
              <span>Items Total:</span>
              <span>{totalItemsCount} units</span>
            </div>

            <div className="summary-row">
              <span>Subtotal:</span>
              <span>₹{totalPriceSum.toLocaleString('en-IN')}</span>
            </div>

            <div className="summary-row">
              <span>Shipping:</span>
              <span style={{ color: 'hsl(var(--success))', fontWeight: 'bold' }}>FREE</span>
            </div>

            <div className="summary-row total">
              <span>Total Price:</span>
              <span>₹{totalPriceSum.toLocaleString('en-IN')}</span>
            </div>

            <button onClick={handleCheckout} className="btn-primary btn-checkout">
              Proceed to Checkout
            </button>

            <Link
              to="/"
              className="btn-secondary"
              style={{ width: '100%', marginTop: '10px', textAlign: 'center' }}
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
