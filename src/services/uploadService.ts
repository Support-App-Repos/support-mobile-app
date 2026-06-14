/**
 * Upload Service
 * Handles image uploads to the backend
 */

import { launchImageLibrary, ImagePickerResponse, MediaType } from 'react-native-image-picker';
import axios from 'axios';
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

/**
 * Open image picker and select images (returns local URIs with metadata)
 */
export const pickImages = (selectionLimit = 6): Promise<PickedImage[]> => {
  return new Promise((resolve, reject) => {
    launchImageLibrary(
      {
        mediaType: 'photo' as MediaType,
        quality: 0.8,
        selectionLimit,
        includeBase64: false,
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
              type: asset.type,
              fileName: asset.fileName,
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
    const normalized = type.toLowerCase();
    if (normalized === 'image/jpg') return 'image/jpeg';
    if (normalized.startsWith('image/')) return normalized;
  }

  const ext = fileName?.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'png':
      return 'image/png';
    case 'gif':
      return 'image/gif';
    case 'webp':
      return 'image/webp';
    case 'jpeg':
    case 'jpg':
      return 'image/jpeg';
    default:
      return 'image/jpeg';
  }
}

function buildUploadFileName(index: number, fileName?: string, uri?: string): string {
  if (fileName && /\.\w+$/.test(fileName)) {
    return fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  }

  const fromUri = uri?.split('/').pop()?.split('?')[0];
  if (fromUri && /\.\w+$/.test(fromUri)) {
    return fromUri.replace(/[^a-zA-Z0-9._-]/g, '_');
  }

  return `image-${Date.now()}-${index}.jpg`;
}

function toPickedImage(item: string | PickedImage): PickedImage {
  if (typeof item === 'string') {
    return { uri: item };
  }
  return item;
}

/**
 * Upload images to backend
 * @param imageUris Array of local image URIs
 * @param folder Optional folder name in S3 (default: 'listings/')
 */
export const uploadImages = async (
  images: Array<string | PickedImage>,
  folder: string = 'listings/'
): Promise<UploadedImage[]> => {
  try {
    if (!images || images.length === 0) {
      throw new Error('No images to upload');
    }

    const formData = new FormData();

    images.forEach((item, index) => {
      const picked = toPickedImage(item);
      const uri =
        Platform.OS === 'ios' && picked.uri.startsWith('file://')
          ? picked.uri
          : picked.uri;
      const name = buildUploadFileName(index, picked.fileName, picked.uri);
      const type = normalizeMimeType(picked.type, name);

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
    const response = await axios.post(
      `${API_CONFIG.BASE_URL}/upload/images`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          Accept: 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        timeout: 60000,
      }
    );

    if (response.data?.success && response.data?.data?.images) {
      return response.data.data.images;
    }

    throw new Error(response.data?.message || 'Invalid response from server');
  } catch (error: any) {
    console.error('[Upload] Error uploading images:', error);
    const serverMessage = error.response?.data?.message;
    throw new Error(serverMessage || error.message || 'Failed to upload images');
  }
};

/**
 * Pick and upload images in one step
 */
export const pickAndUploadImages = async (
  folder: string = 'listings/'
): Promise<UploadedImage[]> => {
  try {
    const images = await pickImages();

    if (images.length === 0) {
      return [];
    }

    return uploadImages(images, folder);
  } catch (error: any) {
    console.error('[Upload] Error in pickAndUploadImages:', error);
    throw error;
  }
};

