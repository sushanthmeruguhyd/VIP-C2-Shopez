import React, { createContext, useState, useEffect } from 'react';

export const ShopContext = createContext();

export const ShopProvider = ({ children }) => {
  // Authentication State
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('shopez_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('shopez_token') || '';
  });

  // Cart State
  const [cartItems, setCartItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(false);

  // Products and Category Config State
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [adminConfig, setAdminConfig] = useState({
    bannerImage: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=1200&auto=format&fit=crop',
    categories: ['Laptops', 'Audio', 'Wearables', 'Phones', 'Accessories'],
  });

  // Active filters in state
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [priceFilter, setPriceFilter] = useState(200000);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');

  // Load products based on filters
  const fetchProducts = async () => {
    setProductsLoading(true);
    try {
      let url = `/api/products?sortBy=${sortBy}`;
      if (categoryFilter && categoryFilter !== 'All') {
        url += `&category=${encodeURIComponent(categoryFilter)}`;
      }
      if (priceFilter) {
        url += `&maxPrice=${priceFilter}`;
      }
      if (searchQuery) {
        url += `&search=${encodeURIComponent(searchQuery)}`;
      }

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setProductsLoading(false);
    }
  };

  // Sync products whenever filters or sort parameters change
  useEffect(() => {
    fetchProducts();
  }, [categoryFilter, priceFilter, searchQuery, sortBy]);

  // Fetch admin settings (e.g. categories & banner)
  const fetchAdminConfig = async () => {
    try {
      const res = await fetch('/api/admin/config');
      if (res.ok) {
        const data = await res.json();
        setAdminConfig(data);
      }
    } catch (error) {
      console.error('Error fetching admin config:', error);
    }
  };

  useEffect(() => {
    fetchAdminConfig();
  }, []);

  // Fetch cart from server on login
  const fetchCart = async (authToken) => {
    const currentToken = authToken || token;
    if (!currentToken) return;

    setCartLoading(true);
    try {
      const res = await fetch('/api/cart', {
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        // Backend returns cart: { user, items: [{ product, qty }] }
        // Format it into items with details
        const formattedItems = data.items
          .filter(item => item.product !== null)
          .map((item) => ({
            _id: item.product._id,
            name: item.product.name,
            price: item.product.price,
            image: item.product.image,
            category: item.product.category,
            countInStock: item.product.countInStock,
            qty: item.qty,
          }));
        setCartItems(formattedItems);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setCartLoading(false);
    }
  };

  useEffect(() => {
    if (user && token) {
      fetchCart();
    } else {
      setCartItems([]);
    }
  }, [user, token]);

  // Sync cart items to database
  const syncCartToDB = async (itemsList, authToken) => {
    const currentToken = authToken || token;
    if (!currentToken) return;

    try {
      const payload = itemsList.map((item) => ({
        product: item._id,
        qty: item.qty,
      }));

      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentToken}`,
        },
        body: JSON.stringify({ items: payload }),
      });
      return res;
    } catch (error) {
      console.error('Error syncing cart to database:', error);
    }
  };

  // Auth Functions
  const login = async (email, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      setUser({
        _id: data._id,
        name: data.name,
        email: data.email,
        isAdmin: data.isAdmin,
      });
      setToken(data.token);
      localStorage.setItem('shopez_user', JSON.stringify({
        _id: data._id,
        name: data.name,
        email: data.email,
        isAdmin: data.isAdmin,
      }));
      localStorage.setItem('shopez_token', data.token);
      fetchCart(data.token);
      return { success: true };
    } else {
      return { success: false, message: data.message || 'Login failed' };
    }
  };

  const register = async (name, email, password) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      setUser({
        _id: data._id,
        name: data.name,
        email: data.email,
        isAdmin: data.isAdmin,
      });
      setToken(data.token);
      localStorage.setItem('shopez_user', JSON.stringify({
        _id: data._id,
        name: data.name,
        email: data.email,
        isAdmin: data.isAdmin,
      }));
      localStorage.setItem('shopez_token', data.token);
      return { success: true };
    } else {
      return { success: false, message: data.message || 'Registration failed' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error API:', err);
    }
    setUser(null);
    setToken('');
    setCartItems([]);
    localStorage.removeItem('shopez_user');
    localStorage.removeItem('shopez_token');
  };

  // Cart Operations
  const addToCart = async (product, qty = 1) => {
    let finalCart;
    setCartItems((prev) => {
      const exists = prev.find((item) => item._id === product._id);
      let newCart;
      if (exists) {
        newCart = prev.map((item) =>
          item._id === product._id
            ? { ...item, qty: Math.min(item.qty + qty, product.countInStock) }
            : item
        );
      } else {
        newCart = [...prev, { ...product, qty: Math.min(qty, product.countInStock) }];
      }
      finalCart = newCart;
      return newCart;
    });

    if (user && token && finalCart) {
      await syncCartToDB(finalCart);
    }
  };

  const removeFromCart = (productId) => {
    setCartItems((prev) => {
      const newCart = prev.filter((item) => item._id !== productId);
      if (user && token) {
        syncCartToDB(newCart);
      }
      return newCart;
    });
  };

  const updateQty = (productId, qty) => {
    setCartItems((prev) => {
      const newCart = prev.map((item) =>
        item._id === productId ? { ...item, qty: Math.min(Math.max(1, qty), item.countInStock) } : item
      );
      if (user && token) {
        syncCartToDB(newCart);
      }
      return newCart;
    });
  };

  const clearCart = () => {
    setCartItems([]);
    if (user && token) {
      fetch('/api/cart', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    }
  };

  const resetFilters = () => {
    setCategoryFilter('All');
    setPriceFilter(200000);
    setSearchQuery('');
    setSortBy('featured');
  };

  return (
    <ShopContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        cartItems,
        cartLoading,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
        products,
        productsLoading,
        fetchProducts,
        adminConfig,
        fetchAdminConfig,
        categoryFilter,
        setCategoryFilter,
        priceFilter,
        setPriceFilter,
        searchQuery,
        setSearchQuery,
        sortBy,
        setSortBy,
        resetFilters,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};
