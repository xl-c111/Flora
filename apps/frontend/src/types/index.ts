// Product Types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  priceRange: string;
  imageUrl?: string;
  inStock: boolean;
  occasions: string[];
  seasons: string[];
  moods: string[];
  colors: string[];
  type: string;
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
    pages: number;
  };
}

export interface FilterOptions {
  occasions: string[];
  seasons: string[];
  moods: string[];
  colors: string[];
  types: string[];
  priceRanges: string[];
}