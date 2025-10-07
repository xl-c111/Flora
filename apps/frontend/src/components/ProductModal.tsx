import React, { useState } from 'react';
import type { Product } from '../types';
import { useCart } from '../contexts/CartContext';
import { getImageUrl } from '../services/api';
import { SUBSCRIPTION_OPTIONS, calculateSubscriptionPrice, formatSubscriptionSavings } from '../config/subscriptionConfig';
import './ProductModal.css';

interface ProductModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ product, isOpen, onClose }) => {
  const { addItem } = useCart();
  const [isSubscription, setIsSubscription] = useState(false);
  const [selectedFrequency, setSelectedFrequency] = useState<'weekly' | 'fortnightly' | 'monthly'>('monthly');
  const [quantity, setQuantity] = useState(1);
  const [isClosing, setIsClosing] = useState(false);

  // Reset state when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setIsSubscription(false);
      setSelectedFrequency('monthly');
      setQuantity(1);
      setIsClosing(false);
    }
  }, [isOpen]);

  // Handle close with animation
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 200);
  };

  // Prevent body scroll when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen && !isClosing) return null;

  const formatPrice = (priceCents: number): string => {
    return `$${(priceCents / 100).toFixed(2)}`;
  };

  const formatAttributes = (attributes: string[]): string => {
    return attributes
      .map((attr) => attr.charAt(0).toUpperCase() + attr.slice(1).toLowerCase())
      .join(', ');
  };

  const getDisplayPrice = () => {
    if (isSubscription) {
      const discountedPrice = calculateSubscriptionPrice(product.priceCents, selectedFrequency);
      return formatPrice(discountedPrice);
    }
    return formatPrice(product.priceCents);
  };

  // Debug logging
  console.log('ProductModal state:', { isSubscription, selectedFrequency, quantity });

  const getSubscriptionInfo = () => {
    if (!isSubscription) return null;

    const option = SUBSCRIPTION_OPTIONS.find(opt => opt.frequency === selectedFrequency);
    const savings = formatSubscriptionSavings(product.priceCents, selectedFrequency);

    return (
      <div className="subscription-info">
        <span className="savings-badge">{savings} with subscription!</span>
        <span className="frequency-label">{option?.label}</span>
      </div>
    );
  };

  const handleAddToCart = () => {
    const subscriptionDiscount = isSubscription
      ? SUBSCRIPTION_OPTIONS.find(opt => opt.frequency === selectedFrequency)?.discountPercentage
      : undefined;

    addItem({
      product,
      quantity,
      isSubscription,
      subscriptionFrequency: isSubscription ? selectedFrequency : undefined,
      subscriptionDiscount
    });

    const message = isSubscription
      ? `Added ${product.name} (${selectedFrequency} subscription) to cart!`
      : `Added ${product.name} to cart!`;

    alert(message);
    handleClose();
  };

  return (
    <div className={`modal-overlay ${isClosing ? 'closing' : ''}`} onClick={handleClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={handleClose}>&times;</button>

        <div className="modal-body">
          {/* Product Image */}
          <div className="modal-image">
            {product.imageUrl ? (
              <img src={getImageUrl(product.imageUrl)} alt={product.name} />
            ) : (
              <div className="image-placeholder">🌸</div>
            )}
          </div>

          {/* Product Details */}
          <div className="modal-details">
            <h2 className="modal-title">{product.name}</h2>

            {/* Price Display */}
            <div className="price-section">
              <div className="current-price">
                {getDisplayPrice()}
                {isSubscription && (
                  <span className="original-price">{formatPrice(product.priceCents)}</span>
                )}
              </div>
              {getSubscriptionInfo()}
            </div>

            {/* Description */}
            <p className="modal-description">{product.description}</p>

            {/* Attributes */}
            <div className="modal-attributes">
              {product.occasions && product.occasions.length > 0 && (
                <div className="attribute-row">
                  <strong>Perfect for:</strong> {formatAttributes(product.occasions)}
                </div>
              )}
              {product.colors && product.colors.length > 0 && (
                <div className="attribute-row">
                  <strong>Colors:</strong> {formatAttributes(product.colors)}
                </div>
              )}
              {product.moods && product.moods.length > 0 && (
                <div className="attribute-row">
                  <strong>Mood:</strong> {formatAttributes(product.moods)}
                </div>
              )}
            </div>

            {/* Purchase Options */}
            <div className="purchase-options">
              <h3>Purchase Options</h3>

              {/* One-time vs Subscription Toggle */}
              <div className="purchase-type-toggle">
                <label className={`toggle-option ${!isSubscription ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="purchaseType"
                    checked={!isSubscription}
                    onChange={() => setIsSubscription(false)}
                  />
                  One-time Purchase
                </label>
                <label className={`toggle-option ${isSubscription ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="purchaseType"
                    checked={isSubscription}
                    onChange={() => setIsSubscription(true)}
                  />
                  Subscribe & Save
                </label>
              </div>

              {/* Subscription Frequency Options */}
              {isSubscription && (
                <div className="frequency-options">
                  <h4>Delivery Frequency</h4>
                  {SUBSCRIPTION_OPTIONS.map(option => (
                    <label key={option.frequency} className={`frequency-option ${selectedFrequency === option.frequency ? 'active' : ''}`}>
                      <input
                        type="radio"
                        name="frequency"
                        value={option.frequency}
                        checked={selectedFrequency === option.frequency}
                        onChange={(e) => setSelectedFrequency(e.target.value as any)}
                      />
                      <div className="option-details">
                        <span className="option-label">{option.label}</span>
                        <span className="option-description">{option.description}</span>
                        <span className="option-price">
                          {formatPrice(calculateSubscriptionPrice(product.priceCents, option.frequency))}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              {/* Quantity Selector */}
              <div className="quantity-section">
                <label htmlFor="quantity">Quantity:</label>
                <input
                  id="quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="quantity-input"
                />
              </div>

              {/* Add to Cart Button */}
              <button
                className="add-to-cart-btn"
                onClick={handleAddToCart}
                disabled={!product.inStock}
              >
                {product.inStock ? 'Add to Cart' : 'Out of Stock'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;