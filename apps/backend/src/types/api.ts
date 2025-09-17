// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Pagination types
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Search types
export interface SearchParams extends PaginationParams {
  q?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}

// Product types (matching Prisma schema)
export interface ProductResponse {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: {
    id: string;
    name: string;
  };
  inStock: boolean;
  createdAt: string;
  updatedAt: string;
}

// Category types
export interface CategoryResponse {
  id: string;
  name: string;
  description: string;
  products?: ProductResponse[];
}

// ============================================
// 🚚 DELIVERY TYPES
// ============================================

// Delivery method types (matching Prisma enums)
export type DeliveryType = 'STANDARD' | 'EXPRESS' | 'SAME_DAY' | 'PICKUP';

// Delivery zone response
export interface DeliveryZoneResponse {
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
  deliveryWindows: DeliveryWindowResponse[];
}

// Delivery window response
export interface DeliveryWindowResponse {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  additionalCostCents: number;
  isAvailable: boolean;
}

// Delivery method response
export interface DeliveryMethodResponse {
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

// Shipping calculation request
export interface ShippingCalculationRequest {
  zipCode: string;
  orderValueCents: number;
  deliveryType?: DeliveryType;
  deliveryWindowId?: string;
}

// Shipping calculation response
export interface ShippingCalculationResponse {
  zone?: DeliveryZoneResponse;
  availableMethods: Array<{
    method: DeliveryMethodResponse;
    costCents: number;
    finalCostCents: number; // After discounts/free shipping
    estimatedDelivery: string; // ISO date string
    isFree: boolean;
  }>;
  unavailableReasons?: string[];
}

// Delivery tracking types
export interface TrackingEventResponse {
  id: string;
  timestamp: string;
  location?: string;
  status: string;
  description: string;
  isCustomerVisible: boolean;
}

export interface DeliveryTrackingResponse {
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
  events: TrackingEventResponse[];
}

// Delivery validation request
export interface DeliveryValidationRequest {
  zipCode: string;
  city?: string;
  deliveryType?: DeliveryType;
  requestedDate?: string; // ISO date string
}
