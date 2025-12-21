/**
 * Category Service
 * Handles category-related API calls
 */

import { ApiService } from './api';

class CategoryService {
  private apiService: ApiService;

  constructor() {
    this.apiService = new ApiService();
  }

  /**
   * Get all categories
   */
  async getCategories() {
    return this.apiService.get<{ success: boolean; data: any[] }>('/categories');
  }

  /**
   * Get event types
   */
  async getEventTypes() {
    return this.apiService.get<{ success: boolean; data: any[] }>('/event-types');
  }

  /**
   * Get service types
   */
  async getServiceTypes() {
    return this.apiService.get<{ success: boolean; data: any[] }>('/service-types');
  }
}

export const categoryService = new CategoryService();


