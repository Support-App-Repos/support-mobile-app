/**
 * API service for making HTTP requests using Axios
 */

import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import { API_CONFIG, STORAGE_KEYS } from '../constants';
import { ApiResponse } from '../types';
import { Storage } from '../utils/storage';

export class ApiService {
  private baseURL: string;
  private axiosInstance: AxiosInstance;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;

    // Create axios instance with default config
    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Request interceptor to add auth token and ensure headers
    this.axiosInstance.interceptors.request.use(
      async (config: any) => {
        // Ensure Content-Type and Accept headers are always set
        if (!config.headers) {
          config.headers = {};
        }
        config.headers['Content-Type'] = config.headers['Content-Type'] || 'application/json';
        config.headers['Accept'] = config.headers['Accept'] || 'application/json';
        
        // Only add token if skipAuth is not set
        if (!config.skipAuth) {
          const token = await Storage.getItem(STORAGE_KEYS.USER_TOKEN);
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } else {
          // Remove Authorization header for public routes
          delete config.headers.Authorization;
        }
        
        // Remove skipAuth from config before sending (it's not a valid axios config)
        delete config.skipAuth;
        
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => {
        return response;
      },
      (error: AxiosError) => {
      // Handle network errors
      if (!error.response) {
        if (__DEV__) {
          console.error('[API] Network Error:', error.message);
        }
        return Promise.reject(new Error('Network error: Unable to connect to server. Please check your internet connection and ensure the backend is running.'));
      }
      
      if (__DEV__) {
        console.error('[API] Error Response:', {
          status: error.response.status,
          statusText: error.response.statusText,
          url: error.config?.url,
        });
      }
        
        // Handle 401 errors - extract actual error message from backend
        if (error.response.status === 401) {
          const errorData = error.response.data as any;
          const message = errorData?.message || errorData?.error || 'Authentication failed. Please check your credentials.';
          return Promise.reject(new Error(message));
        }
        
        // Handle other HTTP errors
        const errorData = error.response.data as any;
        const message = errorData?.message || errorData?.error || error.message || `Request failed: ${error.response.status} ${error.response.statusText}`;
        return Promise.reject(new Error(message));
      }
    );
  }


  /**
   * Make a GET request
   */
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.get<T>(endpoint);
      return {
        data: response.data,
        success: true,
        message: (response.data as any)?.message || 'Success',
      };
    } catch (error: any) {
      if (__DEV__) {
        console.error('[API] GET Error:', error);
      }
      throw error;
    }
  }

  /**
   * Make a POST request
   */
  async post<T>(endpoint: string, body: unknown, skipAuth: boolean = false): Promise<ApiResponse<T>> {
    try {
      const config: any = {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      };
      
      // Mark as skipAuth so interceptor knows not to add token
      if (skipAuth) {
        config.skipAuth = true;
      }

      const response = await this.axiosInstance.post<T>(endpoint, body, config);

      return {
        data: response.data,
        success: true,
        message: (response.data as any)?.message || 'Success',
      };
    } catch (error: any) {
      if (__DEV__) {
        console.error('[API] POST Error:', {
          message: error.message,
          endpoint,
          status: error.response?.status,
        });
      }
      throw error;
    }
  }

  /**
   * Make a PUT request
   */
  async put<T>(endpoint: string, body: unknown): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.put<T>(endpoint, body, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      return {
        data: response.data,
        success: true,
        message: (response.data as any)?.message || 'Success',
      };
    } catch (error: any) {
      if (__DEV__) {
        console.error('[API] PUT Error:', error);
      }
      throw error;
    }
  }

  /**
   * Make a DELETE request
   */
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.delete<T>(endpoint, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      return {
        data: response.data,
        success: true,
        message: (response.data as any)?.message || 'Success',
      };
    } catch (error: any) {
      if (__DEV__) {
        console.error('[API] DELETE Error:', error);
      }
      throw error;
    }
  }
}

export const apiService = new ApiService();



