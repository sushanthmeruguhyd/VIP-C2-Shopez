import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { ShieldAlert, CreditCard, Landmark, Truck } from 'lucide-react';

const CheckoutPage = () => {
  const { user, token, cartItems, clearCart } = useContext(ShopContext);
  const navigate = useNavigate();

  // If no items in cart, send user back to home
  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/');
    }
    if (!user) {
      navigate('/login?redirect=checkout');
    }
  }, [cartItems, user, navigate]);

  // Form State
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [specificRequirements, setSpecificRequirements] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const totalPrice = cartItems.reduce((acc, item) => acc + item.qty * item.price, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!address || !city || !postalCode || !country) {
      setError('Please fill in all shipping fields');
      return;
    }

    setLoading(true);
    setError('');

    const orderPayload = {
      orderItems: cartItems.map((item) => ({
        name: item.name,
        qty: item.qty,
        image: item.image,
        price: item.price,
        product: item._id,
      })),
      shippingAddress: {
        address,
        city,
        postalCode,
        country,
      },
      paymentMethod,
      specificRequirements,
      totalPrice,
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();

      if (res.ok) {
        // Order created successfully
        clearCart(); // Clear local/database cart
        navigate(`/order/${data._id}`); // Direct to order details review
      } else {
        setError(data.message || 'Failed to place order');
      }
    } catch (err) {
      setError('Network error, please try again');
    } finally {
      setLoading(false);
    }
  };

  if (!user || cartItems.length === 0) return null;

  return (
    <div className="main-content animate-fade-in">
      <h1 style={{ fontSize: '28px', marginBottom: '24px', fontFamily: 'var(--font-display)' }}>
        Checkout & Order Details
      </h1>

      {error && (
        <div className="alert alert-danger" style={{ maxWidth: '900px' }}>
          <ShieldAlert size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="checkout-layout">
        {/* Left: Checkout Form */}
        <form onSubmit={handleSubmit} className="checkout-form" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Shipping Address Section */}
          <div style={{ backgroundColor: 'hsl(var(--bg-card))', border: '1px solid hsl(var(--border))', borderRadius: '16px', padding: '24px' }}>
            <h2 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', color: '#00d2c4' }}>
              <Truck size={20} /> Shipping Details
            </h2>

            <div className="form-group">
              <label className="form-label">Street Address</label>
              <input
                type="text"
                className="form-input"
                placeholder="123 Main St, Apt 4"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">City</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="New York"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Postal / ZIP Code</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="10001"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Country</label>
              <input
                type="text"
                className="form-input"
                placeholder="United States"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Payment Method Section */}
          <div style={{ backgroundColor: 'hsl(var(--bg-card))', border: '1px solid hsl(var(--border))', borderRadius: '16px', padding: '24px' }}>
            <h2 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', color: '#00d2c4' }}>
              <CreditCard size={20} /> Payment Method
            </h2>

            <div className="form-group" style={{ display: 'flex', gap: '16px', marginBottom: 0 }}>
              <label
                style={{
                  flex: 1,
                  border: `1px solid ${paymentMethod === 'Credit Card' ? 'hsl(var(--primary))' : 'hsl(var(--border))'}`,
                  borderRadius: '10px',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  backgroundColor: paymentMethod === 'Credit Card' ? 'hsl(var(--primary-glow))' : 'transparent',
                }}
              >
                <input
                  type="radio"
                  name="payment"
                  value="Credit Card"
                  checked={paymentMethod === 'Credit Card'}
                  onChange={() => setPaymentMethod('Credit Card')}
                  style={{ accentColor: '#00d2c4' }}
                />
                <CreditCard size={18} />
                <span>Credit / Debit Card</span>
              </label>

              <label
                style={{
                  flex: 1,
                  border: `1px solid ${paymentMethod === 'PayPal' ? 'hsl(var(--primary))' : 'hsl(var(--border))'}`,
                  borderRadius: '10px',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  backgroundColor: paymentMethod === 'PayPal' ? 'hsl(var(--primary-glow))' : 'transparent',
                }}
              >
                <input
                  type="radio"
                  name="payment"
                  value="PayPal"
                  checked={paymentMethod === 'PayPal'}
                  onChange={() => setPaymentMethod('PayPal')}
                  style={{ accentColor: '#00d2c4' }}
                />
                <Landmark size={18} />
                <span>PayPal</span>
              </label>
            </div>
          </div>

          {/* Specific Requirements Section */}
          <div style={{ backgroundColor: 'hsl(var(--bg-card))', border: '1px solid hsl(var(--border))', borderRadius: '16px', padding: '24px' }}>
            <h2 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: '#00d2c4' }}>
              Custom Product Requirements
            </h2>
            <p style={{ fontSize: '13px', color: 'hsl(var(--text-muted))', marginBottom: '16px' }}>
              Add any specific request (e.g. gift packaging, card note, device color choices, or delivery notes).
            </p>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <textarea
                className="form-textarea"
                placeholder="E.g., Please write 'Happy Birthday!' on the card..."
                value={specificRequirements}
                onChange={(e) => setSpecificRequirements(e.target.value)}
              ></textarea>
            </div>
          </div>
        </form>

        {/* Right Sidebar: Order Summary & Place Order Button */}
        <div className="cart-summary">
          <h2 className="summary-title">Order Items</h2>

          <div
            style={{
              maxHeight: '200px',
              overflowY: 'auto',
              marginBottom: '16px',
              borderBottom: '1px solid hsl(var(--border))',
              paddingBottom: '16px',
            }}
          >
            {cartItems.map((item) => (
              <div
                key={item._id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '13px',
                  marginBottom: '10px',
                }}
              >
                <span style={{ color: 'hsl(var(--text-muted))' }}>
                  {item.name} <strong style={{ color: 'hsl(var(--text-main))' }}>x {item.qty}</strong>
                </span>
                <span>₹{(item.price * item.qty).toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>

          <div className="summary-row">
            <span>Subtotal:</span>
            <span>₹{totalPrice.toLocaleString('en-IN')}</span>
          </div>

          <div className="summary-row">
            <span>Shipping:</span>
            <span style={{ color: 'hsl(var(--success))', fontWeight: 'bold' }}>FREE</span>
          </div>

          <div className="summary-row total">
            <span>Grand Total:</span>
            <span>₹{totalPrice.toLocaleString('en-IN')}</span>
          </div>

          <button
            onClick={handleSubmit}
            className="btn-primary btn-checkout"
            disabled={loading}
            style={{ marginTop: '20px' }}
          >
            {loading ? 'Processing Order...' : 'Place Secure Order'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
