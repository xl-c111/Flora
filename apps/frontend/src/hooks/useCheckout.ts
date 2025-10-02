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
  const { getAccessToken } = useAuth();

  const createOrderAndPaymentIntent = async (
    formData: CheckoutFormData,
    cartItems: CartItem[]
  ) => {
    setIsProcessing(true);
    setError(null);

    try {
      // Separate items into one-time and subscription items
      const oneTimeItems = cartItems.filter(item => !item.isSubscription);
      const subscriptionItems = cartItems.filter(item => item.isSubscription);

      console.log('🛒 Processing mixed cart:', {
        oneTimeCount: oneTimeItems.length,
        subscriptionCount: subscriptionItems.length
      });

      let totalOrderId = null;
      let totalClientSecret = null;

      // Process one-time items if any
      if (oneTimeItems.length > 0) {
        const orderData: CreateOrderData = {
          purchaseType: 'ONE_TIME',
          guestEmail: formData.guestEmail || 'guest@example.com',
          guestPhone: formData.recipientPhone || '+1234567890',
          items: oneTimeItems.map((item) => {
            // Calculate the actual price (including subscription discounts if any)
            let finalPrice = item.product.priceCents;
            if (item.isSubscription && item.subscriptionDiscount) {
              finalPrice = Math.round(finalPrice * (1 - item.subscriptionDiscount / 100));
            }
            return {
              productId: item.product.id,
              quantity: item.quantity,
              priceCents: finalPrice,
            };
          }),
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
        console.log('One-time order created:', order);

        totalOrderId = order.id;

        // Create payment intent for one-time items
        const totalInDollars = order.totalCents / 100;
        console.log('Creating payment intent for amount:', totalInDollars);
        const paymentIntent = await paymentService.createPaymentIntent({
          orderId: order.id,
          amount: totalInDollars,
        });
        console.log('Payment intent created:', paymentIntent);
        totalClientSecret = paymentIntent.clientSecret;
      }

      // Process subscription items if any
      if (subscriptionItems.length > 0) {
        const token = await getAccessToken();
        if (!token) {
          throw new Error('SUBSCRIPTION_AUTH_REQUIRED');
        }

        // For now, process subscription items as simple subscription preferences
        // This creates the subscription record but uses one-time payment
        for (const item of subscriptionItems) {
          const subscriptionData: CreateSubscriptionData = {
            type: mapSubscriptionType('recurring', item.subscriptionFrequency || 'monthly'),
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
            items: [{
              productId: item.product.id,
              quantity: item.quantity,
            }],
          };

          console.log(`🔄 Creating subscription for ${item.product.name}:`, subscriptionData);

          // Create subscription record (stores preference for future automation)
          const subscription = await subscriptionService.createSubscription(subscriptionData, token);
          console.log(`Subscription created for ${item.product.name}:`, subscription);

          // For now, we store the subscription but don't process payment automatically
          // The subscription discount was already applied in the cart total calculation
        }

        // If only subscription items, create a minimal success response
        if (!totalOrderId) {
          totalOrderId = 'subscription_only';
          totalClientSecret = 'subscription_created';
        }
      }

      setOrderId(totalOrderId);
      setClientSecret(totalClientSecret);
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