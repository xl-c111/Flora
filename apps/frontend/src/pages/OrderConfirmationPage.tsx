import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import orderService from "../services/orderService";
import type { Order } from "../services/orderService";
import "../styles/OrderConfirmationPage.css";

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
      console.log("📦 Order data received:", orderData);
      console.log("📦 Shipping info:", {
        firstName: orderData.shippingFirstName,
        lastName: orderData.shippingLastName,
        street1: orderData.shippingStreet1,
        city: orderData.shippingCity,
        state: orderData.shippingState,
        zipCode: orderData.shippingZipCode,
        country: orderData.shippingCountry,
      });
      setOrder(orderData);
    } catch (err) {
      console.error("Error fetching order:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getCountryName = (countryCode?: string) => {
    const countries: Record<string, string> = {
      AU: "Australia",
      US: "United States",
      UK: "United Kingdom",
      CA: "Canada",
      NZ: "New Zealand",
    };
    return countries[countryCode || "AU"] || countryCode || "Australia";
  };

  const getCustomerName = () => {
    if (order?.shippingFirstName && order?.shippingLastName) {
      return `${order.shippingFirstName} ${order.shippingLastName}`;
    }
    return "Valued Customer";
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
        {/* Logo */}
        <div className="logo-section">
          <div className="logo">FLORA</div>
        </div>

        {/* Header Section */}
        <div className="header-section">
          <h1>ORDER CONFIRMATION</h1>
          <p className="thank-you-message">{getCustomerName()}, thank you for your order!</p>
          <p className="info-message">
            We've received your order and will contact you as soon as your package is shipped. You can find your
            purchase information below.
          </p>
        </div>

        {order && (
          <>
            {/* Order Summary */}
            <div className="order-summary-section">
              <h2>Order Summary</h2>
              <p className="order-date">{formatDate(order.createdAt)}</p>

              {order.items && order.items.length > 0 && (
                <div className="order-item-card">
                  <div className="item-image-container">
                    {order.items[0].product.imageUrl ? (
                      <img src={order.items[0].product.imageUrl} alt={order.items[0].product.name} />
                    ) : (
                      <div className="placeholder-image"></div>
                    )}
                  </div>
                  <div className="item-details-container">
                    <div className="item-header">
                      <h3>{order.items[0].product.name}</h3>
                      <span className="item-price">{formatPrice(order.items[0].priceCents * order.items[0].quantity)}</span>
                    </div>
                    <div className="item-info-list">
                      <p>Suburb: {order.shippingCity || "N/A"}</p>
                      <p>Postcode: {order.shippingZipCode || "N/A"}</p>
                      <p>
                        Delivery Date:{" "}
                        {order.requestedDeliveryDate ? formatDate(order.requestedDeliveryDate) : "TBD"}
                      </p>
                      <p>Subscription: {order.subscriptionType || "One-time purchase"}</p>
                    </div>

                    <div className="price-breakdown">
                      <div className="price-row">
                        <span>Subtotal</span>
                        <span>{formatPrice(order.subtotalCents)}</span>
                      </div>
                      <div className="price-row">
                        <span>Shipping</span>
                        <span>{formatPrice(order.shippingCents)}</span>
                      </div>
                      <div className="price-row total-row">
                        <span>Total</span>
                        <span>{formatPrice(order.totalCents)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Billing and Shipping */}
            <div className="billing-shipping-section">
              <h2>Billing and shipping</h2>

              <div className="info-grid">
                <div className="info-column">
                  <h3>Billing Information</h3>
                  <p>
                    {order.shippingFirstName} {order.shippingLastName}
                  </p>
                  <p>{order.shippingStreet1}</p>
                  {order.shippingStreet2 && <p>{order.shippingStreet2}</p>}
                  <p>
                    {order.shippingCity}, {order.shippingState}
                  </p>
                  <p>{order.shippingZipCode}</p>
                  <p>{getCountryName(order.shippingCountry)}</p>
                </div>

                <div className="info-column">
                  <h3>Shipping Information</h3>
                  <p>
                    {order.shippingFirstName} {order.shippingLastName}
                  </p>
                  <p>{order.shippingStreet1}</p>
                  {order.shippingStreet2 && <p>{order.shippingStreet2}</p>}
                  <p>
                    {order.shippingCity}, {order.shippingState}
                  </p>
                  <p>{order.shippingZipCode}</p>
                  <p>{getCountryName(order.shippingCountry)}</p>
                </div>
              </div>

              <div className="payment-shipping-methods">
                <div className="method-column">
                  <h3>Payment method</h3>
                  <p>Visa **** **** **** 4242</p>
                </div>

                <div className="method-column">
                  <h3>Shipping method</h3>
                  <p>
                    {order.deliveryType === "STANDARD"
                      ? "Standard shipping"
                      : order.deliveryType || "Standard shipping"}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Back to Home Button */}
        <div className="action-buttons">
          <Link to="/" className="back-home-btn">
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
