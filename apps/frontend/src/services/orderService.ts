import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface CreateOrderData {
  userId?: string;
  guestEmail?: string;
  guestPhone?: string;
  purchaseType: 'ONE_TIME' | 'SUBSCRIPTION';
  subscriptionType?: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';
  subscriptionId?: string;
  items: Array<{
    productId: string;
    quantity: number;
    priceCents: number;
    subscriptionType?: string;
    requestedDeliveryDate?: Date;
  }>;
  shippingAddress: {
    firstName: string;
    lastName: string;
    street1: string;
    street2?: string;
    city: string;
    state: string;
    zipCode: string;
    country?: string;
    phone?: string;
  };
  billingAddress?: {
    firstName: string;
    lastName: string;
    street1: string;
    street2?: string;
    city: string;
    state: string;
    zipCode: string;
    country?: string;
    phone?: string;
  };
  deliveryType: 'STANDARD' | 'EXPRESS' | 'NEXT_DAY' | 'PICKUP';
  deliveryNotes?: string;
  requestedDeliveryDate?: Date;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: string;
  purchaseType: string;
  subscriptionType?: string;
  totalCents: number;
  subtotalCents: number;
  shippingCents: number;
  taxCents: number;
  createdAt: string;
  deliveryType?: string;
  requestedDeliveryDate?: string;
  shippingFirstName?: string;
  shippingLastName?: string;
  shippingStreet1?: string;
  shippingStreet2?: string;
  shippingCity?: string;
  shippingState?: string;
  shippingZipCode?: string;
  shippingCountry?: string;
  shippingPhone?: string;
  billingFirstName?: string;
  billingLastName?: string;
  billingStreet1?: string;
  billingStreet2?: string;
  billingCity?: string;
  billingState?: string;
  billingZipCode?: string;
  billingCountry?: string;
  billingPhone?: string;
  items: Array<{
    id: string;
    productId: string;
    quantity: number;
    priceCents: number;
    subscriptionType?: string;        // Item-level subscription type
    requestedDeliveryDate?: string;   // Item-level delivery date
    product: {
      id: string;
      name: string;
      imageUrl: string | null;
      priceCents: number;
    };
  }>;
  payments?: Array<{
    id: string;
  }>;
}

class OrderService {
  /**
   * Create authorization headers from JWT token
   * @param token - Optional JWT access token for authenticated requests
   */
  private getAuthHeader = (token?: string) => {
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
    return {}; // Guest checkout - no auth header
  };

  async createOrder(orderData: CreateOrderData, token?: string): Promise<Order> {
    try {
      const headers = this.getAuthHeader(token);
      const response = await axios.post(`${API_URL}/orders`, orderData, {
        headers,
      });
      return response.data.data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  async getOrder(orderId: string, token?: string): Promise<Order> {
    try {
      const headers = this.getAuthHeader(token);
      const response = await axios.get(`${API_URL}/orders/${orderId}`, {
        headers,
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  }

  async confirmOrder(
    orderId: string,
    paymentIntentId: string,
    token?: string
  ): Promise<Order> {
    try {
      const headers = this.getAuthHeader(token);
      const response = await axios.post(
        `${API_URL}/orders/${orderId}/confirm`,
        { paymentIntentId },
        { headers }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error confirming order:', error);
      throw error;
    }
  }

  /**
   * Get paginated order history for authenticated user
   * @param token - JWT access token (required for this endpoint)
   * @param page - Page number (default: 1)
   * @param limit - Items per page (default: 10)
   */
  async getUserOrders(token: string, page: number = 1, limit: number = 10): Promise<any> {
    try {
      const headers = this.getAuthHeader(token);
      const response = await axios.get(`${API_URL}/orders/user`, {
        params: { page, limit },
        headers,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user orders:', error);
      throw error;
    }
  }
}

export default new OrderService();