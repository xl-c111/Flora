import { apiService } from './api';

export interface DeliveryInfo {
  serviceArea: {
    name: string;
    description: string;
    estimatedDays: {
      standard: string;
      express: string;
    };
  };
  pricing: {
    standard: {
      fee: number;
      estimate: string;
      display: string;
    };
    express: {
      fee: number;
      estimate: string;
      display: string;
    };
  };
  currency: string;
  country: string;
}

export interface PostcodeValidation {
  postcode: string;
  available: boolean;
  message: string;
  estimate?: string;
}

export const deliveryService = {
  // Get delivery information and pricing
  getDeliveryInfo: async (): Promise<DeliveryInfo> => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/delivery/info`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch delivery info');
      }

      return data.data;
    } catch (error) {
      console.error('Error fetching delivery info:', error);
      // Fallback to default values if API fails
      return {
        serviceArea: {
          name: "Melbourne Metro Area",
          description: "We deliver throughout Greater Melbourne",
          estimatedDays: {
            standard: "2-4 business days",
            express: "Same day or next business day"
          }
        },
        pricing: {
          standard: {
            fee: 899, // $8.99
            estimate: "2-4 business days",
            display: "$8.99 AUD"
          },
          express: {
            fee: 1599, // $15.99
            estimate: "Same day or next business day",
            display: "$15.99 AUD"
          }
        },
        currency: "AUD",
        country: "Australia"
      };
    }
  },

  // Validate postcode for delivery availability
  validatePostcode: async (postcode: string): Promise<PostcodeValidation> => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/delivery/validate/${postcode}`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to validate postcode');
      }

      return data.data;
    } catch (error) {
      console.error('Error validating postcode:', error);
      // Fallback - assume delivery is available
      return {
        postcode,
        available: true,
        message: `Delivery available to ${postcode}`,
        estimate: "2-4 business days"
      };
    }
  }
};

export default deliveryService;