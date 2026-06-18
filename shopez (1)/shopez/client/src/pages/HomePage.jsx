import React, { useContext } from 'react';
import Sidebar from '../components/Sidebar';
import ProductCard from '../components/ProductCard';
import { ShopContext } from '../context/ShopContext';
import { RefreshCw, LayoutGrid } from 'lucide-react';

const HomePage = () => {
  const { products, productsLoading, sortBy, setSortBy } = useContext(ShopContext);

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  return (
    <div className="main-content">
      <div className="home-layout">
        {/* Left Filters Sidebar */}
        <Sidebar />

        {/* Right Product Grid Area */}
        <div className="catalog-area">
          {/* Top Info Bar */}
          <div className="catalog-header">
            <div className="items-count">
              Showing <strong>{products.length}</strong> items
            </div>

            <div className="sort-container">
              <span>Sort by:</span>
              <select className="sort-select" value={sortBy} onChange={handleSortChange}>
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>

          {/* Product Cards Grid */}
          {productsLoading ? (
            <div className="empty-state" style={{ padding: '80px 0' }}>
              <RefreshCw className="empty-icon" size={36} style={{ animation: 'spin 2s linear infinite' }} />
              <p>Loading catalog products...</p>
              <style>{`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}</style>
            </div>
          ) : products.length > 0 ? (
            <div className="product-grid">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <LayoutGrid className="empty-icon" size={48} />
              <h3>No products found</h3>
              <p>Try resetting the filters or modifying your search query.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
