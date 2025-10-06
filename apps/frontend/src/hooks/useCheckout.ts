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
      // Identify subscription items (for creating subscription records for future deliveries)
      const subscriptionItems = cartItems.filter(item => item.isSubscription);

      console.log('🛒 Processing cart:', {
        totalItems: cartItems.length,
        subscriptionCount: subscriptionItems.length
      });

      let totalOrderId = null;
      let totalClientSecret = null;

      // Create a SINGLE order with ALL items (both one-time and subscription)
      // Subscription items get their first delivery in this order
      const allItems = cartItems.map((item) => {
        // Calculate the actual price (including subscription discounts)
        let finalPrice = item.product.priceCents;
        if (item.isSubscription && item.subscriptionDiscount) {
          finalPrice = Math.round(finalPrice * (1 - item.subscriptionDiscount / 100));
        }

        // Determine subscription type for this item
        let itemSubscriptionType = undefined;
        if (item.isSubscription && item.subscriptionFrequency) {
          itemSubscriptionType = mapSubscriptionType('recurring', item.subscriptionFrequency);
        }

        return {
          productId: item.product.id,
          quantity: item.quantity,
          priceCents: finalPrice,
          subscriptionType: itemSubscriptionType,
          requestedDeliveryDate: item.selectedDate,
        };
      });

      const orderData: CreateOrderData = {
        purchaseType: 'ONE_TIME', // First order is always one-time, subscriptions are for future
        guestEmail: formData.guestEmail || 'guest@example.com',
        guestPhone: formData.recipientPhone || '+1234567890',
        items: allItems,
        shippingAddress: {
          firstName: formData.recipientFirstName,
          lastName: formData.recipientLastName,
          street1: formData.recipientAddress,
          street2: formData.recipientApartment,
          city: formData.recipientCity,
          state: formData.recipientState,
          zipCode: formData.recipientZipCode,
          country: formData.recipientCountry || 'AU',
          phone: formData.recipientPhone || '+1234567890',
        },
        deliveryType: formData.deliveryType || 'STANDARD',
      };

      console.log('📦 Creating order with all items:', JSON.stringify(orderData, null, 2));
      const order = await orderService.createOrder(orderData);
      console.log('Order created:', order);

      totalOrderId = order.id;

      // Create payment intent for the full order
      const totalInDollars = order.totalCents / 100;
      console.log('Creating payment intent for amount:', totalInDollars);
      const paymentIntent = await paymentService.createPaymentIntent({
        orderId: order.id,
        amount: totalInDollars,
      });
      console.log('Payment intent created:', paymentIntent);
      totalClientSecret = paymentIntent.clientSecret;

      // Create subscription records for future recurring deliveries
      // (The first delivery is already included in the order above)
      if (subscriptionItems.length > 0) {
        const token = await getAccessToken();
        if (!token) {
          throw new Error('SUBSCRIPTION_AUTH_REQUIRED');
        }

        for (const item of subscriptionItems) {
          // For subscriptions, PICKUP doesn't make sense (recurring deliveries), so default to STANDARD
          const subscriptionDeliveryType = formData.deliveryType === 'PICKUP'
            ? 'STANDARD'
            : (formData.deliveryType || 'STANDARD');

          const subscriptionData: CreateSubscriptionData = {
            type: mapSubscriptionType('recurring', item.subscriptionFrequency || 'monthly'),
            deliveryType: subscriptionDeliveryType as 'STANDARD' | 'EXPRESS',
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

          console.log(`🔄 Creating subscription record for future deliveries: ${item.product.name}`);

          // Create subscription record for future recurring deliveries
          const subscription = await subscriptionService.createSubscription(subscriptionData, token);
          console.log(`Subscription created for ${item.product.name}:`, subscription);
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