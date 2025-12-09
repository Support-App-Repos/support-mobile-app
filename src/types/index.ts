/**
 * Global type definitions for the application
 */

// Navigation types
export type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Register: undefined;
  RegisterEmail: undefined;
  ForgotPassword: undefined;
  PasswordChanged: undefined;
  OTPVerification: {
    phoneNumber?: string;
    flow?: 'login';
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

// Add more type definitions as needed

