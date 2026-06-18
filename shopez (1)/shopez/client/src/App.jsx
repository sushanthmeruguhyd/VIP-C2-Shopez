import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ShopProvider } from './context/ShopContext';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminPage from './pages/AdminPage';
import ProfilePage from './pages/ProfilePage';

function App() {
  return (
    <ShopProvider>
      <Router>
        <div className="app-container">
          {/* Header/Navbar */}
          <Header />

          {/* Main Application Body */}
          <main style={{ minHeight: 'calc(100vh - 80px)' }}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/product/:id" element={<ProductPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/order/:id" element={<OrderConfirmationPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Routes>
          </main>

          {/* Muted Footer */}
          <footer
            style={{
              textAlign: 'center',
              padding: '24px',
              fontSize: '13px',
              color: 'hsl(var(--text-muted))',
              borderTop: '1px solid hsl(var(--border))',
              backgroundColor: 'hsl(var(--bg-card))',
            }}
          >
            &copy; {new Date().getFullYear()} ShopEZ. All rights reserved. Secure checkout and premium hardware.
          </footer>
        </div>
      </Router>
    </ShopProvider>
  );
}

export default App;
