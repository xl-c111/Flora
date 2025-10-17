import nodemailer from "nodemailer";
import { User, Order, Subscription } from "@prisma/client";

// Type for order with optional user info
type OrderWithUser = Order & {
  user?: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  } | null;
};

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
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER!,
        pass: process.env.SMTP_PASS!,
      },
    };

    this.transporter = nodemailer.createTransport(config);

    // Verify connection on startup
    this.transporter.verify((error) => {
      if (error) {
        console.error("❌ SMTP connection failed:", error.message);
      } else {
        console.log("✅ SMTP server is ready to send emails");
      }
    });
  }

  // Helper method to get professional sender format
  private getProfessionalSender(): string {
    // Use professional display name with the authenticated email
    // Format: "Flora Marketplace <authenticated@email.com>"
    const senderEmail = process.env.SMTP_USER!;
    return `"Flora Marketplace" <${senderEmail}>`;
  }

  async sendWelcomeEmail(user: User): Promise<void> {
    const personalization = this.getPersonalization(user);

    const mailOptions = {
      from: this.getProfessionalSender(),
      to: user.email,
      subject: "Welcome to Flora!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #16a34a;">Welcome to Flora!</h1>
          <p>Dear ${user.firstName || "Customer"},</p>
          <p>Thank you for joining Flora! We're excited to help you discover beautiful, fresh flowers for every occasion.</p>

          ${personalization ? `
          <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #16a34a; margin-top: 0;">Based on your preferences:</h3>
            <p>${personalization}</p>
          </div>
          ` : ''}

          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #16a34a; margin-top: 0;">What's next?</h3>
            <ul>
              <li>Browse our collection of fresh flowers and arrangements</li>
              <li>Consider a subscription for regular flower deliveries</li>
              <li>Check out our seasonal specials</li>
              <li>Complete your profile to get personalized recommendations</li>
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

  async sendOrderConfirmation(order: OrderWithUser): Promise<void> {
    const customerEmail = order.guestEmail || order.user?.email;
    const customerName = order.user?.firstName || 'Customer';
    const totalAmount = (order.totalCents / 100).toFixed(2);
    const deliveryAddress = `${order.shippingFirstName} ${order.shippingLastName}\n${order.shippingStreet1}${order.shippingStreet2 ? '\n' + order.shippingStreet2 : ''}\n${order.shippingCity}, ${order.shippingState} ${order.shippingZipCode}`;

    if (!customerEmail) {
      console.warn('No email found for order confirmation:', order.id);
      return;
    }

    const mailOptions = {
      from: this.getProfessionalSender(),
      to: customerEmail,
      subject: `Order Confirmation #${order.orderNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <img src=''
          <h1 style="color: #595E4E;">Order Confirmation</h1>
          <p>Dear ${customerName},</p>
          <p>Thank you for your order! We've received your purchase and are preparing it for delivery.</p>

          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #595E4E; margin-top: 0;">Order Details</h3>
            <p><strong>Order Number:</strong> #${order.orderNumber}</p>
            <p><strong>Order Date:</strong> ${order.createdAt.toLocaleDateString()}</p>
            <p><strong>Total Amount:</strong> $${totalAmount}</p>
            <p><strong>Delivery Address:</strong><br/>
            ${deliveryAddress}</p>
            ${
              order.requestedDeliveryDate
                ? `<p><strong>Requested Delivery Date:</strong> ${new Date(order.requestedDeliveryDate).toLocaleDateString()}</p>`
                : ""
            }
            ${order.deliveryNotes ? `<p><strong>Delivery Notes:</strong> ${order.deliveryNotes}</p>` : ""}
          </div>

          <p>We'll send you another email when your order ships with tracking information.</p>
          <p>Thank you for choosing Flora!</p>
          <p>The Flora Team</p>
        </div>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendOrderShipped(order: OrderWithUser, trackingNumber?: string): Promise<void> {
    const customerEmail = order.guestEmail || order.user?.email;
    const customerName = order.user?.firstName || 'Customer';
    const deliveryAddress = `${order.shippingFirstName} ${order.shippingLastName}\n${order.shippingStreet1}${order.shippingStreet2 ? '\n' + order.shippingStreet2 : ''}\n${order.shippingCity}, ${order.shippingState} ${order.shippingZipCode}`;

    if (!customerEmail) {
      console.warn('No email found for shipping notification:', order.id);
      return;
    }

    const mailOptions = {
      from: this.getProfessionalSender(),
      to: customerEmail,
      subject: `Your Flora Order #${order.orderNumber} Has Shipped!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #16a34a;">Your Order Has Shipped!</h1>
          <p>Dear ${customerName},</p>
          <p>Great news! Your Flora order is on its way to you.</p>

          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #16a34a; margin-top: 0;">Shipping Information</h3>
            <p><strong>Order Number:</strong> #${order.orderNumber}</p>
            ${trackingNumber ? `<p><strong>Tracking Number:</strong> ${trackingNumber}</p>` : ""}
            <p><strong>Delivery Address:</strong><br/>
            ${deliveryAddress}</p>
            ${
              order.requestedDeliveryDate
                ? `<p><strong>Expected Delivery:</strong> ${new Date(order.requestedDeliveryDate).toLocaleDateString()}</p>`
                : ""
            }
          </div>

          <p>Your fresh flowers are carefully packaged and on their way to brighten your day!</p>
          <p>The Flora Team</p>
        </div>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendSubscriptionConfirmation(subscription: Subscription & { user: User }): Promise<void> {
    const mailOptions = {
      from: this.getProfessionalSender(),
      to: subscription.user.email,
      subject: "Your Flora Subscription is Active!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #16a34a;">Subscription Confirmed!</h1>
          <p>Dear ${subscription.user.firstName || subscription.user.lastName || "Customer"},</p>
          <p>Your Flora subscription is now active! You'll receive beautiful, fresh flowers regularly.</p>

          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #16a34a; margin-top: 0;">Subscription Details</h3>
            <p><strong>Subscription Type:</strong> ${subscription.type}</p>
            <p><strong>Start Date:</strong> ${subscription.createdAt.toLocaleDateString()}</p>
            <p><strong>Next Delivery:</strong> ${subscription.nextDeliveryDate?.toLocaleDateString() || 'TBD'}</p>
            <p><strong>Delivery Address:</strong><br/>
            Address on file</p>
            ${subscription.deliveryNotes ? `<p><strong>Notes:</strong> ${subscription.deliveryNotes}</p>` : ""}
          </div>

          <p>You can manage your subscription anytime from your account dashboard.</p>
          <p>Welcome to the Flora family!</p>
          <p>The Flora Team</p>
        </div>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendSubscriptionReminder(subscription: Subscription & { user: User }): Promise<void> {
    const mailOptions = {
      from: this.getProfessionalSender(),
      to: subscription.user.email,
      subject: "Your Flora Delivery is Coming Soon!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #16a34a;">Delivery Reminder</h1>
          <p>Dear ${subscription.user.firstName || subscription.user.lastName || "Customer"},</p>
          <p>Just a friendly reminder that your next Flora delivery is scheduled for ${subscription.nextDeliveryDate?.toLocaleDateString() || 'TBD'}.</p>

          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #16a34a; margin-top: 0;">Delivery Details</h3>
            <p><strong>Delivery Date:</strong> ${subscription.nextDeliveryDate?.toLocaleDateString() || 'TBD'}</p>
            <p><strong>Delivery Address:</strong><br/>
            Address on file</p>
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
      from: this.getProfessionalSender(),
      to: email,
      subject: "Reset Your Flora Password",
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
      from: this.getProfessionalSender(),
      to: process.env.CONTACT_EMAIL || "support@flora.com",
      subject: `Contact Form: ${data.subject}`,
      replyTo: data.email,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #16a34a;">New Contact Form Submission</h1>

          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Name:</strong> ${data.name}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Subject:</strong> ${data.subject}</p>
            <p><strong>Message:</strong></p>
            <p>${data.message.replace(/\n/g, "<br>")}</p>
          </div>
        </div>
      `,
    };

    await this.transporter.sendMail(mailOptions);

    // Send confirmation to user
    const confirmationOptions = {
      from: this.getProfessionalSender(),
      to: data.email,
      subject: "We Received Your Message - Flora",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #16a34a;">Thank You for Contacting Flora</h1>
          <p>Dear ${data.name},</p>
          <p>We've received your message and will get back to you within 24 hours.</p>

          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Your message:</strong></p>
            <p>${data.message.replace(/\n/g, "<br>")}</p>
          </div>

          <p>Thank you for reaching out to us!</p>
          <p>The Flora Team</p>
        </div>
      `,
    };

    await this.transporter.sendMail(confirmationOptions);
  }

  // Helper method to create personalized content based on user preferences
  private getPersonalization(user: User): string | null {
    const preferences = [];

    if (user.favoriteColors && user.favoriteColors.length > 0) {
      preferences.push(`We have beautiful ${user.favoriteColors.join(', ').toLowerCase()} flowers`);
    }

    if (user.favoriteOccasions && user.favoriteOccasions.length > 0) {
      preferences.push(`perfect for ${user.favoriteOccasions.join(', ').toLowerCase()}`);
    }

    if (user.favoriteMoods && user.favoriteMoods.length > 0) {
      preferences.push(`to create ${user.favoriteMoods.join(', ').toLowerCase()} atmospheres`);
    }

    return preferences.length > 0 ? preferences.join(' ') + '.' : null;
  }

  // Helper method to determine appropriate greeting based on user context
  private getGreeting(user?: User, guestEmail?: string | null): string {
    if (user && user.firstName) {
      return `Dear ${user.firstName}`;
    } else if (user) {
      return `Dear Valued Customer`;
    } else if (guestEmail) {
      return `Dear Customer`;
    }
    return `Hello`;
  }

  // Check if user has opted out of marketing emails (placeholder for future implementation)
  private async shouldSendMarketingEmail(user: User): Promise<boolean> {
    // In the future, check user preferences for marketing emails
    // For now, default to true
    return true;
  }
}
