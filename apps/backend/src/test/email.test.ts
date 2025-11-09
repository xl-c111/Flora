import { EmailService } from '../services/EmailService';
import nodemailer from 'nodemailer';
import { User, Order } from '@prisma/client';

// Mock nodemailer
jest.mock('nodemailer');
const mockNodemailer = nodemailer as jest.Mocked<typeof nodemailer>;

describe('EmailService Tests', () => {
  let emailService: EmailService;
  let mockTransporter: jest.Mocked<nodemailer.Transporter>;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock environment variables
    process.env.SMTP_HOST = 'smtp.test.com';
    process.env.SMTP_PORT = '587';
    process.env.SMTP_SECURE = 'false';
    process.env.SMTP_USER = 'test@flora.com';
    process.env.SMTP_PASS = 'test-password';

    // Create mock transporter
    mockTransporter = {
      sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' }),
      verify: jest.fn((callback: (error: Error | null) => void) => callback(null)),
    } as any;

    mockNodemailer.createTransport.mockReturnValue(mockTransporter);

    // Create EmailService instance
    emailService = new EmailService();
  });

  describe('constructor', () => {
    test('should create transporter with correct config', () => {
      expect(mockNodemailer.createTransport).toHaveBeenCalledWith({
        host: 'smtp.test.com',
        port: 587,
        secure: false,
        auth: {
          user: 'test@flora.com',
          pass: 'test-password',
        },
      });
    });

    test('should use default values when env vars not set', () => {
      delete process.env.SMTP_HOST;
      delete process.env.SMTP_PORT;
      delete process.env.SMTP_SECURE;

      new EmailService();

      expect(mockNodemailer.createTransport).toHaveBeenCalledWith({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: 'test@flora.com',
          pass: 'test-password',
        },
      });
    });
  });

  describe('sendWelcomeEmail', () => {
    test('should send welcome email to user with name', async () => {
      const mockUser: User = {
        id: 'user-123',
        email: 'user@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phone: null,
        role: 'CUSTOMER' as any,
        favoriteColors: ['RED', 'BLUE'],
        favoriteOccasions: ['BIRTHDAY', 'ANNIVERSARY'],
        favoriteMoods: ['ROMANTIC', 'CHEERFUL'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await emailService.sendWelcomeEmail(mockUser);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: '"Flora Marketplace" <test@flora.com>',
        to: 'user@example.com',
        subject: 'Welcome to Flora!',
        html: expect.stringContaining('Dear John'),
      });

      const sentEmail = mockTransporter.sendMail.mock.calls[0][0];
      expect(sentEmail.html).toContain('red, blue flowers');
      expect(sentEmail.html).toContain('birthday, anniversary');
      expect(sentEmail.html).toContain('romantic, cheerful');
    });

    test('should send welcome email to user without name', async () => {
      const mockUser: User = {
        id: 'user-123',
        email: 'user@example.com',
        firstName: null,
        lastName: null,
        phone: null,
        role: 'CUSTOMER' as any,
        favoriteColors: [],
        favoriteOccasions: [],
        favoriteMoods: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await emailService.sendWelcomeEmail(mockUser);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: '"Flora Marketplace" <test@flora.com>',
        to: 'user@example.com',
        subject: 'Welcome to Flora!',
        html: expect.stringContaining('Dear Customer'),
      });

      const sentEmail = mockTransporter.sendMail.mock.calls[0][0];
      expect(sentEmail.html).not.toContain('Based on your preferences');
    });
  });

  describe('sendOrderConfirmation', () => {
    test('should send order confirmation to authenticated user', async () => {
      const mockOrder = {
        id: 'order-123',
        orderNumber: 'FLR202501010001',
        totalCents: 2999,
        createdAt: new Date(),
        guestEmail: null,
        shippingFirstName: 'John',
        shippingLastName: 'Doe',
        shippingStreet1: '123 Main St',
        shippingStreet2: null,
        shippingCity: 'Anytown',
        shippingState: 'CA',
        shippingZipCode: '12345',
        requestedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        deliveryNotes: 'Leave at front door',
        user: {
          id: 'user-123',
          email: 'user@example.com',
          firstName: 'John',
          lastName: 'Doe',
        },
      };

      await emailService.sendOrderConfirmation(mockOrder as any);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          from: '"Flora Marketplace" <test@flora.com>',
          to: 'user@example.com',
          subject: 'Order Confirmation #FLR202501010001',
          attachments: expect.any(Array),
          html: expect.stringContaining('John'),
        })
      );

      const sentEmail = mockTransporter.sendMail.mock.calls[0][0];
      expect(sentEmail.html).toContain('#FLR202501010001');
      expect(sentEmail.html).toContain('$29.99');
      expect(sentEmail.html).toContain('John Doe');
      expect(sentEmail.html).toContain('123 Main St');
      expect(sentEmail.html).toContain('Leave at front door');
    });

    test('should send order confirmation to guest user', async () => {
      const mockOrder = {
        id: 'order-123',
        orderNumber: 'FLR202501010001',
        totalCents: 2999,
        createdAt: new Date(),
        guestEmail: 'guest@example.com',
        shippingFirstName: 'Jane',
        shippingLastName: 'Smith',
        shippingStreet1: '456 Oak Ave',
        shippingStreet2: 'Apt 2B',
        shippingCity: 'Other City',
        shippingState: 'NY',
        shippingZipCode: '54321',
        requestedDeliveryDate: null,
        deliveryNotes: null,
        user: null,
      };

      await emailService.sendOrderConfirmation(mockOrder as any);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          from: '"Flora Marketplace" <test@flora.com>',
          to: 'guest@example.com',
          subject: 'Order Confirmation #FLR202501010001',
          attachments: expect.any(Array),
          html: expect.stringContaining('Customer'),
        })
      );

      const sentEmail = mockTransporter.sendMail.mock.calls[0][0];
      expect(sentEmail.html).toContain('Jane Smith');
      expect(sentEmail.html).toContain('456 Oak Ave');
      expect(sentEmail.html).toContain('Apt 2B');
      expect(sentEmail.html).not.toContain('Requested Delivery Date');
      expect(sentEmail.html).not.toContain('Delivery Notes');
    });

    test('should handle missing email gracefully', async () => {
      const mockOrder = {
        id: 'order-123',
        orderNumber: 'FLR202501010001',
        totalCents: 2999,
        createdAt: new Date(),
        guestEmail: null,
        shippingFirstName: 'John',
        shippingLastName: 'Doe',
        shippingStreet1: '123 Main St',
        shippingStreet2: null,
        shippingCity: 'Anytown',
        shippingState: 'CA',
        shippingZipCode: '12345',
        requestedDeliveryDate: null,
        deliveryNotes: null,
        user: null, // No user and no guest email
      };

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      await emailService.sendOrderConfirmation(mockOrder as any);

      expect(consoleSpy).toHaveBeenCalledWith('No email found for order confirmation:', 'order-123');
      expect(mockTransporter.sendMail).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('sendOrderShipped', () => {
    test('should send shipping notification with tracking number', async () => {
      const mockOrder = {
        id: 'order-123',
        orderNumber: 'FLR202501010001',
        shippingFirstName: 'John',
        shippingLastName: 'Doe',
        shippingStreet1: '123 Main St',
        shippingStreet2: null,
        shippingCity: 'Anytown',
        shippingState: 'CA',
        shippingZipCode: '12345',
        requestedDeliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        user: {
          id: 'user-123',
          email: 'user@example.com',
          firstName: 'John',
          lastName: 'Doe',
        },
        guestEmail: null,
      };

      await emailService.sendOrderShipped(mockOrder as any, 'FLR123456789');

      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: '"Flora Marketplace" <test@flora.com>',
        to: 'user@example.com',
        subject: 'Your Flora Order #FLR202501010001 Has Shipped!',
        html: expect.stringContaining('FLR123456789'),
      });

      const sentEmail = mockTransporter.sendMail.mock.calls[0][0];
      expect(sentEmail.html).toContain('<strong>Tracking Number:</strong> FLR123456789');
      expect(sentEmail.html).toContain('Expected Delivery');
    });

    test('should send shipping notification without tracking number', async () => {
      const mockOrder = {
        id: 'order-123',
        orderNumber: 'FLR202501010001',
        shippingFirstName: 'John',
        shippingLastName: 'Doe',
        shippingStreet1: '123 Main St',
        shippingStreet2: null,
        shippingCity: 'Anytown',
        shippingState: 'CA',
        shippingZipCode: '12345',
        requestedDeliveryDate: null,
        guestEmail: 'guest@example.com',
        user: null,
      };

      await emailService.sendOrderShipped(mockOrder as any);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: '"Flora Marketplace" <test@flora.com>',
        to: 'guest@example.com',
        subject: 'Your Flora Order #FLR202501010001 Has Shipped!',
        html: expect.stringContaining('Dear Customer'),
      });

      const sentEmail = mockTransporter.sendMail.mock.calls[0][0];
      expect(sentEmail.html).not.toContain('Tracking Number');
      expect(sentEmail.html).not.toContain('Expected Delivery');
    });

    test('should handle missing email gracefully for shipping notification', async () => {
      const mockOrder = {
        id: 'order-123',
        orderNumber: 'FLR202501010001',
        shippingFirstName: 'John',
        shippingLastName: 'Doe',
        shippingStreet1: '123 Main St',
        shippingStreet2: null,
        shippingCity: 'Anytown',
        shippingState: 'CA',
        shippingZipCode: '12345',
        requestedDeliveryDate: null,
        guestEmail: null,
        user: null,
      };

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      await emailService.sendOrderShipped(mockOrder as any);

      expect(consoleSpy).toHaveBeenCalledWith('No email found for shipping notification:', 'order-123');
      expect(mockTransporter.sendMail).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('sendPasswordReset', () => {
    test('should send password reset email', async () => {
      process.env.FRONTEND_URL = 'https://flora.example.com';

      await emailService.sendPasswordReset('user@example.com', 'reset-token-123');

      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: '"Flora Marketplace" <test@flora.com>',
        to: 'user@example.com',
        subject: 'Reset Your Flora Password',
        html: expect.stringContaining('https://flora.example.com/auth/reset-password?token=reset-token-123'),
      });

      const sentEmail = mockTransporter.sendMail.mock.calls[0][0];
      expect(sentEmail.html).toContain('Reset Password');
      expect(sentEmail.html).toContain('1 hour');
    });
  });

  describe('sendContactFormSubmission', () => {
    test('should send contact form submission and confirmation', async () => {
      const contactData = {
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Question about flowers',
        message: 'I have a question about your rose arrangements.\nCan you help me?',
      };

      process.env.CONTACT_EMAIL = 'support@flora.com';

      await emailService.sendContactFormSubmission(contactData);

      expect(mockTransporter.sendMail).toHaveBeenCalledTimes(2);

      // Check submission email to support
      const submissionEmail = mockTransporter.sendMail.mock.calls[0][0];
      expect(submissionEmail).toEqual({
        from: '"Flora Marketplace" <test@flora.com>',
        to: 'support@flora.com',
        subject: 'Contact Form: Question about flowers',
        replyTo: 'john@example.com',
        html: expect.stringContaining('John Doe'),
      });
      expect(submissionEmail.html).toContain('john@example.com');
      expect(submissionEmail.html).toContain('I have a question about your rose arrangements.<br>Can you help me?');

      // Check confirmation email to user
      const confirmationEmail = mockTransporter.sendMail.mock.calls[1][0];
      expect(confirmationEmail).toEqual({
        from: '"Flora Marketplace" <test@flora.com>',
        to: 'john@example.com',
        subject: 'We Received Your Message - Flora',
        html: expect.stringContaining('Dear John Doe'),
      });
      expect(confirmationEmail.html).toContain('within 24 hours');
    });
  });

  describe('error handling', () => {
    test('should handle transporter sendMail error', async () => {
      const mockUser: User = {
        id: 'user-123',
        email: 'user@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phone: null,
        role: 'CUSTOMER' as any,
        favoriteColors: [],
        favoriteOccasions: [],
        favoriteMoods: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTransporter.sendMail.mockRejectedValue(new Error('SMTP connection failed'));

      await expect(emailService.sendWelcomeEmail(mockUser)).rejects.toThrow('SMTP connection failed');
    });
  });
});
