
// Helper functions for working with the flower shop data

/**
 * Convert price from cents to dollars
 * @param priceCents - Price in cents (e.g., 2599)
 * @returns Formatted price string (e.g., "$25.99")
 */
export const formatPrice = (priceCents: number): string => {
  return `$${(priceCents / 100).toFixed(2)}`;
};

/**
 * Convert price from dollars to cents for database storage
 * @param priceInDollars - Price in dollars (e.g., 25.99)
 * @returns Price in cents (e.g., 2599)
 */
export const dollarseToCents = (priceInDollars: number): number => {
  return Math.round(priceInDollars * 100);
};

/**
 * Format enum values for display (e.g., "VALENTINES_DAY" -> "Valentine's Day")
 * @param enumValue - Enum value to format
 * @returns Formatted string
 */
export const formatEnumValue = (enumValue: string): string => {
  return enumValue
    .replace(/_/g, ' ')
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Calculate order total with tax and shipping
 * @param subtotalCents - Subtotal in cents
 * @param shippingCents - Shipping cost in cents
 * @param taxRate - Tax rate (e.g., 0.08 for 8%)
 * @returns Order total breakdown
 */
export const calculateOrderTotal = (
  subtotalCents: number,
  shippingCents: number,
  taxRate: number = 0.08
) => {
  const taxCents = Math.round(subtotalCents * taxRate);
  const totalCents = subtotalCents + shippingCents + taxCents;

  return {
    subtotalCents,
    shippingCents,
    taxCents,
    totalCents,
    formatted: {
      subtotal: formatPrice(subtotalCents),
      shipping: formatPrice(shippingCents),
      tax: formatPrice(taxCents),
      total: formatPrice(totalCents),
    },
  };
};

/**
 * Generate a human-friendly order number
 * @returns Order number (e.g., "FL-2024-001234")
 */
export const generateOrderNumber = (): string => {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, '0');
  return `FL-${year}-${random}`;
};
