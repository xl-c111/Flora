import express, { Router } from 'express';
import { DeliveryType } from '@prisma/client';
import { DeliveryService } from '../config/deliveryConfig';
import { ApiResponse } from '../types/api';

const router: Router = express.Router();

// Simple delivery info endpoint for Melbourne
router.get('/info', (req, res) => {
  try {
    const deliveryInfo = DeliveryService.getDeliveryInfo();

    const response: ApiResponse = {
      success: true,
      data: deliveryInfo,
      message: 'Delivery information retrieved successfully'
    };

    res.json(response);
  } catch (error) {
    console.error('Get delivery info error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get delivery information',
    });
  }
});

// Simple postcode validation for Melbourne
router.get('/validate/:postcode', (req, res) => {
  try {
    const { postcode } = req.params;

    if (!postcode) {
      res.status(400).json({
        success: false,
        error: 'Postcode is required',
      });
      return;
    }

    const isAvailable = DeliveryService.isDeliveryAvailable(postcode);
    const estimate = isAvailable
      ? DeliveryService.getDeliveryEstimate(DeliveryType.STANDARD)
      : null;

    const response: ApiResponse = {
      success: true,
      data: {
        postcode,
        available: isAvailable,
        message: isAvailable
          ? `Delivery available to ${postcode}`
          : `Sorry, we don't deliver to ${postcode} yet`,
        estimate: estimate
      },
    };

    res.json(response);
  } catch (error) {
    console.error('Validate postcode error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to validate postcode',
    });
  }
});

export default router;
