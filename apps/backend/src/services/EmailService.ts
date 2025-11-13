import nodemailer from "nodemailer";
import fs from 'fs';
import path from 'path';
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

export class EmailService {
  private static instance: EmailService | null = null;
  private transporter: nodemailer.Transporter;

  // Prefer using getInstance() to reuse pooled connections
  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  constructor() {
    const baseOptions: any = {
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER!,
        pass: process.env.SMTP_PASS!,
      },
    };

    // Only enable pooling outside of test to keep tests simple and deterministic
    const transportOptions: any =
      process.env.NODE_ENV === 'test'
        ? baseOptions
        : {
            ...baseOptions,
            pool: true,
            maxConnections: parseInt(process.env.SMTP_MAX_CONNECTIONS || "3"),
            maxMessages: parseInt(process.env.SMTP_MAX_MESSAGES || "100"),
            rateDelta: parseInt(process.env.SMTP_RATE_DELTA || "1000"),
            rateLimit: parseInt(process.env.SMTP_RATE_LIMIT || "5"),
          };

    this.transporter = nodemailer.createTransport(transportOptions);

    // Skip verify in test to avoid noisy logs and timing variability
    if (process.env.NODE_ENV !== 'test') {
      this.transporter.verify((error) => {
        if (error) {
          console.error("❌ SMTP connection failed:", error.message);
        } else {
          console.log("✅ SMTP server is ready to send emails");
        }
      });
    }
  }

  // Helper method to get professional sender format
  private getProfessionalSender(): string {
    // Allow overriding display name and from-address via env without breaking tests
    const fromName = process.env.FROM_NAME || 'Flora Marketplace';
    const fromEmail = process.env.FROM_EMAIL || process.env.SMTP_USER!;
    return `"${fromName}" <${fromEmail}>`;
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
    const items: any[] | undefined = (order as any).items;

    const attachments: Array<{ filename: string; path: string; cid: string; contentType?: string }> = [];

    // Build CID for local product images (any relative path), else fallback to absolute URL
    const assetBase =
      process.env.EMAIL_IMAGE_BASE_URL ||
      process.env.BACKEND_PUBLIC_URL ||
      process.env.FRONTEND_URL ||
      'http://localhost:3001';
    // Default to embedding item images; set EMAIL_INLINE_ITEM_IMAGES=false to disable
    const inlineItemImages = process.env.EMAIL_INLINE_ITEM_IMAGES !== 'false';
    const buildHostedUrl = (u?: string | null): string => {
      if (!u) return '';
      if (/^https?:\/\//i.test(u)) return u;
      const base = assetBase?.replace(/\/$/, '');
      if (!base) return '';
      const trimmed = u.startsWith('/') ? u.slice(1) : u;
      return `${base}/${trimmed}`;
    };
    const resolveImageRef = (u?: string | null, idx?: number): { src: string } => {
      if (!u) return { src: '' };
      if (!inlineItemImages) {
        return { src: buildHostedUrl(u) };
      }
      if (/^https?:\/\//i.test(u)) return { src: u };

      // Relative path → attempt to attach exact file (preserve subfolders and case)
      const rel = u.startsWith('/') ? u.slice(1) : u; // strip leading '/'
      const localPathCandidates = [
        // Running from repo root
        path.join(process.cwd(), rel),
        path.join(process.cwd(), 'apps', 'backend', rel),
        // Running from dist or src
        path.join(__dirname, '..', '..', rel),
      ];

      for (const p of localPathCandidates) {
        try {
          if (fs.existsSync(p)) {
            const fileName = path.basename(p);
            const cid = `item-${idx}-image`;
            attachments.push({ filename: fileName, path: p, cid });
            return { src: `cid:${cid}` };
          }
        } catch {}
      }

      // Fallback to absolute URL (won't load in many email clients if localhost)
      return { src: buildHostedUrl(u) };
    };
    const logoUrl =
      process.env.EMAIL_LOGO_URL ||
      buildHostedUrl('/flora-logo.png') ||
      'https://dzmu16crq41il.cloudfront.net/flora-logo.png';

    const itemsHtml = items && items.length
      ? `
        <div style="margin-top:4px; text-align:left;">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;">
            ${items.map((it, i) => {
              const unit = (it.priceCents / 100).toFixed(2);
              const line = ((it.priceCents * it.quantity) / 100).toFixed(2);
              const ref = resolveImageRef(it.product?.imageUrl || null, i);
              const name = it.product?.name || 'Product';
              return `
              <tr>
                <td style="padding:10px 0;">
                  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;">
                    <tr>
                      <td width="72" valign="top" style="padding-right:12px;">
                        ${ref.src ? `<img src="${ref.src}" alt="${name}" width="64" height="64" style="display:block; width:64px; height:64px; object-fit:cover; border-radius:10px;" />` : ''}
                      </td>
                      <td valign="top" style="color:#595E4E; font-size:14px;">
                        <div style="font-family: Georgia, 'Times New Roman', Times, serif; font-weight:600;">${name}</div>
                        <div style="margin-top:4px; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif;">
                          Qty ${it.quantity} × $${unit}
                        </div>
                      </td>
                      <td valign="top" align="right" style="color:#595E4E; font-size:14px; white-space:nowrap;">
                        <strong>$${line}</strong>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>`;
            }).join('')}
          </table>
        </div>
      ` : '';

    if (!customerEmail) {
      console.warn('No email found for order confirmation:', order.id);
      return;
    }

    // attachments prepared above (logo + item images if any)

    // Build and send email

    const mailOptions = {
      from: this.getProfessionalSender(),
      to: customerEmail,
      subject: `Order Confirmation #${order.orderNumber}`,
      attachments,
      html: `
        <div style="margin:0;padding:24px;background-color:#f5f5f0;">
          <div style="font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; max-width: 640px; margin: 0 auto; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 2px 6px rgba(0,0,0,0.06);">
            <!-- Brand Header -->
            <div style="padding:32px; text-align:center; background:#ffffff;">
              <img src="${logoUrl}" alt="FLORA" width="160" style="display:inline-block; border:0; outline:none; text-decoration:none; height:auto; max-width:160px;" />
            </div>

            <!-- Confirmation Banner -->
            <div style="background:#C8D7C4; padding:28px; text-align:center;">
              <h1 style="margin:0 0 12px 0; font-size:48px; line-height:1.2; color:#595E4E; letter-spacing:2px; font-family: Georgia, 'Times New Roman', Times, serif;">ORDER CONFIRMATION</h1>
              <div style="display:inline-block; background:rgba(255,255,255,0.7); padding:10px 16px; border-radius:8px; border:2px solid #595E4E;">
                <span style="color:#595E4E; font-size:14px; font-weight:500;">Order Number:</span>
                <span style="color:#595E4E; font-size:16px; font-weight:700; letter-spacing:1px; margin-left:6px;">#${order.orderNumber}</span>
              </div>
              <p style="margin:16px auto 0 auto; color:#595E4E; font-size:14px; max-width:520px;">${customerName}, thank you for your order! We\'ve received it and will notify you as soon as it ships.</p>
            </div>

            <!-- Content -->
            <div style="padding:28px;">
              <h2 style="margin:0 0 12px 0; font-size:28px; color:#595E4E; font-family: Georgia, 'Times New Roman', Times, serif; font-weight:600;">Order Summary</h2>
              <p style="margin:0 0 16px 0; color:#595E4E; font-size:14px;">${order.createdAt.toLocaleDateString()} · Total <strong>$${totalAmount}</strong></p>
              ${itemsHtml}

              <div style="background:#f0f0eb; border-radius:12px; padding:16px 18px;">
                <h3 style="margin:0 0 12px 0; font-size:18px; color:#595E4E; font-family: Georgia, 'Times New Roman', Times, serif;">Order Details</h3>
                <p style="margin:0 0 6px 0; color:#595E4E; font-size:14px;"><strong>Order Number:</strong> #${order.orderNumber}</p>
                <p style="margin:0 0 6px 0; color:#595E4E; font-size:14px;"><strong>Order Date:</strong> ${order.createdAt.toLocaleDateString()}</p>
                <p style="margin:0 0 6px 0; color:#595E4E; font-size:14px;"><strong>Total Amount:</strong> $${totalAmount}</p>
                <p style="margin:10px 0 0 0; color:#595E4E; font-size:14px;"><strong>Delivery Address:</strong><br/>${deliveryAddress.replace(/\n/g, '<br/>')}</p>
                ${
                  order.requestedDeliveryDate
                    ? `<p style="margin:10px 0 0 0; color:#595E4E; font-size:14px;"><strong>Requested Delivery Date:</strong> ${new Date(order.requestedDeliveryDate).toLocaleDateString()}</p>`
                    : ""
                }
                ${order.deliveryNotes ? `<p style="margin:10px 0 0 0; color:#595E4E; font-size:14px;"><strong>Delivery Notes:</strong> ${order.deliveryNotes}</p>` : ""}
              </div>

              <p style="margin:18px 0 0 0; color:#595E4E; font-size:13px;">Questions about your order? Just reply to this email.</p>
              <p style="margin:6px 0 0 0; color:#595E4E; font-size:13px;">Thank you for choosing <span style="font-weight:700;">FLORA</span>.</p>
            </div>

            <!-- Footer -->
            <div style="padding:16px 24px; text-align:center; background:#f9faf9;">
              <p style="margin:0; color:#8b8f82; font-size:12px;">© ${new Date().getFullYear()} FLORA. All rights reserved.</p>
            </div>
          </div>
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

}
