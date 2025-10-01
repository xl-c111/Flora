import { useState } from 'react';
import orderService from '../services/orderService';
import type { CreateOrderData } from '../services/orderService';
import paymentService from '../services/paymentService';
import subscriptionService from '../services/subscriptionService';
import type { CreateSubscriptionData } from '../services/subscriptionService';
import type { CheckoutFormData } from '../components/CheckoutForm';
import type { CartItem } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

// Type mapping functions
const mapPurchaseType = (frontendType: 'one-time' | 'recurring' | 'spontaneous'): 'ONE_TIME' | 'SUBSCRIPTION' => {
  return frontendType === 'one-time' ? 'ONE_TIME' : 'SUBSCRIPTION';
};

const mapSubscriptionType = (
  purchaseType: 'one-time' | 'recurring' | 'spontaneous',
  frequency: 'weekly' | 'fortnightly' | 'monthly'
): 'RECURRING_WEEKLY' | 'RECURRING_BIWEEKLY' | 'RECURRING_MONTHLY' | 'SPONTANEOUS' => {
  if (purchaseType === 'spontaneous') {
    return 'SPONTANEOUS';
  }

  const mapping = {
    'weekly': 'RECURRING_WEEKLY' as const,
    'fortnightly': 'RECURRING_BIWEEKLY' as const,
    'monthly': 'RECURRING_MONTHLY' as const,
  };
  return mapping[frequency];
};

interface UseCheckoutReturn {
  isProcessing: boolean;
  error: string | null;
  orderId: string | null;
  clientSecret: string | null;
  createOrderAndPaymentIntent: (
    formData: CheckoutFormData,
    cartItems: CartItem[],
    purchaseType: 'one-time' | 'recurring' | 'spontaneous',
    frequency: 'weekly' | 'fortnightly' | 'monthly'
  ) => Promise<void>;
  handlePaymentSuccess: () => void;
  handlePaymentError: (error: string) => void;
}

export const useCheckout = (): UseCheckoutReturn => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const { getAccessToken } = useAuth();

  const createOrderAndPaymentIntent = async (
    formData: CheckoutFormData,
    cartItems: CartItem[],
    purchaseType: 'one-time' | 'recurring' | 'spontaneous',
    frequency: 'weekly' | 'fortnightly' | 'monthly'
  ) => {
    setIsProcessing(true);
    setError(null);

    try {
      if (purchaseType === 'one-time') {
        // Step 1a: Create one-time order
        const orderData: CreateOrderData = {
          purchaseType: 'ONE_TIME',
          guestEmail: formData.guestEmail || 'guest@example.com',
          guestPhone: formData.recipientPhone || '+1234567890',
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

        console.log('📦 Creating one-time order:', JSON.stringify(orderData, null, 2));
        const order = await orderService.createOrder(orderData);
        console.log('Order created:', order);
        setOrderId(order.id);

        // Step 2a: Create payment intent for order
        const totalInDollars = order.totalCents / 100;
        console.log('Creating payment intent for amount:', totalInDollars);
        const paymentIntent = await paymentService.createPaymentIntent({
          orderId: order.id,
          amount: totalInDollars,
        });
        console.log('Payment intent created:', paymentIntent);
        setClientSecret(paymentIntent.clientSecret);

      } else {
        // Step 1b: Create subscription (requires authentication)
        const token = await getAccessToken();
        if (!token) {
          throw new Error('Authentication required for subscriptions. Please log in.');
        }

        const subscriptionData: CreateSubscriptionData = {
          type: mapSubscriptionType(purchaseType, frequency),
          deliveryType: 'STANDARD',
          shippingAddress: {
            firstName: formData.recipientFirstName,
            lastName: formData.recipientLastName,
            street1: formData.recipientAddress,
            street2: formData.recipientApartment,
            city: formData.recipientCity,
            state: formData.recipientState,
            zipCode: formData.recipientZipCode,
            phone: formData.recipientPhone,
          },
          items: cartItems.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
          })),
        };

        console.log('🔄 Creating subscription:', JSON.stringify(subscriptionData, null, 2));
        const subscription = await subscriptionService.createSubscription(subscriptionData, token);
        console.log('Subscription created:', subscription);

        // For subscriptions, we'll set a temporary ID and skip payment for now
        // In a real implementation, you'd handle subscription billing here
        setOrderId(subscription.id);
        setClientSecret('subscription_created'); // Placeholder
      }
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