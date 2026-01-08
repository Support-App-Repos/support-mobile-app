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
  // Always use environment variables, regardless of __DEV__ mode
  let baseURL: string;
  if (Platform.OS === 'android') {
    baseURL = API_BASE_URL_ANDROID || API_BASE_URL || 'http://13.62.185.179:3000/api';
  } else {
    baseURL = API_BASE_URL_IOS || API_BASE_URL || 'http://13.62.185.179:3000/api';
  }
  
  // Log the API URL being used (helpful for debugging)
  // if (__DEV__) {
  //   console.log(`[API Config] Platform: ${Platform.OS}, Base URL: ${baseURL}`);
  //   console.log(`[API Config] API_BASE_URL_ANDROID: ${API_BASE_URL_ANDROID || 'not set'}`);
  //   console.log(`[API Config] API_BASE_URL: ${API_BASE_URL || 'not set'}`);
  // }
  
  return baseURL;
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

