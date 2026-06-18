import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { ShieldAlert, Plus, Edit2, Trash2, Check, RefreshCw } from 'lucide-react';

const AdminPage = () => {
  const { user, token, adminConfig, fetchAdminConfig, fetchProducts } = useContext(ShopContext);
  const navigate = useNavigate();

  // Redirect if not admin
  useEffect(() => {
    if (!user || !user.isAdmin) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Tab State
  const [activeTab, setActiveTab] = useState('orders'); // orders | products | settings

  // Lists State
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);

  // Messages State
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Add/Edit Product Modal/Form State
  const [editingProduct, setEditingProduct] = useState(null); // null means adding a new product
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [category, setCategory] = useState('Laptops');
  const [countInStock, setCountInStock] = useState('');

  // Settings State
  const [bannerImage, setBannerImage] = useState(adminConfig.bannerImage || '');
  const [categoriesString, setCategoriesString] = useState(adminConfig.categories ? adminConfig.categories.join(', ') : '');

  // Synchronize state with context configuration
  useEffect(() => {
    if (adminConfig) {
      setBannerImage(adminConfig.bannerImage || '');
      setCategoriesString(adminConfig.categories ? adminConfig.categories.join(', ') : '');
    }
  }, [adminConfig]);

  const loadOrders = async () => {
    setOrdersLoading(true);
    try {
      const res = await fetch('/api/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error('Error fetching admin orders:', err);
    } finally {
      setOrdersLoading(false);
    }
  };

  const loadProducts = async () => {
    setProductsLoading(true);
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error('Error fetching admin products:', err);
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    if (token && user?.isAdmin) {
      loadOrders();
      loadProducts();
    }
  }, [token, user]);

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const showError = (msg) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(''), 3000);
  };

  // Product CRUD Handlers
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    if (!name || !price || !description || !image || !category || countInStock === '') {
      showError('Please fill in all product fields');
      return;
    }

    const payload = {
      name,
      price: Number(price),
      description,
      image,
      category,
      countInStock: Number(countInStock),
    };

    const isEdit = editingProduct !== null;
    const url = isEdit ? `/api/products/${editingProduct._id}` : '/api/products';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showSuccess(isEdit ? 'Product updated successfully!' : 'Product added successfully!');
        resetProductForm();
        loadProducts();
        fetchProducts(); // Refresh main layout products context
      } else {
        const errData = await res.json();
        showError(errData.message || 'Operation failed');
      }
    } catch (err) {
      showError('Network error');
    }
  };

  const startEditProduct = (prod) => {
    setEditingProduct(prod);
    setName(prod.name);
    setPrice(prod.price);
    setDescription(prod.description);
    setImage(prod.image);
    setCategory(prod.category);
    setCountInStock(prod.countInStock);
  };

  const resetProductForm = () => {
    setEditingProduct(null);
    setName('');
    setPrice('');
    setDescription('');
    setImage('');
    setCategory(adminConfig.categories?.[0] || 'Laptops');
    setCountInStock('');
  };

  const handleDeleteProduct = async (prodId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      const res = await fetch(`/api/products/${prodId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        showSuccess('Product deleted successfully');
        loadProducts();
        fetchProducts(); // Refresh catalog context
      } else {
        showError('Failed to delete product');
      }
    } catch (err) {
      showError('Error deleting product');
    }
  };

  // Order Status Handler
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        showSuccess('Order status updated!');
        loadOrders();
      } else {
        const errData = await res.json();
        showError(errData.message || 'Failed to update status');
      }
    } catch (err) {
      showError('Error updating status');
    }
  };

  // Site Configuration Handler
  const handleSettingsSubmit = async (e) => {
    e.preventDefault();

    const categoriesArray = categoriesString
      .split(',')
      .map((c) => c.trim())
      .filter((c) => c.length > 0);

    try {
      const res = await fetch('/api/admin/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bannerImage,
          categories: categoriesArray,
        }),
      });

      if (res.ok) {
        showSuccess('Site configurations updated!');
        fetchAdminConfig(); // Refresh context
      } else {
        showError('Failed to update configurations');
      }
    } catch (err) {
      showError('Error saving configuration');
    }
  };

  if (!user || !user.isAdmin) return null;

  return (
    <div className="main-content animate-fade-in">
      <h1 style={{ fontSize: '28px', marginBottom: '24px', fontFamily: 'var(--font-display)' }}>
        Admin Dashboard
      </h1>

      {successMsg && <div className="alert alert-success">{successMsg}</div>}
      {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}

      {/* Tab Selectors */}
      <div className="admin-tabs">
        <button
          className={`admin-tab ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          Manage Orders
        </button>
        <button
          className={`admin-tab ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          Manage Products
        </button>
        <button
          className={`admin-tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          Site Settings
        </button>
      </div>

      {/* TAB CONTENT: ORDERS */}
      {activeTab === 'orders' && (
        <div>
          {ordersLoading ? (
            <div className="empty-state">
              <RefreshCw size={24} style={{ animation: 'spin 2s linear infinite' }} />
              <p>Loading user orders...</p>
            </div>
          ) : orders.length > 0 ? (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ORDER ID</th>
                    <th>USER</th>
                    <th>DATE</th>
                    <th>TOTAL</th>
                    <th>STATUS</th>
                    <th>UPDATE STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((ord) => (
                    <tr key={ord._id}>
                      <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{ord._id}</td>
                      <td>{ord.user ? ord.user.name : 'Unknown User'}</td>
                      <td>{new Date(ord.createdAt).toLocaleDateString()}</td>
                      <td>₹{ord.totalPrice.toLocaleString('en-IN')}</td>
                      <td>
                        <span
                          style={{
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            backgroundColor:
                              ord.status === 'delivered'
                                ? 'rgba(250, 176, 5, 0.15)'
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
                      </td>
                      <td>
                        <select
                          value={ord.status || 'placed'}
                          onChange={(e) => handleStatusChange(ord._id, e.target.value)}
                          disabled={ord.status === 'cancelled' || ord.status === 'returned'}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '6px',
                            backgroundColor: 'hsl(var(--bg-card))',
                            border: '1px solid hsl(var(--border))',
                            color: 'inherit',
                            fontSize: '12px',
                            cursor: ord.status === 'cancelled' || ord.status === 'returned' ? 'not-allowed' : 'pointer',
                          }}
                        >
                          {(ord.status === 'placed' || !ord.status) && (
                            <>
                              <option value="placed">Placed</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </>
                          )}
                          {ord.status === 'shipped' && (
                            <>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </>
                          )}
                          {ord.status === 'delivered' && (
                            <>
                              <option value="delivered">Delivered</option>
                              <option value="returned">Returned</option>
                            </>
                          )}
                          {ord.status === 'cancelled' && (
                            <option value="cancelled">Cancelled</option>
                          )}
                          {ord.status === 'returned' && (
                            <option value="returned">Returned</option>
                          )}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <ShieldAlert className="empty-icon" size={40} />
              <h3>No orders placed yet</h3>
              <p>When users buy products, they will appear here.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: PRODUCTS */}
      {activeTab === 'products' && (
        <div className="admin-split-layout">
          {/* Left: Products List Table */}
          <div>
            <h2 className="admin-section-title">Product Inventory</h2>
            {productsLoading ? (
              <div className="empty-state">
                <RefreshCw size={24} style={{ animation: 'spin 2s linear infinite' }} />
              </div>
            ) : products.length > 0 ? (
              <div className="admin-table-container">
                <table className="admin-table" style={{ fontSize: '13px' }}>
                  <thead>
                    <tr>
                      <th>PRODUCT</th>
                      <th>CATEGORY</th>
                      <th>PRICE</th>
                      <th>STOCK</th>
                      <th>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((prod) => (
                      <tr key={prod._id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <img
                              src={prod.image}
                              alt={prod.name}
                              style={{ width: '32px', height: '32px', objectFit: 'cover', borderRadius: '4px' }}
                            />
                            <strong style={{ display: 'block', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {prod.name}
                            </strong>
                          </div>
                        </td>
                        <td>{prod.category}</td>
                        <td>₹{prod.price.toLocaleString('en-IN')}</td>
                        <td>{prod.countInStock}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              onClick={() => startEditProduct(prod)}
                              className="admin-btn-action"
                              title="Edit Product"
                              aria-label="Edit product"
                            >
                              <Edit2 size={12} />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(prod._id)}
                              className="admin-btn-action admin-btn-delete"
                              title="Delete Product"
                              aria-label="Delete product"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ color: 'hsl(var(--text-muted))' }}>No products available.</p>
            )}
          </div>

          {/* Right: Add/Edit Form */}
          <div className="admin-section-card">
            <h2 className="admin-section-title">
              {editingProduct ? `Edit: ${editingProduct.name}` : 'Add New Product'}
            </h2>

            <form onSubmit={handleProductSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="prod-name-input">Product Title</label>
                <input
                  id="prod-name-input"
                  type="text"
                  className="form-input"
                  placeholder="e.g. NovaBook Pro 16"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="prod-price-input">Price (₹)</label>
                  <input
                    id="prod-price-input"
                    type="number"
                    min="0"
                    className="form-input"
                    placeholder="e.g. 1499"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="prod-stock-input">Stock Quantity</label>
                  <input
                    id="prod-stock-input"
                    type="number"
                    min="0"
                    className="form-input"
                    placeholder="e.g. 10"
                    value={countInStock}
                    onChange={(e) => setCountInStock(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="prod-cat-select">Category</label>
                <select
                  id="prod-cat-select"
                  className="form-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {(adminConfig.categories || ['Laptops', 'Audio', 'Wearables', 'Phones', 'Accessories']).map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="prod-image-input">Image URL</label>
                <input
                  id="prod-image-input"
                  type="text"
                  className="form-input"
                  placeholder="https://images.unsplash.com/..."
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="prod-desc-input">Description</label>
                <textarea
                  id="prod-desc-input"
                  className="form-textarea"
                  placeholder="Enter detailed description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                ></textarea>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
                {editingProduct && (
                  <button type="button" onClick={resetProductForm} className="btn-secondary">
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB CONTENT: SITE SETTINGS */}
      {activeTab === 'settings' && (
        <div style={{ maxWidth: '600px', margin: '0 auto' }} className="admin-section-card">
          <h2 className="admin-section-title">ShopEZ Config Settings</h2>
          <form onSubmit={handleSettingsSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="setting-banner-input">Hero Banner Image URL</label>
              <input
                id="setting-banner-input"
                type="text"
                className="form-input"
                value={bannerImage}
                onChange={(e) => setBannerImage(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="setting-categories-input">Categories (comma-separated list)</label>
              <input
                id="setting-categories-input"
                type="text"
                className="form-input"
                value={categoriesString}
                onChange={(e) => setCategoriesString(e.target.value)}
                required
              />
              <span style={{ fontSize: '11px', color: 'hsl(var(--text-muted))', marginTop: '4px', display: 'block' }}>
                Separate categories with commas. E.g. Laptops, Audio, Wearables, Phones, Accessories
              </span>
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '10px' }}>
              Save Configurations
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
