/**
 * Authentication service
 */

import { apiService } from './api';
import { Storage } from '../utils/storage';
import { STORAGE_KEYS } from '../constants';
import { LoginResponse, SignupResponse, OTPResponse } from '../types';

class AuthService {
  /**
   * Sign up with email and password
   */
  async signup(data: {
    email: string;
    password: string;
    username: string;
    phone?: string;
    location?: string;
  }): Promise<SignupResponse> {
    try {
      // Skip auth for signup endpoint
      const response = await apiService.post<SignupResponse>('/auth/signup', data, true);
      
      console.log('Signup API Response:', {
        success: response.success,
        hasData: !!response.data,
        hasToken: !!response.data?.token,
        hasUser: !!response.data?.user,
        data: response.data,
      });
      
      // The API returns { success, token, user, message } directly
      // response.data contains the SignupResponse
      if (response.success && response.data) {
        if (response.data.token) {
          await Storage.setItem(STORAGE_KEYS.USER_TOKEN, response.data.token);
        }
        if (response.data.user) {
          await Storage.setObject(STORAGE_KEYS.USER_DATA, response.data.user);
        }
        
        // Return the data with success flag
        return {
          success: response.data.success ?? response.success,
          token: response.data.token,
          user: response.data.user,
          message: response.data.message || response.message,
        };
      }
      
      // If response is not successful, return error
      return {
        success: false,
        message: response.data?.message || response.message || 'Registration failed',
      };
    } catch (error: any) {
      console.error('Signup error:', error);
      throw error;
    }
  }

  /**
   * Sign in with email and password
   */
  async signin(email: string, password: string): Promise<LoginResponse> {
    try {
      // Skip auth for signin endpoint
      const response = await apiService.post<LoginResponse>('/auth/signin', {
        email,
        password,
      }, true);
      
      if (response.success && response.data.token) {
        await Storage.setItem(STORAGE_KEYS.USER_TOKEN, response.data.token);
        if (response.data.user) {
          await Storage.setObject(STORAGE_KEYS.USER_DATA, response.data.user);
        }
      }
      
      return response.data;
    } catch (error) {
      console.error('Signin error:', error);
      throw error;
    }
  }

  /**
   * Send OTP to phone number
   */
  async sendOTP(phone: string): Promise<OTPResponse> {
    try {
      // Skip auth for send-otp endpoint
      const response = await apiService.post<OTPResponse>('/auth/send-otp', { phone }, true);
      return response.data;
    } catch (error) {
      console.error('Send OTP error:', error);
      throw error;
    }
  }

  /**
   * Verify OTP
   */
  async verifyOTP(phone: string, otp: string, flow: 'login' | 'register' = 'login'): Promise<LoginResponse> {
    try {
      // Skip auth for verify-otp endpoint
      const response = await apiService.post<LoginResponse>('/auth/verify-otp', {
        phone,
        otp,
        flow,
      }, true);
      
      if (response.success && response.data.token) {
        await Storage.setItem(STORAGE_KEYS.USER_TOKEN, response.data.token);
        if (response.data.user) {
          await Storage.setObject(STORAGE_KEYS.USER_DATA, response.data.user);
        }
      }
      
      return response.data;
    } catch (error) {
      console.error('Verify OTP error:', error);
      throw error;
    }
  }

  /**
   * Register with OTP (set password after OTP verification)
   */
  async registerWithOTP(data: {
    phone: string;
    password: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  }): Promise<SignupResponse> {
    try {
      // Skip auth for register-with-otp endpoint
      const response = await apiService.post<SignupResponse>('/auth/register-with-otp', data, true);
      
      if (response.success && response.data.token) {
        await Storage.setItem(STORAGE_KEYS.USER_TOKEN, response.data.token);
        if (response.data.user) {
          await Storage.setObject(STORAGE_KEYS.USER_DATA, response.data.user);
        }
      }
      
      return response.data;
    } catch (error) {
      console.error('Register with OTP error:', error);
      throw error;
    }
  }

  /**
   * Forgot password
   */
  async forgotPassword(email: string): Promise<{ success: boolean; message?: string }> {
    try {
      // Skip auth for forgot password endpoint
      const response = await apiService.post<{ success: boolean; message?: string }>('/auth/forgetPassword', {
        email,
      }, true);
      return response.data;
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  }

  /**
   * Reset password
   */
  async resetPassword(email: string, newPassword: string): Promise<{ success: boolean; message?: string }> {
    try {
      // Skip auth for reset password endpoint (if using token, it should be in the body/query, not header)
      const response = await apiService.post<{ success: boolean; message?: string }>('/auth/reset-password', {
        email,
        newPassword,
      }, true);
      return response.data;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }

  /**
   * Logout
   */
  async logout(): Promise<void> {
    try {
      await apiService.post('/auth/logout', {});
      await Storage.removeItem(STORAGE_KEYS.USER_TOKEN);
      await Storage.removeItem(STORAGE_KEYS.USER_DATA);
    } catch (error) {
      console.error('Logout error:', error);
      // Clear storage even if API call fails
      await Storage.removeItem(STORAGE_KEYS.USER_TOKEN);
      await Storage.removeItem(STORAGE_KEYS.USER_DATA);
    }
  }

  /**
   * Get current user token
   */
  async getToken(): Promise<string | null> {
    return await Storage.getItem(STORAGE_KEYS.USER_TOKEN);
  }

  /**
   * Get current user data
   */
  async getUser(): Promise<any | null> {
    return await Storage.getObject(STORAGE_KEYS.USER_DATA);
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return !!token;
  }
}

export const authService = new AuthService();



