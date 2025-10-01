import React from 'react';
import { useCart } from '../contexts/CartContext';
import { SUBSCRIPTION_OPTIONS } from '../config/subscriptionConfig';
import '../styles/CartPage.css';

const CartPage: React.FC = () => {
  const {
    state: cartState,
    updateQuantity,
    removeItem,
    setPurchaseType,
    setFrequency,
    setGiftMessage
  } = useCart();

  // Use cart state instead of local state
  const purchaseType = cartState.purchaseType;
  const frequency = cartState.frequency;
  const giftMessage = cartState.giftMessage || { to: '', from: '', message: '' };

  const handleCheckout = () => {
    // Save message to cart items if needed
    window.location.href = '/checkout';
  };

  const calculateTotal = () => {
    return cartState.total; // Use the cart's built-in total calculation which handles discounts
  };

  const calculateSavings = () => {
    return cartState.items.reduce((savings, item) => {
      if (item.isSubscription && item.subscriptionDiscount) {
        const originalPrice = item.product.priceCents * item.quantity;
        const discountedPrice = originalPrice * (1 - item.subscriptionDiscount / 100);
        return savings + (originalPrice - discountedPrice);
      }
      return savings;
    }, 0);
  };

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(0)}`;
  };

  if (cartState.items.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-container">
          <h1 className="cart-title">Your Bag</h1>
          <div className="cart-empty">
            <p>Your bag is empty</p>
            <a href="/products" className="continue-shopping-btn">
              Browse Products
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        <h1 className="cart-title">Your Bag</h1>

        {/* Cart Items Table */}
        <div className="cart-table">
          <div className="cart-header">
            <div className="header-col">Products</div>
            <div className="header-col">Description</div>
            <div className="header-col">Quantity</div>
            <div className="header-col">Price</div>
            <div className="header-col">Delete</div>
          </div>

          {cartState.items.map((item) => {
            const isSubscription = item.isSubscription;
            const originalPrice = item.product.priceCents * item.quantity;
            let displayPrice = originalPrice;

            // Calculate discounted price for subscription items
            if (isSubscription && item.subscriptionDiscount) {
              displayPrice = originalPrice * (1 - item.subscriptionDiscount / 100);
            }

            const subscriptionOption = isSubscription && item.subscriptionFrequency
              ? SUBSCRIPTION_OPTIONS.find(opt => opt.frequency === item.subscriptionFrequency)
              : null;

            return (
              <div key={item.id} className={`cart-item ${isSubscription ? 'subscription-item' : 'one-time-item'}`}>
                <div className="item-image">
                  <img src={item.product.imageUrl} alt={item.product.name} />
                  {isSubscription && (
                    <div className="subscription-badge">
                      📅 {subscriptionOption?.label}
                    </div>
                  )}
                </div>

                <div className="item-description">
                  <h3>{item.product.name}</h3>
                  <p>{item.product.description}</p>
                  {isSubscription && (
                    <div className="subscription-details">
                      <span className="subscription-label">
                        {subscriptionOption?.description}
                      </span>
                      {item.subscriptionDiscount && (
                        <span className="savings-amount">
                          Save ${((originalPrice - displayPrice) / 100).toFixed(2)}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="item-quantity">
                  <button
                    className="qty-btn"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  >
                    -
                  </button>
                  <span className="qty-value">{item.quantity}</span>
                  <button
                    className="qty-btn"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>

                <div className="item-price">
                  <div className="price-display">
                    <span className="current-price">{formatPrice(displayPrice)}</span>
                    {isSubscription && item.subscriptionDiscount && (
                      <span className="original-price">{formatPrice(originalPrice)}</span>
                    )}
                  </div>
                  {isSubscription && (
                    <div className="subscription-frequency">
                      per {item.subscriptionFrequency?.replace('ly', '')}
                    </div>
                  )}
                </div>

                <div className="item-delete">
                  <button
                    className="delete-btn"
                    onClick={() => removeItem(item.id)}
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Cart Summary Section */}
        <div className="cart-summary">
          <div className="summary-section">
            <h3>Order Summary</h3>
            <div className="summary-line">
              <span>Subtotal ({cartState.items.length} items)</span>
              <span>{formatPrice(calculateTotal() + calculateSavings())}</span>
            </div>
            {calculateSavings() > 0 && (
              <div className="summary-line savings-line">
                <span>Subscription Savings</span>
                <span className="savings-amount">-{formatPrice(calculateSavings())}</span>
              </div>
            )}
            <div className="summary-line total-line">
              <span>Total</span>
              <span className="total-amount">{formatPrice(calculateTotal())}</span>
            </div>
            {calculateSavings() > 0 && (
              <div className="savings-note">
                🎉 You're saving {formatPrice(calculateSavings())} with subscriptions!
              </div>
            )}
          </div>

        </div>

        {/* Optional Gift Message Section */}
        <div className="cart-options">
          <div className="message-section">
            <h3>Leave a Message</h3>
            <div className="message-inputs">
              <div className="message-row">
                <input
                  type="text"
                  placeholder="To:"
                  value={giftMessage.to}
                  onChange={(e) => setGiftMessage({ ...giftMessage, to: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="From:"
                  value={giftMessage.from}
                  onChange={(e) => setGiftMessage({ ...giftMessage, from: e.target.value })}
                />
              </div>
              <textarea
                placeholder="Message:"
                value={giftMessage.message}
                onChange={(e) => setGiftMessage({ ...giftMessage, message: e.target.value })}
                rows={4}
              />
              <button className="save-message-btn">Save</button>
            </div>
          </div>
        </div>

        {/* Checkout Button */}
        <button className="checkout-btn" onClick={handleCheckout}>
          Check Out
        </button>
      </div>
    </div>
  );
};

export default CartPage;