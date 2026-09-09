/**
 * Global type definitions for the application
 */

// Navigation types
export type RootStackParamList = {
  Home: undefined;
  MarketplaceSearch: {
    initialQuery?: string;
  };
  Login: undefined;
  Register: undefined;
  RegisterEmail: undefined;
  ForgotPassword: undefined;
  PasswordChanged: undefined;
  OTPVerification: {
    phoneNumber?: string;
    flow?: 'login';
  };
  SelectCategory: undefined;
  ProductListing: {
    category?: string;
  };
  SelectEventType: {
    category?: string;
  };
  EventListing: {
    category?: string;
    eventType?: string;
  };
  SelectServiceType: {
    category?: string;
    categoryId?: string;
  };
  ServiceListing: {
    category?: string;
    serviceType?: string;
  };
  PropertyListing: {
    category?: string;
  };
  Payment: {
    listingData?: any;
  };
  SelectRegion: {
    listingData?: any;
    paymentData?: any;
  };
  Review: {
    listingData?: any;
    paymentData?: any;
    regionData?: any;
  };
  Publish: {
    listingId?: string;
  };
  Profile: undefined;
  EditProfile: {
    user?: any;
  };
  MyListings: undefined;
  Store: undefined;
  CreateStore: { edit?: boolean } | undefined;
  StoreDashboard: undefined;
  StoreProfile: { storeId?: string } | undefined;
  ManageStoreListings: undefined;
  StoreBookings: undefined;
  StoreVerifiedSuccess: { storeName?: string } | undefined;
  StoreAnalytics: undefined;
  StoreListingsAll: { storeId: string; storeName?: string };
  ListingDetail: {
    listingId: string;
  };
  EventListingDetail: {
    listingId: string;
  };
  PropertyListingDetail: {
    listingId: string;
  };
  ServiceListingDetail: {
    listingId: string;
  };
  ChooseService: {
    storeId: string;
    listingId: string;
  };
  SelectBookingDateTime: {
    storeId: string;
    listingId: string;
    serviceTitle: string;
    servicePrice: number | null;
    currency?: string | null;
    priceType?: string | null;
    duration?: string | null;
    serviceImageUrl?: string | null;
    storeName?: string | null;
    storeLogoUrl?: string | null;
  };
  ServiceBookingAddOns: {
    storeId: string;
    listingId: string;
    serviceTitle: string;
    servicePrice: number | null;
    currency?: string | null;
    priceType?: string | null;
    duration?: string | null;
    serviceImageUrl?: string | null;
    storeName?: string | null;
    storeLogoUrl?: string | null;
    appointmentDate: string;
    appointmentTime: string;
  };
  BookingConfirmed: {
    bookingId: string;
  };
  EventBookTickets: {
    listingId: string;
    storeId?: string | null;
    eventTitle: string;
    eventPrice: number | null;
    currency?: string | null;
    priceType?: string | null;
    eventDate?: string | null;
    eventTime?: string | null;
    location?: string | null;
    eventImageUrl?: string | null;
  };
  EventBookingConfirmed: {
    bookingId: string;
  };
  // Add more screen params as needed
};

// Common types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

// Auth types
export interface LoginResponse {
  success: boolean;
  token?: string;
  user?: any;
  message?: string;
}

export interface SignupResponse {
  success: boolean;
  token?: string;
  user?: any;
  message?: string;
}

export interface OTPResponse {
  success: boolean;
  message?: string;
  otp?: string; // Only in development
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

// User types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface StoreWorkingHours {
  days: string[];
  open: string;
  close: string;
}

export interface Store {
  id: string;
  userId?: string;
  name: string;
  slug?: string;
  logoUrl?: string | null;
  coverImageUrl?: string | null;
  businessCategory: string;
  description?: string | null;
  address?: string | null;
  city?: string | null;
  location?: string | null;
  contactPhone?: string | null;
  contactEmail?: string | null;
  workingHours?: StoreWorkingHours | null;
  status?: string;
  verificationStatus?: string;
  isVerified?: boolean;
  ratingAverage?: number;
  reviewsCount?: number;
  viewsCount?: number;
  listingsCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface StoreReview {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  user?: {
    id: string;
    fullName: string;
    profileImageUrl?: string;
  } | null;
}

export interface StoreDashboard {
  store: Store;
  stats: {
    totalListings: number;
    activeListings: number;
    pausedListings: number;
    messages: number;
    views: number;
    ratingAverage: number;
    reviewsCount: number;
  };
  recentReviews: StoreReview[];
}

