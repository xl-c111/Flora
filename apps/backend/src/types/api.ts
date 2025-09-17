// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Pagination types
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Search types
export interface SearchParams extends PaginationParams {
  q?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}

// Product types (matching Prisma schema)
export interface ProductResponse {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: {
    id: string;
    name: string;
  };
  inStock: boolean;
  createdAt: string;
  updatedAt: string;
}

// Category types
export interface CategoryResponse {
  id: string;
  name: string;
  description: string;
  products?: ProductResponse[];
}
