import {
  PrismaClient,
  Occasion,
  Season,
  Mood,
  Color,
  ProductType,
  PriceRange,
} from '@prisma/client';

const prisma = new PrismaClient();

const sampleProducts = [
  {
    name: 'Red Rose Bouquet',
    description: 'Classic red roses perfect for romantic occasions',
    priceCents: 4599, // $45.99
    priceRange: PriceRange.RANGE_25_50,
    imageUrl: '/images/Roses.jpg',
    stockCount: 25,
    occasions: [Occasion.VALENTINES_DAY, Occasion.ANNIVERSARY],
    seasons: [Season.ALL_SEASON],
    moods: [Mood.ROMANTIC],
    colors: [Color.RED],
    type: ProductType.BOUQUET,
  },
  {
    name: 'Spring Tulip Arrangement',
    description: 'Beautiful mixed tulips in a ceramic vase',
    priceCents: 3250, // $32.50
    priceRange: PriceRange.RANGE_25_50,
    imageUrl: '/images/Tulips.jpg',
    stockCount: 18,
    occasions: [Occasion.MOTHERS_DAY, Occasion.BIRTHDAY, Occasion.JUST_BECAUSE],
    seasons: [Season.SPRING],
    moods: [Mood.CHEERFUL, Mood.VIBRANT],
    colors: [Color.MIXED, Color.PASTEL],
    type: ProductType.TULIP,
  },
  {
    name: 'White Orchid Plant',
    description: 'Elegant white orchid in decorative pot',
    priceCents: 6800, // $68.00
    priceRange: PriceRange.RANGE_50_75,
    imageUrl: '/images/Orchids.jpg',
    stockCount: 12,
    occasions: [Occasion.CONGRATULATIONS, Occasion.JUST_BECAUSE],
    seasons: [Season.ALL_SEASON],
    moods: [Mood.ELEGANT, Mood.SOPHISTICATED],
    colors: [Color.WHITE],
    type: ProductType.ORCHID,
  },
  {
    name: 'Sunflower Happiness Bouquet',
    description: 'Bright sunflowers to bring joy and warmth',
    priceCents: 3875, // $38.75
    priceRange: PriceRange.RANGE_25_50,
    imageUrl: '/images/Sunflowers.jpg',
    stockCount: 22,
    occasions: [
      Occasion.GET_WELL_SOON,
      Occasion.CONGRATULATIONS,
      Occasion.BIRTHDAY,
    ],
    seasons: [Season.SUMMER, Season.FALL],
    moods: [Mood.CHEERFUL, Mood.VIBRANT],
    colors: [Color.YELLOW],
    type: ProductType.SUNFLOWER,
  },
  {
    name: 'Pink Lily Arrangement',
    description: 'Graceful pink lilies in an elegant vase',
    priceCents: 5500, // $55.00
    priceRange: PriceRange.RANGE_50_75,
    imageUrl: '/images/Lilys.jpg',
    stockCount: 15,
    occasions: [Occasion.MOTHERS_DAY, Occasion.SYMPATHY, Occasion.ANNIVERSARY],
    seasons: [Season.SPRING, Season.SUMMER],
    moods: [Mood.ELEGANT, Mood.PEACEFUL],
    colors: [Color.PINK],
    type: ProductType.LILY,
  },
  {
    name: 'Delicate Anemone Bouquet',
    description: 'Stunning anemones with dark centers and vibrant petals',
    priceCents: 3499, // $34.99
    priceRange: PriceRange.RANGE_25_50,
    imageUrl: '/images/Anemones.jpg',
    stockCount: 16,
    occasions: [Occasion.BIRTHDAY, Occasion.JUST_BECAUSE, Occasion.CONGRATULATIONS],
    seasons: [Season.SPRING, Season.WINTER],
    moods: [Mood.VIBRANT, Mood.CHEERFUL],
    colors: [Color.MIXED, Color.PURPLE],
    type: ProductType.BOUQUET,
  },
  {
    name: 'Sweet Carnation Mix',
    description: 'Ruffled carnations in soft pastel shades',
    priceCents: 2899, // $28.99
    priceRange: PriceRange.RANGE_25_50,
    imageUrl: '/images/Carnation.jpg',
    stockCount: 28,
    occasions: [Occasion.MOTHERS_DAY, Occasion.BIRTHDAY, Occasion.JUST_BECAUSE],
    seasons: [Season.ALL_SEASON],
    moods: [Mood.CHEERFUL, Mood.PEACEFUL],
    colors: [Color.PINK, Color.PASTEL],
    type: ProductType.BOUQUET,
  },
  {
    name: 'Cheerful Daffodil Bundle',
    description: 'Bright yellow daffodils celebrating spring',
    priceCents: 2650, // $26.50
    priceRange: PriceRange.RANGE_25_50,
    imageUrl: '/images/Daffodil.jpg',
    stockCount: 24,
    occasions: [Occasion.BIRTHDAY, Occasion.JUST_BECAUSE, Occasion.GET_WELL_SOON],
    seasons: [Season.SPRING],
    moods: [Mood.CHEERFUL, Mood.VIBRANT],
    colors: [Color.YELLOW],
    type: ProductType.BOUQUET,
  },
  {
    name: 'Fresh Daisy Bouquet',
    description: 'Simple and charming white daisies',
    priceCents: 2299, // $22.99
    priceRange: PriceRange.UNDER_25,
    imageUrl: '/images/Daisies.jpg',
    stockCount: 32,
    occasions: [Occasion.JUST_BECAUSE, Occasion.BIRTHDAY],
    seasons: [Season.SPRING, Season.SUMMER],
    moods: [Mood.CHEERFUL, Mood.PEACEFUL],
    colors: [Color.WHITE],
    type: ProductType.BOUQUET,
  },
  {
    name: 'Fragrant Gardenia Plant',
    description: 'Exotic gardenia with heavenly scent',
    priceCents: 5899, // $58.99
    priceRange: PriceRange.RANGE_50_75,
    imageUrl: '/images/Gardenia.jpg',
    stockCount: 10,
    occasions: [Occasion.JUST_BECAUSE, Occasion.CONGRATULATIONS],
    seasons: [Season.SPRING, Season.SUMMER],
    moods: [Mood.ELEGANT, Mood.ROMANTIC],
    colors: [Color.WHITE],
    type: ProductType.PLANT,
  },
  {
    name: 'Golden Marigold Bunch',
    description: 'Vibrant marigolds bursting with color',
    priceCents: 1999, // $19.99
    priceRange: PriceRange.UNDER_25,
    imageUrl: '/images/Merigold.jpg',
    stockCount: 35,
    occasions: [Occasion.JUST_BECAUSE, Occasion.BIRTHDAY],
    seasons: [Season.SUMMER, Season.FALL],
    moods: [Mood.VIBRANT, Mood.CHEERFUL],
    colors: [Color.ORANGE, Color.YELLOW],
    type: ProductType.BOUQUET,
  },
  {
    name: 'Romantic Peony Bouquet',
    description: 'Lush peonies in full bloom',
    priceCents: 7250, // $72.50
    priceRange: PriceRange.RANGE_50_75,
    imageUrl: '/images/Peonies.jpg',
    stockCount: 14,
    occasions: [Occasion.WEDDING, Occasion.ANNIVERSARY, Occasion.MOTHERS_DAY],
    seasons: [Season.SPRING, Season.SUMMER],
    moods: [Mood.ROMANTIC, Mood.ELEGANT],
    colors: [Color.PINK, Color.PASTEL],
    type: ProductType.BOUQUET,
  },
  {
    name: 'Premium Mixed Bouquet',
    description: 'Luxurious arrangement with premium seasonal flowers',
    priceCents: 12500, // $125.00
    priceRange: PriceRange.OVER_100,
    imageUrl: '/images/Filler.jpg',
    stockCount: 8,
    occasions: [Occasion.WEDDING, Occasion.ANNIVERSARY, Occasion.GRADUATION],
    seasons: [Season.ALL_SEASON],
    moods: [Mood.SOPHISTICATED, Mood.ELEGANT],
    colors: [Color.MIXED],
    type: ProductType.MIXED_FLOWERS,
  },
  {
    name: 'Succulent Garden Collection',
    description: 'Mix of beautiful succulents in a modern planter',
    priceCents: 2399, // $23.99
    priceRange: PriceRange.UNDER_25,
    imageUrl: '/images/Filler2.jpg',
    stockCount: 30,
    occasions: [Occasion.JUST_BECAUSE],
    seasons: [Season.ALL_SEASON],
    moods: [Mood.PEACEFUL, Mood.SOPHISTICATED],
    colors: [Color.GREEN],
    type: ProductType.SUCCULENT,
  },
  {
    name: 'Tropical Paradise Mix',
    description: 'Exotic tropical flowers in vibrant colors',
    priceCents: 6499, // $64.99
    priceRange: PriceRange.RANGE_50_75,
    imageUrl: '/images/Filler3.jpg',
    stockCount: 11,
    occasions: [Occasion.BIRTHDAY, Occasion.CONGRATULATIONS, Occasion.JUST_BECAUSE],
    seasons: [Season.SUMMER, Season.ALL_SEASON],
    moods: [Mood.VIBRANT, Mood.CHEERFUL],
    colors: [Color.MIXED, Color.ORANGE],
    type: ProductType.MIXED_FLOWERS,
  },
  {
    name: 'Zen Garden Plant',
    description: 'Peaceful bamboo and greenery arrangement',
    priceCents: 4250, // $42.50
    priceRange: PriceRange.RANGE_25_50,
    imageUrl: '/images/Filler4.jpg',
    stockCount: 20,
    occasions: [Occasion.JUST_BECAUSE, Occasion.CONGRATULATIONS],
    seasons: [Season.ALL_SEASON],
    moods: [Mood.PEACEFUL, Mood.SOPHISTICATED],
    colors: [Color.GREEN],
    type: ProductType.PLANT,
  },
  {
    name: 'Autumn Harvest Bouquet',
    description: 'Warm fall colors with seasonal blooms',
    priceCents: 4899, // $48.99
    priceRange: PriceRange.RANGE_25_50,
    imageUrl: '/images/Filler5.jpg',
    stockCount: 17,
    occasions: [Occasion.HOUSEWARMING, Occasion.BIRTHDAY, Occasion.JUST_BECAUSE],
    seasons: [Season.FALL],
    moods: [Mood.CHEERFUL, Mood.VIBRANT],
    colors: [Color.ORANGE, Color.YELLOW, Color.RED],
    type: ProductType.MIXED_FLOWERS,
  },
  {
    name: 'Garden Rose Delight',
    description: 'Premium garden roses in soft hues',
    priceCents: 8999, // $89.99
    priceRange: PriceRange.RANGE_75_100,
    imageUrl: '/images/Filler6.jpg',
    stockCount: 9,
    occasions: [Occasion.ANNIVERSARY, Occasion.WEDDING, Occasion.VALENTINES_DAY],
    seasons: [Season.ALL_SEASON],
    moods: [Mood.ROMANTIC, Mood.ELEGANT],
    colors: [Color.PINK, Color.PASTEL],
    type: ProductType.ROSE,
  },
  {
    name: 'Country Wildflower Mix',
    description: 'Rustic wildflowers for a natural look',
    priceCents: 3150, // $31.50
    priceRange: PriceRange.RANGE_25_50,
    imageUrl: '/images/Filler7.jpg',
    stockCount: 21,
    occasions: [Occasion.JUST_BECAUSE, Occasion.BIRTHDAY],
    seasons: [Season.SPRING, Season.SUMMER],
    moods: [Mood.CHEERFUL, Mood.PEACEFUL],
    colors: [Color.MIXED, Color.PASTEL],
    type: ProductType.MIXED_FLOWERS,
  },
  {
    name: 'Indoor Fern Collection',
    description: 'Lush ferns perfect for home or office',
    priceCents: 3599, // $35.99
    priceRange: PriceRange.RANGE_25_50,
    imageUrl: '/images/Filler8.jpg',
    stockCount: 19,
    occasions: [Occasion.JUST_BECAUSE],
    seasons: [Season.ALL_SEASON],
    moods: [Mood.PEACEFUL, Mood.SOPHISTICATED],
    colors: [Color.GREEN],
    type: ProductType.PLANT,
  },
];

const categories = [
  {
    name: 'Bouquets',
    description: 'Hand-crafted flower bouquets for any occasion',
    imageUrl: '/images/Roses.jpg',
  },
  {
    name: 'Plants',
    description: 'Beautiful plants for home and office',
    imageUrl: '/images/Filler4.jpg',
  },
  {
    name: 'Arrangements',
    description: 'Elegant flower arrangements in vases',
    imageUrl: '/images/Tulips.jpg',
  },
  {
    name: 'Seasonal',
    description: 'Seasonal flowers and plants',
    imageUrl: '/images/Sunflowers.jpg',
  },
];

const collections = [
  {
    name: 'Bundle Up and Save',
    description: 'Get more for less with our curated bundles',
    imageUrl: '/images/Filler.jpg',
    discountPercent: 15,
  },
  {
    name: "Valentine's Special",
    description: "Romantic flowers perfect for Valentine's Day",
    imageUrl: '/images/Roses.jpg',
    discountPercent: 10,
  },
];

// Test users for graduation project demo
// Note: These users have Auth0 IDs that match real test accounts
const testUsers = [
  {
    id: 'user_1_test', // Will be replaced with real Auth0 ID when testing
    email: 'test@flora.com',
    firstName: 'Flora',
    lastName: 'Tester',
    role: 'CUSTOMER',
  },
  {
    id: 'user_2_demo', // For demo purposes
    email: 'demo@flora.com',
    firstName: 'Demo',
    lastName: 'User',
    role: 'CUSTOMER',
  }
];

// Test addresses for our test users (Melbourne, Australia)
const testAddresses = [
  // Addresses for test@flora.com
  {
    userId: 'user_1_test',
    label: 'Home',
    firstName: 'Flora',
    lastName: 'Tester',
    street1: '123 Collins Street',
    street2: 'Apt 15B',
    city: 'Melbourne',
    state: 'VIC',
    zipCode: '3000',
    country: 'AU',
    phone: '+61-3-9555-0123',
    isDefault: true,
  },
  {
    userId: 'user_1_test',
    label: 'Work',
    firstName: 'Flora',
    lastName: 'Tester',
    street1: '456 Bourke Street',
    city: 'Melbourne',
    state: 'VIC',
    zipCode: '3000',
    country: 'AU',
    phone: '+61-3-9555-0123',
    isDefault: false,
  },
  // Address for demo@flora.com
  {
    userId: 'user_2_demo',
    label: 'Home',
    firstName: 'Demo',
    lastName: 'User',
    street1: '789 Chapel Street',
    city: 'South Yarra',
    state: 'VIC',
    zipCode: '3141',
    country: 'AU',
    phone: '+61-3-9555-0456',
    isDefault: true,
  },
];

async function main() {
  console.log('🌸 Starting to seed Flora database...');

  // Clear existing data in correct order to respect foreign key constraints
  console.log('🧹 Cleaning existing data...');

  // Delete in order: children first, parents last
  await prisma.payment.deleteMany();           // References orders
  await prisma.orderItem.deleteMany();         // References orders
  await prisma.subscriptionItem.deleteMany();  // References subscriptions
  await prisma.order.deleteMany();             // References subscriptions, users, addresses
  await prisma.subscription.deleteMany();      // References users
  await prisma.address.deleteMany();           // References users
  await prisma.user.deleteMany();              // No dependencies
  await prisma.product.deleteMany();           // No dependencies
  await prisma.category.deleteMany();          // No dependencies

  // Create categories
  console.log('📂 Creating categories...');
  for (const category of categories) {
    await prisma.category.create({
      data: category,
    });
  }

  // Create products
  console.log('🌺 Creating products...');
  for (const product of sampleProducts) {
    await prisma.product.create({
      data: product,
    });
  }

  // Create test users
  console.log('👤 Creating test users...');
  for (const user of testUsers) {
    await prisma.user.create({
      data: user,
    });
  }

  // Create test addresses
  console.log('🏠 Creating test addresses...');
  for (const address of testAddresses) {
    await prisma.address.create({
      data: address,
    });
  }

  console.log('✅ Seeding completed successfully!');
  console.log(`📊 Created:`);
  console.log(`   ${categories.length} categories`);
  console.log(`   ${sampleProducts.length} products`);
  console.log(`   ${testUsers.length} test users`);
  console.log(`   ${testAddresses.length} test addresses`);
  console.log(`\n🧪 Test Data Ready:`);
  console.log(`   📧 Test User: test@flora.com`);
  console.log(`   📧 Demo User: demo@flora.com`);
  console.log(`   🏠 Addresses: ${testAddresses.length} total (default addresses marked)`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
