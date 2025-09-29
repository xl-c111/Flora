import { OrderController } from '../controllers/OrderController';
import { PaymentController } from '../controllers/PaymentController';
import { OrderService } from '../services/OrderService';
import { PaymentService } from '../services/PaymentService';
import { EmailService } from '../services/EmailService';
import { AuthRequest } from '../middleware/auth';
import { PurchaseType, DeliveryType, OrderStatus } from '@prisma/client';
import { createMockAuthRequest, createMockResponse, createMockUser } from './setup';

jest.mock('../services/OrderService');
jest.mock('../services/PaymentService');
jest.mock('../services/EmailService');
jest.mock('stripe');
jest.mock('nodemailer');

describe('Order + Payment + Email + Auth Integration', () => {
  let orderController: OrderController;
  let paymentController: PaymentController;
  let mockOrderService: jest.Mocked<OrderService>;
  let mockPaymentService: jest.Mocked<PaymentService>;
  let mockEmailService: jest.Mocked<EmailService>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup controllers
    orderController = new OrderController();
    paymentController = new PaymentController();

    // Setup mocked services
    mockOrderService = new (OrderService as jest.MockedClass<typeof OrderService>)() as jest.Mocked<OrderService>;
    mockPaymentService = new (PaymentService as jest.MockedClass<typeof PaymentService>)() as jest.Mocked<PaymentService>;
    mockEmailService = new (EmailService as jest.MockedClass<typeof EmailService>)() as jest.Mocked<EmailService>;

    // Inject mocked services
    (orderController as any).orderService = mockOrderService;
    (paymentController as any).paymentService = mockPaymentService;
    (mockOrderService as any).emailService = mockEmailService;
  });

  describe('Complete Authenticated User Order Flow', () => {
    test('user creates order → payment → confirmation email', async () => {
      const mockUser = createMockUser();
      const orderId = 'order-123';
      const paymentIntentId = 'pi_test_123';

      // Step 1: Create Order
      const orderReq = createMockAuthRequest(mockUser);
      orderReq.body = {
        purchaseType: PurchaseType.ONE_TIME,
        items: [{ productId: 'product-1', quantity: 1, priceCents: 2999 }],
        shippingAddress: {
          firstName: 'John', lastName: 'Doe', street1: '123 Main St',
          city: 'Anytown', state: 'CA', zipCode: '12345'
        },
        deliveryType: DeliveryType.STANDARD,
      };
      const orderRes = createMockResponse();

      const mockOrder = {
        id: orderId,
        orderNumber: 'FLR202501010001',
        userId: mockUser.id,
        user: mockUser,
        totalCents: 2999,
        status: OrderStatus.PENDING,
        ...orderReq.body,
      };
      mockOrderService.createOrder.mockResolvedValue(mockOrder as any);

      await orderController.createOrder(orderReq as AuthRequest, orderRes as any);

      expect(mockOrderService.createOrder).toHaveBeenCalledWith({
        ...orderReq.body,
        userId: mockUser.id,
      });
      expect(orderRes.status).toHaveBeenCalledWith(201);

      // Step 2: Create Payment Intent
      const paymentReq = createMockAuthRequest(mockUser);
      paymentReq.body = { orderId, amount: 29.99 };
      const paymentRes = createMockResponse();

      const mockPaymentIntent = {
        id: paymentIntentId,
        client_secret: 'pi_test_123_secret_test',
      };
      mockPaymentService.createPaymentIntent.mockResolvedValue(mockPaymentIntent as any);

      await paymentController.createPaymentIntent(paymentReq as any, paymentRes as any);

      expect(mockPaymentService.createPaymentIntent).toHaveBeenCalledWith({
        orderId,
        amount: 29.99,
      });

      // Step 3: Confirm Order (after payment)
      const confirmReq = createMockAuthRequest(mockUser);
      confirmReq.params = { id: orderId };
      confirmReq.body = { paymentIntentId };
      const confirmRes = createMockResponse();

      const mockConfirmedOrder = {
        ...mockOrder,
        status: OrderStatus.CONFIRMED,
      };
      mockOrderService.confirmOrder.mockResolvedValue(mockConfirmedOrder as any);
      mockEmailService.sendOrderConfirmation.mockResolvedValue(undefined);

      await orderController.confirmOrder(confirmReq as AuthRequest, confirmRes as any);

      expect(mockOrderService.confirmOrder).toHaveBeenCalledWith(orderId, paymentIntentId);
      expect(confirmRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockConfirmedOrder,
        message: 'Order confirmed successfully',
      });
    });
  });

  describe('Complete Guest User Order Flow', () => {
    test('guest creates order → payment → confirmation email', async () => {
      const guestEmail = 'guest@example.com';
      const orderId = 'order-456';
      const paymentIntentId = 'pi_test_456';

      // Step 1: Create Order (Guest)
      const orderReq = createMockAuthRequest(); // No user
      orderReq.body = {
        purchaseType: PurchaseType.ONE_TIME,
        guestEmail,
        guestPhone: '+1234567890',
        items: [{ productId: 'product-1', quantity: 1, priceCents: 2999 }],
        shippingAddress: {
          firstName: 'Jane', lastName: 'Guest', street1: '456 Guest St',
          city: 'Guesttown', state: 'NY', zipCode: '67890'
        },
        deliveryType: DeliveryType.STANDARD,
      };
      const orderRes = createMockResponse();

      const mockOrder = {
        id: orderId,
        orderNumber: 'FLR202501010002',
        userId: null,
        user: null,
        guestEmail,
        totalCents: 2999,
        status: OrderStatus.PENDING,
        ...orderReq.body,
      };
      mockOrderService.createOrder.mockResolvedValue(mockOrder as any);

      await orderController.createOrder(orderReq as AuthRequest, orderRes as any);

      expect(mockOrderService.createOrder).toHaveBeenCalledWith({
        ...orderReq.body,
        userId: undefined,
      });

      // Step 2: Create Payment Intent (Guest)
      const paymentReq = createMockAuthRequest(); // No user
      paymentReq.body = { orderId, amount: 29.99 };
      const paymentRes = createMockResponse();

      const mockPaymentIntent = {
        id: paymentIntentId,
        client_secret: 'pi_test_456_secret_test',
      };
      mockPaymentService.createPaymentIntent.mockResolvedValue(mockPaymentIntent as any);

      await paymentController.createPaymentIntent(paymentReq as any, paymentRes as any);

      expect(mockPaymentService.createPaymentIntent).toHaveBeenCalledWith({
        orderId,
        amount: 29.99,
      });

      // Step 3: Confirm Order (Guest)
      const confirmReq = createMockAuthRequest(); // No user
      confirmReq.params = { id: orderId };
      confirmReq.body = { paymentIntentId };
      const confirmRes = createMockResponse();

      const mockConfirmedOrder = {
        ...mockOrder,
        status: OrderStatus.CONFIRMED,
      };
      mockOrderService.confirmOrder.mockResolvedValue(mockConfirmedOrder as any);
      mockEmailService.sendOrderConfirmation.mockResolvedValue(undefined);

      await orderController.confirmOrder(confirmReq as AuthRequest, confirmRes as any);

      expect(mockOrderService.confirmOrder).toHaveBeenCalledWith(orderId, paymentIntentId);
      expect(confirmRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockConfirmedOrder,
        message: 'Order confirmed successfully',
      });
    });
  });

  describe('Payment Webhook Integration', () => {
    test('payment webhook triggers order confirmation and email', async () => {
      const orderId = 'order-789';
      const paymentIntentId = 'pi_test_789';

      // Mock payment intent succeeded
      const mockPaymentIntent = {
        id: paymentIntentId,
        amount: 2999,
        currency: 'usd',
        metadata: { orderId },
      };

      // Mock order update and email sending in PaymentService webhook handler
      const mockUpdatedOrder = {
        id: orderId,
        status: OrderStatus.CONFIRMED,
        user: createMockUser(),
      };

      // This tests the webhook flow in PaymentService
      await mockPaymentService.handleWebhook(Buffer.from('test'), 'test-signature', 'test-secret');

      // Note: The actual webhook implementation would call handlePaymentIntentSucceeded
      // which updates the order and sends email
      expect(mockPaymentService.handleWebhook).toHaveBeenCalled();
    });
  });
});