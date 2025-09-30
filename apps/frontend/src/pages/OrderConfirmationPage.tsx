import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import orderService from '../services/orderService';
import type { Order } from '../services/orderService';
import '../styles/OrderConfirmationPage.css';

const OrderConfirmationPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { clearCart } = useCart();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Clear cart when order confirmation page loads
    clearCart();

    if (orderId) {
      fetchOrder(orderId);
    }
  }, [orderId, clearCart]);

  const fetchOrder = async (id: string) => {
    try {
      const orderData = await orderService.getOrder(id);
      setOrder(orderData);
    } catch (err) {
      console.error('Error fetching order:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="order-confirmation-loading">
        <div className="spinner"></div>
        <p>Loading your order...</p>
      </div>
    );
  }

  return (
    <div className="order-confirmation-page">
      <div className="confirmation-container">
        <div className="success-icon">✅</div>
        <h1>Order Confirmed!</h1>
        <p className="success-message">
          Thank you for your purchase. Your order has been confirmed and is being processed.
        </p>

        {order && (
          <>
            <div className="order-details-box">
              <h2>Order Details</h2>
              <div className="detail-row">
                <span className="label">Order Number:</span>
                <span className="value">{order.orderNumber}</span>
              </div>
              <div className="detail-row">
                <span className="label">Order ID:</span>
                <span className="value">{order.id}</span>
              </div>
              <div className="detail-row">
                <span className="label">Status:</span>
                <span className="value status-badge">{order.status}</span>
              </div>
              <div className="detail-row">
                <span className="label">Total:</span>
                <span className="value total-amount">{formatPrice(order.totalCents)}</span>
              </div>
            </div>

            {order.items && order.items.length > 0 && (
              <div className="order-items-box">
                <h3>Items Ordered</h3>
                {order.items.map((item) => (
                  <div key={item.id} className="order-item">
                    <div className="item-details">
                      <span className="item-name">{item.product.name}</span>
                      <span className="item-quantity">Qty: {item.quantity}</span>
                    </div>
                    <span className="item-price">
                      {formatPrice(item.priceCents * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="confirmation-note">
              <p>📧 A confirmation email has been sent to your email address.</p>
              <p>💳 Your payment has been processed successfully.</p>
            </div>
          </>
        )}

        <div className="action-buttons">
          <Link to="/products" className="continue-shopping-btn">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;