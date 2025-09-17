import { Request, Response } from 'express';
import { SubscriptionService } from '../services/SubscriptionService';
import { ApiResponse } from '../types/api';

export class SubscriptionController {
  private subscriptionService: SubscriptionService;

  constructor() {
    this.subscriptionService = new SubscriptionService();
  }

  // Create new subscription (requires login)
  createSubscription = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res
          .status(401)
          .json({ success: false, error: 'Login required for subscriptions' });
        return;
      }

      const subscriptionData = req.body;
      const subscription = await this.subscriptionService.createSubscription({
        ...subscriptionData,
        userId,
      });

      const response: ApiResponse = {
        success: true,
        data: subscription,
        message: 'Subscription created successfully',
      };
      res.status(201).json(response);
    } catch (error) {
      console.error('Create subscription error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create subscription',
      });
    }
  };

  // Get user subscriptions
  getUserSubscriptions = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const subscriptions = await this.subscriptionService.getUserSubscriptions(
        userId
      );

      const response: ApiResponse = {
        success: true,
        data: subscriptions,
      };
      res.json(response);
    } catch (error) {
      console.error('Get user subscriptions error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get subscriptions',
      });
    }
  };

  // Update subscription
  updateSubscription = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const updateData = req.body;

      if (!userId) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const subscription = await this.subscriptionService.updateSubscription(
        id,
        userId,
        updateData
      );

      const response: ApiResponse = {
        success: true,
        data: subscription,
        message: 'Subscription updated successfully',
      };
      res.json(response);
    } catch (error) {
      console.error('Update subscription error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update subscription',
      });
    }
  };

  // Pause subscription
  pauseSubscription = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const subscription = await this.subscriptionService.pauseSubscription(
        id,
        userId
      );

      const response: ApiResponse = {
        success: true,
        data: subscription,
        message: 'Subscription paused successfully',
      };
      res.json(response);
    } catch (error) {
      console.error('Pause subscription error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to pause subscription',
      });
    }
  };

  // Cancel subscription
  cancelSubscription = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const subscription = await this.subscriptionService.cancelSubscription(
        id,
        userId
      );

      const response: ApiResponse = {
        success: true,
        data: subscription,
        message: 'Subscription cancelled successfully',
      };
      res.json(response);
    } catch (error) {
      console.error('Cancel subscription error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to cancel subscription',
      });
    }
  };

  // Trigger spontaneous delivery
  createSpontaneousDelivery = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const deliveryData = req.body;

      if (!userId) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const order = await this.subscriptionService.createSpontaneousDelivery(
        id,
        userId,
        deliveryData
      );

      const response: ApiResponse = {
        success: true,
        data: order,
        message: 'Spontaneous delivery scheduled successfully',
      };
      res.json(response);
    } catch (error) {
      console.error('Create spontaneous delivery error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to schedule delivery',
      });
    }
  };
}
