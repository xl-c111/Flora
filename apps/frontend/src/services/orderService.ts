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
  items: Array<{
    id: string;
    productId: string;
    quantity: number;
    priceCents: number;
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
  private getAuthHeader = async () => {
    // If user is logged in, we could add auth token here
    // For now, supporting guest checkout
    return {};
  };

  async createOrder(orderData: CreateOrderData): Promise<Order> {
    try {
      const headers = await this.getAuthHeader();
      const response = await axios.post(`${API_URL}/orders`, orderData, {
        headers,
      });
      return response.data.data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  async getOrder(orderId: string): Promise<Order> {
    try {
      const headers = await this.getAuthHeader();
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
    paymentIntentId: string
  ): Promise<Order> {
    try {
      const headers = await this.getAuthHeader();
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

  async getUserOrders(page: number = 1, limit: number = 10): Promise<any> {
    try {
      const headers = await this.getAuthHeader();
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