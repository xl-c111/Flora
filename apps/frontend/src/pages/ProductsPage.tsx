import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Product, FilterOptions, ProductResponse } from '../types';
import { apiService } from '../services/api';
import FilterSidebar from '../components/FilterSidebar';
import ProductGrid from '../components/ProductGrid';
import './ProductsPage.css';

// Interface to define what filters the user has selected
interface ProductFilters {
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

const ProductsPage: React.FC = () => {
  // Get URL query parameters (e.g., ?filter=colour or ?category=romantic)
  const [searchParams] = useSearchParams();

  // State for storing the current products being displayed
  const [products, setProducts] = useState<Product[]>([]);

  // State for pagination information (current page, total pages, etc.)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });

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
    limit: 12,
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
      limit: 12,
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
      setPagination(response.pagination);
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

  /**
   * Function to handle when user changes any filter
   * This updates our selectedFilters state and resets to page 1
   */
  const handleFilterChange = (
    filterType: keyof ProductFilters,
    value: string
  ) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [filterType]: value,
      page: 1, // Reset to first page when filters change
    }));
  };

  /**
   * Function to clear all selected filters
   * Resets everything back to default state (show all products)
   */
  const handleClearFilters = () => {
    setSelectedFilters({
      page: 1,
      limit: 12,
    });
  };

  /**
   * Function to handle pagination (when user clicks page numbers)
   */
  const handlePageChange = (newPage: number) => {
    setSelectedFilters((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  /**
   * Function to count how many filters are currently active
   * Used to show filter count to the user
   */
  const getActiveFilterCount = (): number => {
    let count = 0;
    if (selectedFilters.occasion) count++;
    if (selectedFilters.season) count++;
    if (selectedFilters.mood) count++;
    if (selectedFilters.color) count++;
    if (selectedFilters.type) count++;
    if (selectedFilters.priceRange) count++;
    if (selectedFilters.search) count++;
    if (selectedFilters.inStock !== undefined) count++;
    return count;
  };

  return (
    <div className="products-page">
      {/* Page Header with Search */}
      <div className="banner-container"
      style={{
        // marginTop:'16px',
      }}>
        {/* <div className="page-header">
          <div className="header-container">

            <SearchBar
              onSearchChange={handleSearchChange}
              currentSearch={selectedFilters.search || ''}
            />
          </div>
        </div> */}
      </div>

      {/* Main Content Area */}
      <main className="page-content">
        <div className="products-container">
          <div className="content-wrapper">
            {/* Left Sidebar - Filters */}
            <aside
              className="filter-sidebar"
              role="complementary"
              aria-label="Product filters"
            >
              <FilterSidebar
                filterOptions={filterOptions}
                selectedFilters={selectedFilters}
                onFilterChange={handleFilterChange}
                onClearFilters={handleClearFilters}
                activeFilterCount={getActiveFilterCount()}
              />
            </aside>

            {/* Right Side - Products Grid */}
            <section
              className="products-main"
              aria-label="Product results"
            >
              {/* Screen Reader Announcements */}
              <div
                aria-live="polite"
                aria-atomic="true"
                className="sr-only"
              >
                {isLoading
                  ? 'Loading products...'
                  : `Showing ${products.length} of ${
                      pagination.total
                    } products${
                      getActiveFilterCount() > 0
                        ? ` with ${getActiveFilterCount()} filters applied`
                        : ''
                    }`}
              </div>

              {/* Results Header */}
              <div className="results-header">
                <div className="results-info">
                  {isLoading ? (
                    <span>Loading products...</span>
                  ) : (
                    <span>
                      Showing {products.length} of {pagination.total} products
                      {getActiveFilterCount() > 0 && (
                        <span className="filter-count">
                          ({getActiveFilterCount()} filter
                          {getActiveFilterCount() > 1 ? 's' : ''} applied)
                        </span>
                      )}
                    </span>
                  )}
                </div>

                {/* Clear Filters Button (only show if filters are applied) */}
                {getActiveFilterCount() > 0 && (
                  <button
                    className="clear-filters-btn"
                    onClick={handleClearFilters}
                    aria-label={`Clear all ${getActiveFilterCount()} active filters`}
                  >
                    Clear All Filters
                  </button>
                )}
              </div>

              {/* Error Message */}
              {error && <div className="error-message">{error}</div>}

              {/* Products Grid */}
              <ProductGrid
                products={products}
                isLoading={isLoading}
              />

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="products-pagination">
                  <div className="pagination-controls">
                    {/* Previous Page Button */}
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="pagination-btn"
                      aria-label="Go to previous page"
                    >
                      Previous
                    </button>

                    {/* Page Numbers */}
                    {Array.from(
                      { length: pagination.totalPages },
                      (_, i) => i + 1
                    ).map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`pagination-btn ${
                          pageNum === pagination.page ? 'active' : ''
                        }`}
                        aria-label={`Go to page ${pageNum}`}
                        aria-current={
                          pageNum === pagination.page ? 'page' : undefined
                        }
                      >
                        {pageNum}
                      </button>
                    ))}

                    {/* Next Page Button */}
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                      className="pagination-btn"
                      aria-label="Go to next page"
                    >
                      Next
                    </button>
                  </div>

                  {/* Page Info */}
                  <div className="pagination-info">
                    Page {pagination.page} of {pagination.totalPages}
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductsPage;
