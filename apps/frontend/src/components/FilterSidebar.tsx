import React from 'react';
import type { FilterOptions } from '../types';
import { formatFilterValue } from '../utils/filterFormatting';

/**
 * FilterSidebar Component
 *
 * This component renders all the filter options in a sidebar format.
 * It provides dropdown filters for different product attributes like
 * price, color, mood, season, occasion, etc.
 *
 * The component receives available filter options from the backend
 * and current selections from the parent component.
 */

// Interface for the filters that user has selected
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

interface FilterSidebarProps {
  // Available filter options from the backend (what can be selected)
  filterOptions: FilterOptions;

  // Currently selected filters
  selectedFilters: ProductFilters;

  // Function to call when user changes a filter
  onFilterChange: (filterType: keyof ProductFilters, value: string) => void;

  // Function to clear all filters
  onClearFilters: () => void;

  // Number of currently active filters (for display)
  activeFilterCount: number;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filterOptions,
  selectedFilters,
  onFilterChange,
  onClearFilters,
  activeFilterCount,
}) => {
  /**
   * Handle filter change and ensure we pass empty string for "All" option
   */
  const handleFilterChange = (
    filterType: keyof ProductFilters,
    value: string
  ) => {
    // If user selects "All" option, pass empty string to clear the filter
    const filterValue = value === 'all' ? '' : value;
    onFilterChange(filterType, filterValue);
  };

  return (
    <div className="filter-sidebar">
      {/* Sidebar Header */}
      <header className="filter-header">
        <h2>Filter Products</h2>

        {/* Show active filter count and clear button if filters are applied */}
        {activeFilterCount > 0 && (
          <div className="filter-header-actions">
            <span className="active-filters">
              {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''}{' '}
              active
            </span>
            <button
              className="clear-all-btn"
              onClick={onClearFilters}
            >
              Clear All
            </button>
          </div>
        )}
      </header>

      {/* Filter Options */}
      <div className="filter-options">
        {/* Price Range Filter */}
        <div className="filter-group">
          <label
            htmlFor="price-filter"
            className="filter-label"
          >
            Price Range
          </label>
          <select
            id="price-filter"
            value={selectedFilters.priceRange || ''}
            onChange={(e) => handleFilterChange('priceRange', e.target.value)}
            className="filter-select"
            aria-label="Filter by price range"
          >
            <option value="">All Prices</option>
            {filterOptions.priceRanges.map((priceRange) => (
              <option
                key={priceRange}
                value={priceRange}
              >
                {formatFilterValue('priceRange', priceRange)}
              </option>
            ))}
          </select>
        </div>

        {/* Color Filter */}
        <div className="filter-group">
          <label
            htmlFor="color-filter"
            className="filter-label"
          >
            Color
          </label>
          <select
            id="color-filter"
            value={selectedFilters.color || ''}
            onChange={(e) => handleFilterChange('color', e.target.value)}
            className="filter-select"
          >
            <option value="">All Colors</option>
            {filterOptions.colors.map((color) => (
              <option
                key={color}
                value={color}
              >
                {formatFilterValue('color', color)}
              </option>
            ))}
          </select>
        </div>

        {/* Mood Filter */}
        <div className="filter-group">
          <label
            htmlFor="mood-filter"
            className="filter-label"
          >
            Mood
          </label>
          <select
            id="mood-filter"
            value={selectedFilters.mood || ''}
            onChange={(e) => handleFilterChange('mood', e.target.value)}
            className="filter-select"
          >
            <option value="">All Moods</option>
            {filterOptions.moods.map((mood) => (
              <option
                key={mood}
                value={mood}
              >
                {formatFilterValue('mood', mood)}
              </option>
            ))}
          </select>
        </div>

        {/* Season Filter */}
        <div className="filter-group">
          <label
            htmlFor="season-filter"
            className="filter-label"
          >
            Season
          </label>
          <select
            id="season-filter"
            value={selectedFilters.season || ''}
            onChange={(e) => handleFilterChange('season', e.target.value)}
            className="filter-select"
          >
            <option value="">All Seasons</option>
            {filterOptions.seasons.map((season) => (
              <option
                key={season}
                value={season}
              >
                {formatFilterValue('season', season)}
              </option>
            ))}
          </select>
        </div>

        {/* Occasion Filter */}
        <div className="filter-group">
          <label
            htmlFor="occasion-filter"
            className="filter-label"
          >
            Occasion
          </label>
          <select
            id="occasion-filter"
            value={selectedFilters.occasion || ''}
            onChange={(e) => handleFilterChange('occasion', e.target.value)}
            className="filter-select"
          >
            <option value="">All Occasions</option>
            {filterOptions.occasions.map((occasion) => (
              <option
                key={occasion}
                value={occasion}
              >
                {formatFilterValue('occasion', occasion)}
              </option>
            ))}
          </select>
        </div>

        {/* Product Type Filter */}
        <div className="filter-group">
          <label
            htmlFor="type-filter"
            className="filter-label"
          >
            Product Type
          </label>
          <select
            id="type-filter"
            value={selectedFilters.type || ''}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="filter-select"
          >
            <option value="">All Types</option>
            {filterOptions.types.map((type) => (
              <option
                key={type}
                value={type}
              >
                {formatFilterValue('type', type)}
              </option>
            ))}
          </select>
        </div>

        {/* Stock Filter */}
        <div className="filter-group">
          <label
            htmlFor="stock-filter"
            className="filter-label"
          >
            Availability
          </label>
          <select
            id="stock-filter"
            value={
              selectedFilters.inStock === undefined
                ? ''
                : selectedFilters.inStock.toString()
            }
            onChange={(e) => {
              const value = e.target.value;
              if (value === '') {
                onFilterChange('inStock', ''); // Clear filter
              } else {
                onFilterChange('inStock', value);
              }
            }}
            className="filter-select"
          >
            <option value="">All Products</option>
            <option value="true">In Stock Only</option>
            <option value="false">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Filter Tips */}
      <div className="filter-tips">
        <h4>Filter Tips:</h4>
        <ul>
          <li>Select multiple filters to narrow down results</li>
          <li>Use search to find specific flower names</li>
          <li>Clear filters to see all available products</li>
        </ul>
      </div>
    </div>
  );
};

export default FilterSidebar;
