
/**
 * Supported filter types for formatting
 * using union type
 */
export type FilterType = 'priceRange' | 'season' | 'occasion' | 'mood' | 'color' | 'type';

/**
 * Helper function to format enum values for display
 * Converts backend enum values like "UNDER_25" to "Under $25"
 *
 * @param filterType - The type of filter being formatted
 * @param value - The backend enum value to format
 * @returns Formatted display string
 *
 * @example
 * formatFilterValue('priceRange', 'UNDER_25') // returns "Under $25"
 * formatFilterValue('occasion', 'MOTHERS_DAY') // returns "Mother's Day"
 * formatFilterValue('season', 'SUMMER') // returns "Summer"
 */
export const formatFilterValue = (
  filterType: string,
  value: string
): string => {
  switch (filterType) {
    case 'priceRange': {
      // Handle price range formatting with explicit mappings
      const priceLabels: Record<string, string> = {
        UNDER_25: 'Under $25',
        RANGE_25_50: '$25-$50',
        RANGE_50_75: '$50-$75',
        RANGE_75_100: '$75-$100',
        OVER_100: 'Over $100',
      };
      return priceLabels[value] || value;
    }

    case 'season':
      // Simple capitalization for seasons: "SUMMER" -> "Summer"
      return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();

    case 'occasion': {
      // Handle complex occasion formatting: "MOTHERS_DAY" -> "Mother's Day"
      return value
        .split('_')
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join(' ')
        .replace('s Day', "'s Day"); // Fix possessives like "Mother's Day"
    }

    case 'mood':
    case 'color':
    case 'type':
      // Simple capitalization for these filter types
      return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();

    default:
      // Fallback: simple capitalization
      return value;
  }
};
