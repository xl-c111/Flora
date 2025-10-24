// Product Types
export interface Product {
  id: string;
  name: string;
  description: string; // Short description for cards/listings
  longDescription?: string; // Detailed description for product detail page
  priceCents: number; // Changed from price to priceCents to match API
  priceRange: string;
  imageUrl?: string | null;
  inStock: boolean;
  stockCount: number; // Added to match API
  isActive: boolean; // Added to match API
  occasions: string[];
  seasons: string[];
  moods: string[];
  colors: string[];
  type: string;
  category?: string; // Optional category name for display
  categoryId: string | null; // Added to match API
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: FilterOptions;
}

export interface FilterOptions {
  occasions: string[];
  seasons: string[];
  moods: string[];
  colors: string[];
  types: string[];
  priceRanges: string[];
}

export interface ProductFilters {
  occasion?: string;
  season?: string;
  mood?: string;
  color?: string;
  type?: string;
  priceRange?: string;
  inStock?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}
