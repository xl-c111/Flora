// Subscription configuration for Flora marketplace
// Individual product subscription settings

export interface SubscriptionOption {
  frequency: 'weekly' | 'fortnightly' | 'monthly';
  discountPercentage: number;
  label: string;
  description: string;
}

export const SUBSCRIPTION_OPTIONS: SubscriptionOption[] = [
  {
    frequency: 'weekly',
    discountPercentage: 20,
    label: 'Weekly Delivery',
    description: 'Save 20% with weekly deliveries'
  },
  {
    frequency: 'fortnightly',
    discountPercentage: 18,
    label: 'Fortnightly Delivery',
    description: 'Save 18% with bi-weekly deliveries'
  },
  {
    frequency: 'monthly',
    discountPercentage: 15,
    label: 'Monthly Delivery',
    description: 'Save 15% with monthly deliveries'
  }
];

// Helper functions
export const getSubscriptionDiscount = (frequency: 'weekly' | 'fortnightly' | 'monthly'): number => {
  const option = SUBSCRIPTION_OPTIONS.find(opt => opt.frequency === frequency);
  return option?.discountPercentage || 0;
};

export const calculateSubscriptionPrice = (originalPrice: number, frequency: 'weekly' | 'fortnightly' | 'monthly'): number => {
  const discount = getSubscriptionDiscount(frequency);
  return originalPrice * (1 - discount / 100);
};

export const formatSubscriptionSavings = (originalPrice: number, frequency: 'weekly' | 'fortnightly' | 'monthly'): string => {
  const discount = getSubscriptionDiscount(frequency);
  const savings = originalPrice * (discount / 100);
  return `Save $${(savings / 100).toFixed(2)}`;
};