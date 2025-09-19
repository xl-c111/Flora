import { Request, Response } from 'express';
import { SubscriptionService } from '../services/SubscriptionService';
import { ApiResponse } from '../types/api';
import { AuthRequest } from '../middleware/auth';

export class SubscriptionController {
  private subscriptionService: SubscriptionService;

  constructor() {
    this.subscriptionService = new SubscriptionService();
  }

  // Create new subscription (requires login)
  createSubscription = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
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

  // Get specific subscription
  getSubscription = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const subscription = await this.subscriptionService.getSubscription(id);

      if (!subscription || subscription.userId !== userId) {
        res.status(404).json({
          success: false,
          error: 'Subscription not found',
        });
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: subscription,
      };
      res.json(response);
    } catch (error) {
      console.error('Get subscription error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get subscription',
      });
    }
  };

  // Get user subscriptions
  getUserSubscriptions = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const subscriptions =
        await this.subscriptionService.getSubscriptionsByUser(userId);

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
  updateSubscription = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const updateData = req.body;

      if (!userId) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      // Verify ownership
      const existing = await this.subscriptionService.getSubscription(id);
      if (!existing || existing.userId !== userId) {
        res.status(404).json({
          success: false,
          error: 'Subscription not found',
        });
        return;
      }

      const subscription = await this.subscriptionService.updateSubscription(
        id,
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

  // Resume subscription
  resumeSubscription = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      // Verify ownership
      const existing = await this.subscriptionService.getSubscription(id);
      if (!existing || existing.userId !== userId) {
        res.status(404).json({
          success: false,
          error: 'Subscription not found',
        });
        return;
      }

      const subscription = await this.subscriptionService.resumeSubscription(
        id
      );

      const response: ApiResponse = {
        success: true,
        data: subscription,
        message: 'Subscription resumed successfully',
      };
      res.json(response);
    } catch (error) {
      console.error('Resume subscription error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to resume subscription',
      });
    }
  };

  // Pause subscription
  pauseSubscription = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      // Verify ownership
      const existing = await this.subscriptionService.getSubscription(id);
      if (!existing || existing.userId !== userId) {
        res.status(404).json({
          success: false,
          error: 'Subscription not found',
        });
        return;
      }

      const subscription = await this.subscriptionService.pauseSubscription(id);

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
  cancelSubscription = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      // Verify ownership
      const existing = await this.subscriptionService.getSubscription(id);
      if (!existing || existing.userId !== userId) {
        res.status(404).json({
          success: false,
          error: 'Subscription not found',
        });
        return;
      }

      const subscription = await this.subscriptionService.cancelSubscription(
        id
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
    req: AuthRequest,
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

      // Verify ownership
      const existing = await this.subscriptionService.getSubscription(id);
      if (!existing || existing.userId !== userId) {
        res.status(404).json({
          success: false,
          error: 'Subscription not found',
        });
        return;
      }

      const order = await this.subscriptionService.createSpontaneousDelivery(
        id,
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
