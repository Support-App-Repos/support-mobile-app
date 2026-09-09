/**
 * Upload Service
 * Handles image uploads to the backend (React Native FormData + fetch)
 */

import { launchImageLibrary, ImagePickerResponse, MediaType } from 'react-native-image-picker';
import { Platform } from 'react-native';
import { API_CONFIG, STORAGE_KEYS } from '../constants';
import { Storage } from '../utils/storage';

export interface PickedImage {
  uri: string;
  type?: string;
  fileName?: string;
}

export interface UploadedImage {
  url: string;
  originalName: string;
  size: number;
  mimetype: string;
  index: number;
}

export interface UploadImagesResponse {
  images: UploadedImage[];
  count: number;
}

const PICKER_OPTIONS = {
  mediaType: 'photo' as MediaType,
  quality: 0.8 as const,
  maxWidth: 2048,
  maxHeight: 2048,
  includeBase64: false,
  /** iOS: prefer JPEG-compatible representation for HEIC assets */
  assetRepresentationMode: 'compatible' as const,
};

/**
 * Open image picker and select images (returns local URIs with metadata)
 */
export const pickImages = (selectionLimit = 6): Promise<PickedImage[]> => {
  return new Promise((resolve, reject) => {
    launchImageLibrary(
      {
        ...PICKER_OPTIONS,
        selectionLimit,
      },
      (response: ImagePickerResponse) => {
        if (response.didCancel) {
          resolve([]);
          return;
        }

        if (response.errorMessage) {
          reject(new Error(response.errorMessage));
          return;
        }

        if (response.assets && response.assets.length > 0) {
          const images = response.assets
            .map((asset) => ({
              uri: asset.uri || '',
              type: asset.type || undefined,
              fileName: asset.fileName || undefined,
            }))
            .filter((asset) => asset.uri);
          resolve(images);
        } else {
          resolve([]);
        }
      }
    );
  });
};

/** Pick a single image (logo, cover, profile photo, etc.) */
export const pickSingleImage = (): Promise<PickedImage | null> =>
  pickImages(1).then((images) => images[0] || null);

function normalizeMimeType(type?: string, fileName?: string): string {
  if (type) {
    const normalized = type.toLowerCase().trim();
    if (normalized === 'image/jpg' || normalized === 'jpg' || normalized === 'jpeg') {
      return 'image/jpeg';
    }
    if (normalized === 'image/heic' || normalized === 'image/heif') {
      return 'image/jpeg';
    }
    if (
      normalized === 'image/jpeg' ||
      normalized === 'image/png' ||
      normalized === 'image/gif' ||
      normalized === 'image/webp'
    ) {
      return normalized;
    }
    if (normalized.startsWith('image/')) {
      return 'image/jpeg';
    }
  }

  const ext = fileName?.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'png':
      return 'image/png';
    case 'gif':
      return 'image/gif';
    case 'webp':
      return 'image/webp';
    case 'heic':
    case 'heif':
    case 'jpeg':
    case 'jpg':
    default:
      return 'image/jpeg';
  }
}

function extensionForMime(mime: string): string {
  switch (mime) {
    case 'image/png':
      return 'png';
    case 'image/gif':
      return 'gif';
    case 'image/webp':
      return 'webp';
    default:
      return 'jpg';
  }
}

function buildUploadFileName(index: number, fileName?: string, uri?: string, mime?: string): string {
  const resolvedMime = normalizeMimeType(mime, fileName);
  const ext = extensionForMime(resolvedMime);

  let base: string | null = null;
  if (fileName && /\.\w+$/.test(fileName)) {
    base = fileName;
  } else {
    const fromUri = uri?.split('/').pop()?.split('?')[0];
    if (fromUri && /\.\w+$/.test(fromUri)) {
      base = fromUri;
    }
  }

  if (base) {
    return base.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/\.\w+$/, `.${ext}`);
  }

  return `image-${Date.now()}-${index}.${ext}`;
}

function normalizeUploadUri(uri: string): string {
  if (!uri) return uri;
  if (Platform.OS === 'android' && uri.startsWith('/')) {
    return `file://${uri}`;
  }
  return uri;
}

export function toPickedImage(item: string | PickedImage): PickedImage {
  if (typeof item === 'string') {
    return { uri: item };
  }
  return item;
}

function getUploadErrorMessage(status?: number, data?: any, fallback?: string): string {
  if (typeof data === 'string' && data.trim()) {
    // Avoid dumping HTML error pages into the alert
    if (data.trim().startsWith('<')) {
      return status
        ? `Upload failed (${status}). Please try again.`
        : 'Upload failed. Please try again.';
    }
    return data;
  }
  if (data?.message) return data.message;
  if (data?.error) {
    return typeof data.error === 'string' ? data.error : data.error?.message || fallback || 'Upload failed';
  }
  if (status === 413) return 'Image is too large. Please choose a smaller photo.';
  if (status === 401) return 'Session expired. Please sign in again and retry.';
  if (status === 400) return fallback || 'Invalid image upload. Please try a JPG or PNG under 10MB.';
  return fallback || (status ? `Upload failed (${status})` : 'Failed to upload images');
}

/**
 * Upload images to backend via fetch (most reliable with RN FormData).
 */
export const uploadImages = async (
  images: Array<string | PickedImage>,
  folder: string = 'listings/'
): Promise<UploadedImage[]> => {
  if (!images || images.length === 0) {
    throw new Error('No images to upload');
  }

  const formData = new FormData();

  images.forEach((item, index) => {
    const picked = toPickedImage(item);
    if (!picked.uri) return;

    const type = normalizeMimeType(picked.type, picked.fileName || picked.uri);
    const name = buildUploadFileName(index, picked.fileName, picked.uri, type);
    const uri = normalizeUploadUri(picked.uri);

    formData.append('images', {
      uri,
      type,
      name,
    } as any);
  });

  if (folder) {
    formData.append('folder', folder);
  }

  const token = await Storage.getItem(STORAGE_KEYS.USER_TOKEN);
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  // Never set Content-Type — RN fetch adds multipart boundary automatically.

  const controller = new AbortController();
  const timeoutMs = 60000;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const url = `${API_CONFIG.BASE_URL}/upload/images`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
      signal: controller.signal,
    });

    const raw = await response.text();
    let data: any = null;
    try {
      data = raw ? JSON.parse(raw) : null;
    } catch {
      data = raw;
    }

    if (!response.ok) {
      throw new Error(getUploadErrorMessage(response.status, data));
    }

    if (data?.success && data?.data?.images) {
      return data.data.images as UploadedImage[];
    }

    throw new Error(data?.message || 'Invalid response from server');
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      throw new Error('Upload timed out. Please try a smaller image or check your connection.');
    }
    console.error('[Upload] Error uploading images:', {
      message: error?.message,
      url,
    });
    throw new Error(error?.message || 'Failed to upload images');
  } finally {
    clearTimeout(timeoutId);
  }
};

/**
 * Pick and upload images in one step
 */
export const pickAndUploadImages = async (
  folder: string = 'listings/'
): Promise<UploadedImage[]> => {
  const images = await pickImages();
  if (images.length === 0) {
    return [];
  }
  return uploadImages(images, folder);
};
