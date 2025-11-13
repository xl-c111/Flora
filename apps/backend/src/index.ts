// Load environment variables FIRST
import dotenv from "dotenv";
dotenv.config();

import express, { Application } from "express";
import path from "path";
import { prisma } from "./config/database";

// Middleware
import { corsMiddleware } from "./middleware/cors";
import { errorHandler } from "./middleware/errorHandler";
import { notFoundHandler } from "./middleware/notFoundHandler";

// Routes
import productRoutes from "./routes/products";
import categoryRoutes from "./routes/categories";
import orderRoutes from "./routes/orders";
import subscriptionRoutes from "./routes/subscriptions";
import paymentRoutes from "./routes/payments";
import webhookRoutes from "./routes/webhooks";
import deliveryInfoRoutes from "./routes/deliveryInfo";
import userRoutes from "./routes/users";
import aiRoutes from "./routes/ai";

// Initialize Express app
const app: Application = express();
const port = Number(process.env.PORT) || 3001;

// Behind CloudFront/ALB we trust the first proxy to get real client IPs
app.set("trust proxy", 1);

// Middleware
app.use(corsMiddleware);

// Webhook route MUST come before express.json() to preserve raw body
app.use("/api/webhooks", webhookRoutes);

// JSON parsing for all other routes
app.use(express.json());

// Serve static images from the images directory
app.use('/images', express.static(path.join(__dirname, '../images')));

// Routes
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/delivery", deliveryInfoRoutes);
app.use("/api/users", userRoutes);
app.use("/api/ai", aiRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    message: "Flora API is running!",
    timestamp: new Date().toISOString(),
  });
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "🌸 Welcome to Flora - Flowers & Plants Marketplace API",
    version: "1.0.0",
    endpoints: {
      health: "/api/health",
      products: "/api/products",
      categories: "/api/categories",
      orders: "/api/orders",
      subscriptions: "/api/subscriptions",
      payments: "/api/payments",
      webhooks: "/api/webhooks",
      users: "/api/users",
      ai: "/api/ai",
    },
  });
});

// Error Handling Middleware
app.use("*", notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(port, '0.0.0.0', async () => {
  console.log(`🚀 Flora API server running on http://0.0.0.0:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/`);

  // Pre-warm AI cache for faster responses on demo day
  // Temporarily disabled to avoid quota issues
  // try {
  //   const { aiService } = await import('./services/AIService');
  //   await aiService.prewarmCache();
  // } catch (error) {
  //   console.log('⚠️  AI cache pre-warming skipped');
  // }
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down Flora API server...");
  await prisma.$disconnect();
  process.exit(0);
});

// Export for use in routes and tests
export { prisma } from "./config/database";
export default app;
