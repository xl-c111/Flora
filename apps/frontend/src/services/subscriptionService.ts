const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Helper function to create auth headers
const createAuthHeaders = (token?: string): Record<string, string> => {
  if (token) {
    return {
      'Authorization': `Bearer ${token}`,
    };
  }
  return {};
};

export interface CreateSubscriptionData {
  type: 'RECURRING_WEEKLY' | 'RECURRING_BIWEEKLY' | 'RECURRING_MONTHLY' | 'SPONTANEOUS';
  deliveryType: 'STANDARD' | 'EXPRESS';
  shippingAddress: {
    firstName: string;
    lastName: string;
    street1: string;
    street2?: string;
    city: string;
    state: string;
    zipCode: string;
    phone?: string;
  };
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  deliveryNotes?: string;
}

export interface Subscription {
  id: string;
  subscriptionType: string;
  deliveryType: string;
  isActive: boolean;
  startDate: string;
  nextDeliveryDate: string;
  shippingAddress: {
    firstName: string;
    lastName: string;
    street1: string;
    street2?: string;
    city: string;
    state: string;
    zipCode: string;
    phone?: string;
  };
  products: Array<{
    id: string;
    productId: string;
    quantity: number;
    product: {
      id: string;
      name: string;
      priceCents: number;
      imageUrl?: string;
    };
  }>;
  specialInstructions?: string;
  createdAt: string;
  updatedAt: string;
}

class SubscriptionService {
  async createSubscription(data: CreateSubscriptionData, token?: string): Promise<Subscription> {
    const response = await fetch(`${API_BASE_URL}/subscriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...createAuthHeaders(token),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Subscription creation failed:', errorData);
      throw new Error(errorData.error || errorData.message || `Failed to create subscription: ${response.status}`);
    }

    return response.json();
  }

  // NEW: Create subscription with Stripe payment setup
  async createSubscriptionWithPayment(data: CreateSubscriptionData, token?: string): Promise<{
    subscription: Subscription;
    clientSecret: string;
    stripeSubscriptionId: string;
  }> {
    const response = await fetch(`${API_BASE_URL}/subscriptions/with-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...createAuthHeaders(token),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to create subscription with payment: ${response.status}`);
    }

    const result = await response.json();
    return result.data; // Return the data object which contains subscription, clientSecret, etc.
  }

  async getSubscriptions(token?: string): Promise<Subscription[]> {
    const response = await fetch(`${API_BASE_URL}/subscriptions`, {
      headers: {
        ...createAuthHeaders(token),
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to fetch subscriptions: ${response.status}`);
    }

    const result = await response.json();
    return result.data || [];
  }

  async getSubscription(id: string, token?: string): Promise<Subscription> {
    const response = await fetch(`${API_BASE_URL}/subscriptions/${id}`, {
      headers: {
        ...createAuthHeaders(token),
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to fetch subscription: ${response.status}`);
    }

    return response.json();
  }

  async updateSubscription(id: string, data: Partial<CreateSubscriptionData>, token?: string): Promise<Subscription> {
    const response = await fetch(`${API_BASE_URL}/subscriptions/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...createAuthHeaders(token),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to update subscription: ${response.status}`);
    }

    return response.json();
  }

  async pauseSubscription(id: string, token?: string): Promise<Subscription> {
    const response = await fetch(`${API_BASE_URL}/subscriptions/${id}/pause`, {
      method: 'PUT',
      headers: {
        ...createAuthHeaders(token),
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to pause subscription: ${response.status}`);
    }

    return response.json();
  }

  async resumeSubscription(id: string, token?: string): Promise<Subscription> {
    const response = await fetch(`${API_BASE_URL}/subscriptions/${id}/resume`, {
      method: 'PUT',
      headers: {
        ...createAuthHeaders(token),
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to resume subscription: ${response.status}`);
    }

    return response.json();
  }

  async cancelSubscription(id: string, token?: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/subscriptions/${id}`, {
      method: 'DELETE',
      headers: {
        ...createAuthHeaders(token),
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to cancel subscription: ${response.status}`);
    }
  }
}

export const subscriptionService = new SubscriptionService();
export default subscriptionService;