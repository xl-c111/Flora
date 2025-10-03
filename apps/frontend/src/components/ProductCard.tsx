import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Product } from '../types';
import { useCart } from '../contexts/CartContext';
import { getImageUrl } from '../services/api';
import './ProductCard.css';

/**
 * ProductCard Component
 *
 * This component displays a single product in a card format.
 * It shows the product image, name, price, and key attributes.
 * Clicking the card navigates to the product detail page.
 *
 * This component is used in the ProductGrid to display multiple products.
 */

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const navigate = useNavigate();
  const { addItem } = useCart();

  /**
   * Format price from cents to dollars
   * Backend stores price in cents, we display in dollars
   */
  const formatPrice = (priceCents: number): string => {
    return `$${(priceCents / 100).toFixed(2)}`;
  };

  /**
   * Format array of attributes for display
   * Takes an array like ['ROMANTIC', 'ELEGANT'] and makes it readable
   */
  const formatAttributes = (attributes: string[]): string => {
    return attributes
      .map((attr) => attr.charAt(0).toUpperCase() + attr.slice(1).toLowerCase())
      .join(', ');
  };

  /**
   * Get stock status styling
   */
  const getStockStatus = () => {
    return product.inStock
      ? { text: 'In Stock', className: 'in-stock' }
      : { text: 'Out of Stock', className: 'out-of-stock' };
  };

  const stockStatus = getStockStatus();

  return (
    <article
      className={`product-card ${!product.inStock ? 'out-of-stock' : ''}`}
      role="group"
      aria-label={`${product.name} - ${formatPrice(product.priceCents)}`}
    >
      {/* Product Link - makes entire card clickable */}
      <Link
        to={`/products/${product.id}`}
        className="product-link"
        aria-label={`View details for ${product.name}`}
      >
        {/* Product Image */}
        <div className="product-image-container">
          {product.imageUrl ? (
            <img
              src={getImageUrl(product.imageUrl)}
              alt={product.name}
              className="product-image"
              loading="lazy"
            />
          ) : (
            /* Placeholder if no image */
            <div className="product-image-placeholder">
              <span className="placeholder-icon">🌸</span>
            </div>
          )}

          {/* Stock Status Badge */}
          <div className={`stock-badge ${stockStatus.className}`}>
            {stockStatus.text}
          </div>
        </div>

        {/* Product Information */}
        <div className="product-info">
          {/* Product Name */}
          <h3 className="product-name">{product.name}</h3>

          {/* Product Price */}
          <div className="product-price">{formatPrice(product.priceCents)}</div>

          {/* Product Attributes - show a few key ones */}
          <div className="product-attributes">
            {/* Occasions */}
            {product.occasions && product.occasions.length > 0 && (
              <div className="attribute-group">
                <span className="attribute-label">Perfect for:</span>
                <span className="attribute-value">
                  {formatAttributes(product.occasions.slice(0, 2))}
                  {product.occasions.length > 2 && '...'}
                </span>
              </div>
            )}

            {/* Colors */}
            {product.colors && product.colors.length > 0 && (
              <div className="attribute-group">
                <span className="attribute-label">Colors:</span>
                <span className="attribute-value">
                  {formatAttributes(product.colors.slice(0, 3))}
                  {product.colors.length > 3 && '...'}
                </span>
              </div>
            )}
          </div>

          {/* Product Description - truncated */}
          {product.description && (
            <div className="product-description">
              {product.description.length > 100
                ? `${product.description.substring(0, 100)}...`
                : product.description}
            </div>
          )}
        </div>
      </Link>

      {/* Card Actions */}
      <div className="product-actions">
        <button
          className={`view-details-btn ${!product.inStock ? 'disabled' : ''}`}
          disabled={!product.inStock}
          onClick={() => navigate(`/products/${product.id}`)}
          aria-label={`${
            product.inStock ? 'View details for' : 'Out of stock:'
          } ${product.name}`}
        >
          {product.inStock ? 'View Details' : 'Out of Stock'}
        </button>
      </div>

      {/* Quick Action Buttons (outside the link so they don't trigger navigation) */}
      <div className="quick-actions">
        <button
          className="quick-action-btn favorite-btn"
          onClick={(e) => {
            e.preventDefault();
            // TODO: Implement favorite functionality
            console.log('Add to favorites:', product.id);
          }}
          title="Add to favorites"
        >
          ♡
        </button>

        {product.inStock && (
          <button
            className="quick-action-btn cart-btn"
            onClick={(e) => {
              e.preventDefault();
              addItem({
                product,
                quantity: 1,
              });
              alert(`Added ${product.name} to cart!`);
            }}
            title="Add to cart"
          >
            🛒
          </button>
        )}
      </div>

    </article>
  );
};

export default ProductCard;
