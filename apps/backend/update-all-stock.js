const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateAllStock() {
  try {
    const targetCount = parseInt(process.env.RESTOCK_COUNT || '100', 10);
    const threshold = parseInt(process.env.RESTOCK_THRESHOLD || '10', 10);
    const restockAll = String(process.env.RESTOCK_ALL || '').toLowerCase() === 'true';

    // Build where clause (only low stock or out-of-stock unless RESTOCK_ALL=true)
    const where = restockAll
      ? {}
      : {
          OR: [
            { stockCount: { lt: threshold } },
            { inStock: false },
          ],
        };

    // Update products to have stock
    const result = await prisma.product.updateMany({
      where,
      data: {
        inStock: true,
        stockCount: targetCount,
      },
    });
    
    console.log(`✅ Updated ${result.count} products to stockCount=${targetCount}${restockAll ? ' (all products)' : ` (threshold < ${threshold} or inStock=false)`}`);
    
    // Show all products with their stock
    const products = await prisma.product.findMany({
      select: {
        name: true,
        stockCount: true,
        inStock: true,
      },
      orderBy: {
        name: 'asc'
      }
    });
    
    console.log('\n📦 Current inventory:');
    products.forEach(p => {
      console.log(`  ${p.inStock ? '✓' : '✗'} ${p.name}: ${p.stockCount} units`);
    });
  } catch (error) {
    console.error('❌ Error updating stock:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

updateAllStock();
