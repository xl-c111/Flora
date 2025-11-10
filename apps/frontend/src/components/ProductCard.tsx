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
      style={{
        width: '300px',
        height: '525px',
        // padding: '40px',
        alignContent: 'center',
        margin: '25px',
        // border: 'dashed',
      }}>
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
              style={{
                width:'100%',
                height: '100%',
                objectFit: 'cover',
                // borderRadius: 'var(--radius-image)',
              }} />
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

      </Link>
        {/* Product Information */}
        <div className="product-info">
          <div className="product-header">
            {/* Product Name */}
            <h4 className="product-card-name">
              {product.name}
            </h4>
            {/* Product Price */}
            <h4 className="product-card-price">
              {formatPrice(product.priceCents)}
            </h4>
        </div>

          {/* Product Attributes - show a few key ones */}
          {/* Colours below */}
          {/* <div className="product-attributes">
            Occasions
            {product.occasions && product.occasions.length > 0 && (
              <div className="attribute-group">
                <span className="attribute-label">Perfect for: product card.tsx</span>
                <span className="attribute-value">
                  {formatAttributes(product.occasions.slice(0, 2))}
                  {product.occasions.length > 2 && '...'}
                </span>
                product attributes
              </div>
            )}

            {product.colors && product.colors.length > 0 && (
              <div className="attribute-group">
                <span className="attribute-label">Colors:</span>
                <span className="attribute-value">
                  {formatAttributes(product.colors.slice(0, 3))}
                  {product.colors.length > 3 && '...'}
                </span>
              </div>
            )}
          </div> */}

          {/* Product Description - truncated */}
          {product.description && (
            <div className="product-card-description">
              {product.description.length > 100
                ? `${product.description.substring(0, 100)}...`
                : product.description}
            </div>
          )}
        </div>


      {/* Card Actions */}
      <div className="product-actions">
        <button
          className={`view-details-product-card-btn ${!product.inStock ? 'disabled' : ''}`}
          disabled={!product.inStock}
          onClick={() => navigate(`/products/${product.id}`)}
          aria-label={`${
            product.inStock ? 'View details for' : 'Out of stock:'
          } ${product.name}`}
          style={{
            float: 'left',
            // border:'1px solid',
            // borderColor: 'var(--border-colour)',
          }}>
          <p>{product.inStock ? 'View Details' : 'Out of Stock'}</p>
        </button>

        {product.inStock && (
          <button
            className="buy-now-button"
            onClick={(e) => {
              e.preventDefault();
              addItem({
                product,
                quantity: 1,
              });
              // alert(`Added ${product.name} to cart!`);
            }}
            title="Add to cart"
            style={{
            float: 'right',
            // border:'1px solid',
            // borderColor: 'var(--border-colour)',
            }}
          >
          <p>Add to Cart</p>
          </button>
        )}
      </div>

{/* favourite button OUT OF SCOPE */}
      {/* Quick Action Buttons (outside the link so they don't trigger navigation) */}
      {/* <div className="quick-actions">
        <button
          className="quick-action-btn favorite-btn"
          onClick={(e) => {
            e.preventDefault();
            // TODO: Implement favorite functionality
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
      </div> */}

    </article>
  );
};

export default ProductCard;
