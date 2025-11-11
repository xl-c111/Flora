import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
}

export interface PaymentIntentRequest {
  orderId: string;
  amount: number; // in dollars
  currency?: string;
}

class PaymentService {
  private getAuthHeader = async () => {
    // If user is logged in, we could add auth token here
    // For now, supporting guest checkout
    return {};
  };

  async createPaymentIntent(
    data: PaymentIntentRequest
  ): Promise<PaymentIntentResponse> {
    try {
      const headers = await this.getAuthHeader();
      const response = await axios.post(`${API_URL}/payments/intent`, data, {
        headers,
      });
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }

  async confirmPayment(
    paymentIntentId: string,
    orderId: string
  ): Promise<any> {
    try {
      const headers = await this.getAuthHeader();
      const response = await axios.post(
        `${API_URL}/payments/confirm`,
        { paymentIntentId, orderId },
        { headers }
      );
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }

  async getPayment(paymentId: string): Promise<any> {
    try {
      const headers = await this.getAuthHeader();
      const response = await axios.get(`${API_URL}/payments/${paymentId}`, {
        headers,
      });
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }
}

export default new PaymentService();