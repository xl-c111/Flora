import { prisma } from '../config/database';
import {
  Subscription,
  SubscriptionType,
  SubscriptionStatus,
  DeliveryType,
} from '@prisma/client';
import { OrderService, CreateOrderData } from './OrderService';
import { DeliveryService } from '../config/deliveryConfig';

// Simplified interface - inline addresses like OrderService
interface CreateSubscriptionData {
  userId: string; // Auth0 user ID
  type: SubscriptionType;
  shippingAddress: {
    firstName: string;
    lastName: string;
    street1: string;
    street2?: string;
    city: string;
    state: string;
    zipCode: string;
    phone?: string;
  };
  deliveryType?: DeliveryType;
  deliveryNotes?: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  paymentMethodId?: string; // For Stripe integration
}

export class SubscriptionService {
  private orderService: OrderService;

  constructor() {
    this.orderService = new OrderService();
  }

  // Get delivery fee based on type
  static getDeliveryFee(deliveryType: DeliveryType): number {
    return DeliveryService.getDeliveryFee(deliveryType);
  }

  // Create subscription with inline address (like OrderService)
  async createSubscription(data: CreateSubscriptionData): Promise<Subscription> {
    console.log(`🎯 Creating subscription for user: ${data.userId}`);
    console.log(`📍 Delivery to: ${data.shippingAddress.street1}, ${data.shippingAddress.city}`);

    // Ensure user exists (auto-create from Auth0 data if needed)
    await this.ensureUserExists(data.userId, data.shippingAddress);

    // Calculate next delivery date
    const nextDeliveryDate = data.type === SubscriptionType.SPONTANEOUS
      ? null
      : this.calculateNextDelivery(new Date(), data.type);

    // Create subscription with inline address data
    const subscription = await prisma.subscription.create({
      data: {
        userId: data.userId,
        type: data.type,
        status: SubscriptionStatus.ACTIVE,
        deliveryType: data.deliveryType || DeliveryType.STANDARD,
        deliveryNotes: data.deliveryNotes,
        nextDeliveryDate,

        // Store address as JSON (like OrderService)
        shippingFirstName: data.shippingAddress.firstName,
        shippingLastName: data.shippingAddress.lastName,
        shippingStreet1: data.shippingAddress.street1,
        shippingStreet2: data.shippingAddress.street2,
        shippingCity: data.shippingAddress.city,
        shippingState: data.shippingAddress.state,
        shippingZipCode: data.shippingAddress.zipCode,
        shippingPhone: data.shippingAddress.phone,

        items: {
          create: data.items,
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    console.log(`✅ Subscription created: ${subscription.id}`);

    // For recurring subscriptions, create first order immediately
    if (data.type !== SubscriptionType.SPONTANEOUS) {
      console.log(`🛒 Creating first order for recurring subscription...`);
      await this.createSubscriptionOrder(subscription);
    }

    return subscription;
  }

  // Get subscription with all related data
  async getSubscription(id: string): Promise<Subscription | null> {
    return prisma.subscription.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                priceCents: true,
                imageUrl: true,
              },
            },
          },
        },
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 5, // Last 5 orders from this subscription
        },
      },
    });
  }

  async getSubscriptionsByUser(userId: string): Promise<Subscription[]> {
    return prisma.subscription.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Update subscription - only allows safe fields to be updated
  async updateSubscription(
    id: string,
    data: Partial<{
      type: SubscriptionType;
      status: SubscriptionStatus;
      deliveryType: DeliveryType;
      deliveryNotes: string;
      stripeSubscriptionId: string;
    }>
  ): Promise<Subscription> {
    const subscription = await prisma.subscription.update({
      where: { id },
      data,
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return subscription;
  }

  async pauseSubscription(id: string): Promise<Subscription> {
    return this.updateSubscription(id, { status: SubscriptionStatus.PAUSED });
  }

  async resumeSubscription(id: string): Promise<Subscription> {
    const subscription = await this.updateSubscription(id, {
      status: SubscriptionStatus.ACTIVE,
    });

    // Update next delivery date when resuming
    // Only set for recurring subscriptions, not spontaneous
    if (subscription.type !== SubscriptionType.SPONTANEOUS) {
      await prisma.subscription.update({
        where: { id },
        data: {
          nextDeliveryDate: this.calculateNextDelivery(new Date(), subscription.type),
        },
      });
    }

    return subscription;
  }

  async cancelSubscription(id: string): Promise<Subscription> {
    return this.updateSubscription(id, {
      status: SubscriptionStatus.CANCELLED,
    });
  }

  // Background job method: Process all due subscription deliveries
  // This would typically run daily via a cron job or task scheduler
  async processSubscriptionDeliveries(): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find all active subscriptions that are due for delivery today
    const dueSubscriptions = await prisma.subscription.findMany({
      where: {
        status: SubscriptionStatus.ACTIVE,
        nextDeliveryDate: {
          lte: today, // Due today or overdue
        },
        type: {
          not: SubscriptionType.SPONTANEOUS, // Exclude spontaneous (user-triggered)
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    for (const subscription of dueSubscriptions) {
      // Create order for subscription delivery
      await this.createSubscriptionOrder(subscription);

      // Update next delivery date for recurring processing
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          nextDeliveryDate: this.calculateNextDelivery(
            subscription.nextDeliveryDate ?? new Date(),
            subscription.type
          ),
        },
      });
    }
  }

  // Create an actual order for a subscription delivery using inline address
  private async createSubscriptionOrder(subscription: any): Promise<void> {
    try {
      // Build order data using inline address from subscription
      // Subscriptions always have userId (require login), never guest orders
      const orderData: CreateOrderData = {
        userId: subscription.userId,
        purchaseType: 'SUBSCRIPTION' as any,
        subscriptionId: subscription.id,
        subscriptionType: subscription.type,

        // Convert subscription items to order items
        items: subscription.items.map((item: any) => ({
          productId: item.productId,
          quantity: item.quantity,
          priceCents: item.product.priceCents,
        })),

        // Use subscription's inline address fields
        shippingAddress: {
          firstName: subscription.shippingFirstName,
          lastName: subscription.shippingLastName,
          street1: subscription.shippingStreet1,
          street2: subscription.shippingStreet2 ?? undefined,
          city: subscription.shippingCity,
          state: subscription.shippingState,
          zipCode: subscription.shippingZipCode,
          phone: subscription.shippingPhone ?? undefined,
        },

        deliveryType: subscription.deliveryType,
        deliveryNotes: subscription.deliveryNotes ?? undefined,
        requestedDeliveryDate: subscription.nextDeliveryDate ?? undefined,
      };

      // Add delivery fee
      const deliveryFee = SubscriptionService.getDeliveryFee(subscription.deliveryType);

      // Create the order using your teammate's service
      const order = await this.orderService.createOrder(orderData);

      console.log(`✅ Created subscription order for subscription ${subscription.id}`);
      console.log(`   💰 Order total includes $${(deliveryFee / 100).toFixed(2)} delivery fee`);

      // Update subscription's last delivery date
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          lastDeliveryDate: new Date(),
        },
      });

    } catch (error) {
      console.error(`❌ Failed to create subscription order for ${subscription.id}:`, error);
      // Graceful degradation - don't break the subscription
    }
  }

  // Create spontaneous delivery order
  // Allows users to trigger immediate deliveries for spontaneous subscriptions
  // Returns a real order that goes through the full payment/fulfillment process
  async createSpontaneousDelivery(
    subscriptionId: string,
    deliveryData: {
      requestedDate?: Date;
      deliveryNotes?: string;
      items?: Array<{ productId: string; quantity: number }>;
    }
  ) {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    // Validate subscription type - only spontaneous subscriptions can trigger deliveries
    if (subscription.type !== SubscriptionType.SPONTANEOUS) {
      throw new Error('Only spontaneous subscriptions can trigger manual deliveries');
    }

    // Use provided items or fall back to subscription's default items
    const orderItems = deliveryData.items
      ? deliveryData.items.map(item => ({ ...item, priceCents: 0 })) // Price will be resolved by OrderService
      : subscription.items.map((item: any) => ({
          productId: item.productId,
          quantity: item.quantity,
          priceCents: item.product.priceCents,
        }));

    // Build order data for spontaneous delivery using inline address
    const orderData: CreateOrderData = {
      userId: subscription.userId,
      purchaseType: 'ONE_TIME' as any,
      subscriptionId: subscription.id,
      items: orderItems,
      shippingAddress: {
        firstName: subscription.shippingFirstName,
        lastName: subscription.shippingLastName,
        street1: subscription.shippingStreet1,
        street2: subscription.shippingStreet2 ?? undefined,
        city: subscription.shippingCity,
        state: subscription.shippingState,
        zipCode: subscription.shippingZipCode,
        phone: subscription.shippingPhone ?? undefined,
      },
      deliveryType: subscription.deliveryType,
      deliveryNotes: (deliveryData.deliveryNotes || subscription.deliveryNotes) ?? undefined,
      requestedDeliveryDate: deliveryData.requestedDate ?? undefined,
    };

    // Create the order using your teammate's OrderService
    const order = await this.orderService.createOrder(orderData);

    console.log(`✅ Created spontaneous delivery order for subscription ${subscription.id}`);
    console.log(`   💰 Total includes $${(SubscriptionService.getDeliveryFee(subscription.deliveryType) / 100).toFixed(2)} delivery fee`);

    return order;
  }

  // Auto-create user if they don't exist (for Auth0 users making first subscription)
  private async ensureUserExists(userId: string, shippingAddress: any): Promise<void> {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (existingUser) {
        console.log(`👤 User ${userId} already exists`);
        return;
      }

      // Create new user from Auth0 ID and address info
      console.log(`🆕 Creating new user: ${userId}`);
      await prisma.user.create({
        data: {
          id: userId, // Use Auth0 ID as primary key
          email: `${userId}@auth0.user`, // Placeholder email (Auth0 handles real email)
          firstName: shippingAddress.firstName,
          lastName: shippingAddress.lastName,
          phone: shippingAddress.phone,
        }
      });

      console.log(`✅ User ${userId} created successfully`);
    } catch (error) {
      console.error(`❌ Error ensuring user exists:`, error);
      throw new Error(`Failed to create user: ${error}`);
    }
  }

  // Calculate next delivery date based on subscription type
  // Uses proper enum values from schema and handles different frequencies
  private calculateNextDelivery(
    currentDate: Date,
    type: SubscriptionType
  ): Date {
    const nextDelivery = new Date(currentDate);

    switch (type) {
      case SubscriptionType.RECURRING_WEEKLY:
        nextDelivery.setDate(nextDelivery.getDate() + 7);
        break;
      case SubscriptionType.RECURRING_BIWEEKLY:
        nextDelivery.setDate(nextDelivery.getDate() + 14);
        break;
      case SubscriptionType.RECURRING_MONTHLY:
        nextDelivery.setMonth(nextDelivery.getMonth() + 1);
        break;
      case SubscriptionType.RECURRING_QUARTERLY:
        nextDelivery.setMonth(nextDelivery.getMonth() + 3);
        break;
      case SubscriptionType.RECURRING_YEARLY:
        nextDelivery.setFullYear(nextDelivery.getFullYear() + 1);
        break;
      case SubscriptionType.SPONTANEOUS:
        // Spontaneous subscriptions don't have automatic next delivery
        throw new Error('Spontaneous subscriptions do not have automatic next delivery dates');
      default:
        throw new Error(`Unsupported subscription type: ${type}`);
    }

    return nextDelivery;
  }

  async getSubscriptionStats(): Promise<{
    total: number;
    active: number;
    paused: number;
    cancelled: number;
    revenueProjection: number;
  }> {
    const [total, active, paused, cancelled] = await Promise.all([
      prisma.subscription.count(),
      prisma.subscription.count({
        where: { status: SubscriptionStatus.ACTIVE },
      }),
      prisma.subscription.count({
        where: { status: SubscriptionStatus.PAUSED },
      }),
      prisma.subscription.count({
        where: { status: SubscriptionStatus.CANCELLED },
      }),
    ]);

    // Calculate monthly revenue projection based on active subscriptions
    const activeSubscriptions = await prisma.subscription.findMany({
      where: { status: SubscriptionStatus.ACTIVE },
    });

    const revenueProjection = activeSubscriptions.reduce((total: number, sub: any) => {
      const monthlyValue = this.getMonthlyValue(sub.type);
      return total + monthlyValue;
    }, 0);

    return {
      total,
      active,
      paused,
      cancelled,
      revenueProjection,
    };
  }

  // Calculate monthly revenue value for a subscription type
  // Used for business analytics and revenue projections
  private getMonthlyValue(type: SubscriptionType): number {
    // Base subscription prices (in dollars) - would be configurable in production
    const basePrices = {
      [SubscriptionType.RECURRING_WEEKLY]: 25,
      [SubscriptionType.RECURRING_BIWEEKLY]: 20,
      [SubscriptionType.RECURRING_MONTHLY]: 15,
      [SubscriptionType.RECURRING_QUARTERLY]: 40,
      [SubscriptionType.RECURRING_YEARLY]: 120,
      [SubscriptionType.SPONTANEOUS]: 0, // No recurring revenue
    } as const;

    const basePrice = basePrices[type] || 0;

    // Convert to monthly equivalent for revenue projection
    switch (type) {
      case SubscriptionType.RECURRING_WEEKLY:
        return basePrice * 4.33; // Average weeks per month
      case SubscriptionType.RECURRING_BIWEEKLY:
        return basePrice * 2.17; // Average bi-weeks per month
      case SubscriptionType.RECURRING_MONTHLY:
        return basePrice;
      case SubscriptionType.RECURRING_QUARTERLY:
        return basePrice / 3; // Quarterly payment divided by 3 months
      case SubscriptionType.RECURRING_YEARLY:
        return basePrice / 12; // Yearly payment divided by 12 months
      case SubscriptionType.SPONTANEOUS:
        return 0; // No predictable recurring revenue
      default:
        return 0;
    }
  }
}
