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
   * Create booking payment intent (platform charge for service/event)
   */
  async createBookingPaymentIntent(data: {
    type: 'service' | 'event' | 'product';
    listingId: string;
    addonIds?: string[];
    ticketQuantity?: number;
  }) {
    const response = await this.apiService.post<{
      success: boolean;
      message?: string;
      data: {
        clientSecret: string;
        paymentIntentId: string;
        amount: number;
        currency: string;
      };
    }>('/stripe/create-booking-payment-intent', data);
    return response;
  }

  /**
   * Create a paid product order after Stripe Payment Sheet succeeds
   */
  async createProductOrder(data: { listingId: string; paymentIntentId: string }) {
    const response = await this.apiService.post<{
      success: boolean;
      message?: string;
      data: {
        id: string;
        productTitle?: string | null;
        amount: number;
        currency: string | null;
        quantity?: number;
        status: string;
      };
    }>('/product-orders', data);
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

  /**
   * Check if user has a valid active subscription
   */
  async checkSubscriptionValidity() {
    const response = await this.apiService.get<{ 
      success: boolean; 
      data: { 
        hasValidSubscription: boolean; 
        subscription: any | null;
      } 
    }>('/stripe/check-subscription-validity');
    return response;
  }
}

export const paymentService = new PaymentService();
