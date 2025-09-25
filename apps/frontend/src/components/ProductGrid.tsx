import React from 'react';
import type { Product } from '../types';
import ProductCard from './ProductCard';

/**
 * ProductGrid Component
 *
 * This component displays a grid of product cards.
 * It handles the loading state and shows products in a responsive grid layout.
 *
 * The component uses the existing ProductCard component to display individual products.
 */

interface ProductGridProps {
  // Array of products to display
  products: Product[];

  // Loading state to show loading indicator
  isLoading: boolean;
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, isLoading }) => {
  /**
   * Loading State
   * Show loading indicator while fetching products
   */
  if (isLoading) {
    return (
      <div className="product-grid-loading">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading products...</p>
        </div>

        {/* Loading skeleton - show placeholder cards */}
        <div className="product-grid skeleton">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="product-card skeleton-card"
            >
              <div className="skeleton-image"></div>
              <div className="skeleton-content">
                <div className="skeleton-title"></div>
                <div className="skeleton-price"></div>
                <div className="skeleton-button"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /**
   * Empty State
   * Show message when no products match the current filters
   */
  if (!products || products.length === 0) {
    return (
      <div className="product-grid-empty">
        <div className="empty-state">
          <div className="empty-icon">🌸</div>
          <h3>No flowers found</h3>
          <p>
            Try adjusting your filters or search terms to find more products.
          </p>
          <div className="empty-suggestions">
            <h4>Suggestions:</h4>
            <ul>
              <li>Clear some filters to see more options</li>
              <li>Try searching for different flower names</li>
              <li>
                Check if you've selected "In Stock Only" and try "All Products"
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Products Grid
   * Display the actual products in a responsive grid
   */
  return (
    <div className="product-grid-container">
      {/* Grid Header - could add sorting options here later */}
      <div className="grid-header">
        <span className="product-count">
          {products.length} product{products.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Products Grid */}
      <div className="product-grid">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
          />
        ))}
      </div>

      {/* Grid Footer - could add "Load More" button here if needed */}
      <div className="grid-footer">
        <div className="grid-info">Showing {products.length} products</div>
      </div>
    </div>
  );
};

export default ProductGrid;
