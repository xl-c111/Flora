/**
 * Simple Delivery Configuration for Flora Demo
 *
 * Hardcoded delivery zones and pricing for graduation project timeline.
 * This avoids complex delivery management while providing professional demo.
 */

import { DeliveryType } from '@prisma/client';

export const DELIVERY_CONFIG = {
  // Flat rate pricing (in cents) - AUD
  fees: {
    standard: 899,  // $8.99 AUD
    express: 1599,  // $15.99 AUD
  },

  // Service areas
  serviceArea: {
    name: "Melbourne Metro Area",
    description: "We deliver throughout Greater Melbourne",
    estimatedDays: {
      standard: "2-4 business days",
      express: "Same day or next business day"
    }
  },

  // Melbourne postcodes for demo purposes
  validPostcodes: [
    // Melbourne CBD
    '3000', '3001', '3002', '3003', '3004', '3005', '3006', '3008',
    // Inner Melbourne
    '3011', '3031', '3032', '3051', '3052', '3053', '3054', '3055', '3056', '3057',
    '3065', '3066', '3067', '3068', '3070', '3071', '3078', '3079', '3080', '3081',
    '3121', '3122', '3123', '3124', '3125', '3126', '3127', '3128', '3129', '3141',
    '3142', '3143', '3144', '3145', '3146', '3147', '3161', '3162', '3163', '3181',
    '3182', '3183', '3184', '3185', '3186', '3187', '3188', '3189',
    // Outer Melbourne suburbs
    '3018', '3019', '3020', '3021', '3022', '3023', '3024', '3025', '3030', '3033',
    '3034', '3047', '3131', '3132', '3133', '3134', '3135', '3136', '3137', '3138', '3139',
    '3148', '3149', '3150', '3151', '3152', '3153', '3154', '3155', '3156', '3165',
    '3166', '3167', '3168', '3169', '3170', '3171', '3172', '3173', '3174', '3175',
    '3176', '3177', '3178', '3179', '3190', '3191', '3192', '3193', '3194', '3195',
    '3196', '3197', '3198', '3199'
  ]
};

export class DeliveryService {
  // Get delivery fee based on type
  static getDeliveryFee(deliveryType: DeliveryType): number {
    return deliveryType === DeliveryType.EXPRESS
      ? DELIVERY_CONFIG.fees.express
      : DELIVERY_CONFIG.fees.standard;
  }

  // Simple postcode validation for demo
  static isDeliveryAvailable(postcode: string): boolean {
    return DELIVERY_CONFIG.validPostcodes.includes(postcode);
  }

  // Get delivery estimate
  static getDeliveryEstimate(deliveryType: DeliveryType): string {
    return deliveryType === DeliveryType.EXPRESS
      ? DELIVERY_CONFIG.serviceArea.estimatedDays.express
      : DELIVERY_CONFIG.serviceArea.estimatedDays.standard;
  }

  // Get delivery info for frontend
  static getDeliveryInfo() {
    return {
      serviceArea: DELIVERY_CONFIG.serviceArea,
      pricing: {
        standard: {
          fee: DELIVERY_CONFIG.fees.standard,
          estimate: DELIVERY_CONFIG.serviceArea.estimatedDays.standard,
          display: `$${(DELIVERY_CONFIG.fees.standard / 100).toFixed(2)} AUD`
        },
        express: {
          fee: DELIVERY_CONFIG.fees.express,
          estimate: DELIVERY_CONFIG.serviceArea.estimatedDays.express,
          display: `$${(DELIVERY_CONFIG.fees.express / 100).toFixed(2)} AUD`
        }
      },
      currency: "AUD",
      country: "Australia"
    };
  }
}