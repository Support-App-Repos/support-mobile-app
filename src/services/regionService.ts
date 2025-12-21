/**
 * Region Service
 * Handles region-related API calls
 */

import { ApiService } from './api';

class RegionService {
  private apiService: ApiService;

  constructor() {
    this.apiService = new ApiService();
  }

  /**
   * Get all regions
   */
  async getRegions(search?: string) {
    const endpoint = search ? `/regions?search=${encodeURIComponent(search)}` : '/regions';
    return this.apiService.get<{ success: boolean; data: any[] }>(endpoint);
  }

  /**
   * Get user's recent regions
   */
  async getRecentRegions() {
    return this.apiService.get<{ success: boolean; data: any[] }>('/regions/recent');
  }

  /**
   * Add region to recent
   */
  async addRecentRegion(regionId: string) {
    return this.apiService.post<{ success: boolean }>('/regions/recent', { regionId });
  }
}

export const regionService = new RegionService();


