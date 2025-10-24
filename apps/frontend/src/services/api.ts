import axios from 'axios';
import type { Product, ProductResponse } from '../types';

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Backend server URL (without /api suffix) for serving static files like images
const BACKEND_URL = API_BASE_URL.replace('/api', '');

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

/**
 * Convert relative image URL to absolute URL
 * @param imageUrl - Relative path like "/images/Roses.jpg"
 * @returns Absolute URL like "http://localhost:3001/images/Roses.jpg"
 */
export const getImageUrl = (imageUrl: string): string => {
  // If already absolute URL (starts with http/https), return as-is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  // Convert relative path to absolute URL
  return `${BACKEND_URL}${imageUrl}`;
};

export const apiService = {
  // Products
  getProducts: async (
    params?: Record<string, string>
  ): Promise<ProductResponse> => {
    const response = await api.get('/products', { params });
    return response.data;
  },

  getProduct: async (id: string): Promise<Product> => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  getProductsByCategory: async (categoryId: string): Promise<Product[]> => {
    const response = await api.get(`/categories/${categoryId}/products`);
    return response.data;
  },

  getFilterOptions: async (): Promise<any> => {
    const response = await api.get('/products/filters/options');
    return response.data;
  },

  // Categories
  getCategories: async (): Promise<any[]> => {
    const response = await api.get('/categories');
    return response.data;
  },

  getCategory: async (id: string): Promise<any> => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  // Subscriptions
  getSubscriptions: async (token: string): Promise<{ success: boolean; data: any[] }> => {
    const response = await api.get('/subscriptions', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // Health check
  healthCheck: async (): Promise<{
    status: string;
    message: string;
    timestamp: string;
  }> => {
    const response = await api.get('/health');
    return response.data;
  },

  // AI Message Generation
  generateAIMessage: async (data: {
    to?: string;
    from?: string;
    occasion?: string;
    keywords?: string;
    tone?: string;
    userPrompt?: string;
  }): Promise<{ success: boolean; data: { message: string }; message: string }> => {
    const response = await api.post('/ai/generate-message', data, {
      timeout: 15000, // Reduced to 15 seconds for faster timeout feedback
    });
    return response.data;
  },

  getMessageSuggestions: async (data: {
    productName?: string;
    productDescription?: string;
  }): Promise<{ success: boolean; data: { suggestions: string[] }; message: string }> => {
    const response = await api.post('/ai/message-suggestions', data);
    return response.data;
  },
};

export default apiService;
