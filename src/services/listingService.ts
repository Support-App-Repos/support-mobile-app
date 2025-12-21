/**
 * Listing Service
 * Handles listing-related API calls
 */

import { ApiService } from './api';

class ListingService {
  private apiService: ApiService;

  constructor() {
    this.apiService = new ApiService();
  }

  /**
   * Get all listings with filters
   */
  async getListings(params?: {
    categoryId?: string;
    status?: string;
    minPrice?: number;
    maxPrice?: number;
    location?: string;
    page?: number;
    limit?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.categoryId) queryParams.append('categoryId', params.categoryId);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.minPrice) queryParams.append('minPrice', params.minPrice.toString());
    if (params?.maxPrice) queryParams.append('maxPrice', params.maxPrice.toString());
    if (params?.location) queryParams.append('location', params.location);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/listings?${queryString}` : '/listings';
    
    return this.apiService.get<{ success: boolean; data: any[]; pagination?: any }>(endpoint);
  }

  /**
   * Get listing by ID
   */
  async getListingById(id: string) {
    return this.apiService.get<{ success: boolean; data: any }>(`/listings/${id}`);
  }

  /**
   * Create a new listing
   */
  async createListing(data: {
    title: string;
    description: string;
    price?: number;
    priceType?: string;
    location: string;
    city?: string;
    venue?: string;
    categoryId: string;
    eventTypeId?: string;
    serviceTypeId?: string;
    // Event fields
    eventDate?: string;
    eventTime?: string;
    duration?: string;
    maxCapacity?: number;
    organizerName?: string;
    organizerContact?: string;
    organizerEmail?: string;
    tags?: string;
    // Service fields
    businessName?: string;
    specialization?: string;
    yearsOfExperience?: number;
    // Property fields
    bedrooms?: number;
    bathrooms?: number;
    squareFeet?: number;
    yearBuilt?: number;
    // Photos
    photos?: string[];
    // Regions
    regionIds?: string[];
  }) {
    return this.apiService.post<{ success: boolean; data: any }>('/listings', data);
  }

  /**
   * Update listing
   */
  async updateListing(id: string, data: any) {
    return this.apiService.put<{ success: boolean; data: any }>(`/listings/${id}`, data);
  }

  /**
   * Publish listing
   */
  async publishListing(id: string) {
    return this.apiService.post<{ success: boolean; data: any }>(`/listings/${id}/publish`, {});
  }
}

export const listingService = new ListingService();


