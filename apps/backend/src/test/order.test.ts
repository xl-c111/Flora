import { Request, Response } from 'express';
import { OrderController } from '../controllers/OrderController';
import { OrderService } from '../services/OrderService';
import { AuthRequest } from '../middleware/auth';
import { OrderStatus, PurchaseType, DeliveryType } from '@prisma/client';

// Mock dependencies
jest.mock('../services/OrderService');

const MockOrderService = OrderService as jest.MockedClass<typeof OrderService>;

describe('OrderController Tests', () => {
  let orderController: OrderController;
  let mockOrderService: jest.Mocked<OrderService>;
  let mockReq: Partial<AuthRequest>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create controller and mocked service
    orderController = new OrderController();
    mockOrderService = new MockOrderService() as jest.Mocked<OrderService>;
    (orderController as any).orderService = mockOrderService;

    // Setup mock response
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe('createOrder', () => {
    const mockOrderData = {
      purchaseType: PurchaseType.ONE_TIME,
      items: [
        {
          productId: 'product-1',
          quantity: 2,
          priceCents: 1999,
        }
      ],
      shippingAddress: {
        firstName: 'John',
        lastName: 'Doe',
        street1: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        zipCode: '12345',
      },
      deliveryType: DeliveryType.STANDARD,
    };

    test('should create order for authenticated user', async () => {
      mockReq = {
        user: { id: 'auth0|123456', email: 'user@example.com' },
        body: mockOrderData,
      };

      const mockCreatedOrder = {
        id: 'order-123',
        orderNumber: 'FLR202501010001',
        totalCents: 2999,
        ...mockOrderData,
      };

      mockOrderService.createOrder.mockResolvedValue(mockCreatedOrder as any);

      await orderController.createOrder(mockReq as AuthRequest, mockRes as Response);

      expect(mockOrderService.createOrder).toHaveBeenCalledWith({
        ...mockOrderData,
        userId: 'auth0|123456',
      });

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockCreatedOrder,
        message: 'Order created successfully',
      });
    });

    test('should create order for guest user', async () => {
      mockReq = {
        user: undefined, // No authenticated user
        body: {
          ...mockOrderData,
          guestEmail: 'guest@example.com',
          guestPhone: '+1234567890',
        },
      };

      const mockCreatedOrder = {
        id: 'order-123',
        orderNumber: 'FLR202501010001',
        totalCents: 2999,
        guestEmail: 'guest@example.com',
        ...mockOrderData,
      };

      mockOrderService.createOrder.mockResolvedValue(mockCreatedOrder as any);

      await orderController.createOrder(mockReq as AuthRequest, mockRes as Response);

      expect(mockOrderService.createOrder).toHaveBeenCalledWith({
        ...mockOrderData,
        guestEmail: 'guest@example.com',
        guestPhone: '+1234567890',
        userId: undefined,
      });

      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    test('should handle out of stock error', async () => {
      mockReq = {
        user: { id: 'auth0|123456', email: 'user@example.com' },
        body: mockOrderData,
      };

      mockOrderService.createOrder.mockRejectedValue(new Error('Product product-1 is out of stock'));

      await orderController.createOrder(mockReq as AuthRequest, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Product product-1 is out of stock',
      });
    });

    test('should handle generic server error', async () => {
      mockReq = {
        user: { id: 'auth0|123456', email: 'user@example.com' },
        body: mockOrderData,
      };

      mockOrderService.createOrder.mockRejectedValue(new Error('Database connection failed'));

      await orderController.createOrder(mockReq as AuthRequest, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to create order',
      });
    });
  });

  describe('getOrder', () => {
    test('should get order for authenticated user', async () => {
      mockReq = {
        user: { id: 'auth0|123456', email: 'user@example.com' },
        params: { id: 'order-123' },
      };

      const mockOrder = {
        id: 'order-123',
        userId: 'auth0|123456',
        orderNumber: 'FLR202501010001',
        totalCents: 2999,
        items: [],
      };

      mockOrderService.getOrderById.mockResolvedValue(mockOrder as any);

      await orderController.getOrder(mockReq as AuthRequest, mockRes as Response);

      expect(mockOrderService.getOrderById).toHaveBeenCalledWith('order-123', 'auth0|123456');
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockOrder,
      });
    });

    test('should get order for guest user', async () => {
      mockReq = {
        user: undefined, // No authenticated user
        params: { id: 'order-123' },
      };

      const mockOrder = {
        id: 'order-123',
        userId: null,
        guestEmail: 'guest@example.com',
        orderNumber: 'FLR202501010001',
        totalCents: 2999,
        items: [],
      };

      mockOrderService.getOrderById.mockResolvedValue(mockOrder as any);

      await orderController.getOrder(mockReq as AuthRequest, mockRes as Response);

      expect(mockOrderService.getOrderById).toHaveBeenCalledWith('order-123', undefined);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockOrder,
      });
    });

    test('should handle order not found', async () => {
      mockReq = {
        user: { id: 'auth0|123456', email: 'user@example.com' },
        params: { id: 'nonexistent-order' },
      };

      mockOrderService.getOrderById.mockResolvedValue(null);

      await orderController.getOrder(mockReq as AuthRequest, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Order not found',
      });
    });
  });

  describe('getUserOrders', () => {
    test('should get user orders with pagination', async () => {
      mockReq = {
        user: { id: 'auth0|123456', email: 'user@example.com' },
        query: { page: '2', limit: '5' },
      };

      const mockOrdersResult = {
        orders: [
          { id: 'order-1', totalCents: 2999 },
          { id: 'order-2', totalCents: 3999 },
        ],
        total: 15,
        totalPages: 3,
      };

      mockOrderService.getUserOrders.mockResolvedValue(mockOrdersResult as any);

      await orderController.getUserOrders(mockReq as AuthRequest, mockRes as Response);

      expect(mockOrderService.getUserOrders).toHaveBeenCalledWith('auth0|123456', 2, 5);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockOrdersResult.orders,
        meta: {
          currentPage: 2,
          totalPages: 3,
          totalItems: 15,
          itemsPerPage: 5,
        },
      });
    });

    test('should require authentication', async () => {
      mockReq = {
        user: undefined, // No authenticated user
        query: {},
      };

      await orderController.getUserOrders(mockReq as AuthRequest, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Unauthorized',
      });
    });

    test('should use default pagination values', async () => {
      mockReq = {
        user: { id: 'auth0|123456', email: 'user@example.com' },
        query: {}, // No pagination parameters
      };

      const mockOrdersResult = {
        orders: [],
        total: 0,
        totalPages: 0,
      };

      mockOrderService.getUserOrders.mockResolvedValue(mockOrdersResult as any);

      await orderController.getUserOrders(mockReq as AuthRequest, mockRes as Response);

      expect(mockOrderService.getUserOrders).toHaveBeenCalledWith('auth0|123456', 1, 10);
    });
  });

  describe('confirmOrder', () => {
    test('should confirm order with payment intent', async () => {
      mockReq = {
        user: { id: 'auth0|123456', email: 'user@example.com' },
        params: { id: 'order-123' },
        body: { paymentIntentId: 'pi_test_12345' },
      };

      const mockConfirmedOrder = {
        id: 'order-123',
        status: OrderStatus.CONFIRMED,
        orderNumber: 'FLR202501010001',
      };

      mockOrderService.confirmOrder.mockResolvedValue(mockConfirmedOrder as any);

      await orderController.confirmOrder(mockReq as AuthRequest, mockRes as Response);

      expect(mockOrderService.confirmOrder).toHaveBeenCalledWith('order-123', 'pi_test_12345');
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockConfirmedOrder,
        message: 'Order confirmed successfully',
      });
    });

    test('should require payment intent ID', async () => {
      mockReq = {
        user: { id: 'auth0|123456', email: 'user@example.com' },
        params: { id: 'order-123' },
        body: {}, // Missing paymentIntentId
      };

      await orderController.confirmOrder(mockReq as AuthRequest, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Payment intent ID is required',
      });
    });
  });

  describe('cancelOrder', () => {
    test('should cancel order for authenticated user', async () => {
      mockReq = {
        user: { id: 'auth0|123456', email: 'user@example.com' },
        params: { id: 'order-123' },
      };

      const mockOrder = {
        id: 'order-123',
        userId: 'auth0|123456',
        status: OrderStatus.PENDING,
      };

      const mockCancelledOrder = {
        ...mockOrder,
        status: OrderStatus.CANCELLED,
      };

      mockOrderService.getOrderById.mockResolvedValue(mockOrder as any);
      mockOrderService.updateOrderStatus.mockResolvedValue(mockCancelledOrder as any);

      await orderController.cancelOrder(mockReq as AuthRequest, mockRes as Response);

      expect(mockOrderService.getOrderById).toHaveBeenCalledWith('order-123', 'auth0|123456');
      expect(mockOrderService.updateOrderStatus).toHaveBeenCalledWith('order-123', OrderStatus.CANCELLED);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockCancelledOrder,
        message: 'Order cancelled successfully',
      });
    });

    test('should prevent cancellation of non-cancellable order', async () => {
      mockReq = {
        user: { id: 'auth0|123456', email: 'user@example.com' },
        params: { id: 'order-123' },
      };

      const mockOrder = {
        id: 'order-123',
        userId: 'auth0|123456',
        status: OrderStatus.DELIVERED, // Cannot cancel delivered order
      };

      mockOrderService.getOrderById.mockResolvedValue(mockOrder as any);

      await orderController.cancelOrder(mockReq as AuthRequest, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Order cannot be cancelled at this stage',
      });
    });

    test('should handle order not found', async () => {
      mockReq = {
        user: { id: 'auth0|123456', email: 'user@example.com' },
        params: { id: 'nonexistent-order' },
      };

      mockOrderService.getOrderById.mockResolvedValue(null);

      await orderController.cancelOrder(mockReq as AuthRequest, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Order not found',
      });
    });
  });

  describe('updateOrderStatus', () => {
    test('should update order status with valid status', async () => {
      mockReq = {
        user: { id: 'auth0|123456', email: 'user@example.com' },
        params: { id: 'order-123' },
        body: { status: OrderStatus.OUT_FOR_DELIVERY },
      };

      const mockUpdatedOrder = {
        id: 'order-123',
        status: OrderStatus.OUT_FOR_DELIVERY,
      };

      mockOrderService.updateOrderStatus.mockResolvedValue(mockUpdatedOrder as any);

      await orderController.updateOrderStatus(mockReq as AuthRequest, mockRes as Response);

      expect(mockOrderService.updateOrderStatus).toHaveBeenCalledWith('order-123', OrderStatus.OUT_FOR_DELIVERY);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockUpdatedOrder,
        message: 'Order status updated successfully',
      });
    });

    test('should reject invalid order status', async () => {
      mockReq = {
        user: { id: 'auth0|123456', email: 'user@example.com' },
        params: { id: 'order-123' },
        body: { status: 'INVALID_STATUS' },
      };

      await orderController.updateOrderStatus(mockReq as AuthRequest, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid order status',
      });
    });
  });

  describe('getOrderTracking', () => {
    test('should get order tracking information', async () => {
      mockReq = {
        user: { id: 'auth0|123456', email: 'user@example.com' },
        params: { id: 'order-123' },
      };

      const mockTracking = {
        id: 'tracking-123',
        orderId: 'order-123',
        trackingNumber: 'FLR123456',
        status: 'OUT_FOR_DELIVERY',
        events: [],
      };

      mockOrderService.getOrderTracking.mockResolvedValue(mockTracking as any);

      await orderController.getOrderTracking(mockReq as AuthRequest, mockRes as Response);

      expect(mockOrderService.getOrderTracking).toHaveBeenCalledWith('order-123');
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockTracking,
      });
    });

    test('should handle tracking not found', async () => {
      mockReq = {
        user: { id: 'auth0|123456', email: 'user@example.com' },
        params: { id: 'order-123' },
      };

      mockOrderService.getOrderTracking.mockResolvedValue(null);

      await orderController.getOrderTracking(mockReq as AuthRequest, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Tracking information not found',
      });
    });
  });
});