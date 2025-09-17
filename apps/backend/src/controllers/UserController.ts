import { Request, Response } from 'express';
import { UserService } from '../services/UserService';
import { ApiResponse } from '../types/api';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  // Get user profile
  getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id; // From auth middleware
      if (!userId) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const user = await this.userService.getUserById(userId);
      if (!user) {
        res.status(404).json({ success: false, error: 'User not found' });
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: user,
      };
      res.json(response);
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get user profile',
      });
    }
  };

  // Update user profile
  updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const updateData = req.body;
      const user = await this.userService.updateUser(userId, updateData);

      const response: ApiResponse = {
        success: true,
        data: user,
        message: 'Profile updated successfully',
      };
      res.json(response);
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update profile',
      });
    }
  };

  // Create or update user address
  createAddress = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const addressData = req.body;
      const address = await this.userService.createAddress(userId, addressData);

      const response: ApiResponse = {
        success: true,
        data: address,
        message: 'Address created successfully',
      };
      res.json(response);
    } catch (error) {
      console.error('Create address error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create address',
      });
    }
  };

  // Get user addresses
  getAddresses = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const addresses = await this.userService.getUserAddresses(userId);

      const response: ApiResponse = {
        success: true,
        data: addresses,
      };
      res.json(response);
    } catch (error) {
      console.error('Get addresses error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get addresses',
      });
    }
  };
}
