/**
 * Application constants
 */

import {
  API_BASE_URL,
  API_BASE_URL_ANDROID,
  API_BASE_URL_IOS,
  API_TIMEOUT,
  APP_NAME,
  APP_VERSION,
} from '@env';
import { Platform } from 'react-native';

// API Configuration
// Automatically detects platform and uses appropriate URL
const getBaseURL = () => {
  if (__DEV__) {
    // Use platform-specific URLs from .env
    // For Android emulator, use API_BASE_URL_ANDROID
    // For iOS simulator, use API_BASE_URL_IOS
    // Fallback to API_BASE_URL
    let baseURL: string;
    if (Platform.OS === 'android') {
      baseURL = API_BASE_URL_ANDROID || API_BASE_URL || 'http://10.0.2.2:3000/api';
    } else {
      baseURL = API_BASE_URL_IOS || API_BASE_URL || 'http://localhost:3000/api';
    }
    
    // Log the API URL being used (helpful for debugging)
    console.log(`[API Config] Platform: ${Platform.OS}, Base URL: ${baseURL}`);
    
    return baseURL;
  }
  const prodURL = API_BASE_URL || 'https://api.production.com/api';
  console.log(`[API Config] Production Base URL: ${prodURL}`);
  return prodURL;
};

export const API_CONFIG = {
  BASE_URL: getBaseURL(),
  TIMEOUT: parseInt(API_TIMEOUT || '10000', 10),
} as const;

// App Configuration
export const APP_CONFIG = {
  NAME: APP_NAME || 'SupportMobileApp',
  VERSION: APP_VERSION || '0.0.1',
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  USER_TOKEN: '@user_token',
  USER_DATA: '@user_data',
  THEME: '@theme',
} as const;

// Screen Names
export const SCREENS = {
  HOME: 'Home',
  // Add more screen names as needed
} as const;

// Add more constants as needed

