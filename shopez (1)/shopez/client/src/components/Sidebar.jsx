import React, { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import { SlidersHorizontal } from 'lucide-react';

const Sidebar = () => {
  const {
    adminConfig,
    categoryFilter,
    setCategoryFilter,
    priceFilter,
    setPriceFilter,
    resetFilters,
  } = useContext(ShopContext);

  const categories = ['All', ...(adminConfig.categories || [])];

  return (
    <aside className="sidebar">
      {/* Title */}
      <div className="filter-section" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
        <SlidersHorizontal size={18} className="primary-accent" style={{ color: '#fab005' }} />
        <h2 style={{ fontSize: '18px', fontFamily: 'var(--font-display)', fontWeight: 700 }}>Filters</h2>
      </div>

      {/* Categories */}
      <div className="filter-section">
        <h3 className="filter-title">Categories</h3>
        <div className="category-list">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`category-item ${categoryFilter === cat ? 'active' : ''}`}
              onClick={() => setCategoryFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Max Price */}
      <div className="filter-section">
        <h3 className="filter-title">Max Price</h3>
        <div className="price-slider-container">
          <div className="price-header">
            <span>₹0</span>
            <span className="price-value">₹{priceFilter.toLocaleString('en-IN')}</span>
          </div>
          <input
            type="range"
            min="0"
            max="200000"
            step="5000"
            value={priceFilter}
            onChange={(e) => setPriceFilter(Number(e.target.value))}
            className="price-slider"
          />
          <div className="price-labels">
            <span>₹0</span>
            <span>₹2,00,000</span>
          </div>
        </div>
      </div>

      {/* Reset */}
      <button className="btn-reset" onClick={resetFilters}>
        Reset Filters
      </button>
    </aside>
  );
};

export default Sidebar;
