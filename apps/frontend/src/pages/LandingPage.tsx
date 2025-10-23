import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Product, FilterOptions, ProductResponse } from '../types';
import { apiService } from '../services/api';
import ProductGrid from '../components/ProductGrid';
import './ProductsPage.css';
import './LandingPage.css';

const LandingPage: React.FC = () => {
  // Get URL query parameters (e.g., ?filter=colour or ?category=romantic)
  const [searchParams] = useSearchParams();

  // State for storing the current products being displayed
  const [products, setProducts] = useState<Product[]>([]);

  // State for storing available filter options (filled from backend)
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    occasions: [],
    seasons: [],
    moods: [],
    colors: [],
    types: [],
    priceRanges: [],
  });

  // State for storing user's currently selected filters
  const [selectedFilters, setSelectedFilters] = useState<ProductFilters>({
    page: 1,
    limit: 3,
  });

  // State for loading indicator
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // State for error handling
  const [error, setError] = useState<string | null>(null);

  /**
   * Effect hook to read URL query parameters and apply filters on mount
   * This allows links like /products?filter=colour or /products?search=roses to automatically filter
   */
  useEffect(() => {
    const urlCategory = searchParams.get('category');
    const urlSearch = searchParams.get('search');

    // Map category names to appropriate filters
    const categoryMapping: Record<string, Partial<ProductFilters>> = {
      romantic: { mood: 'ROMANTIC' },
      cheerful: { mood: 'CHEERFUL' },
      elegant: { mood: 'ELEGANT' },
      // "seasonal" shows all products (no filter)
      seasonal: {},
      // "special" could filter by special occasions, but for now show all
      special: {},
    };

    const filters = urlCategory ? categoryMapping[urlCategory.toLowerCase()] || {} : {};

    // Always reset filters to match URL params (or reset to default if no params)
    setSelectedFilters({
      page: 1,
      limit: 3,
      ...filters,
      ...(urlSearch && { search: urlSearch }), // Add search term from URL if present
    });
  }, [searchParams]);

  /**
   * Function to fetch products from the backend API
   * This function is called whenever filters change or page loads
   */
  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Convert our filters object to query parameters for the API
      const queryParams: Record<string, string> = {};

      // Only add filter parameters if they have values (not empty strings)
      Object.entries(selectedFilters).forEach(([key, value]) => {
        if (value !== '' && value !== undefined && value !== null) {
          queryParams[key] = value.toString();
        }
      });

      // Call the backend API with our filters
      const response: ProductResponse = await apiService.getProducts(
        queryParams
      );

      // Update our component state with the response data
      setProducts(response.products);
      setFilterOptions(response.filters);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedFilters]);

  /**i
   * Effect hook that runs when component mounts and when filters change
   * This ensures we always fetch fresh data when user changes filters
   */
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);
  

  return (
    <div>
      <div className="details-container">
        <div id="flower" className="details-card">
          <div className="details-icon">
            <img src="/src/assets/flower-icon.svg"></img>
          </div>
          <div className="details-text">
            <h4>Spontatous Subscription</h4>
            <p>Give a gift of surprise to your loved ones. Weekly, Fortnightly, Monthly and Yearly Subscriptions available.</p>
          </div>
        </div>

        <div id="calendar" className="details-card">
          <div className="details-icon">
            <img src="/src/assets/calendar-icon.svg"></img>
          </div>
          <div className="details-text">
            <h4>Reoccurring Subscription</h4>
            <p>Set up a gift on repeat! With our subscription, you can send a gift for any occasion.</p>
          </div>
        </div>
      
        <div id="colour" className="details-card">
          <div className="details-icon">
            <img src="/src/assets/colour-icon.svg"></img>
          </div>
          <div className="details-text">
            <h4>Mood Picker</h4>
            <p>Pick a colour based on your mood and let our florists put together a bouquet of flowers.</p>
          </div>
        </div>

        <div id="details" className="details-card">
          <div className="details-icon">
            <img src="/src/assets/delivery-icon.svg"></img>
          </div>
          <div className="details-text">
            <h4>Same Day Delivery</h4>
            <p>Based in Melbourne, send out a gift to your loved ones on the same day of purchase.</p>
          </div>
        </div>
      </div>

      <div className="picture-container">
        <div className="image-container">
          <img src="./src/assets/landing-image.png"></img>
        </div>
      </div>

      <div className="shop-by-container">
        <div className="shop-by-card">
          <a href="/products">
            <div className="shop-by-image">
              <img src="/src/assets/Filler1.jpg"></img>
            </div>
            <div className="shop-by-text">
                <p>Shop By All</p>
            </div>
          </a>
        </div>

        <div className="shop-by-card">
          <a href="/products?filter=colour">
          <div className="shop-by-image">
            <img src="/src/assets/Filler2.jpg"></img>
          </div>
          <div className="shop-by-text">
              <p>Shop By Colour</p>
          </div>
          </a>
        </div>

        <div className="shop-by-card">
          <a href="/products?filter=occasion">
          <div className="shop-by-image">
            <img src="/src/assets/Filler3.jpg"></img>
          </div>
          <div className="shop-by-text">
              <p>Shop By Occasion</p>
          </div>
          </a>
        </div>

        <div className="shop-by-card">
          <a href="/products">
          <div className="shop-by-image">
            <img src="/src/assets/Filler4.jpg"></img>
          </div>
          <div className="shop-by-text">
              <p>Bundle Up and Save</p>
          </div>
          </a>
        </div>

      </div>
      <div className="card-container">
              <div className="product-card-grid-container">
                <ProductGrid
                  products={products}
                  isLoading={isLoading}
                />
              </div>
      </div>
    </div>
  );
};

export default LandingPage;
