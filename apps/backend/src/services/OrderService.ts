import { prisma } from '../config/database';
import {
  Order,
  OrderItem,
  PurchaseType,
  SubscriptionType,
  OrderStatus,
} from '@prisma/client';
import { EmailService } from './EmailService';

export class OrderService {
  private emailService: EmailService;

  constructor() {
    this.emailService = new EmailService();
  }

  // Create new order (guest or user)
  async createOrder(orderData: {
    userId?: string;
    guestEmail?: string;
    guestPhone?: string;
    purchaseType: PurchaseType;
    subscriptionType?: SubscriptionType;
    subscriptionId?: string;
    items: Array<{
      productId: string;
      quantity: number;
      priceCents: number;
    }>;
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
    deliveryType: string;
    deliveryNotes?: string;
    requestedDeliveryDate?: Date;
  }): Promise<Order> {
    // Calculate totals
    const subtotalCents = orderData.items.reduce(
      (sum, item) => sum + item.priceCents * item.quantity,
      0
    );

    // Calculate shipping (simplified)
    const shippingCents = this.calculateShipping(
      orderData.deliveryType,
      subtotalCents
    );

    // Calculate tax (simplified - 8.5%)
    const taxCents = Math.round(subtotalCents * 0.085);

    const totalCents = subtotalCents + shippingCents + taxCents;

    // Generate order number
    const orderNumber = await this.generateOrderNumber();

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        purchaseType: orderData.purchaseType,
        subscriptionType: orderData.subscriptionType,
        subscriptionId: orderData.subscriptionId,
        userId: orderData.userId,
        guestEmail: orderData.guestEmail,
        guestPhone: orderData.guestPhone,
        subtotalCents,
        shippingCents,
        taxCents,
        totalCents,
        deliveryType: orderData.deliveryType as any,
        requestedDeliveryDate: orderData.requestedDeliveryDate,
        deliveryNotes: orderData.deliveryNotes,
        // Shipping address snapshot
        shippingFirstName: orderData.shippingAddress.firstName,
        shippingLastName: orderData.shippingAddress.lastName,
        shippingStreet1: orderData.shippingAddress.street1,
        shippingStreet2: orderData.shippingAddress.street2,
        shippingCity: orderData.shippingAddress.city,
        shippingState: orderData.shippingAddress.state,
        shippingZipCode: orderData.shippingAddress.zipCode,
        shippingPhone: orderData.shippingAddress.phone,
        items: {
          create: orderData.items,
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: true,
      },
    });

    return order;
  }

  // Get order by ID (with access control)
  async getOrderById(orderId: string, userId?: string): Promise<Order | null> {
    const whereClause: any = { id: orderId };

    // If user is provided, ensure they own the order or it's a guest order with their email
    if (userId) {
      whereClause.OR = [
        { userId },
        { AND: [{ userId: null }, { guestEmail: { not: null } }] },
      ];
    }

    return await prisma.order.findFirst({
      where: whereClause,
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: true,
      },
    });
  }

  // Get user orders
  async getUserOrders(userId: string): Promise<Order[]> {
    return await prisma.order.findMany({
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

  // Confirm order (after payment)
  async confirmOrder(orderId: string, paymentIntentId: string): Promise<Order> {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.CONFIRMED,
        payments: {
          create: {
            amountCents: 0, // Will be updated by payment service
            stripePaymentIntentId: paymentIntentId,
            status: 'succeeded',
          },
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: true,
      },
    });

    // Send confirmation email
    await this.emailService.sendOrderConfirmation(order);

    return order;
  }

  // Update order status
  async updateOrderStatus(
    orderId: string,
    status: OrderStatus
  ): Promise<Order> {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: true,
      },
    });

    // Send status update email
    await this.emailService.sendOrderStatusUpdate(order);

    return order;
  }

  // Generate unique order number
  private async generateOrderNumber(): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');

    // Get count of orders today
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

    const todayOrderCount = await prisma.order.count({
      where: {
        createdAt: {
          gte: startOfDay,
          lt: endOfDay,
        },
      },
    });

    const orderNumber = `FLR${dateStr}${(todayOrderCount + 1)
      .toString()
      .padStart(4, '0')}`;
    return orderNumber;
  }

  // Calculate shipping cost (simplified)
  private calculateShipping(
    deliveryType: string,
    subtotalCents: number
  ): number {
    // Free shipping over $75
    if (subtotalCents >= 7500) {
      return 0;
    }

    switch (deliveryType) {
      case 'STANDARD':
        return 995; // $9.95
      case 'EXPRESS':
        return 1995; // $19.95
      case 'SAME_DAY':
        return 2995; // $29.95
      case 'PICKUP':
        return 0;
      default:
        return 995;
    }
  }
}
