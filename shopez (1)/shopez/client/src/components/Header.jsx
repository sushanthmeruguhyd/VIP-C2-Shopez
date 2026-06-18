import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Search, ShoppingCart, User, LogOut, Shield } from 'lucide-react';
import { ShopContext } from '../context/ShopContext';

const Header = () => {
  const { user, logout, cartItems, searchQuery, setSearchQuery } = useContext(ShopContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    // Redirect to home page if user starts typing search on other pages
    if (location.pathname !== '/') {
      navigate('/');
    }
  };

  return (
    <header className="header">
      <div className="header-inner">
        {/* Logo */}
        <Link to="/" className="logo-container">
          <ShoppingBag className="logo-icon" size={28} strokeWidth={2.5} />
          <span>SHOPEZ</span>
        </Link>

        {/* Search Input */}
        <div className="search-bar">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            className="search-input"
            placeholder="Search products..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>

        {/* Nav Links */}
        <nav className="nav-links">
          <Link
            to="/"
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            Shop
          </Link>

          <Link
            to="/cart"
            className={`nav-link ${location.pathname === '/cart' ? 'active' : ''}`}
          >
            <ShoppingCart size={18} />
            <span>Cart</span>
            {cartCount > 0 && <span className="badge">{cartCount}</span>}
          </Link>

          {user ? (
            <>
              {/* User Profile Info */}
              <Link
                to="/profile"
                className={`nav-link ${location.pathname === '/profile' ? 'active' : ''}`}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <User size={16} />
                <span>{user.name}</span>
                {user.isAdmin && (
                  <span className="badge admin-badge" style={{ backgroundColor: '#fab005', color: '#090b0f', fontWeight: 'bold' }}>
                    Admin
                  </span>
                )}
              </Link>

              {/* Admin Dashboard link if user is admin */}
              {user.isAdmin && (
                <Link
                  to="/admin"
                  className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`}
                  style={{ color: '#007bff' }}
                >
                  <Shield size={16} />
                  <span>Dashboard</span>
                </Link>
              )}

              {/* Logout Button */}
              <button onClick={handleLogout} className="nav-link" style={{ background: 'none', border: 'none' }}>
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className={`nav-link ${location.pathname === '/login' ? 'active' : ''}`}
            >
              <User size={18} />
              <span>Login</span>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
