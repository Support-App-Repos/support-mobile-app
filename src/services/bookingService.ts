import { ApiService } from './api';

export type ServiceAddon = {
  id: string;
  listingId: string;
  storeId?: string | null;
  name: string;
  description?: string | null;
  price: number;
  icon?: string | null;
  isActive: boolean;
  sortOrder?: number;
};

export type ServiceBooking = {
  id: string;
  storeId: string;
  listingId: string;
  serviceTitle: string;
  servicePrice: number;
  currency?: string | null;
  priceType?: string | null;
  duration?: string | null;
  appointmentDate: string;
  appointmentTime: string;
  addonIds: string[];
  addonsSnapshot: Array<{ id: string; name: string; price: number }>;
  addonsTotal: number;
  totalAmount: number;
  status: string;
};

class BookingService {
  private apiService = new ApiService();

  async getStoreServiceListings(storeId: string, highlightListingId?: string) {
    const qs = highlightListingId
      ? `?highlightListingId=${encodeURIComponent(highlightListingId)}`
      : '';
    return this.apiService.get<{
      success: boolean;
      data: {
        store: any;
        listings: any[];
        highlightListingId: string | null;
      };
    }>(`/stores/${storeId}/service-listings${qs}`);
  }

  async getAddons(listingId: string, all = false) {
    const qs = all ? '?all=1' : '';
    return this.apiService.get<{ success: boolean; data: ServiceAddon[] }>(
      `/listings/${listingId}/addons${qs}`,
    );
  }

  async createAddon(
    listingId: string,
    body: {
      name: string;
      description?: string;
      price: number;
      icon?: string;
      isActive?: boolean;
      sortOrder?: number;
    },
  ) {
    return this.apiService.post<{ success: boolean; data: ServiceAddon }>(
      `/listings/${listingId}/addons`,
      body,
    );
  }

  async updateAddon(
    listingId: string,
    addonId: string,
    body: Partial<{
      name: string;
      description: string | null;
      price: number;
      icon: string | null;
      isActive: boolean;
      sortOrder: number;
    }>,
  ) {
    return this.apiService.put<{ success: boolean; data: ServiceAddon }>(
      `/listings/${listingId}/addons/${addonId}`,
      body,
    );
  }

  async deleteAddon(listingId: string, addonId: string) {
    return this.apiService.delete<{ success: boolean; message?: string }>(
      `/listings/${listingId}/addons/${addonId}`,
    );
  }

  async createBooking(body: {
    storeId: string;
    listingId: string;
    appointmentDate: string;
    appointmentTime: string;
    addonIds?: string[];
  }) {
    return this.apiService.post<{ success: boolean; data: ServiceBooking }>(
      '/bookings',
      body,
    );
  }

  async getBooking(id: string) {
    return this.apiService.get<{ success: boolean; data: ServiceBooking }>(
      `/bookings/${id}`,
    );
  }
}

export const bookingService = new BookingService();
