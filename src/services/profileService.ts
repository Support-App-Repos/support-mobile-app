/**
 * Profile Service
 * Handles profile-related API calls
 */

import { ApiService } from './api';

class ProfileService {
  private apiService: ApiService;

  constructor() {
    this.apiService = new ApiService();
  }

  /**
   * Get user profile
   */
  async getProfile() {
    return this.apiService.get<{ success: boolean; data: any }>('/profile');
  }

  /**
   * Get browsing history
   */
  async getBrowsingHistory(params?: { page?: number; limit?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/profile/browsing-history?${queryString}` : '/profile/browsing-history';
    
    return this.apiService.get<{ success: boolean; data: any[]; pagination?: any }>(endpoint);
  }

  /**
   * Get wishlist
   */
  async getWishlist() {
    return this.apiService.get<{ success: boolean; data: any[] }>('/profile/wishlist');
  }

  /**
   * Add to wishlist
   */
  async addToWishlist(listingId: string) {
    return this.apiService.post<{ success: boolean; data: any }>('/profile/wishlist', { listingId });
  }

  /**
   * Remove from wishlist
   */
  async removeFromWishlist(listingId: string) {
    return this.apiService.delete<{ success: boolean }>(`/profile/wishlist/${listingId}`);
  }

  /**
   * Get user's listings
   */
  async getMyListings(params?: { status?: string; page?: number; limit?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/profile/listings?${queryString}` : '/profile/listings';
    
    return this.apiService.get<{ success: boolean; data: any[]; pagination?: any }>(endpoint);
  }

  /**
   * Update user profile
   */
  async updateProfile(data: {
    firstName?: string;
    lastName?: string;
    fullName?: string; // For backward compatibility
    email?: string;
    phoneNumber?: string;
    profileImage?: string;
    profileImageUrl?: string; // For backward compatibility
  }) {
    return this.apiService.put<{ success: boolean; data: any; message?: string }>('/profile', data);
  }

  /**
   * Delete user account
   */
  async deleteAccount() {
    return this.apiService.delete<{ success: boolean; message?: string }>('/profile');
  }
}

export const profileService = new ProfileService();


