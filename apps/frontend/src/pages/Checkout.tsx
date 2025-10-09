import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CheckoutForm from '../components/CheckoutForm';
import OrderSummary from '../components/OrderSummary';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useCheckout } from '../hooks/useCheckout';
import deliveryService, { type DeliveryInfo } from '../services/deliveryService';
import type { CheckoutFormData } from '../components/CheckoutForm';
import '../styles/CheckoutPage.css';

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, clearCart } = useCart();
  const { login } = useAuth();
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo | null>(null);
  const [selectedDeliveryType, setSelectedDeliveryType] = useState<'STANDARD' | 'EXPRESS' | 'PICKUP'>('STANDARD');
  const {
    clientSecret,
    orderId,
    isProcessing,
    error,
    createOrderAndPaymentIntent,
  } = useCheckout();

  // Fetch delivery info on component mount
  useEffect(() => {
    const fetchDeliveryInfo = async () => {
      try {
        const info = await deliveryService.getDeliveryInfo();
        setDeliveryInfo(info);
      } catch (error) {
        console.error('Failed to fetch delivery info:', error);
      }
    };

    fetchDeliveryInfo();
  }, []);

  const handleFormSubmit = async (formData: CheckoutFormData) => {
    await createOrderAndPaymentIntent(
      { ...formData, deliveryType: selectedDeliveryType },
      state.items
    );
  };

  const handlePaymentSuccess = () => {
    if (orderId) {
      clearCart();
      navigate(`/order-confirmation/${orderId}`);
    }
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
  };

  if (state.items.length === 0) {
    return (
      <div className="checkout-page">
        <div className="empty-cart">
          <h2>Your cart is empty</h2>
          <button onClick={() => navigate('/products')} className="continue-shopping-btn">
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  // Dynamic shipping cost based on delivery type and backend config
  const getShippingCost = () => {
    if (selectedDeliveryType === 'PICKUP') return 0; // Pickup is free
    if (!deliveryInfo) return 500; // Fallback to $5 if not loaded yet
    const deliveryKey = selectedDeliveryType.toLowerCase() as 'standard' | 'express';
    return deliveryInfo.pricing[deliveryKey].fee;
  };

  const SHIPPING_COST = getShippingCost();

  // Check if cart contains subscription items
  const hasSubscriptionItems = state.items.some(item => item.isSubscription);

  // Create user-friendly error message
  const getErrorDisplay = () => {
    if (!error) return null;

    if (error === 'SUBSCRIPTION_AUTH_REQUIRED') {
      return (
        <div className="auth-required-message">
          <div className="auth-message-content">
            <h3>🔐 Login Required</h3>
            <p>You have subscription items in your cart. Please log in to continue with your purchase.</p>
            <div className="auth-actions">
              <button onClick={login} className="login-btn">
                Sign In
              </button>
              <button onClick={() => navigate('/cart')} className="back-to-cart-btn">
                Back to Cart
              </button>
            </div>
          </div>
        </div>
      );
    }

    return <div className="error-message">{error}</div>;
  };

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <div className="checkout-left">
          <div className="checkout-logo-placeholder">logo here</div>
          {getErrorDisplay()}
          {isProcessing && <div className="loading-message">Processing...</div>}

          <CheckoutForm
            clientSecret={clientSecret || undefined}
            orderId={orderId || undefined}
            onSubmit={handleFormSubmit}
            onPaymentSuccess={handlePaymentSuccess}
            onPaymentError={handlePaymentError}
            deliveryInfo={deliveryInfo}
            selectedDeliveryType={selectedDeliveryType}
            onDeliveryTypeChange={setSelectedDeliveryType}
            />
        </div>

        <div className="checkout-right">
          <OrderSummary
            items={state.items}
            subtotal={state.total}
            shipping={SHIPPING_COST}
            total={state.total + SHIPPING_COST}
          />
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;