/**
 * Upload Service
 * Handles image uploads to the backend
 */

import { launchImageLibrary, ImagePickerResponse, MediaType } from 'react-native-image-picker';
import axios from 'axios';
import { API_CONFIG, STORAGE_KEYS } from '../constants';
import { Storage } from '../utils/storage';

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
 * Open image picker and select images (returns local URIs, not uploaded)
 */
export const pickImages = (): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    launchImageLibrary(
      {
        mediaType: 'photo' as MediaType,
        quality: 0.8,
        selectionLimit: 6, // Max 6 images
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
          const imageUris = response.assets.map((asset) => asset.uri || '').filter(Boolean);
          resolve(imageUris);
        } else {
          resolve([]);
        }
      }
    );
  });
};

/**
 * Upload images to backend
 * @param imageUris Array of local image URIs
 * @param folder Optional folder name in S3 (default: 'listings/')
 */
export const uploadImages = async (
  imageUris: string[],
  folder: string = 'listings/'
): Promise<UploadedImage[]> => {
  try {
    if (!imageUris || imageUris.length === 0) {
      throw new Error('No images to upload');
    }

    // Create FormData
    const formData = new FormData();
    
    imageUris.forEach((uri, index) => {
      const filename = uri.split('/').pop() || `image-${index}.jpg`;
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('images', {
        uri: uri,
        type: type,
        name: filename,
      } as any);
    });

    // Add folder if provided
    if (folder) {
      formData.append('folder', folder);
    }

    // Upload to backend with FormData
    // Use axios directly for multipart/form-data
    const token = await Storage.getItem(STORAGE_KEYS.USER_TOKEN);
    const response = await axios.post(
      `${API_CONFIG.BASE_URL}/upload/images`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        timeout: 60000, // 60 seconds for file uploads
      }
    );

    if (response.data?.success && response.data?.data?.images) {
      return response.data.data.images;
    }

    throw new Error('Invalid response from server');
  } catch (error: any) {
    console.error('[Upload] Error uploading images:', error);
    throw new Error(error.message || 'Failed to upload images');
  }
};

/**
 * Pick and upload images in one step
 */
export const pickAndUploadImages = async (
  folder: string = 'listings/'
): Promise<UploadedImage[]> => {
  try {
    // Pick images
    const imageUris = await pickImages();
    
    if (imageUris.length === 0) {
      return [];
    }

    // Upload images
    const uploadedImages = await uploadImages(imageUris, folder);
    
    return uploadedImages;
  } catch (error: any) {
    console.error('[Upload] Error in pickAndUploadImages:', error);
    throw error;
  }
};

