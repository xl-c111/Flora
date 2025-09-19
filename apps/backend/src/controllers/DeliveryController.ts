// ============================================
// 🚚 DELIVERY CONTROLLER
// ============================================
// Handles HTTP requests for delivery functionality:
// - Shipping cost calculation endpoints
// - Delivery zone validation
// - Order tracking API
// - Delivery method information

import { Request, Response } from 'express';
import { DeliveryService } from '../services/DeliveryService';
import { ApiResponse } from '../types/api';

export class DeliveryController {
  private deliveryService: DeliveryService;

  constructor() {
    this.deliveryService = new DeliveryService();
  }

  // ============================================
  // 📍 DELIVERY ZONES
  // ============================================

  /**
   * GET /api/delivery/zones
   * Get all available delivery zones
   * Used for admin management and zone lookup
   */
  async getDeliveryZones(req: Request, res: Response) {
    try {
      const zones = await this.deliveryService.getAllDeliveryZones();

      const response: ApiResponse = {
        success: true,
        data: zones,
        message: `Found ${zones.length} delivery zones`,
      };

      res.json(response);
    } catch (error) {
      console.error('Error fetching delivery zones:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Failed to fetch delivery zones',
      };
      res.status(500).json(response);
    }
  }

  /**
   * GET /api/delivery/zones/validate?zipCode=12345&city=CityName
   * Validate if delivery is available to a location
   */
  async validateDeliveryLocation(req: Request, res: Response) {
    try {
      const { zipCode, city, deliveryType, requestedDate } = req.query;

      if (!zipCode || typeof zipCode !== 'string') {
        const response: ApiResponse = {
          success: false,
          error: 'Zip code is required',
        };
        return res.status(400).json(response);
      }

      const validation = await this.deliveryService.validateDelivery({
        zipCode,
        city: city as string,
        deliveryType: deliveryType as any,
        requestedDate: requestedDate as string,
      });

      const response: ApiResponse = {
        success: validation.isValid,
        data: {
          isValid: validation.isValid,
          zone: validation.zone,
          message: validation.message,
        },
      };

      res.json(response);
    } catch (error) {
      console.error('Error validating delivery location:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Failed to validate delivery location',
      };
      res.status(500).json(response);
    }
  }

  // ============================================
  // 📦 DELIVERY METHODS
  // ============================================

  /**
   * GET /api/delivery/methods
   * Get all available delivery methods
   */
  async getDeliveryMethods(req: Request, res: Response) {
    try {
      const methods = await this.deliveryService.getAllDeliveryMethods();

      const response: ApiResponse = {
        success: true,
        data: methods,
        message: `Found ${methods.length} delivery methods`,
      };

      res.json(response);
    } catch (error) {
      console.error('Error fetching delivery methods:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Failed to fetch delivery methods',
      };
      res.status(500).json(response);
    }
  }

  // ============================================
  // 💰 SHIPPING CALCULATION
  // ============================================

  /**
   * POST /api/delivery/calculate
   * Calculate shipping costs for an order
   * Body: { zipCode, orderValueCents, deliveryType?, deliveryWindowId? }
   */
  async calculateShipping(req: Request, res: Response) {
    try {
      const { zipCode, orderValueCents, deliveryType, deliveryWindowId } =
        req.body;

      // Validate required fields
      if (!zipCode || typeof zipCode !== 'string') {
        const response: ApiResponse = {
          success: false,
          error: 'Zip code is required',
        };
        return res.status(400).json(response);
      }

      if (
        !orderValueCents ||
        typeof orderValueCents !== 'number' ||
        orderValueCents < 0
      ) {
        const response: ApiResponse = {
          success: false,
          error: 'Valid order value in cents is required',
        };
        return res.status(400).json(response);
      }

      const calculation = await this.deliveryService.calculateShipping({
        zipCode,
        orderValueCents,
        deliveryType,
        deliveryWindowId,
      });

      const response: ApiResponse = {
        success: true,
        data: calculation,
        message:
          calculation.availableMethods.length > 0
            ? `Found ${calculation.availableMethods.length} shipping options`
            : 'No shipping options available for this location',
      };

      res.json(response);
    } catch (error) {
      console.error('Error calculating shipping:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Failed to calculate shipping costs',
      };
      res.status(500).json(response);
    }
  }

  // ============================================
  // 📍 ORDER TRACKING
  // ============================================

  /**
   * GET /api/delivery/tracking/:orderId
   * Get tracking information for an order
   */
  async getOrderTracking(req: Request, res: Response) {
    try {
      const { orderId } = req.params;

      if (!orderId) {
        const response: ApiResponse = {
          success: false,
          error: 'Order ID is required',
        };
        return res.status(400).json(response);
      }

      const tracking = await this.deliveryService.getOrderTracking(orderId);

      if (!tracking) {
        const response: ApiResponse = {
          success: false,
          error: 'Tracking information not found for this order',
        };
        return res.status(404).json(response);
      }

      const response: ApiResponse = {
        success: true,
        data: tracking,
        message: 'Tracking information retrieved successfully',
      };

      res.json(response);
    } catch (error) {
      console.error('Error fetching order tracking:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Failed to fetch tracking information',
      };
      res.status(500).json(response);
    }
  }

  /**
   * GET /api/delivery/tracking/number/:trackingNumber
   * Get tracking information by tracking number
   */
  async getTrackingByNumber(req: Request, res: Response) {
    try {
      const { trackingNumber } = req.params;

      if (!trackingNumber) {
        const response: ApiResponse = {
          success: false,
          error: 'Tracking number is required',
        };
        return res.status(400).json(response);
      }

      // For now, we'll need to modify the service to support tracking by number
      // This would require adding a new method to DeliveryService
      const response: ApiResponse = {
        success: false,
        error: 'Tracking by number not yet implemented',
      };

      res.status(501).json(response);
    } catch (error) {
      console.error('Error fetching tracking by number:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Failed to fetch tracking information',
      };
      res.status(500).json(response);
    }
  }

  /**
   * POST /api/delivery/tracking/:trackingNumber/update
   * Update tracking status (for internal use or webhooks)
   * Body: { status, description, location? }
   */
  async updateTrackingStatus(req: Request, res: Response) {
    try {
      const { trackingNumber } = req.params;
      const { status, description, location } = req.body;

      if (!trackingNumber) {
        const response: ApiResponse = {
          success: false,
          error: 'Tracking number is required',
        };
        return res.status(400).json(response);
      }

      if (!status || !description) {
        const response: ApiResponse = {
          success: false,
          error: 'Status and description are required',
        };
        return res.status(400).json(response);
      }

      await this.deliveryService.updateTrackingStatus(
        trackingNumber,
        status,
        description,
        location
      );

      const response: ApiResponse = {
        success: true,
        message: 'Tracking status updated successfully',
      };

      res.json(response);
    } catch (error) {
      console.error('Error updating tracking status:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Failed to update tracking status',
      };
      res.status(500).json(response);
    }
  }

  // ============================================
  // 🔧 UTILITY ENDPOINTS
  // ============================================

  /**
   * GET /api/delivery/health
   * Health check for delivery service
   */
  async healthCheck(req: Request, res: Response) {
    try {
      // Test database connection by fetching one delivery zone
      const zones = await this.deliveryService.getAllDeliveryZones();

      const response: ApiResponse = {
        success: true,
        data: {
          status: 'healthy',
          timestamp: new Date().toISOString(),
          zonesCount: zones.length,
        },
        message: 'Delivery service is operational',
      };

      res.json(response);
    } catch (error) {
      console.error('Delivery service health check failed:', error);
      const response: ApiResponse = {
        success: false,
        data: {
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
        },
        error: 'Delivery service is experiencing issues',
      };
      res.status(500).json(response);
    }
  }

  /**
   * GET /api/delivery/estimate-date
   * Get estimated delivery date for a zip code and delivery type
   */
  async getEstimatedDeliveryDate(req: Request, res: Response) {
    try {
      const { zipCode, deliveryType = 'STANDARD' } = req.query;

      if (!zipCode || typeof zipCode !== 'string') {
        const response: ApiResponse = {
          success: false,
          error: 'Zip code is required',
        };
        return res.status(400).json(response);
      }

      // Calculate using minimum order value to get base estimate
      const calculation = await this.deliveryService.calculateShipping({
        zipCode,
        orderValueCents: 1000, // $10 minimum for estimate
        deliveryType: deliveryType as any,
      });

      if (calculation.availableMethods.length === 0) {
        const response: ApiResponse = {
          success: false,
          error: 'No delivery available to this location',
        };
        return res.status(404).json(response);
      }

      // Find the requested delivery type or default to first available
      let selectedMethod = calculation.availableMethods[0];
      if (deliveryType) {
        const found = calculation.availableMethods.find(
          (method) => method.method.deliveryType === deliveryType
        );
        if (found) selectedMethod = found;
      }

      const response: ApiResponse = {
        success: true,
        data: {
          estimatedDelivery: selectedMethod.estimatedDelivery,
          deliveryType: selectedMethod.method.deliveryType,
          methodName: selectedMethod.method.name,
          estimatedDays: selectedMethod.method.estimatedDays,
        },
        message: 'Estimated delivery date calculated',
      };

      res.json(response);
    } catch (error) {
      console.error('Error calculating estimated delivery date:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Failed to calculate estimated delivery date',
      };
      res.status(500).json(response);
    }
  }
}
