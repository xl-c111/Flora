#!/usr/bin/env tsx
/**
 * Get Test Data for Postman/Manual Testing
 * Run: npx tsx src/test/get-test-data.ts
 */

import {
  PrismaClient,
  SubscriptionType,
  DeliveryType,
} from '@prisma/client';

const prisma = new PrismaClient();

async function getTestData() {
  console.log('🧪 Flora Test Data for Manual Testing\n');

  try {
    // Get test users
    console.log('👤 Test Users:');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      }
    });

    users.forEach((user) => {
      console.log(`   📧 ${user.email} (ID: ${user.id})`);
    });

    // Get test addresses
    console.log('\n🏠 Test Addresses:');
    const addresses = await prisma.address.findMany({
      select: {
        id: true,
        userId: true,
        label: true,
        street1: true,
        city: true,
        isDefault: true,
      }
    });

    addresses.forEach((addr) => {
      const defaultFlag = addr.isDefault ? ' ⭐ DEFAULT' : '';
      console.log(`   🏠 ${addr.label}: ${addr.street1}, ${addr.city}${defaultFlag}`);
      console.log(`      📋 Address ID: ${addr.id}`);
      console.log(`      👤 User ID: ${addr.userId}`);
    });

    // Get sample products
    console.log('\n🌺 Sample Products:');
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        priceCents: true,
      },
      take: 3
    });

    products.forEach((product) => {
      const price = (product.priceCents / 100).toFixed(2);
      console.log(`   🌸 ${product.name} - $${price}`);
      console.log(`      📋 Product ID: ${product.id}`);
    });

    // Example Postman data
    console.log('\n📝 Example Postman Test Data:');
    console.log('─'.repeat(50));

    const sampleAddress =
      addresses.find((address) => address.isDefault) || addresses[0];
    const sampleProduct = products[0];

    if (sampleAddress && sampleProduct) {
      const exampleData = {
        productId: sampleProduct.id,
        subscriptionType: SubscriptionType.RECURRING_WEEKLY,
        addressId: sampleAddress.id,
        quantity: 1,
        deliveryType: DeliveryType.STANDARD,
        deliveryNotes: "Leave at door"
      };

      console.log(JSON.stringify(exampleData, null, 2));
    }

    console.log('─'.repeat(50));
    console.log('\n🎯 Ready for Postman Testing!');
    console.log('   📍 Endpoint: POST /api/subscriptions/from-product');
    console.log('   🔑 Don\'t forget your Auth0 Bearer token!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

getTestData();
