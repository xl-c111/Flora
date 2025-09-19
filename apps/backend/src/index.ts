// Load environment variables FIRST
import dotenv from 'dotenv';
dotenv.config();

import express, { Application } from 'express';
import { prisma } from './config/database';

// Middleware
import { corsMiddleware } from './middleware/cors';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';

// Routes
import productRoutes from './routes/products';
import categoryRoutes from './routes/categories';
import authTestRoutes from './routes/auth-test';
import orderRoutes from './routes/orders';
import subscriptionRoutes from './routes/subscriptions';
// import paymentRoutes from "./routes/payments";

// Initialize Express app
const app: Application = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(corsMiddleware);
app.use(express.json());

// Routes
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
// app.use("/api/payments", paymentRoutes);
app.use('/api/auth-test', authTestRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    message: 'Flora API is running!',
    timestamp: new Date().toISOString(),
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🌸 Welcome to Flora - Flowers & Plants Marketplace API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      products: '/api/products',
      categories: '/api/categories',
      orders: '/api/orders',
      subscriptions: '/api/subscriptions',
      // payments: "/api/payments",
    },
  });
});

// Error Handling Middleware
app.use('*', notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(port, () => {
  console.log(`🚀 Flora API server running on http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down Flora API server...');
  await prisma.$disconnect();
  process.exit(0);
});

export default app;
