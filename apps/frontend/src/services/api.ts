import axios from 'axios';
import type { Product, ProductResponse } from '../types';

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

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
};

export default apiService;
