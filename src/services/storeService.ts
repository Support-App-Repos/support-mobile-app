/**
 * Store Service
 * Handles store-related API calls
 */

import { ApiService } from './api';
import type { Store, StoreDashboard, StoreReview } from '../types';

class StoreService {
  private apiService = new ApiService();

  async getMyStore() {
    return this.apiService.get<{ success: boolean; data: Store | null }>('/stores/me');
  }

  async createStore(data: Partial<Store>) {
    return this.apiService.post<{ success: boolean; data: Store }>('/stores', data);
  }

  async updateStore(id: string, data: Partial<Store>) {
    return this.apiService.put<{ success: boolean; data: Store }>(`/stores/${id}`, data);
  }

  async getStoreById(id: string) {
    return this.apiService.get<{ success: boolean; data: Store }>(`/stores/${id}`);
  }

  async getStoreListings(id: string, params?: { page?: number; limit?: number; status?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    const qs = queryParams.toString();
    const endpoint = qs ? `/stores/${id}/listings?${qs}` : `/stores/${id}/listings`;
    return this.apiService.get<{ success: boolean; data: any[]; pagination?: any }>(endpoint);
  }

  async getStoreReviews(id: string, params?: { page?: number; limit?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    const qs = queryParams.toString();
    const endpoint = qs ? `/stores/${id}/reviews?${qs}` : `/stores/${id}/reviews`;
    return this.apiService.get<{ success: boolean; data: StoreReview[]; pagination?: any }>(endpoint);
  }

  async getStoreDashboard() {
    return this.apiService.get<{ success: boolean; data: StoreDashboard }>('/stores/me/dashboard');
  }

  async submitVerification(
    storeId: string,
    documents: Array<{ documentUrl: string; documentType?: string }>
  ) {
    return this.apiService.post<{ success: boolean; data: Store }>(
      `/stores/${storeId}/verification`,
      { documents }
    );
  }
}

export const storeService = new StoreService();
