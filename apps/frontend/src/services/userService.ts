import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface UserProfile {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  role: string;
  favoriteOccasions: string[];
  favoriteColors: string[];
  favoriteMoods: string[];
  addresses: any[];
  stats?: {
    orderCount: number;
    subscriptionCount: number;
    addressCount: number;
    totalSpentCents: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface UpdatePreferencesData {
  favoriteOccasions?: string[];
  favoriteColors?: string[];
  favoriteMoods?: string[];
}

class UserService {
  private getAuthHeader = (token?: string) => {
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
    return {};
  };

  /**
   * Sync user from Auth0 to database
   * Called automatically when user logs in
   */
  async syncUser(token: string): Promise<UserProfile> {
    const headers = this.getAuthHeader(token);
    const response = await axios.post(
      `${API_URL}/users/sync`,
      {},
      { headers }
    );
    return response.data.data;
  }

  /**
   * Get current user profile with stats
   */
  async getProfile(token: string): Promise<UserProfile> {
    const headers = this.getAuthHeader(token);
    const response = await axios.get(`${API_URL}/users/profile`, { headers });
    return response.data.data;
  }

  /**
   * Update user profile (firstName, lastName, phone)
   */
  async updateProfile(
    token: string,
    data: UpdateProfileData
  ): Promise<UserProfile> {
    const headers = this.getAuthHeader(token);
    const response = await axios.put(`${API_URL}/users/profile`, data, {
      headers,
    });
    return response.data.data;
  }

  /**
   * Update user preferences
   */
  async updatePreferences(
    token: string,
    data: UpdatePreferencesData
  ): Promise<UserProfile> {
    const headers = this.getAuthHeader(token);
    const response = await axios.put(`${API_URL}/users/preferences`, data, {
      headers,
    });
    return response.data.data;
  }

  /**
   * Get user statistics
   */
  async getStats(token: string): Promise<any> {
    const headers = this.getAuthHeader(token);
    const response = await axios.get(`${API_URL}/users/stats`, { headers });
    return response.data.data;
  }

  /**
   * Delete user account (destructive)
   */
  async deleteAccount(token: string): Promise<void> {
    const headers = this.getAuthHeader(token);
    await axios.delete(`${API_URL}/users/profile`, { headers });
  }
}

export default new UserService();
