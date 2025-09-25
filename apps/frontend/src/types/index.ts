// Product Types
export interface Product {
  id: string;
  name: string;
  description: string;
  priceCents: number; // Changed from price to priceCents to match API
  priceRange: string;
  imageUrl?: string;
  inStock: boolean;
  stockCount: number; // Added to match API
  isActive: boolean; // Added to match API
  occasions: string[];
  seasons: string[];
  moods: string[];
  colors: string[];
  type: string;
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
