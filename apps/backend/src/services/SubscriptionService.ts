import {
  PrismaClient,
  Subscription,
  SubscriptionType,
  SubscriptionStatus,
} from '@prisma/client';

const prisma = new PrismaClient();

export class SubscriptionService {
  async createSubscription(data: {
    userId: string;
    type: SubscriptionType;
    startDate: Date;
    deliveryAddress: string;
    notes?: string;
  }): Promise<Subscription> {
    const subscription = await prisma.subscription.create({
      data: {
        ...data,
        status: SubscriptionStatus.ACTIVE,
        nextDelivery: this.calculateNextDelivery(data.startDate, data.type),
      },
      include: {
        user: true,
      },
    });

    return subscription;
  }

  async getSubscription(id: string): Promise<Subscription | null> {
    return prisma.subscription.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });
  }

  async getSubscriptionsByUser(userId: string): Promise<Subscription[]> {
    return prisma.subscription.findMany({
      where: { userId },
      include: {
        user: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateSubscription(
    id: string,
    data: Partial<{
      type: SubscriptionType;
      status: SubscriptionStatus;
      deliveryAddress: string;
      notes: string;
    }>
  ): Promise<Subscription> {
    const subscription = await prisma.subscription.update({
      where: { id },
      data,
      include: {
        user: true,
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

    // Update next delivery date
    await prisma.subscription.update({
      where: { id },
      data: {
        nextDelivery: this.calculateNextDelivery(new Date(), subscription.type),
      },
    });

    return subscription;
  }

  async cancelSubscription(id: string): Promise<Subscription> {
    return this.updateSubscription(id, {
      status: SubscriptionStatus.CANCELLED,
    });
  }

  async processSubscriptionDeliveries(): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueSubscriptions = await prisma.subscription.findMany({
      where: {
        status: SubscriptionStatus.ACTIVE,
        nextDelivery: {
          lte: today,
        },
      },
      include: {
        user: true,
      },
    });

    for (const subscription of dueSubscriptions) {
      // Create order for subscription delivery
      await this.createSubscriptionOrder(subscription);

      // Update next delivery date
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          nextDelivery: this.calculateNextDelivery(
            subscription.nextDelivery,
            subscription.type
          ),
        },
      });
    }
  }

  private async createSubscriptionOrder(
    subscription: Subscription
  ): Promise<void> {
    // This would create an order for the subscription
    // Implementation depends on how you want to handle subscription products
    // For now, this is a placeholder
    console.log(
      `Creating subscription order for subscription ${subscription.id}`
    );
  }

  // Create spontaneous delivery order
  async createSpontaneousDelivery(
    subscriptionId: string,
    deliveryData: {
      requestedDate?: Date;
      deliveryNotes?: string;
      items?: Array<{ productId: string; quantity: number }>;
    }
  ): Promise<any> {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: true,
        address: true,
      },
    });

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    // Use subscription items or provided items
    const orderItems = deliveryData.items || subscription.items.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      priceCents: item.product.priceCents,
    }));

    // Create one-time order for spontaneous delivery
    const orderData = {
      userId: subscription.userId,
      purchaseType: 'ONE_TIME' as const,
      items: orderItems,
      shippingAddress: {
        firstName: subscription.address.firstName,
        lastName: subscription.address.lastName,
        street1: subscription.address.street1,
        street2: subscription.address.street2,
        city: subscription.address.city,
        state: subscription.address.state,
        zipCode: subscription.address.zipCode,
        phone: subscription.address.phone,
      },
      deliveryType: subscription.deliveryType,
      deliveryNotes: deliveryData.deliveryNotes || subscription.deliveryNotes,
      requestedDeliveryDate: deliveryData.requestedDate,
    };

    // Would integrate with OrderService here
    console.log('Creating spontaneous delivery order:', orderData);

    // Return mock order for now
    return {
      id: 'spontaneous-order-' + Date.now(),
      orderNumber: `SPNT${Date.now()}`,
      ...orderData,
      status: 'PENDING',
      createdAt: new Date(),
    };
  }

  private calculateNextDelivery(
    currentDate: Date,
    type: SubscriptionType
  ): Date {
    const nextDelivery = new Date(currentDate);

    switch (type) {
      case SubscriptionType.WEEKLY:
        nextDelivery.setDate(nextDelivery.getDate() + 7);
        break;
      case SubscriptionType.BIWEEKLY:
        nextDelivery.setDate(nextDelivery.getDate() + 14);
        break;
      case SubscriptionType.MONTHLY:
        nextDelivery.setMonth(nextDelivery.getMonth() + 1);
        break;
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

    const revenueProjection = activeSubscriptions.reduce((total, sub) => {
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

  private getMonthlyValue(type: SubscriptionType): number {
    // These would be configurable subscription prices
    const prices = {
      [SubscriptionType.WEEKLY]: 25,
      [SubscriptionType.BIWEEKLY]: 20,
      [SubscriptionType.MONTHLY]: 15,
    };

    const weeklyPrice = prices[type];

    switch (type) {
      case SubscriptionType.WEEKLY:
        return weeklyPrice * 4.33; // Average weeks per month
      case SubscriptionType.BIWEEKLY:
        return weeklyPrice * 2.17; // Average bi-weeks per month
      case SubscriptionType.MONTHLY:
        return weeklyPrice;
      default:
        return 0;
    }
  }
}
