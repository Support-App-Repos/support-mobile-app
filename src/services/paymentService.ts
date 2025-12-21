/**
 * Payment Service
 * Handles payment-related API calls
 */

import { ApiService } from './api';

class PaymentService {
  private apiService: ApiService;

  constructor() {
    this.apiService = new ApiService();
  }

  /**
   * Get all payment plans
   */
  async getPaymentPlans() {
    const response = await this.apiService.get<{ success: boolean; data: any[] }>('/payment-plans');
    // Backend returns { success: true, data: [...] }
    // ApiService.get already extracts response.data, so we get { success, data }
    return response;
  }

  /**
   * Validate promo code
   */
  async validatePromoCode(code: string) {
    const response = await this.apiService.get<{ success: boolean; data: any }>(`/promo-codes/validate?code=${encodeURIComponent(code)}`);
    return response;
  }

  /**
   * Create payment intent
   */
  async createPaymentIntent(data: {
    listingId: string;
    paymentPlanId: string;
    promoCodeId?: string;
  }) {
    const response = await this.apiService.post<{ success: boolean; data: any }>('/stripe/create-payment-intent', data);
    return response;
  }

  /**
   * Confirm payment
   */
  async confirmPayment(data: {
    paymentIntentId: string;
    subscriptionId: string;
  }) {
    const response = await this.apiService.post<{ success: boolean; data: any }>('/stripe/confirm-payment', data);
    return response;
  }
}

export const paymentService = new PaymentService();

