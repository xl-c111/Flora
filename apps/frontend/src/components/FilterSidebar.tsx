import React from 'react';
import type { FilterOptions, ProductFilters } from '../types';
import { formatFilterValue } from '../utils/filterFormatting';

const PRICE_ORDER = ['UNDER_25', 'RANGE_25_50', 'RANGE_50_75', 'RANGE_75_100', 'OVER_100'];
const SEASON_ORDER = ['SPRING', 'SUMMER', 'FALL', 'WINTER', 'ALL_SEASON'];

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

interface FilterSidebarProps {
  // Available filter options from the backend (what can be selected)
  filterOptions: FilterOptions;

  // Currently selected filters
  selectedFilters: ProductFilters;

  // Function to call when user changes a filter
  onFilterChange: (filterType: keyof ProductFilters, value: string) => void;

  // Optional handlers used for filter summaries
  onClearFilters?: () => void;
  activeFilterCount?: number;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filterOptions,
  selectedFilters,
  onFilterChange,
  onClearFilters,
  activeFilterCount = 0,
}) => {
  const sortedPriceRanges = React.useMemo(
    () =>
      [...filterOptions.priceRanges].sort((a, b) => {
        const indexA = PRICE_ORDER.indexOf(a);
        const indexB = PRICE_ORDER.indexOf(b);
        const safeIndexA = indexA === -1 ? PRICE_ORDER.length : indexA;
        const safeIndexB = indexB === -1 ? PRICE_ORDER.length : indexB;
        if (safeIndexA === safeIndexB) {
          return a.localeCompare(b);
        }
        return safeIndexA - safeIndexB;
      }),
    [filterOptions.priceRanges]
  );

  const sortedSeasons = React.useMemo(
    () =>
      [...filterOptions.seasons].sort((a, b) => {
        const indexA = SEASON_ORDER.indexOf(a);
        const indexB = SEASON_ORDER.indexOf(b);
        const safeIndexA = indexA === -1 ? SEASON_ORDER.length : indexA;
        const safeIndexB = indexB === -1 ? SEASON_ORDER.length : indexB;
        if (safeIndexA === safeIndexB) {
          return a.localeCompare(b);
        }
        return safeIndexA - safeIndexB;
      }),
    [filterOptions.seasons]
  );

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
        {activeFilterCount > 0 && (
          <div className="filter-header-actions">
            <span className="active-filters">
              {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active
            </span>
            {onClearFilters && (
              <button
                className="clear-all-btn"
                onClick={onClearFilters}
              >
                Clear All
              </button>
            )}
          </div>
        )}
      </header>

      {/* Filter Options */}
      <div className="filter-options">
        {/* Price Range Filter */}
        <div className="filter-group">
          {/* <label
            htmlFor="price-filter"
            className="filter-label"
          >
            Price Range
          </label> */}
          <select
            id="price-filter"
            value={selectedFilters.priceRange || ''}
            onChange={(e) => handleFilterChange('priceRange', e.target.value)}
            className="filter-select"
            aria-label="Filter by price range"
          >
            <option value="" className="filter-select-menu">All Prices</option>
            {sortedPriceRanges.map((priceRange) => (
              <option
                key={priceRange}
                value={priceRange}
                className="filter-select-menu"
              >
                {formatFilterValue('priceRange', priceRange)}
              </option>
            ))}
          </select>
        </div>

        {/* Color Filter */}
        <div className="filter-group">
          {/* <label
            htmlFor="color-filter"
            className="filter-label"
          >
            Color
          </label> */}
          <select
            id="color-filter"
            value={selectedFilters.color || ''}
            onChange={(e) => handleFilterChange('color', e.target.value)}
            className="filter-select"
          >
            <option value="" className="filter-select-menu">All Colors</option>
            {filterOptions.colors.map((color) => (
              <option
                key={color}
                value={color}
                className="filter-select-menu"
              >
                {formatFilterValue('color', color)}
              </option>
            ))}
          </select>
        </div>

        {/* Mood Filter */}
        <div className="filter-group">
          {/* <label
            htmlFor="mood-filter"
            className="filter-label"
          >
            Mood
          </label> */}
          <select
            id="mood-filter"
            value={selectedFilters.mood || ''}
            onChange={(e) => handleFilterChange('mood', e.target.value)}
            className="filter-select"
          >
            <option value="" className="filter-select-menu">All Moods</option>
            {filterOptions.moods.map((mood) => (
              <option
                key={mood}
                value={mood}
                className="filter-select-menu"
              >
                {formatFilterValue('mood', mood)}
              </option>
            ))}
          </select>
        </div>

        {/* Season Filter */}
        <div className="filter-group">
          {/* <label
            htmlFor="season-filter"
            className="filter-label"
          >
            Season
          </label> */}
          <select
            id="season-filter"
            value={selectedFilters.season || ''}
            onChange={(e) => handleFilterChange('season', e.target.value)}
            className="filter-select"
          >
            <option value="" className="filter-select-menu">All Seasons</option>
            {sortedSeasons.map((season) => (
              <option
                key={season}
                value={season}
                className="filter-select-menu"
              >
                {formatFilterValue('season', season)}
              </option>
            ))}
          </select>
        </div>

        {/* Occasion Filter */}
        <div className="filter-group">
          {/* <label
            htmlFor="occasion-filter"
            className="filter-label"
          >
            Occasion
          </label> */}
          <select
            id="occasion-filter"
            value={selectedFilters.occasion || ''}
            onChange={(e) => handleFilterChange('occasion', e.target.value)}
            className="filter-select"
          >
            <option value="" className="filter-select-menu">All Occasions</option>
            {filterOptions.occasions.map((occasion) => (
              <option
                key={occasion}
                value={occasion}
                className="filter-select-menu"
              >
                {formatFilterValue('occasion', occasion)}
              </option>
            ))}
          </select>
        </div>

        {/* Product Type Filter */}
        <div className="filter-group">
          {/* <label
            htmlFor="type-filter"
            className="filter-label"
          >
            Product Type
          </label> */}
          <select
            id="type-filter"
            value={selectedFilters.type || ''}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="filter-select"
          >
            <option className="filter-select-menu" value="">All Types</option>
            {filterOptions.types.map((type) => (
              <option
                key={type}
                value={type}
                className="filter-select-menu"
              >
                {formatFilterValue('type', type)}
              </option>
            ))}
          </select>
        </div>

        {/* Stock Filter */}
        <div className="filter-group">
          {/* <label
            htmlFor="stock-filter"
            className="filter-label"
          >
            Availability
          </label> */}
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
            <option value="" className="filter-select-menu">All Products</option>
            <option value="true" className="filter-select-menu">In Stock Only</option>
            <option value="false" className="filter-select-menu">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Filter Tips */}
      {/* <div className="filter-tips">
        <h4>Filter Tips:</h4>
        <ul>
          <li>Select multiple filters to narrow down results</li>
          <li>Use search to find specific flower names</li>
          <li>Clear filters to see all available products</li>
        </ul>
      </div> */}
    </div>
  );
};

export default FilterSidebar;
