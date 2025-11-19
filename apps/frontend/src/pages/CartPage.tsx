import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { getImageUrl, apiService } from '../services/api';
import { SUBSCRIPTION_OPTIONS } from '../config/subscriptionConfig';
import { format } from 'date-fns';
import './CartPage.css';

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    state: cartState,
    updateQuantity,
    removeItem,
    setGiftMessage
  } = useCart();
  const { login, user, userProfile } = useAuth();
  const hasSubscriptionItems = cartState.items.some(item => item.isSubscription);
  const isUserLoggedIn = !!(user || userProfile);

  // Use cart state instead of local state
  const giftMessage = cartState.giftMessage || { to: '', from: '', message: '' };
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [generateError, setGenerateError] = React.useState<string | null>(null);
  const [selectedTone, setSelectedTone] = React.useState('warm');
  const [lastAIGeneratedMessage, setLastAIGeneratedMessage] = React.useState<string | null>(null);

  const handleProductClick = (productId: string) => {
    navigate(`/products/${productId}`);
  };

  const handleCheckout = () => {
    if (hasSubscriptionItems && !isUserLoggedIn) {
      login('/checkout');
      return;
    }

    window.location.href = '/checkout';
  };

  const handleGenerateAIMessage = async () => {
    setIsGenerating(true);
    setGenerateError(null);

    try {
      const firstProduct = cartState.items[0]?.product;
      const keywords = firstProduct ? `flowers, ${firstProduct.name}` : 'flowers, gift';

      const requestPayload: Parameters<typeof apiService.generateAIMessage>[0] = {
        to: giftMessage.to || undefined,
        from: giftMessage.from || undefined,
        keywords,
        tone: selectedTone,
      };

      const trimmedMessage = giftMessage.message?.trim();
      if (trimmedMessage && trimmedMessage !== lastAIGeneratedMessage) {
        requestPayload.userPrompt = trimmedMessage;
      }

      const response = await apiService.generateAIMessage(requestPayload);

      if (response.success && response.data?.message) {
        setGiftMessage({ ...giftMessage, message: response.data.message });
        setLastAIGeneratedMessage(response.data.message);
      } else {
        setGenerateError('Failed to generate message. Please try again.');
      }
    } catch (error: any) {
      setGenerateError(error.response?.data?.error || 'Failed to generate message. Please try again.');
    } finally {
      setIsGenerating(false);
    }
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
    const dollars = Number(cents) / 100;
    return `$${dollars.toFixed(2)}`;
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
                <div
                  className="item-image"
                  onClick={() => handleProductClick(item.product.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <img src={getImageUrl(item.product.imageUrl || '')} alt={item.product.name} />
                  {isSubscription && (
                    <div className="subscription-badge">
                      📅 {subscriptionOption?.label}
                    </div>
                  )}
                </div>

                <div className="item-description">
                  <h3
                    onClick={() => handleProductClick(item.product.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    {item.product.name}
                  </h3>
                  <p>{item.product.description}</p>
                  {isSubscription ? (
                    <div className="subscription-details">
                      <span>
                        {item.purchaseType === 'spontaneous'
                          ? 'Spontaneous Subscription'
                          : 'Recurring Subscription'}
                      </span>
                      <span className="subscription-label">
                        {subscriptionOption?.description}
                      </span>
                      {item.subscriptionDiscount && (
                        <span className="savings-amount">
                          Save ${((originalPrice - displayPrice) / 100).toFixed(2)}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="subscription-details">
                      <span>
                        One-time Purchase
                      </span>
                    </div>
                  )}
                  {item.selectedDate && (
                    <div className="delivery-date-info">
                      {item.purchaseType === 'spontaneous'
                        ? `First delivery: ${format(item.selectedDate, 'PPP')} (then on-demand)`
                        : item.isSubscription
                        ? `First delivery: ${format(item.selectedDate, 'PPP')} (then auto-renews ${item.subscriptionFrequency})`
                        : `Delivery: ${format(item.selectedDate, 'PPP')}`
                      }
                    </div>
                  )}
                </div>

                <div className="item-quantity">
                  <div>
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

        {/* Message and Summary Section - Side by Side */}
        <div className="cart-bottom-section">
          {/* Optional Gift Message Section */}
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
                onChange={(e) => {
                  const newValue = e.target.value;
                  setGiftMessage({ ...giftMessage, message: newValue });
                  if (lastAIGeneratedMessage && newValue !== lastAIGeneratedMessage) {
                    setLastAIGeneratedMessage(null);
                  }
                }}
                rows={4}
              />
              <div className="ai-tone-selector">
                <label htmlFor="tone-select">Message Tone:</label>
                <select
                  id="tone-select"
                  value={selectedTone}
                  onChange={(e) => setSelectedTone(e.target.value)}
                  className="tone-dropdown"
                >
                  <option value="warm">Warm</option>
                  <option value="warmer">Deeply Warm</option>
                  <option value="heartfelt">Heartfelt</option>
                  <option value="romantic">Romantic</option>
                  <option value="happy">Happy</option>
                  <option value="joyful">Joyful</option>
                  <option value="funny">Funny</option>
                  <option value="playful">Playful</option>
                  <option value="professional">Professional</option>
                  <option value="formal">Formal</option>
                  <option value="casual">Casual</option>
                  <option value="grateful">Grateful</option>
                  <option value="supportive">Supportive</option>
                  <option value="sympathetic">Sympathetic</option>
                  <option value="congratulatory">Congratulatory</option>
                </select>
              </div>
              <div className="message-buttons">
                <button
                  className="generate-ai-btn"
                  onClick={handleGenerateAIMessage}
                  disabled={isGenerating}
                >
                  {isGenerating ? '✨ Generating...' : '✨ Generate Message with AI'}
                </button>
              </div>
              {generateError && (
                <div className="generate-error">{generateError}</div>
              )}
            </div>
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
                  You're saving {formatPrice(calculateSavings())} with subscriptions!
                </div>
              )}
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
