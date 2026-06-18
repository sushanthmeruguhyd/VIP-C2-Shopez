import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { User, ShoppingBag, Calendar, ShieldAlert } from 'lucide-react';

const ProfilePage = () => {
  const { user, token } = useContext(ShopContext);
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchMyOrders = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/orders/myorders', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (res.ok) {
          setOrders(data);
        } else {
          setError(data.message || 'Failed to load orders');
        }
      } catch (err) {
        setError('Network error, please try again');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchMyOrders();
    }
  }, [user, token, navigate]);

  if (!user) return null;

  return (
    <div className="main-content animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '28px', marginBottom: '24px', fontFamily: 'var(--font-display)' }}>
        User Account
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px', alignItems: 'start' }}>
        {/* Left: User Info Card */}
        <div style={{ backgroundColor: 'hsl(var(--bg-card))', border: '1px solid hsl(var(--border))', borderRadius: '16px', padding: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '20px' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#fab005', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#090b0f', marginBottom: '14px' }}>
              <User size={40} />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>{user.name}</h2>
            <span style={{ fontSize: '12px', color: 'hsl(var(--text-muted))' }}>{user.isAdmin ? 'Administrator' : 'Customer'}</span>
          </div>

          <div style={{ borderTop: '1px solid hsl(var(--border))', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <span style={{ fontSize: '11px', color: 'hsl(var(--text-muted))', display: 'block', textTransform: 'uppercase' }}>Email Address</span>
              <strong style={{ fontSize: '14px' }}>{user.email}</strong>
            </div>
            <div>
              <span style={{ fontSize: '11px', color: 'hsl(var(--text-muted))', display: 'block', textTransform: 'uppercase' }}>Account Type</span>
              <strong style={{ fontSize: '14px' }}>{user.isAdmin ? 'Admin Portal Enabled' : 'Standard Account'}</strong>
            </div>
          </div>
        </div>

        {/* Right: Previous Orders */}
        <div>
          <h2 style={{ fontSize: '20px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingBag size={20} /> Order History
          </h2>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'hsl(var(--text-muted))' }}>
              Loading your orders...
            </div>
          ) : error ? (
            <div className="alert alert-danger">{error}</div>
          ) : orders.length === 0 ? (
            <div style={{ backgroundColor: 'hsl(var(--bg-card))', border: '1px solid hsl(var(--border))', borderRadius: '16px', padding: '40px 20px', textAlign: 'center' }}>
              <ShoppingBag size={48} style={{ color: 'hsl(var(--text-muted))', marginBottom: '12px' }} />
              <p style={{ color: 'hsl(var(--text-muted))' }}>You haven't placed any orders yet.</p>
              <Link to="/" className="btn-primary" style={{ display: 'inline-block', marginTop: '16px' }}>
                Start Shopping
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {orders.map((ord) => (
                <div
                  key={ord._id}
                  style={{
                    backgroundColor: 'hsl(var(--bg-card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '16px',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid hsl(var(--border))', paddingBottom: '10px' }}>
                    <div>
                      <span style={{ fontSize: '12px', color: 'hsl(var(--text-muted))', display: 'block' }}>
                        Order ID: <span style={{ fontFamily: 'monospace' }}>{ord._id}</span>
                      </span>
                      <span style={{ fontSize: '12px', color: 'hsl(var(--text-muted))', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                        <Calendar size={12} /> {new Date(ord.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        backgroundColor:
                          ord.status === 'delivered'
                            ? 'rgba(0, 210, 196, 0.15)'
                            : ord.status === 'cancelled'
                            ? 'rgba(239, 68, 68, 0.15)'
                            : ord.status === 'returned'
                            ? 'rgba(236, 72, 153, 0.15)'
                            : ord.status === 'shipped'
                            ? 'rgba(59, 130, 246, 0.15)'
                            : 'rgba(156, 163, 175, 0.15)',
                        color:
                          ord.status === 'delivered'
                            ? '#fab005'
                            : ord.status === 'cancelled'
                            ? '#ef4444'
                            : ord.status === 'returned'
                            ? '#ec4899'
                            : ord.status === 'shipped'
                            ? '#3b82f6'
                            : 'hsl(var(--text-muted))',
                      }}
                    >
                      {ord.status || 'placed'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {ord.orderItems.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                        <span>
                          {item.name} <strong style={{ color: 'hsl(var(--text-main))' }}>x {item.qty}</strong>
                        </span>
                        <span>₹{(item.price * item.qty).toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid hsl(var(--border))', paddingTop: '10px', marginTop: '4px' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '15px' }}>Total Price Paid:</span>
                    <strong style={{ fontSize: '16px', color: '#fab005' }}>₹{ord.totalPrice.toLocaleString('en-IN')}</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                    <Link to={`/order/${ord._id}`} className="btn-secondary" style={{ padding: '6px 14px', fontSize: '12px' }}>
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
