import { Request, Response } from 'express';
import { ProductService } from '../services/ProductService';

export class ProductController {
  /**
   * GET /api/products
   * Get all products with optional filtering
   */
  static async getProducts(req: Request, res: Response) {
    try {
      const filters = {
        occasion: req.query.occasion as string,
        season: req.query.season as string,
        mood: req.query.mood as string,
        color: req.query.color as string,
        type: req.query.type as string,
        priceRange: req.query.priceRange as string,
        inStock: req.query.inStock ? req.query.inStock === 'true' : undefined,
        search: req.query.search as string,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 12,
      };

      const result = await ProductService.getProducts(filters);
      res.json(result);
    } catch (error) {
      console.error('Error getting products:', error);
      res.status(500).json({
        error: 'Failed to fetch products',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * GET /api/products/:id
   * Get a single product by ID
   */
  static async getProductById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const product = await ProductService.getProductById(id);

      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      res.json(product);
    } catch (error) {
      console.error('Error getting product by ID:', error);
      res.status(500).json({
        error: 'Failed to fetch product',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * GET /api/products/search/suggestions
   * Get search suggestions for autocomplete
   */
  static async getSearchSuggestions(req: Request, res: Response) {
    try {
      const rawQuery = req.query.q;
      const query = typeof rawQuery === 'string' ? rawQuery.trim() : '';

      if (!query || query.length < 2) {
        return res.json({ suggestions: [] });
      }

      const suggestions = await ProductService.getSearchSuggestions(query);
      res.json({ suggestions });
    } catch (error) {
      console.error('Error getting search suggestions:', error);
      res.status(500).json({
        error: 'Failed to fetch search suggestions',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * GET /api/products/:id/similar
   * Get similar products to the given product
   */
  static async getSimilarProducts(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const limit = parseInt(req.query.limit as string) || 4;

      const similarProducts = await ProductService.getSimilarProducts(
        id,
        limit
      );
      res.json({ products: similarProducts });
    } catch (error) {
      console.error('Error getting similar products:', error);
      res.status(500).json({
        error: 'Failed to fetch similar products',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
