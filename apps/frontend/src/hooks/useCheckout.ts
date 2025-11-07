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
  const { user, getAccessToken } = useAuth();

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
          const purchaseType = item.purchaseType || 'recurring';
          itemSubscriptionType = mapSubscriptionType(purchaseType, item.subscriptionFrequency);
        }

        return {
          productId: item.product.id,
          quantity: item.quantity,
          priceCents: finalPrice,
          subscriptionType: itemSubscriptionType,
          requestedDeliveryDate: item.selectedDate,
        };
      });

      // Get user token if logged in
      const token = await getAccessToken();

      // Build billing address based on checkbox
      console.log('💳 Billing Address Logic:', {
        useSameAddress: formData.useSameAddress,
        senderFirstName: formData.senderFirstName,
        senderLastName: formData.senderLastName,
        senderAddress: formData.senderAddress,
      });

      const billingAddress = formData.useSameAddress ? {
        firstName: formData.recipientFirstName,
        lastName: formData.recipientLastName,
        street1: formData.recipientAddress,
        street2: formData.recipientApartment,
        city: formData.recipientCity,
        state: formData.recipientState,
        zipCode: formData.recipientZipCode,
        country: formData.recipientCountry || 'AU',
        phone: formData.recipientPhone,
      } : {
        firstName: formData.senderFirstName,
        lastName: formData.senderLastName,
        street1: formData.senderAddress,
        street2: formData.senderApartment,
        city: formData.senderCity,
        state: formData.senderState,
        zipCode: formData.senderZipCode,
        country: 'AU',
        phone: formData.senderPhone,
      };

      console.log('💳 Built billing address:', billingAddress);

      const orderData: CreateOrderData = {
        purchaseType: 'ONE_TIME', // First order is always one-time, subscriptions are for future
        // If user is logged in, use their ID; otherwise guest checkout
        userId: user?.sub,  // Auth0 user ID
        // Only send a real email. Avoid placeholder addresses.
        guestEmail: formData.guestEmail || (user?.email ?? undefined),
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
        billingAddress: billingAddress,
        deliveryType: formData.deliveryType || 'STANDARD',
      };

      console.log('📦 Creating order with all items:', JSON.stringify(orderData, null, 2));
      console.log('🔑 User logged in:', !!user, 'User ID:', user?.sub);
      const order = await orderService.createOrder(orderData, token);
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
        if (!token) {
          throw new Error('SUBSCRIPTION_AUTH_REQUIRED');
        }

        for (const item of subscriptionItems) {
          // For subscriptions, PICKUP doesn't make sense (recurring deliveries), so default to STANDARD
          const subscriptionDeliveryType = formData.deliveryType === 'PICKUP'
            ? 'STANDARD'
            : (formData.deliveryType || 'STANDARD');

          const itemPurchaseType = item.purchaseType || 'recurring';
          const subscriptionData: CreateSubscriptionData = {
            type: mapSubscriptionType(itemPurchaseType, item.subscriptionFrequency || 'monthly'),
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
