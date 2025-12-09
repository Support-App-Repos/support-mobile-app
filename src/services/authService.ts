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
    firstName: string;
    lastName: string;
  }): Promise<SignupResponse> {
    try {
      // Send email, password, firstName, and lastName
      const payload = {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
      };
      
      const response = await apiService.post<SignupResponse>('/auth/signup', payload, true);
      const responseData = response.data as any;
      
      if (response.success && responseData) {
        if (responseData.token) {
          await Storage.setItem(STORAGE_KEYS.USER_TOKEN, responseData.token);
        }
        if (responseData.user) {
          await Storage.setObject(STORAGE_KEYS.USER_DATA, responseData.user);
        }
        
        // Return the data with success flag
        return {
          success: responseData.success ?? response.success,
          token: responseData.token,
          user: responseData.user,
          message: responseData.message || response.message,
        };
      }
      
      // If response is not successful, return error
      return {
        success: false,
        message: responseData?.message || response.message || 'Registration failed',
      };
    } catch (error: any) {
      if (__DEV__) {
        console.error('[Auth] Signup error:', error);
      }
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
      
      // Axios wraps the response in response.data
      const responseData = response.data as any;
      
      if (response.success && responseData?.token) {
        await Storage.setItem(STORAGE_KEYS.USER_TOKEN, responseData.token);
        if (responseData.user) {
          await Storage.setObject(STORAGE_KEYS.USER_DATA, responseData.user);
        }
      }
      
      return responseData || response.data;
    } catch (error) {
      if (__DEV__) {
        console.error('[Auth] Signin error:', error);
      }
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
      if (__DEV__) {
        console.error('[Auth] Send OTP error:', error);
      }
      throw error;
    }
  }

  /**
   * Verify OTP
   */
  async verifyOTP(phone: string, otp: string, flow: 'login' | 'register' = 'login'): Promise<LoginResponse> {
    try {
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
      if (__DEV__) {
        console.error('[Auth] Verify OTP error:', error);
      }
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
      const response = await apiService.post<SignupResponse>('/auth/register-with-otp', data, true);
      
      if (response.success && response.data.token) {
        await Storage.setItem(STORAGE_KEYS.USER_TOKEN, response.data.token);
        if (response.data.user) {
          await Storage.setObject(STORAGE_KEYS.USER_DATA, response.data.user);
        }
      }
      
      return response.data;
    } catch (error) {
      if (__DEV__) {
        console.error('[Auth] Register with OTP error:', error);
      }
      throw error;
    }
  }

  /**
   * Forgot password
   */
  async forgotPassword(email: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await apiService.post<{ success: boolean; message?: string }>('/auth/forgetPassword', {
        email,
      }, true);
      return response.data;
    } catch (error) {
      if (__DEV__) {
        console.error('[Auth] Forgot password error:', error);
      }
      throw error;
    }
  }

  /**
   * Reset password
   */
  async resetPassword(email: string, newPassword: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await apiService.post<{ success: boolean; message?: string }>('/auth/reset-password', {
        email,
        newPassword,
      }, true);
      return response.data;
    } catch (error) {
      if (__DEV__) {
        console.error('[Auth] Reset password error:', error);
      }
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
      if (__DEV__) {
        console.error('[Auth] Logout error:', error);
      }
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




