import { Request, Response } from 'express';
import { PaymentController } from '../controllers/PaymentController';
import { PaymentService } from '../services/PaymentService';
import { AuthRequest } from '../middleware/auth';

// Mock dependencies
jest.mock('../services/PaymentService');

const MockPaymentService = PaymentService as jest.MockedClass<typeof PaymentService>;

describe('PaymentController Tests', () => {
  let paymentController: PaymentController;
  let mockPaymentService: jest.Mocked<PaymentService>;
  let mockReq: Partial<AuthRequest>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create controller and mocked service
    paymentController = new PaymentController();
    mockPaymentService = new MockPaymentService() as jest.Mocked<PaymentService>;
    (paymentController as any).paymentService = mockPaymentService;

    // Setup mock response
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe('createPaymentIntent', () => {
    test('should create payment intent for authenticated user', async () => {
      mockReq = {
        user: { id: 'auth0|123456', email: 'user@example.com' },
        body: {
          orderId: 'order-123',
          amount: 29.99,
        },
      };

      const mockPaymentIntent = {
        id: 'pi_test_12345',
        client_secret: 'pi_test_12345_secret_test',
        amount: 2999,
        currency: 'usd',
        status: 'requires_payment_method',
      };

      mockPaymentService.createPaymentIntent.mockResolvedValue(mockPaymentIntent as any);

      await paymentController.createPaymentIntent(mockReq as Request, mockRes as Response);

      expect(mockPaymentService.createPaymentIntent).toHaveBeenCalledWith({
        orderId: 'order-123',
        amount: 29.99,
      });

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: {
          clientSecret: 'pi_test_12345_secret_test',
          paymentIntentId: 'pi_test_12345',
        },
      });
    });

    test('should create payment intent for guest user', async () => {
      mockReq = {
        user: undefined, // No authenticated user
        body: {
          orderId: 'order-123',
          amount: 29.99,
        },
      };

      const mockPaymentIntent = {
        id: 'pi_test_12345',
        client_secret: 'pi_test_12345_secret_test',
        amount: 2999,
        currency: 'usd',
        status: 'requires_payment_method',
      };

      mockPaymentService.createPaymentIntent.mockResolvedValue(mockPaymentIntent as any);

      await paymentController.createPaymentIntent(mockReq as Request, mockRes as Response);

      expect(mockPaymentService.createPaymentIntent).toHaveBeenCalledWith({
        orderId: 'order-123',
        amount: 29.99,
      });

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: {
          clientSecret: 'pi_test_12345_secret_test',
          paymentIntentId: 'pi_test_12345',
        },
      });
    });

    test('should handle payment intent creation error', async () => {
      mockReq = {
        user: { id: 'auth0|123456', email: 'user@example.com' },
        body: {
          orderId: 'order-123',
          amount: 29.99,
        },
      };

      mockPaymentService.createPaymentIntent.mockRejectedValue(new Error('Stripe API error'));

      await paymentController.createPaymentIntent(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to create payment intent',
      });
    });
  });

  describe('confirmPayment', () => {
    test('should confirm payment for authenticated user', async () => {
      mockReq = {
        user: { id: 'auth0|123456', email: 'user@example.com' },
        body: {
          paymentIntentId: 'pi_test_12345',
          orderId: 'order-123',
        },
      };

      const mockPaymentIntent = {
        id: 'pi_test_12345',
        status: 'succeeded',
        amount: 2999,
        currency: 'usd',
      };

      mockPaymentService.confirmPayment.mockResolvedValue(mockPaymentIntent as any);

      await paymentController.confirmPayment(mockReq as Request, mockRes as Response);

      expect(mockPaymentService.confirmPayment).toHaveBeenCalledWith('pi_test_12345', 'order-123');
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockPaymentIntent,
        message: 'Payment confirmed successfully',
      });
    });

    test('should confirm payment for guest user', async () => {
      mockReq = {
        user: undefined, // No authenticated user
        body: {
          paymentIntentId: 'pi_test_12345',
          orderId: 'order-123',
        },
      };

      const mockPaymentIntent = {
        id: 'pi_test_12345',
        status: 'succeeded',
        amount: 2999,
        currency: 'usd',
      };

      mockPaymentService.confirmPayment.mockResolvedValue(mockPaymentIntent as any);

      await paymentController.confirmPayment(mockReq as Request, mockRes as Response);

      expect(mockPaymentService.confirmPayment).toHaveBeenCalledWith('pi_test_12345', 'order-123');
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockPaymentIntent,
        message: 'Payment confirmed successfully',
      });
    });

    test('should handle payment confirmation error', async () => {
      mockReq = {
        user: { id: 'auth0|123456', email: 'user@example.com' },
        body: {
          paymentIntentId: 'pi_test_12345',
          orderId: 'order-123',
        },
      };

      mockPaymentService.confirmPayment.mockRejectedValue(new Error('Payment failed'));

      await paymentController.confirmPayment(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to confirm payment',
      });
    });
  });

  describe('getPayment', () => {
    test('should get payment details for authenticated user', async () => {
      mockReq = {
        user: { id: 'auth0|123456', email: 'user@example.com' },
        params: { id: 'pi_test_12345' },
      };

      const mockPaymentIntent = {
        id: 'pi_test_12345',
        status: 'succeeded',
        amount: 2999,
        currency: 'usd',
        metadata: { orderId: 'order-123' },
      };

      mockPaymentService.getPaymentById.mockResolvedValue(mockPaymentIntent as any);

      await paymentController.getPayment(mockReq as Request, mockRes as Response);

      expect(mockPaymentService.getPaymentById).toHaveBeenCalledWith('pi_test_12345');
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockPaymentIntent,
      });
    });

    test('should get payment details for guest user', async () => {
      mockReq = {
        user: undefined, // No authenticated user
        params: { id: 'pi_test_12345' },
      };

      const mockPaymentIntent = {
        id: 'pi_test_12345',
        status: 'succeeded',
        amount: 2999,
        currency: 'usd',
        metadata: { orderId: 'order-123' },
      };

      mockPaymentService.getPaymentById.mockResolvedValue(mockPaymentIntent as any);

      await paymentController.getPayment(mockReq as Request, mockRes as Response);

      expect(mockPaymentService.getPaymentById).toHaveBeenCalledWith('pi_test_12345');
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockPaymentIntent,
      });
    });

    test('should handle payment not found', async () => {
      mockReq = {
        user: { id: 'auth0|123456', email: 'user@example.com' },
        params: { id: 'pi_nonexistent' },
      };

      mockPaymentService.getPaymentById.mockResolvedValue(null);

      await paymentController.getPayment(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Payment not found',
      });
    });
  });

  describe('getPaymentMethods', () => {
    test('should get payment methods for authenticated user', async () => {
      mockReq = {
        user: { id: 'auth0|123456', email: 'user@example.com' },
        query: { customerId: 'cus_test_12345' },
      };

      const mockPaymentMethods = [
        {
          id: 'pm_test_card1',
          type: 'card',
          card: {
            brand: 'visa',
            last4: '4242',
            exp_month: 12,
            exp_year: 2025,
          },
        },
        {
          id: 'pm_test_card2',
          type: 'card',
          card: {
            brand: 'mastercard',
            last4: '1234',
            exp_month: 6,
            exp_year: 2026,
          },
        },
      ];

      mockPaymentService.getPaymentMethods.mockResolvedValue(mockPaymentMethods as any);

      await paymentController.getPaymentMethods(mockReq as Request, mockRes as Response);

      expect(mockPaymentService.getPaymentMethods).toHaveBeenCalledWith('cus_test_12345');
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockPaymentMethods,
      });
    });

    test('should require customer ID', async () => {
      mockReq = {
        user: { id: 'auth0|123456', email: 'user@example.com' },
        query: {}, // Missing customerId
      };

      await paymentController.getPaymentMethods(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Customer ID is required',
      });
    });

    test('should get payment methods with valid customer ID', async () => {
      mockReq = {
        user: { id: 'auth0|123456', email: 'user@example.com' },
        query: { customerId: 'cus_valid_123' },
      };

      const mockPaymentMethods = [
        {
          id: 'pm_test_card1',
          type: 'card',
          card: { brand: 'visa', last4: '4242' },
        },
      ];

      mockPaymentService.getPaymentMethods.mockResolvedValue(mockPaymentMethods as any);

      await paymentController.getPaymentMethods(mockReq as Request, mockRes as Response);

      expect(mockPaymentService.getPaymentMethods).toHaveBeenCalledWith('cus_valid_123');
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockPaymentMethods,
      });
    });
  });

  describe('createCustomer', () => {
    test('should create customer for authenticated user', async () => {
      mockReq = {
        user: { id: 'auth0|123456', email: 'user@example.com' },
        body: {
          email: 'user@example.com',
          name: 'John Doe',
          phone: '+1234567890',
          address: {
            line1: '123 Main St',
            city: 'Anytown',
            state: 'CA',
            postal_code: '12345',
            country: 'US',
          },
        },
      };

      const mockCustomer = {
        id: 'cus_test_12345',
        email: 'user@example.com',
        name: 'John Doe',
        phone: '+1234567890',
        address: {
          line1: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          postal_code: '12345',
          country: 'US',
        },
      };

      mockPaymentService.createCustomer.mockResolvedValue(mockCustomer as any);

      await paymentController.createCustomer(mockReq as Request, mockRes as Response);

      expect(mockPaymentService.createCustomer).toHaveBeenCalledWith({
        email: 'user@example.com',
        name: 'John Doe',
        phone: '+1234567890',
        address: {
          line1: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          postal_code: '12345',
          country: 'US',
        },
      });

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockCustomer,
        message: 'Customer created successfully',
      });
    });

    test('should require email', async () => {
      mockReq = {
        user: { id: 'auth0|123456', email: 'user@example.com' },
        body: {
          name: 'John Doe',
          // Missing email
        },
      };

      await paymentController.createCustomer(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Email is required',
      });
    });

    test('should handle customer creation error', async () => {
      mockReq = {
        user: { id: 'auth0|123456', email: 'user@example.com' },
        body: {
          email: 'user@example.com',
          name: 'John Doe',
        },
      };

      mockPaymentService.createCustomer.mockRejectedValue(new Error('Stripe customer creation failed'));

      await paymentController.createCustomer(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to create customer',
      });
    });
  });

  describe('refundPayment', () => {
    test('should refund payment for authenticated user', async () => {
      mockReq = {
        user: { id: 'auth0|123456', email: 'user@example.com' },
        params: { id: 'pi_test_12345' },
        body: {
          amount: 1000, // Partial refund
          reason: 'requested_by_customer',
        },
      };

      const mockRefund = {
        id: 're_test_12345',
        amount: 1000,
        currency: 'usd',
        payment_intent: 'pi_test_12345',
        reason: 'requested_by_customer',
        status: 'succeeded',
      };

      mockPaymentService.refundPayment.mockResolvedValue(mockRefund as any);

      await paymentController.refundPayment(mockReq as Request, mockRes as Response);

      expect(mockPaymentService.refundPayment).toHaveBeenCalledWith(
        'pi_test_12345',
        1000,
        'requested_by_customer'
      );
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockRefund,
        message: 'Payment refunded successfully',
      });
    });

    test('should handle full refund', async () => {
      mockReq = {
        user: { id: 'auth0|123456', email: 'user@example.com' },
        params: { id: 'pi_test_12345' },
        body: {
          // No amount specified = full refund
          reason: 'requested_by_customer',
        },
      };

      const mockRefund = {
        id: 're_test_12345',
        amount: 2999, // Full amount
        currency: 'usd',
        payment_intent: 'pi_test_12345',
        reason: 'requested_by_customer',
        status: 'succeeded',
      };

      mockPaymentService.refundPayment.mockResolvedValue(mockRefund as any);

      await paymentController.refundPayment(mockReq as Request, mockRes as Response);

      expect(mockPaymentService.refundPayment).toHaveBeenCalledWith(
        'pi_test_12345',
        undefined, // No amount = full refund
        'requested_by_customer'
      );
    });

    test('should handle refund error', async () => {
      mockReq = {
        user: { id: 'auth0|123456', email: 'user@example.com' },
        params: { id: 'pi_test_12345' },
        body: {
          amount: 1000,
          reason: 'requested_by_customer',
        },
      };

      mockPaymentService.refundPayment.mockRejectedValue(new Error('Refund failed'));

      await paymentController.refundPayment(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to refund payment',
      });
    });
  });
});