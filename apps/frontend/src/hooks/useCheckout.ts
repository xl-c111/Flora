import { useState } from 'react';
import orderService from '../services/orderService';
import type { CreateOrderData } from '../services/orderService';
import paymentService from '../services/paymentService';
import type { CheckoutFormData } from '../components/CheckoutForm';
import type { CartItem } from '../contexts/CartContext';

interface UseCheckoutReturn {
  isProcessing: boolean;
  error: string | null;
  orderId: string | null;
  clientSecret: string | null;
  createOrderAndPaymentIntent: (
    formData: CheckoutFormData,
    cartItems: CartItem[]
  ) => Promise<void>;
  handlePaymentSuccess: () => void;
  handlePaymentError: (error: string) => void;
}

export const useCheckout = (): UseCheckoutReturn => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const createOrderAndPaymentIntent = async (
    formData: CheckoutFormData,
    cartItems: CartItem[]
  ) => {
    setIsProcessing(true);
    setError(null);

    try {
      // Step 1: Create order
      const orderData: CreateOrderData = {
        purchaseType: 'ONE_TIME',
        guestEmail: formData.guestEmail || 'guest@example.com',
        guestPhone: formData.recipientPhone || '+1234567890', // Backend requires phone
        items: cartItems.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          priceCents: item.product.priceCents,
        })),
        shippingAddress: {
          firstName: formData.recipientFirstName,
          lastName: formData.recipientLastName,
          street1: formData.recipientAddress,
          street2: formData.recipientApartment,
          city: formData.recipientCity,
          state: formData.recipientState,
          zipCode: formData.recipientZipCode,
          phone: formData.recipientPhone || '+1234567890',
        },
        deliveryType: 'STANDARD',
      };

      console.log('📦 Creating order with data:', JSON.stringify(orderData, null, 2));
      const order = await orderService.createOrder(orderData);
      console.log('Order created:', order);
      setOrderId(order.id);

      // Step 2: Create payment intent
      const totalInDollars = order.totalCents / 100;
      console.log('Creating payment intent for amount:', totalInDollars);
      const paymentIntent = await paymentService.createPaymentIntent({
        orderId: order.id,
        amount: totalInDollars,
      });
      console.log('Payment intent created:', paymentIntent);
      setClientSecret(paymentIntent.clientSecret);
    } catch (err: any) {
      console.error('Checkout error:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.error || err.message || 'An error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentSuccess = () => {
    console.log('Payment successful!');
    // Redirect is handled by Stripe confirmPayment
  };

  const handlePaymentError = (errorMsg: string) => {
    setError(errorMsg);
    console.error('Payment error:', errorMsg);
  };

  return {
    isProcessing,
    error,
    orderId,
    clientSecret,
    createOrderAndPaymentIntent,
    handlePaymentSuccess,
    handlePaymentError,
  };
};