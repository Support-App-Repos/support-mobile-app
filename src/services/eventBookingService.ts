import { ApiService } from './api';

export type EventBooking = {
  id: string;
  storeId?: string | null;
  listingId: string;
  eventTitle: string;
  eventPrice: number;
  currency?: string | null;
  priceType?: string | null;
  eventDate?: string | null;
  eventTime?: string | null;
  location?: string | null;
  ticketQuantity: number;
  totalAmount: number;
  status: string;
};

class EventBookingService {
  private apiService = new ApiService();

  async createBooking(body: {
    listingId: string;
    ticketQuantity: number;
    storeId?: string | null;
  }) {
    return this.apiService.post<{ success: boolean; data: EventBooking }>(
      '/event-bookings',
      body,
    );
  }

  async getBooking(id: string) {
    return this.apiService.get<{ success: boolean; data: EventBooking }>(
      `/event-bookings/${id}`,
    );
  }
}

export const eventBookingService = new EventBookingService();
