import { Response } from 'express';
import { UserService, Auth0UserData } from '../services/UserService';
import { ApiResponse } from '../types/api';
import { AuthRequest } from '../middleware/auth';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  /**
   * Sync user from Auth0 token - creates/updates user in database
   * POST /api/users/sync
   * Called automatically when user logs in
   */
  syncUser = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      const userEmail = req.user?.email;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Authentication required - user ID missing',
        });
        return;
      }

      // Use a fallback email if not provided in token (database connections)
      const email = userEmail || `${userId}@auth0.user`;

      // Build Auth0 user data from JWT token
      const auth0Data: Auth0UserData = {
        sub: userId,
        email: email,
        name: req.user?.name,
        picture: req.user?.picture,
        email_verified: req.user?.email_verified,
      };

      console.log('🔄 Syncing user:', userId);

      const user = await this.userService.syncUser(auth0Data);

      const response: ApiResponse = {
        success: true,
        data: user,
        message: 'User synced successfully',
      };
      res.json(response);
    } catch (error: any) {
      console.error('Sync user error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to sync user',
      });
    }
  };

  /**
   * Get current user profile
   * GET /api/users/profile
   */
  getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
        return;
      }

      const user = await this.userService.getUser(userId);

      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found',
        });
        return;
      }

      // Also fetch user stats
      const stats = await this.userService.getUserStats(userId);

      const response: ApiResponse = {
        success: true,
        data: {
          ...user,
          stats,
        },
      };
      res.json(response);
    } catch (error: any) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get user profile',
      });
    }
  };

  /**
   * Update user profile (firstName, lastName, phone)
   * PUT /api/users/profile
   */
  updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
        return;
      }

      const { firstName, lastName, phone } = req.body;

      // Validate at least one field is provided
      if (!firstName && !lastName && !phone) {
        res.status(400).json({
          success: false,
          error: 'At least one field (firstName, lastName, phone) is required',
        });
        return;
      }

      const user = await this.userService.updateUser(userId, {
        firstName,
        lastName,
        phone,
      });

      const response: ApiResponse = {
        success: true,
        data: user,
        message: 'Profile updated successfully',
      };
      res.json(response);
    } catch (error: any) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to update profile',
      });
    }
  };

  /**
   * Update user preferences (occasions, colors, moods)
   * PUT /api/users/preferences
   */
  updatePreferences = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
        return;
      }

      const { favoriteOccasions, favoriteColors, favoriteMoods } = req.body;

      // Validate at least one preference is provided
      if (!favoriteOccasions && !favoriteColors && !favoriteMoods) {
        res.status(400).json({
          success: false,
          error:
            'At least one preference (favoriteOccasions, favoriteColors, favoriteMoods) is required',
        });
        return;
      }

      const user = await this.userService.updatePreferences(userId, {
        favoriteOccasions,
        favoriteColors,
        favoriteMoods,
      });

      const response: ApiResponse = {
        success: true,
        data: user,
        message: 'Preferences updated successfully',
      };
      res.json(response);
    } catch (error: any) {
      console.error('Update preferences error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to update preferences',
      });
    }
  };

  /**
   * Get user statistics
   * GET /api/users/stats
   */
  getUserStats = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
        return;
      }

      const stats = await this.userService.getUserStats(userId);

      const response: ApiResponse = {
        success: true,
        data: stats,
      };
      res.json(response);
    } catch (error: any) {
      console.error('Get user stats error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get user statistics',
      });
    }
  };

  /**
   * Delete user account
   * DELETE /api/users/profile
   * WARNING: This is a destructive operation
   */
  deleteAccount = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
        return;
      }

      await this.userService.deleteUser(userId);

      const response: ApiResponse = {
        success: true,
        message: 'Account deleted successfully',
      };
      res.json(response);
    } catch (error: any) {
      console.error('Delete account error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to delete account',
      });
    }
  };
}
