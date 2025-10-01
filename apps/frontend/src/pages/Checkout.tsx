import React from 'react';
import { useNavigate } from 'react-router-dom';
import CheckoutForm from '../components/CheckoutForm';
import OrderSummary from '../components/OrderSummary';
import { useCart } from '../contexts/CartContext';
import { useCheckout } from '../hooks/useCheckout';
import type { CheckoutFormData } from '../components/CheckoutForm';
import '../styles/CheckoutPage.css';

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, clearCart } = useCart();
  const {
    clientSecret,
    orderId,
    isProcessing,
    error,
    createOrderAndPaymentIntent,
  } = useCheckout();

  const handleFormSubmit = async (formData: CheckoutFormData) => {
    await createOrderAndPaymentIntent(
      formData,
      state.items,
      state.purchaseType,
      state.frequency
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

  const SHIPPING_COST = 500; // Fixed $5 AUD shipping

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <div className="checkout-left">
          <h1>Checkout</h1>
          {error && <div className="error-message">{error}</div>}
          {isProcessing && <div className="loading-message">Processing...</div>}

          <CheckoutForm
            clientSecret={clientSecret || undefined}
            orderId={orderId || undefined}
            onSubmit={handleFormSubmit}
            onPaymentSuccess={handlePaymentSuccess}
            onPaymentError={handlePaymentError}
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