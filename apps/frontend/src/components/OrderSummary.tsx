import React, { useState, useRef } from 'react';
import type { CartItem } from '../contexts/CartContext';
import { getImageUrl } from '../services/api';
import '../styles/OrderSummary.css';

interface OrderSummaryProps {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  onApplyDiscount?: (code: string) => void;
  onUpdateQuantity?: (itemId: string, quantity: number) => void;
  onRemoveItem?: (itemId: string) => void;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  items,
  subtotal,
  shipping,
  total,
  onApplyDiscount,
  onUpdateQuantity,
  onRemoveItem,
}) => {
  const [discountCode, setDiscountCode] = useState('');
  const itemsContainerRef = useRef<HTMLDivElement>(null);

  const handleApplyDiscount = () => {
    if (discountCode.trim() && onApplyDiscount) {
      onApplyDiscount(discountCode.trim());
    }
  };

  const handleScrollDown = () => {
    if (itemsContainerRef.current) {
      itemsContainerRef.current.scrollBy({
        top: 200,
        behavior: 'smooth'
      });
    }
  };

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  return (
    <div className="order-summary">
      <div className="order-summary-items-wrapper">
        {items.length > 3 && (
          <button className="scroll-hint" onClick={handleScrollDown}>
            Scroll for more items <span className="scroll-arrow">↓</span>
          </button>
        )}
        <div className="order-summary-items" ref={itemsContainerRef}>
          {items.map((item) => (
          <div key={item.id} className="order-item">
            <div className="order-item-image">
              {item.product.imageUrl ? (
                <img
                  src={getImageUrl(item.product.imageUrl)}
                  alt={item.product.name}
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder-flower.png';
                  }}
                />
              ) : (
                <div className="placeholder-image">🌸</div>
              )}
              <span className="item-quantity-badge">{item.quantity}</span>
            </div>
            <div className="order-item-details">
              <h3>{item.product.name}</h3>

              {/* Purchase Type */}
              {item.isSubscription ? (
                <div className="item-subscription-info">
                  <p className="item-type subscription">
                    <span className="badge">Subscription</span>
                  </p>
                  {item.subscriptionFrequency && (
                    <p className="item-frequency">
                      Every {item.subscriptionFrequency === 'weekly' ? '1 week' :
                             item.subscriptionFrequency === 'fortnightly' ? '2 weeks' :
                             '1 month'} {item.subscriptionDiscount && `• Save ${item.subscriptionDiscount}%`}
                    </p>
                  )}
                </div>
              ) : (
                <p className="item-type one-time">One-time purchase</p>
              )}

              {/* Delivery Date */}
              {item.selectedDate && (
                <p className="item-delivery-date">
                  Delivery: {new Date(item.selectedDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              )}

              {/* Quantity Controls */}
              {onUpdateQuantity && (
                <div className="quantity-controls">
                  <button
                    className="quantity-btn"
                    onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    −
                  </button>
                  <span className="quantity-display">{item.quantity}</span>
                  <button
                    className="quantity-btn"
                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                  >
                    +
                  </button>
                  {onRemoveItem && (
                    <button
                      className="remove-btn"
                      onClick={() => onRemoveItem(item.id)}
                      title="Remove item"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className="order-item-price">
              {(() => {
                // Calculate the actual price with subscription discount if applicable
                let itemTotalCents = item.product.priceCents * item.quantity;
                if (item.isSubscription && item.subscriptionDiscount) {
                  itemTotalCents = Math.round(itemTotalCents * (1 - item.subscriptionDiscount / 100));
                }
                return formatPrice(itemTotalCents);
              })()}
            </div>
          </div>
        ))}
        </div>
      </div>

      <div className="discount-section">
        <input
          type="text"
          placeholder="Discount code or gift card"
          value={discountCode}
          onChange={(e) => setDiscountCode(e.target.value)}
          className="discount-input"
        />
        <button
          onClick={handleApplyDiscount}
          className="apply-button"
          disabled={!discountCode.trim()}
        >
          Apply
        </button>
      </div>

      <div className="order-totals">
        <div className="total-row subtotal-row">
          <span>Subtotal · {items.reduce((sum, item) => sum + item.quantity, 0)} items</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="total-row">
          <span>Shipping</span>
          <span className="shipping-tbd">
            {shipping === 0 ? 'Enter shipping address' : formatPrice(shipping)}
          </span>
        </div>
        <div className="total-row final-total">
          <span className="total-label">Total</span>
          <div className="total-amount">
            <span className="currency">AUD</span>
            <span className="amount">{formatPrice(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;