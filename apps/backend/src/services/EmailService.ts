import nodemailer from 'nodemailer';
import { User, Order, Subscription } from '@prisma/client';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    const config: EmailConfig = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER!,
        pass: process.env.SMTP_PASS!,
      },
    };

    this.transporter = nodemailer.createTransporter(config);
  }

  async sendWelcomeEmail(user: User): Promise<void> {
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@flora.com',
      to: user.email,
      subject: 'Welcome to Flora!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #16a34a;">Welcome to Flora!</h1>
          <p>Dear ${user.name || 'Customer'},</p>
          <p>Thank you for joining Flora! We're excited to help you discover beautiful, fresh flowers for every occasion.</p>

          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #16a34a; margin-top: 0;">What's next?</h3>
            <ul>
              <li>Browse our collection of fresh flowers and arrangements</li>
              <li>Consider a subscription for regular flower deliveries</li>
              <li>Check out our seasonal specials</li>
            </ul>
          </div>

          <p>If you have any questions, feel free to reach out to our customer service team.</p>
          <p>Happy flowering!</p>
          <p>The Flora Team</p>
        </div>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendOrderConfirmation(order: Order & { user?: User }): Promise<void> {
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@flora.com',
      to: order.guestEmail || order.user?.email,
      subject: `Order Confirmation #${order.id}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #16a34a;">Order Confirmation</h1>
          <p>Dear ${order.guestName || order.user?.name || 'Customer'},</p>
          <p>Thank you for your order! We've received your purchase and are preparing it for delivery.</p>

          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #16a34a; margin-top: 0;">Order Details</h3>
            <p><strong>Order Number:</strong> #${order.id}</p>
            <p><strong>Order Date:</strong> ${order.createdAt.toLocaleDateString()}</p>
            <p><strong>Total Amount:</strong> $${order.total.toFixed(2)}</p>
            <p><strong>Delivery Address:</strong><br/>
            ${order.deliveryAddress}</p>
            ${
              order.deliveryDate
                ? `<p><strong>Delivery Date:</strong> ${order.deliveryDate.toLocaleDateString()}</p>`
                : ''
            }
            ${
              order.message
                ? `<p><strong>Special Message:</strong> ${order.message}</p>`
                : ''
            }
          </div>

          <p>We'll send you another email when your order ships with tracking information.</p>
          <p>Thank you for choosing Flora!</p>
          <p>The Flora Team</p>
        </div>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendOrderShipped(
    order: Order & { user?: User },
    trackingNumber?: string
  ): Promise<void> {
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@flora.com',
      to: order.guestEmail || order.user?.email,
      subject: `Your Flora Order #${order.id} Has Shipped!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #16a34a;">Your Order Has Shipped!</h1>
          <p>Dear ${order.guestName || order.user?.name || 'Customer'},</p>
          <p>Great news! Your Flora order is on its way to you.</p>

          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #16a34a; margin-top: 0;">Shipping Information</h3>
            <p><strong>Order Number:</strong> #${order.id}</p>
            ${
              trackingNumber
                ? `<p><strong>Tracking Number:</strong> ${trackingNumber}</p>`
                : ''
            }
            <p><strong>Delivery Address:</strong><br/>
            ${order.deliveryAddress}</p>
            ${
              order.deliveryDate
                ? `<p><strong>Expected Delivery:</strong> ${order.deliveryDate.toLocaleDateString()}</p>`
                : ''
            }
          </div>

          <p>Your fresh flowers are carefully packaged and on their way to brighten your day!</p>
          <p>The Flora Team</p>
        </div>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendSubscriptionConfirmation(
    subscription: Subscription & { user: User }
  ): Promise<void> {
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@flora.com',
      to: subscription.user.email,
      subject: 'Your Flora Subscription is Active!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #16a34a;">Subscription Confirmed!</h1>
          <p>Dear ${subscription.user.name || 'Customer'},</p>
          <p>Your Flora subscription is now active! You'll receive beautiful, fresh flowers regularly.</p>

          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #16a34a; margin-top: 0;">Subscription Details</h3>
            <p><strong>Subscription Type:</strong> ${subscription.type}</p>
            <p><strong>Start Date:</strong> ${subscription.startDate.toLocaleDateString()}</p>
            <p><strong>Next Delivery:</strong> ${subscription.nextDelivery.toLocaleDateString()}</p>
            <p><strong>Delivery Address:</strong><br/>
            ${subscription.deliveryAddress}</p>
            ${
              subscription.notes
                ? `<p><strong>Notes:</strong> ${subscription.notes}</p>`
                : ''
            }
          </div>

          <p>You can manage your subscription anytime from your account dashboard.</p>
          <p>Welcome to the Flora family!</p>
          <p>The Flora Team</p>
        </div>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendSubscriptionReminder(
    subscription: Subscription & { user: User }
  ): Promise<void> {
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@flora.com',
      to: subscription.user.email,
      subject: 'Your Flora Delivery is Coming Soon!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #16a34a;">Delivery Reminder</h1>
          <p>Dear ${subscription.user.name || 'Customer'},</p>
          <p>Just a friendly reminder that your next Flora delivery is scheduled for ${subscription.nextDelivery.toLocaleDateString()}.</p>

          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #16a34a; margin-top: 0;">Delivery Details</h3>
            <p><strong>Delivery Date:</strong> ${subscription.nextDelivery.toLocaleDateString()}</p>
            <p><strong>Delivery Address:</strong><br/>
            ${subscription.deliveryAddress}</p>
          </div>

          <p>Need to make changes to your subscription? You can do so anytime from your account dashboard.</p>
          <p>The Flora Team</p>
        </div>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendPasswordReset(email: string, resetToken: string): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@flora.com',
      to: email,
      subject: 'Reset Your Flora Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #16a34a;">Reset Your Password</h1>
          <p>We received a request to reset your Flora account password.</p>

          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <a href="${resetUrl}" style="display: inline-block; background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Reset Password
            </a>
          </div>

          <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
          <p>This link will expire in 1 hour for security reasons.</p>
          <p>The Flora Team</p>
        </div>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendContactFormSubmission(data: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }): Promise<void> {
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@flora.com',
      to: process.env.CONTACT_EMAIL || 'support@flora.com',
      subject: `Contact Form: ${data.subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #16a34a;">New Contact Form Submission</h1>

          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Name:</strong> ${data.name}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Subject:</strong> ${data.subject}</p>
            <p><strong>Message:</strong></p>
            <p>${data.message.replace(/\n/g, '<br>')}</p>
          </div>
        </div>
      `,
    };

    await this.transporter.sendMail(mailOptions);

    // Send confirmation to user
    const confirmationOptions = {
      from: process.env.FROM_EMAIL || 'noreply@flora.com',
      to: data.email,
      subject: 'We Received Your Message - Flora',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #16a34a;">Thank You for Contacting Flora</h1>
          <p>Dear ${data.name},</p>
          <p>We've received your message and will get back to you within 24 hours.</p>

          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Your message:</strong></p>
            <p>${data.message.replace(/\n/g, '<br>')}</p>
          </div>

          <p>Thank you for reaching out to us!</p>
          <p>The Flora Team</p>
        </div>
      `,
    };

    await this.transporter.sendMail(confirmationOptions);
  }
}
