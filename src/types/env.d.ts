/**
 * Type definitions for environment variables
 */
declare module '@env' {
  export const API_BASE_URL: string;
  export const API_BASE_URL_ANDROID: string;
  export const API_BASE_URL_IOS: string;
  export const API_TIMEOUT: string;
  export const APP_NAME: string;
  export const APP_VERSION: string;
  export const STRIPE_PUBLISHABLE_KEY: string;
  /** OAuth 2.0 Web Client ID (Google Cloud Console) — required for Google Sign-In ID token */
  export const GOOGLE_WEB_CLIENT_ID: string;
  /** OAuth 2.0 iOS Client ID (Google Cloud Console) — required for iOS Google Sign-In without Firebase */
  export const GOOGLE_IOS_CLIENT_ID: string;
  export const GOOGLE_MAPS_API_KEY: string;
  export const GOOGLE_ANDROID_CERT_SHA1: string;
  export const GOOGLE_ANDROID_PACKAGE: string;
}





