#!/usr/bin/env tsx
/**
 * 🌸 Flora Subscription System Tester - Simplified Edition
 *
 * Tests the simplified subscription system with inline addresses (Melbourne-based)
 * No auto-user creation, works like OrderService with flat delivery fees
 *
 * Usage: npx tsx src/test/test-subscriptions.ts
 */

import { PrismaClient } from '@prisma/client';
import { SubscriptionService } from '../services/SubscriptionService';
import { DeliveryService } from '../config/deliveryConfig';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

interface TestSubscriptionData {
  productId: string;
  subscriptionType: 'RECURRING_WEEKLY' | 'RECURRING_MONTHLY' | 'SPONTANEOUS';
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
  quantity: number;
  deliveryType: 'STANDARD' | 'EXPRESS';
  deliveryNotes?: string;
}

class SubscriptionTester {
  private subscriptionService: SubscriptionService;
  private existingUserId: string = 'user_1_test'; // Use existing test user
  private createdSubscriptionIds: string[] = [];

  constructor() {
    this.subscriptionService = new SubscriptionService();
  }

  // Clean up test data (only test subscriptions, not users)
  async cleanup(): Promise<void> {
    console.log('🧹 Cleaning up test data...');

    try {
      // Delete test subscriptions (users are persistent test data)
      for (const subId of this.createdSubscriptionIds) {
        await prisma.subscription.delete({
          where: { id: subId }
        }).catch(() => {}); // Ignore if already deleted
      }

      console.log('✅ Test cleanup completed');
    } catch (error) {
      console.log('⚠️  Cleanup had minor issues:', (error as Error).message);
    }
  }

  // Get sample product for testing
  async getTestProduct(): Promise<{ id: string; name: string; priceCents: number } | null> {
    const product = await prisma.product.findFirst({
      select: { id: true, name: true, priceCents: true }
    });
    return product;
  }

  // Test 1: Simplified Subscription Creation (Melbourne)
  async testSimplifiedSubscriptionFlow(): Promise<boolean> {
    console.log('\n🧪 Test 1: Simplified Subscription Creation (Melbourne)');
    console.log('─'.repeat(50));

    try {
      const product = await this.getTestProduct();
      if (!product) {
        console.log('❌ No products found in database. Run seed first.');
        return false;
      }

      // Melbourne address for testing
      const testData: TestSubscriptionData = {
        productId: product.id,
        subscriptionType: 'RECURRING_WEEKLY',
        shippingAddress: {
          firstName: 'Emma',
          lastName: 'Melbourne',
          street1: '123 Collins Street',
          street2: 'Unit 15B',
          city: 'Melbourne',
          state: 'VIC',
          zipCode: '3000',
          phone: '+61-3-9555-1234'
        },
        quantity: 1,
        deliveryType: 'STANDARD',
        deliveryNotes: 'Test subscription - simplified approach'
      };

      console.log(`📦 Testing with product: ${product.name} ($${(product.priceCents / 100).toFixed(2)})`);
      console.log(`👤 Using existing user ID: ${this.existingUserId}`);
      console.log(`📍 Delivery to: ${testData.shippingAddress.street1}, ${testData.shippingAddress.city}`);

      // Validate Melbourne postcode
      const isValidPostcode = DeliveryService.isDeliveryAvailable(testData.shippingAddress.zipCode);
      console.log(`📮 Postcode ${testData.shippingAddress.zipCode}: ${isValidPostcode ? '✅ Valid' : '❌ Invalid'}`);

      // Calculate delivery fee
      const deliveryFee = DeliveryService.getDeliveryFee(testData.deliveryType);
      console.log(`🚚 Delivery fee: $${(deliveryFee / 100).toFixed(2)} AUD`);

      // Create subscription using simplified flow (no user/address auto-creation)
      const subscription = await this.subscriptionService.createSubscription({
        userId: this.existingUserId,
        type: testData.subscriptionType,
        shippingAddress: testData.shippingAddress,
        deliveryType: testData.deliveryType,
        deliveryNotes: testData.deliveryNotes,
        items: [{ productId: testData.productId, quantity: testData.quantity }]
      });

      this.createdSubscriptionIds.push(subscription.id);

      console.log('✅ Subscription created successfully!');
      console.log(`   📋 Subscription ID: ${subscription.id}`);
      console.log(`   📅 Type: ${subscription.type}`);
      console.log(`   📦 Status: ${subscription.status}`);
      console.log(`   🚚 Next delivery: ${subscription.nextDeliveryDate?.toDateString() || 'N/A'}`);
      console.log(`   📍 Address: ${subscription.shippingStreet1}, ${subscription.shippingCity}`);

      return true;

    } catch (error) {
      console.log('❌ Simplified subscription test failed:', (error as Error).message);
      return false;
    }
  }

  // Test 2: Subscription Management Operations
  async testSubscriptionManagement(): Promise<boolean> {
    console.log('\n🧪 Test 2: Subscription Management Operations');
    console.log('─'.repeat(50));

    try {
      if (this.createdSubscriptionIds.length === 0) {
        console.log('❌ No subscriptions to test. Run auto-create test first.');
        return false;
      }

      const subscriptionId = this.createdSubscriptionIds[0];

      // Test pause
      console.log('⏸️  Testing pause...');
      const pausedSub = await this.subscriptionService.pauseSubscription(subscriptionId);
      console.log(`✅ Paused: ${pausedSub.status}`);

      // Test resume
      console.log('▶️  Testing resume...');
      const resumedSub = await this.subscriptionService.resumeSubscription(subscriptionId);
      console.log(`✅ Resumed: ${resumedSub.status}`);

      // Test update
      console.log('✏️  Testing update...');
      const updatedSub = await this.subscriptionService.updateSubscription(subscriptionId, {
        deliveryNotes: 'Updated delivery notes via test'
      });
      console.log(`✅ Updated: ${updatedSub.deliveryNotes}`);

      return true;

    } catch (error) {
      console.log('❌ Management test failed:', (error as Error).message);
      return false;
    }
  }

  // Test 3: Spontaneous Delivery Creation (Melbourne)
  async testSpontaneousDelivery(): Promise<boolean> {
    console.log('\n🧪 Test 3: Spontaneous Delivery Creation (Melbourne)');
    console.log('─'.repeat(50));

    try {
      const product = await this.getTestProduct();
      if (!product) return false;

      // Create a spontaneous subscription first (Melbourne address)
      const spontaneousSubscription = await this.subscriptionService.createSubscription({
        userId: this.existingUserId,
        type: 'SPONTANEOUS',
        shippingAddress: {
          firstName: 'Sarah',
          lastName: 'Spontaneous',
          street1: '456 Chapel Street',
          city: 'South Yarra',
          state: 'VIC',
          zipCode: '3141',
          phone: '+61-3-9555-7890'
        },
        deliveryType: 'EXPRESS',
        deliveryNotes: 'Test spontaneous subscription - Melbourne',
        items: [{ productId: product.id, quantity: 2 }]
      });

      this.createdSubscriptionIds.push(spontaneousSubscription.id);

      console.log('✅ Spontaneous subscription created');
      console.log(`   📋 Subscription ID: ${spontaneousSubscription.id}`);
      console.log(`   📍 Delivery to: South Yarra 3141`);

      // Test creating a spontaneous delivery
      console.log('🚀 Testing spontaneous delivery creation...');
      const order = await this.subscriptionService.createSpontaneousDelivery(
        spontaneousSubscription.id,
        {
          requestedDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
          deliveryNotes: 'Rush delivery for Melbourne event'
        }
      );

      console.log('✅ Spontaneous delivery created!');
      console.log(`   📦 Order created for subscription ${spontaneousSubscription.id}`);
      console.log(`   💰 Includes $${(DeliveryService.getDeliveryFee('EXPRESS') / 100).toFixed(2)} AUD express delivery`);

      return true;

    } catch (error) {
      console.log('❌ Spontaneous delivery test failed:', (error as Error).message);
      return false;
    }
  }

  // Test 4: Integration with Order System
  async testOrderIntegration(): Promise<boolean> {
    console.log('\n🧪 Test 4: Order System Integration');
    console.log('─'.repeat(50));

    try {
      // Check if any orders were created from our subscriptions
      const orders = await prisma.order.findMany({
        where: {
          subscriptionId: { in: this.createdSubscriptionIds }
        },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      });

      if (orders.length === 0) {
        console.log('❌ No orders found from subscription creation');
        return false;
      }

      console.log(`✅ Found ${orders.length} orders created by subscriptions`);

      for (const order of orders) {
        console.log(`📦 Order ${order.orderNumber}:`);
        console.log(`   💰 Total: $${(order.totalCents / 100).toFixed(2)}`);
        console.log(`   📊 Status: ${order.status}`);
        console.log(`   🛒 Items: ${order.items.length}`);
        console.log(`   🔗 Subscription: ${order.subscriptionId}`);
      }

      return true;

    } catch (error) {
      console.log('❌ Order integration test failed:', (error as Error).message);
      return false;
    }
  }

  // Test 5: Error Handling
  async testErrorHandling(): Promise<boolean> {
    console.log('\n🧪 Test 5: Error Handling and Validation');
    console.log('─'.repeat(50));

    try {
      let errorsCaught = 0;

      // Test 1: Invalid product ID
      try {
        await this.subscriptionService.createSubscription({
          userId: `${this.testUserId}_error`,
          email: 'error.test@example.com',
          firstName: 'Error',
          lastName: 'Test',
          type: 'RECURRING_WEEKLY',
          shippingAddress: {
            firstName: 'Error',
            lastName: 'Test',
            street1: '123 Error St',
            city: 'ErrorCity',
            state: 'ER',
            zipCode: '00000'
          },
          deliveryType: 'STANDARD',
          items: [{ productId: 'invalid-product-id', quantity: 1 }]
        });
        console.log('❌ Should have failed with invalid product ID');
      } catch (error) {
        console.log('✅ Correctly caught invalid product ID error');
        errorsCaught++;
      }

      // Test 2: Invalid subscription type for spontaneous delivery
      if (this.createdSubscriptionIds.length > 0) {
        try {
          // Try to create spontaneous delivery on recurring subscription
          await this.subscriptionService.createSpontaneousDelivery(
            this.createdSubscriptionIds[0],
            { deliveryNotes: 'This should fail' }
          );
          console.log('❌ Should have failed with wrong subscription type');
        } catch (error) {
          console.log('✅ Correctly prevented spontaneous delivery on recurring subscription');
          errorsCaught++;
        }
      }

      console.log(`✅ Error handling test passed: ${errorsCaught} errors properly caught`);
      return errorsCaught >= 1;

    } catch (error) {
      console.log('❌ Error handling test failed:', (error as Error).message);
      return false;
    }
  }

  // Test 5: Delivery System (Melbourne)
  async testDeliverySystem(): Promise<boolean> {
    console.log('\n🧪 Test 5: Melbourne Delivery System');
    console.log('─'.repeat(50));

    try {
      // Test delivery info
      const deliveryInfo = DeliveryService.getDeliveryInfo();
      console.log(`📍 Service Area: ${deliveryInfo.serviceArea.name}`);
      console.log(`💰 Standard: ${deliveryInfo.pricing.standard.display}`);
      console.log(`🚀 Express: ${deliveryInfo.pricing.express.display}`);

      // Test valid Melbourne postcodes
      const testPostcodes = ['3000', '3141', '3186', '3199'];
      let validCount = 0;

      for (const postcode of testPostcodes) {
        const isValid = DeliveryService.isDeliveryAvailable(postcode);
        if (isValid) validCount++;
        console.log(`📮 ${postcode}: ${isValid ? '✅' : '❌'}`);
      }

      // Test invalid postcode
      const invalidPostcode = '9999';
      const isInvalid = DeliveryService.isDeliveryAvailable(invalidPostcode);
      console.log(`📮 ${invalidPostcode} (invalid): ${isInvalid ? '❌ SHOULD BE FALSE' : '✅ Correctly rejected'}`);

      console.log(`✅ Delivery system test: ${validCount}/${testPostcodes.length} valid postcodes recognized`);
      return validCount === testPostcodes.length && !isInvalid;

    } catch (error) {
      console.log('❌ Delivery system test failed:', (error as Error).message);
      return false;
    }
  }

  // Run all tests
  async runAllTests(): Promise<void> {
    console.log('🌸 Flora Subscription System - Simplified Test Suite (Melbourne)');
    console.log('═'.repeat(65));
    console.log('Testing simplified inline address approach with flat delivery fees');
    console.log('No auto-user creation, works like OrderService\n');

    const testResults = {
      simplifiedFlow: false,
      management: false,
      spontaneous: false,
      orderIntegration: false,
      deliverySystem: false,
      errorHandling: false
    };

    try {
      // Run tests in sequence
      testResults.simplifiedFlow = await this.testSimplifiedSubscriptionFlow();
      testResults.management = await this.testSubscriptionManagement();
      testResults.spontaneous = await this.testSpontaneousDelivery();
      testResults.orderIntegration = await this.testOrderIntegration();
      testResults.deliverySystem = await this.testDeliverySystem();
      testResults.errorHandling = await this.testErrorHandling();

    } catch (error) {
      console.log('\n❌ Test suite encountered an error:', (error as Error).message);
    } finally {
      // Always cleanup
      await this.cleanup();
    }

    // Summary
    console.log('\n📊 Test Results Summary');
    console.log('═'.repeat(65));
    console.log(`Simplified Flow:       ${testResults.simplifiedFlow ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Management Operations: ${testResults.management ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Spontaneous Delivery:  ${testResults.spontaneous ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Order Integration:     ${testResults.orderIntegration ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Melbourne Delivery:    ${testResults.deliverySystem ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Error Handling:        ${testResults.errorHandling ? '✅ PASSED' : '❌ FAILED'}`);

    const passedTests = Object.values(testResults).filter(Boolean).length;
    const totalTests = Object.keys(testResults).length;

    console.log(`\n🎯 Overall: ${passedTests}/${totalTests} tests passed`);

    if (passedTests === totalTests) {
      console.log('\n🎉 All tests passed! Simplified subscription system ready for demo!');
      console.log('✅ Inline addresses working (no auto-creation complexity)');
      console.log('✅ Melbourne delivery system functioning');
      console.log('✅ Order integration working properly');
      console.log('✅ Management operations working');
      console.log('✅ Error handling in place');
    } else {
      console.log('\n⚠️  Some tests failed. Review the output above.');
      console.log('💡 Common issues:');
      console.log('   - Database not seeded (run: pnpm docker:seed)');
      console.log('   - Services not running (run: pnpm docker:dev:bg)');
      console.log('   - User user_1_test not found in database');
    }

    console.log('\n🔄 Next Steps for Demo:');
    console.log('1. Test Postman with simplified payload (no auto-creation)');
    console.log('2. Test Melbourne delivery endpoints');
    console.log('3. Integrate frontend with inline address forms');
    console.log('4. Prepare Melbourne demo scenarios');
  }
}

// Main execution
async function main() {
  const tester = new SubscriptionTester();
  await tester.runAllTests();
  await prisma.$disconnect();
}

// Handle cleanup on exit
process.on('SIGINT', async () => {
  console.log('\n🛑 Test interrupted. Cleaning up...');
  const tester = new SubscriptionTester();
  await tester.cleanup();
  await prisma.$disconnect();
  process.exit(0);
});

main().catch((error) => {
  console.error('❌ Test suite failed:', error);
  process.exit(1);
});