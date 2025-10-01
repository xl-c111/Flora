import React from 'react';
import { useCart } from '../contexts/CartContext';
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
    return cartState.items.reduce(
      (total, item) => total + item.product.priceCents * item.quantity,
      0
    );
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

          {cartState.items.map((item) => (
            <div key={item.id} className="cart-item">
              <div className="item-image">
                <img src={item.product.imageUrl} alt={item.product.name} />
              </div>

              <div className="item-description">
                <h3>{item.product.name}</h3>
                <p>{item.product.description}</p>
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
                {formatPrice(item.product.priceCents * item.quantity)}
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
          ))}
        </div>

        {/* Purchase Type and Message Section */}
        <div className="cart-options">
          <div className="purchase-type-section">
            <h3>Purchase Type</h3>
            <div className="purchase-options-grid">
              {/* One-time */}
              <div className="purchase-column">
                <button
                  className={`option-btn ${purchaseType === 'one-time' ? 'active' : ''}`}
                  onClick={() => setPurchaseType('one-time')}
                >
                  <span className="radio-circle"></span>
                  One-time
                </button>
              </div>

              {/* Recurring Subscription */}
              <div className="purchase-column">
                <button
                  className={`option-btn ${purchaseType === 'recurring' ? 'active' : ''}`}
                  onClick={() => setPurchaseType('recurring')}
                >
                  <span className="radio-circle"></span>
                  Reoccurring Subscription
                </button>
                <div className="frequency-options">
                  <button
                    className={`freq-btn ${purchaseType === 'recurring' && frequency === 'weekly' ? 'active' : ''}`}
                    onClick={() => {
                      setPurchaseType('recurring');
                      setFrequency('weekly');
                    }}
                  >
                    <span className="radio-circle"></span>
                    Weekly
                  </button>
                  <button
                    className={`freq-btn ${purchaseType === 'recurring' && frequency === 'fortnightly' ? 'active' : ''}`}
                    onClick={() => {
                      setPurchaseType('recurring');
                      setFrequency('fortnightly');
                    }}
                  >
                    <span className="radio-circle"></span>
                    Fortnightly
                  </button>
                  <button
                    className={`freq-btn ${purchaseType === 'recurring' && frequency === 'monthly' ? 'active' : ''}`}
                    onClick={() => {
                      setPurchaseType('recurring');
                      setFrequency('monthly');
                    }}
                  >
                    <span className="radio-circle"></span>
                    Monthly
                  </button>
                </div>
              </div>

              {/* Spontaneous Subscription */}
              <div className="purchase-column">
                <button
                  className={`option-btn ${purchaseType === 'spontaneous' ? 'active' : ''}`}
                  onClick={() => setPurchaseType('spontaneous')}
                >
                  <span className="radio-circle"></span>
                  Spontaneous Subscription
                </button>
                <div className="frequency-options">
                  <button
                    className={`freq-btn ${purchaseType === 'spontaneous' && frequency === 'weekly' ? 'active' : ''}`}
                    onClick={() => {
                      setPurchaseType('spontaneous');
                      setFrequency('weekly');
                    }}
                  >
                    <span className="radio-circle"></span>
                    Weekly
                  </button>
                  <button
                    className={`freq-btn ${purchaseType === 'spontaneous' && frequency === 'fortnightly' ? 'active' : ''}`}
                    onClick={() => {
                      setPurchaseType('spontaneous');
                      setFrequency('fortnightly');
                    }}
                  >
                    <span className="radio-circle"></span>
                    Fortnightly
                  </button>
                  <button
                    className={`freq-btn ${purchaseType === 'spontaneous' && frequency === 'monthly' ? 'active' : ''}`}
                    onClick={() => {
                      setPurchaseType('spontaneous');
                      setFrequency('monthly');
                    }}
                  >
                    <span className="radio-circle"></span>
                    Monthly
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Leave a Message */}
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