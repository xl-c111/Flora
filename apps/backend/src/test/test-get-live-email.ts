import { EmailService } from '../services/EmailService';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testEmailSafely() {
  console.log('🧪 Testing Flora Email Service...');
  console.log(`📧 SMTP Host: ${process.env.SMTP_HOST}`);
  console.log(`📧 SMTP User: ${process.env.SMTP_USER}`);

  const emailService = new EmailService();

  // Test order confirmation email
  const mockOrder = {
    id: 'test-order-' + Date.now(),
    orderNumber: 'FLR' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '0001',
    totalCents: 2999,
    createdAt: new Date(),
    guestEmail: process.env.SMTP_USER, // Send to yourself for safety
    shippingFirstName: 'Test',
    shippingLastName: 'Customer',
    shippingStreet1: '123 Test Street',
    shippingStreet2: null,
    shippingCity: 'Test City',
    shippingState: 'CA',
    shippingZipCode: '12345',
    shippingPhone: '+1234567890',
    requestedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    deliveryNotes: 'This is a test email from Flora backend development',
    user: null,
    purchaseType: 'ONE_TIME',
    subtotalCents: 2499,
    shippingCents: 500,
    taxCents: 0,
    deliveryType: 'STANDARD',
    status: 'CONFIRMED'
  };

  try {
    console.log('📤 Sending order confirmation email...');
    await emailService.sendOrderConfirmation(mockOrder as any);
    console.log('✅ Order confirmation email sent successfully!');
    console.log(`📧 Email sent to: ${mockOrder.guestEmail}`);
    console.log(`📋 Order Number: ${mockOrder.orderNumber}`);
    console.log('💡 Check your inbox for the confirmation email');
  } catch (error) {
    console.error('❌ Failed to send order confirmation email:');
    console.error(error);

    // Check for common issues
    if (error instanceof Error) {
      if (error.message.includes('authentication')) {
        console.log('💡 Check your SMTP_USER and SMTP_PASS in .env file');
      } else if (error.message.includes('connection')) {
        console.log('💡 Check your SMTP_HOST and SMTP_PORT in .env file');
      }
    }
  }

  // Test welcome email
  const mockUser = {
    id: 'test-user-' + Date.now(),
    email: process.env.SMTP_USER || 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    name: 'Test User',
    auth0Id: 'test-auth0-id',
    createdAt: new Date(),
    updatedAt: new Date(),
    phoneNumber: null,
    profilePicture: null,
    address: null,
    preferredLanguage: null,
    marketingOptIn: true,
    stripeCustomerId: null,
    favoriteColors: ['Red', 'Pink'],
    favoriteOccasions: ['Birthday', 'Anniversary'],
    favoriteMoods: ['Romantic', 'Cheerful']
  };

  try {
    console.log('📤 Sending welcome email...');
    await emailService.sendWelcomeEmail(mockUser as any);
    console.log('✅ Welcome email sent successfully!');
    console.log(`📧 Email sent to: ${mockUser.email}`);
  } catch (error) {
    console.error('❌ Failed to send welcome email:');
    console.error(error);
  }

  console.log('🏁 Email testing completed!');
}

testEmailSafely().catch(console.error);