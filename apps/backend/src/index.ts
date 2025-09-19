import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { prisma } from './config/database';
import productRoutes from './routes/products';
import categoryRoutes from './routes/categories';
import authTestRoutes from './routes/auth-test';

// Load environment variables
dotenv.config();

// Initialize Express app
const app: Application = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
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
    },
  });
});

// Error handling middleware
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error('Error:', err);
    res.status(500).json({
      error: 'Internal server error',
      message:
        process.env.NODE_ENV === 'development'
          ? err.message
          : 'Something went wrong',
    });
  }
);

// Handle 404
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

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
