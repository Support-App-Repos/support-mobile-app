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
    // Priority: API_BASE_URL_ANDROID/API_BASE_URL_IOS > API_BASE_URL > default
    let baseURL: string;
    if (Platform.OS === 'android') {
      // Use API_BASE_URL_ANDROID if set, otherwise use API_BASE_URL, otherwise default to localhost
      // Note: For Android emulator, you may need to use 10.0.2.2 instead of localhost
      // For physical Android devices, use your computer's IP address (e.g., http://192.168.1.100:3000/api)
      baseURL = API_BASE_URL_ANDROID || API_BASE_URL || 'http://localhost:3000/api';
    } else {
      baseURL = API_BASE_URL_IOS || API_BASE_URL || 'http://localhost:3000/api';
    }
    
    // Log the API URL being used (helpful for debugging)
    console.log(`[API Config] Platform: ${Platform.OS}, Base URL: ${baseURL}`);
    console.log(`[API Config] API_BASE_URL_ANDROID: ${API_BASE_URL_ANDROID || 'not set'}`);
    console.log(`[API Config] API_BASE_URL: ${API_BASE_URL || 'not set'}`);
    
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

// Legal Documents
export {
  TERMS_AND_CONDITIONS_CONTENT,
  PRIVACY_POLICY_CONTENT,
} from './legalDocuments';

// Legal Documents
export {
  TERMS_AND_CONDITIONS_CONTENT,
  PRIVACY_POLICY_CONTENT,
} from './legalDocuments';

// Add more constants as needed

