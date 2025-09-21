import { prisma } from "../config/database";
import {
  Order,
  OrderItem,
  PurchaseType,
  SubscriptionType,
  OrderStatus,
  DeliveryType,
  DeliveryTracking,
} from "@prisma/client";
import { EmailService } from "./EmailService";

export interface CreateOrderData {
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
  deliveryType: DeliveryType;
  deliveryNotes?: string;
  requestedDeliveryDate?: Date;
}

export interface OrderWithDetails extends Order {
  items: (OrderItem & {
    product: {
      id: string;
      name: string;
      priceCents: number;
      imageUrl?: string;
    };
  })[];
  user?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  } | null;
  payments?: Array<{
    id: string;
    amountCents: number;
    status: string;
    paidAt?: Date;
  }>;
}

export class OrderService {
  private emailService: EmailService;

  constructor() {
    this.emailService = new EmailService();
  }

  // Create new order (guest or user)
  async createOrder(orderData: CreateOrderData): Promise<OrderWithDetails> {
    // Validate products exist and are in stock
    await this.validateOrderItems(orderData.items);

    // Calculate totals
    const subtotalCents = orderData.items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);

    // Calculate shipping
    const shippingCents = await this.calculateShipping(
      orderData.deliveryType,
      orderData.shippingAddress.zipCode,
      subtotalCents
    );

    // Calculate tax (simplified - 8.5%)
    const taxCents = Math.round(subtotalCents * 0.085);

    const totalCents = subtotalCents + shippingCents + taxCents;

    // Generate order number
    const orderNumber = await this.generateOrderNumber();

    // Create order with transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
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
          deliveryType: orderData.deliveryType,
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
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      // Update product stock
      for (const item of orderData.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stockCount: {
              decrement: item.quantity,
            },
          },
        });
      }

      return newOrder;
    });

    return order;
  }

  // Get order by ID (with access control)
  async getOrderById(orderId: string, userId?: string): Promise<OrderWithDetails | null> {
    const whereClause: any = { id: orderId };

    // If user is provided, ensure they own the order or it's accessible
    if (userId) {
      whereClause.OR = [{ userId }, { AND: [{ userId: null }, { guestEmail: { not: null } }] }];
    }

    return await prisma.order.findFirst({
      where: whereClause,
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
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        payments: {
          select: {
            id: true,
            amountCents: true,
            status: true,
            paidAt: true,
          },
        },
      },
    });
  }

  // Get user orders
  async getUserOrders(
    userId: string,
    page = 1,
    limit = 10
  ): Promise<{
    orders: OrderWithDetails[];
    total: number;
    totalPages: number;
  }> {
    const offset = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId },
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
          payments: {
            select: {
              id: true,
              amountCents: true,
              status: true,
              paidAt: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: limit,
      }),
      prisma.order.count({ where: { userId } }),
    ]);

    return {
      orders,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Get all orders (admin)
  async getAllOrders(
    page = 1,
    limit = 20,
    status?: OrderStatus,
    purchaseType?: PurchaseType
  ): Promise<{
    orders: OrderWithDetails[];
    total: number;
    totalPages: number;
  }> {
    const offset = (page - 1) * limit;
    const where: any = {};

    if (status) where.status = status;
    if (purchaseType) where.purchaseType = purchaseType;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
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
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          payments: {
            select: {
              id: true,
              amountCents: true,
              status: true,
              paidAt: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return {
      orders,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Confirm order (after payment)
  async confirmOrder(orderId: string, paymentIntentId: string): Promise<OrderWithDetails> {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.CONFIRMED,
        payments: {
          create: {
            amountCents: 0, // Will be updated by payment service
            stripePaymentIntentId: paymentIntentId,
            status: "succeeded",
            paidAt: new Date(),
          },
        },
      },
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
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        payments: {
          select: {
            id: true,
            amountCents: true,
            status: true,
            paidAt: true,
          },
        },
      },
    });

    // Create delivery tracking record
    await this.createDeliveryTracking(order);

    // Send confirmation email
    await this.emailService.sendOrderConfirmation(order);

    return order;
  }

  // Update order status
  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<OrderWithDetails> {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        actualDeliveryDate: status === OrderStatus.DELIVERED ? new Date() : undefined,
      },
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
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        payments: {
          select: {
            id: true,
            amountCents: true,
            status: true,
            paidAt: true,
          },
        },
      },
    });

    // Update delivery tracking
    await this.updateDeliveryTracking(orderId, status);

    // Send status update email
    await this.emailService.sendOrderShipped(order);

    return order;
  }

  // Get order tracking information
  async getOrderTracking(orderId: string): Promise<DeliveryTracking | null> {
    return await prisma.deliveryTracking.findUnique({
      where: { orderId },
      include: {
        events: {
          where: { isCustomerVisible: true },
          orderBy: { timestamp: "desc" },
        },
      },
    });
  }

  // Private helper methods
  private async validateOrderItems(items: Array<{ productId: string; quantity: number }>) {
    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        select: { id: true, inStock: true, stockCount: true, isActive: true },
      });

      if (!product || !product.isActive) {
        throw new Error(`Product ${item.productId} is not available`);
      }

      if (!product.inStock || product.stockCount < item.quantity) {
        throw new Error(`Product ${item.productId} is out of stock`);
      }
    }
  }

  private async generateOrderNumber(): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");

    // Get count of orders today
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

    const todayOrderCount = await prisma.order.count({
      where: {
        createdAt: {
          gte: startOfDay,
          lt: endOfDay,
        },
      },
    });

    const orderNumber = `FLR${dateStr}${(todayOrderCount + 1).toString().padStart(4, "0")}`;
    return orderNumber;
  }

  private async calculateShipping(deliveryType: DeliveryType, zipCode: string, subtotalCents: number): Promise<number> {
    // Check if delivery zone offers free shipping
    const deliveryZone = await prisma.deliveryZone.findFirst({
      where: {
        zipCodes: { has: zipCode },
        isActive: true,
      },
    });

    // Free shipping over threshold
    if (deliveryZone?.freeDeliveryThreshold && subtotalCents >= deliveryZone.freeDeliveryThreshold) {
      return 0;
    }

    // Use delivery zone pricing if available
    if (deliveryZone) {
      switch (deliveryType) {
        case DeliveryType.STANDARD:
          return deliveryZone.standardCostCents;
        case DeliveryType.EXPRESS:
          return deliveryZone.expressCostCents || deliveryZone.standardCostCents;
        case DeliveryType.SAME_DAY:
          return deliveryZone.sameDayCostCents || deliveryZone.expressCostCents || deliveryZone.standardCostCents;
        case DeliveryType.PICKUP:
          return 0;
        default:
          return deliveryZone.standardCostCents;
      }
    }

    // Fallback pricing
    switch (deliveryType) {
      case DeliveryType.STANDARD:
        return 995; // $9.95
      case DeliveryType.EXPRESS:
        return 1995; // $19.95
      case DeliveryType.SAME_DAY:
        return 2995; // $29.95
      case DeliveryType.PICKUP:
        return 0;
      default:
        return 995;
    }
  }

  private async createDeliveryTracking(order: OrderWithDetails): Promise<void> {
    const trackingNumber = await this.generateTrackingNumber();

    await prisma.deliveryTracking.create({
      data: {
        orderId: order.id,
        trackingNumber,
        carrierName: "Flora Express",
        status: "PREPARING",
        estimatedDelivery: order.requestedDeliveryDate,
        events: {
          create: {
            timestamp: new Date(),
            status: "ORDER_PLACED",
            description: "Order has been placed and is being prepared",
            location: "Flora Marketplace",
          },
        },
      },
    });
  }

  private async updateDeliveryTracking(orderId: string, status: OrderStatus): Promise<void> {
    const trackingStatusMap: Record<OrderStatus, string> = {
      [OrderStatus.PENDING]: "PREPARING",
      [OrderStatus.CONFIRMED]: "PREPARING",
      [OrderStatus.PREPARING]: "PREPARING",
      [OrderStatus.OUT_FOR_DELIVERY]: "OUT_FOR_DELIVERY",
      [OrderStatus.DELIVERED]: "DELIVERED",
      [OrderStatus.CANCELLED]: "CANCELLED",
      [OrderStatus.REFUNDED]: "CANCELLED",
    };

    const trackingStatus = trackingStatusMap[status];
    if (!trackingStatus) return;

    const tracking = await prisma.deliveryTracking.findUnique({
      where: { orderId },
    });

    if (tracking) {
      await prisma.deliveryTracking.update({
        where: { orderId },
        data: {
          status: trackingStatus,
          actualDelivery: status === OrderStatus.DELIVERED ? new Date() : undefined,
        },
      });

      // Add tracking event
      await prisma.trackingEvent.create({
        data: {
          trackingId: tracking.id,
          timestamp: new Date(),
          status: trackingStatus,
          description: this.getTrackingDescription(status),
          location: status === OrderStatus.DELIVERED ? "Delivered" : "Flora Express",
        },
      });
    }
  }

  private async generateTrackingNumber(): Promise<string> {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `FLR${timestamp.slice(-6)}${random}`;
  }

  private getTrackingDescription(status: OrderStatus): string {
    const descriptions: Record<OrderStatus, string> = {
      [OrderStatus.PENDING]: "Order received and being processed",
      [OrderStatus.CONFIRMED]: "Order confirmed and being prepared",
      [OrderStatus.PREPARING]: "Your beautiful flowers are being prepared",
      [OrderStatus.OUT_FOR_DELIVERY]: "Your order is out for delivery",
      [OrderStatus.DELIVERED]: "Order has been successfully delivered",
      [OrderStatus.CANCELLED]: "Order has been cancelled",
      [OrderStatus.REFUNDED]: "Order has been refunded",
    };

    return descriptions[status] || "Order status updated";
  }
}
