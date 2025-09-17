import express from 'express';
import { ProductController } from '../controllers/ProductController';

const router = express.Router();

// GET /api/products/search/suggestions - Must come before /:id route
router.get('/search/suggestions', ProductController.getSearchSuggestions);

// GET /api/products/:id/similar - Must come before general /:id route
router.get('/:id/similar', ProductController.getSimilarProducts);

// GET /api/products/:id - Get single product
router.get('/:id', ProductController.getProductById);

// GET /api/products - Get all products with filtering
router.get('/', ProductController.getProducts);

export default router;
