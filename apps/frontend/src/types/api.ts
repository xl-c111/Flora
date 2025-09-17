// ============================================
// 🌸 FLORA MARKETPLACE TYPES
// ============================================

export type Occasion =
  | 'BIRTHDAY'
  | 'ANNIVERSARY'
  | 'WEDDING'
  | 'GRADUATION'
  | 'VALENTINES_DAY'
  | 'MOTHERS_DAY'
  | 'FATHERS_DAY'
  | 'CHRISTMAS'
  | 'EASTER'
  | 'SYMPATHY'
  | 'CONGRATULATIONS'
  | 'GET_WELL_SOON'
  | 'JUST_BECAUSE';

export type Season = 'SPRING' | 'SUMMER' | 'FALL' | 'WINTER' | 'ALL_SEASON';

export type Mood =
  | 'ROMANTIC'
  | 'CHEERFUL'
  | 'ELEGANT'
  | 'PEACEFUL'
  | 'VIBRANT'
  | 'SOPHISTICATED'
  | 'WHIMSICAL'
  | 'CLASSIC';

export type Color =
  | 'RED'
  | 'PINK'
  | 'WHITE'
  | 'YELLOW'
  | 'ORANGE'
  | 'PURPLE'
  | 'BLUE'
  | 'GREEN'
  | 'MIXED'
  | 'PASTEL';

export type ProductType =
  | 'BOUQUET'
  | 'ARRANGEMENT'
  | 'PLANT'
  | 'SUCCULENT'
  | 'ORCHID'
  | 'ROSE'
  | 'LILY'
  | 'TULIP'
  | 'SUNFLOWER'
  | 'MIXED_FLOWERS';

export type PriceRange =
  | 'UNDER_25'
  | 'RANGE_25_50'
  | 'RANGE_50_75'
  | 'RANGE_75_100'
  | 'OVER_100';

// ============================================
// 🚚 DELIVERY TYPES
// ============================================

export type DeliveryType = 'STANDARD' | 'EXPRESS' | 'SAME_DAY' | 'PICKUP';

export interface DeliveryWindow {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  additionalCostCents: number;
  isAvailable: boolean;
}

export interface DeliveryZone {
  id: string;
  name: string;
  description?: string;
  zipCodes: string[];
  cities: string[];
  standardCostCents: number;
  expressCostCents?: number;
  sameDayCostCents?: number;
  standardDeliveryDays: number;
  expressDeliveryDays: number;
  sameDayAvailable: boolean;
  sameDayCutoffHour?: number;
  freeDeliveryThreshold?: number;
  weekendDelivery: boolean;
  holidayDelivery: boolean;
  deliveryWindows: DeliveryWindow[];
}

export interface DeliveryMethod {
  id: string;
  name: string;
  description: string;
  deliveryType: DeliveryType;
  baseCostCents: number;
  estimatedDays: number;
  trackingAvailable: boolean;
  signatureRequired: boolean;
  insuranceIncluded: boolean;
}

export interface ShippingOption {
  method: DeliveryMethod;
  costCents: number;
  finalCostCents: number; // After discounts/free shipping
  estimatedDelivery: string; // ISO date string
  isFree: boolean;
  deliveryWindow?: DeliveryWindow;
}

export interface ShippingCalculation {
  zone?: DeliveryZone;
  availableMethods: ShippingOption[];
  unavailableReasons?: string[];
}

export interface TrackingEvent {
  id: string;
  timestamp: string;
  location?: string;
  status: string;
  description: string;
  isCustomerVisible: boolean;
}

export interface DeliveryTracking {
  id: string;
  orderId: string;
  trackingNumber?: string;
  carrierName?: string;
  status: string;
  currentLocation?: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
  deliveredTo?: string;
  deliveryNotes?: string;
  deliveryPhoto?: string;
  events: TrackingEvent[];
}

// ============================================
// 🛒 PRODUCT TYPES
// ============================================

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  priceRange: PriceRange;
  imageUrl?: string;
  inStock: boolean;
  occasions: Occasion[];
  seasons: Season[];
  moods: Mood[];
  colors: Color[];
  type: ProductType;
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
  occasions: Occasion[];
  seasons: Season[];
  moods: Mood[];
  colors: Color[];
  types: ProductType[];
  priceRanges: PriceRange[];
}
