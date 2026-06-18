import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { Check, ShieldAlert, ArrowRight, Package } from 'lucide-react';

const OrderConfirmationPage = () => {
  const { id } = useParams();
  const { token } = useContext(ShopContext);

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/orders/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (res.ok) {
          setOrder(data);
        } else {
          setError(data.message || 'Order not found');
        }
      } catch (err) {
        setError('Error retrieving order information');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchOrderDetails();
    }
  }, [id, token]);

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      const res = await fetch(`/api/orders/${id}/cancel`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setOrder(data);
        alert('Order has been cancelled successfully.');
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to cancel order');
      }
    } catch (err) {
      alert('Error cancelling order');
    }
  };

  if (loading) {
    return (
      <div className="main-content empty-state" style={{ padding: '100px 0' }}>
        <p>Loading order confirmation...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="main-content empty-state" style={{ padding: '100px 0' }}>
        <ShieldAlert size={48} className="empty-icon" style={{ color: 'hsl(var(--danger))' }} />
        <h3>Error loading order</h3>
        <p>{error}</p>
        <Link to="/" className="btn-primary" style={{ marginTop: '24px' }}>
          Go back to Catalog
        </Link>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="main-content animate-fade-in" style={{ maxWidth: '900px' }}>
      {/* Confirmation Card */}
      <div className="confirmation-card">
        {/* Success Header */}
        <div className="success-badge-container">
          <div className="success-icon-circle">
            <Check size={36} strokeWidth={3} />
          </div>
          <h1 className="success-title">Thank You For Your Order!</h1>
          <p style={{ color: 'hsl(var(--text-muted))' }}>
            Order ID: <strong>{order._id}</strong>
          </p>
          <div
            style={{
              display: 'inline-block',
              backgroundColor: 'rgba(26, 178, 89, 0.1)',
              color: 'hsl(var(--success))',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: 'bold',
              marginTop: '10px',
            }}
          >
            Payment Secured Successfully
          </div>
        </div>

        {/* Detailed Breakdown Grid */}
        <div className="details-grid">
          {/* Shipping Address */}
          <div>
            <h3 className="detail-block-title">Shipping Address</h3>
            <p className="detail-block-text">
              {order.shippingAddress.address}
              <br />
              {order.shippingAddress.city}, {order.shippingAddress.postalCode}
              <br />
              {order.shippingAddress.country}
            </p>
          </div>

          {/* Payment Method */}
          <div>
            <h3 className="detail-block-title">Payment Info</h3>
            <p className="detail-block-text">
              Method: <strong>{order.paymentMethod}</strong>
              <br />
              Status: <span style={{ color: 'hsl(var(--success))', fontWeight: 600 }}>Paid</span>
            </p>
          </div>

          {/* Specific Requirements */}
          <div style={{ gridColumn: 'span 2', borderTop: '1px solid hsl(var(--border))', paddingTop: '20px' }}>
            <h3 className="detail-block-title">Custom Requests / Requirements</h3>
            <p className="detail-block-text" style={{ fontStyle: order.specificRequirements ? 'normal' : 'italic', color: order.specificRequirements ? 'hsl(var(--text-main))' : 'hsl(var(--text-muted))' }}>
              {order.specificRequirements || 'None specified'}
            </p>
          </div>

          {/* Delivery Status */}
          <div style={{ gridColumn: 'span 2', borderTop: '1px solid hsl(var(--border))', paddingTop: '20px' }}>
            <h3 className="detail-block-title">Order Status</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px' }}>
              <Package size={16} className="primary-accent" style={{ color: '#fab005' }} />
              <span
                style={{
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  color:
                    order.status === 'delivered'
                      ? 'hsl(var(--success))'
                      : order.status === 'cancelled'
                      ? 'hsl(var(--danger))'
                      : order.status === 'returned'
                      ? '#ec4899'
                      : order.status === 'shipped'
                      ? '#3b82f6'
                      : 'hsl(var(--text-muted))',
                }}
              >
                {order.status || 'placed'}
              </span>
              {order.status === 'delivered' && order.deliveredAt && (
                <span style={{ fontSize: '13px', color: 'hsl(var(--text-muted))' }}>
                  (on {new Date(order.deliveredAt).toLocaleDateString()})
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Order Items Summary */}
      <div className="confirmation-card" style={{ marginTop: '24px' }}>
        <h2 style={{ fontSize: '18px', borderBottom: '1px solid hsl(var(--border))', paddingBottom: '12px', marginBottom: '16px' }}>
          Items Purchased
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {order.orderItems.map((item) => (
            <div
              key={item._id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <img
                  src={item.image}
                  alt={item.name}
                  style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '4px', backgroundColor: 'hsl(var(--bg-hover))' }}
                />
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 'bold' }}>{item.name}</h4>
                  <span style={{ fontSize: '12px', color: 'hsl(var(--text-muted))' }}>
                    ₹{item.price.toLocaleString('en-IN')} x {item.qty}
                  </span>
                </div>
              </div>
              <span style={{ fontWeight: 'bold' }}>₹{(item.price * item.qty).toLocaleString('en-IN')}</span>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: '20px',
            borderTop: '1px solid hsl(var(--border))',
            paddingTop: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            fontFamily: 'var(--font-display)',
            fontSize: '18px',
            fontWeight: '800',
          }}
        >
          <span>Total Price Paid:</span>
          <span style={{ color: '#fab005' }}>₹{order.totalPrice.toLocaleString('en-IN')}</span>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '30px' }}>
        <Link to="/" className="btn-primary">
          <span>Continue Shopping</span>
          <ArrowRight size={16} />
        </Link>
        {(order.status === 'placed' || order.status === 'shipped' || !order.status) && (
          <button
            onClick={handleCancelOrder}
            className="btn-secondary"
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              borderColor: '#ef4444',
              color: '#ef4444',
              cursor: 'pointer',
              padding: '10px 20px',
              borderRadius: '8px',
              fontWeight: 'bold',
            }}
          >
            Cancel Order
          </button>
        )}
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
