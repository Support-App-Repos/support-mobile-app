/**
 * API service for making HTTP requests
 */

import { API_CONFIG, STORAGE_KEYS } from '../constants';
import { ApiResponse } from '../types';
import { Storage } from '../utils/storage';

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    console.log('[ApiService] Initialized with base URL:', this.baseURL);
  }

  /**
   * Get authentication token from storage
   */
  private async getToken(): Promise<string | null> {
    return await Storage.getItem(STORAGE_KEYS.USER_TOKEN);
  }

  /**
   * Get headers with authentication token
   */
  private async getHeaders(): Promise<HeadersInit> {
    const token = await this.getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Parse JSON response safely
   */
  private async parseJSONResponse<T>(response: Response): Promise<T> {
    // Clone response to read it without consuming the stream
    const clonedResponse = response.clone();
    const text = await clonedResponse.text();
    
    if (!text || text.trim() === '') {
      console.warn('Empty response body');
      return {} as T;
    }
    
    try {
      return JSON.parse(text);
    } catch (error) {
      console.error('JSON Parse Error:', error, 'Response text:', text.substring(0, 200));
      throw new Error(`JSON Parse error: ${error instanceof Error ? error.message : 'Unexpected end of input'}`);
    }
  }

  /**
   * Make a GET request
   */
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const headers = await this.getHeaders();
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'GET',
        headers,
      });

      const data = await this.parseJSONResponse<T>(response);
      return {
        data,
        success: response.ok,
        message: data?.message || (response.ok ? 'Success' : 'Request failed'),
      };
    } catch (error) {
      console.error('API GET Error:', error);
      throw error;
    }
  }

  /**
   * Make a POST request
   */
  async post<T>(endpoint: string, body: unknown, skipAuth: boolean = false): Promise<ApiResponse<T>> {
    try {
      // For signup/login endpoints, don't include auth token
      const headers = skipAuth 
        ? { 'Content-Type': 'application/json' }
        : await this.getHeaders();
      
      const url = `${this.baseURL}${endpoint}`;
      
      console.log('API POST Request:', {
        url,
        endpoint,
        body: JSON.stringify(body),
        headers: JSON.stringify(headers),
        skipAuth,
        baseURL: this.baseURL,
      });
      
      // Log headers separately for debugging
      console.log('Request Headers:', headers);

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      console.log('API POST Response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        url: response.url,
        headers: Object.fromEntries(response.headers.entries()),
      });

      // Handle 401 specifically - must read response before parsing (response can only be read once)
      if (response.status === 401) {
        let errorText = '';
        let errorData: any = {};
        
        try {
          errorText = await response.text();
          console.error('401 Unauthorized Error Response:', errorText);
          
          if (errorText) {
            try {
              errorData = JSON.parse(errorText);
            } catch {
              // If not JSON, use the text as message
              errorData = { message: errorText };
            }
          }
        } catch (e) {
          console.error('Error reading 401 response:', e);
          errorData = { message: 'Unauthorized: Please check your credentials' };
        }
        
        const errorMessage = errorData.message || errorData.error || 'Authentication failed: Please check your credentials or contact support';
        throw new Error(errorMessage);
      }

      // Only parse JSON if not 401 (response stream already consumed for 401)
      const data = await this.parseJSONResponse<T>(response);
      
      console.log('API POST Parsed Data:', data);

      return {
        data,
        success: response.ok,
        message: data?.message || (response.ok ? 'Success' : `Request failed: ${response.status} ${response.statusText}`),
      };
    } catch (error: any) {
      console.error('API POST Error Details:', {
        message: error.message,
        stack: error.stack,
        endpoint,
        baseURL: this.baseURL,
      });
      
      // Handle network errors
      if (error.message?.includes('Network request failed') || error.message?.includes('Failed to fetch')) {
        throw new Error('Network error: Unable to connect to server. Please check your internet connection and ensure the API server is running.');
      }
      
      throw error;
    }
  }

  /**
   * Make a PUT request
   */
  async put<T>(endpoint: string, body: unknown): Promise<ApiResponse<T>> {
    try {
      const headers = await this.getHeaders();
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(body),
      });

      const data = await this.parseJSONResponse<T>(response);
      return {
        data,
        success: response.ok,
        message: data?.message || (response.ok ? 'Success' : 'Request failed'),
      };
    } catch (error) {
      console.error('API PUT Error:', error);
      throw error;
    }
  }

  /**
   * Make a DELETE request
   */
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const headers = await this.getHeaders();
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'DELETE',
        headers,
      });

      const data = await this.parseJSONResponse<T>(response);
      return {
        data,
        success: response.ok,
        message: data?.message || (response.ok ? 'Success' : 'Request failed'),
      };
    } catch (error) {
      console.error('API DELETE Error:', error);
      throw error;
    }
  }
}

export const apiService = new ApiService();



