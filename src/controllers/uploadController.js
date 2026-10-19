/**
 * Upload Controller
 * Handles image uploads to S3 (AWS)
 */

const { uploadFileToS3 } = require('../helpers/uploadToS3');
const { BadRequest } = require('../helpers/errors');

/**
 * Upload single or multiple images
 * POST /api/upload/images
 * Content-Type: multipart/form-data
 * Body: files (array of images)
 */
exports.uploadImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded',
      });
    }

    // Validate file types
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/heic',
      'image/heif',
    ];
    const invalidFiles = req.files.filter(
      (file) => !allowedMimeTypes.includes(file.mimetype)
    );

    if (invalidFiles.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file type. Only JPEG, PNG, GIF, WebP, and HEIC images are allowed.',
      });
    }

    // Validate file sizes (max 10MB per file)
    const maxSize = 10 * 1024 * 1024; // 10MB
    const oversizedFiles = req.files.filter((file) => file.size > maxSize);

    if (oversizedFiles.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 10MB per file.',
      });
    }

    // Upload files to S3
    const uploadPromises = req.files.map(async (file, index) => {
      try {
        // Generate unique filename with timestamp
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const extension = file.originalname.split('.').pop();
        const folder = req.body.folder || 'listings/';
        const filename = `${timestamp}-${randomString}.${extension}`;

        const imageData = {
          buffer: file.buffer,
          originalname: filename,
          mimetype: file.mimetype,
          folder,
        };

        const fileUrl = await uploadFileToS3(imageData);
        return {
          url: fileUrl,
          originalName: file.originalname,
          size: file.size,
          mimetype: file.mimetype,
          index: index,
        };
      } catch (error) {
        console.error(`Error uploading file ${file.originalname}:`, error);
        throw new Error(`Failed to upload ${file.originalname}: ${error.message}`);
      }
    });

    const uploadedFiles = await Promise.all(uploadPromises);

    return res.status(200).json({
      success: true,
      message: 'Images uploaded successfully',
      data: {
        images: uploadedFiles,
        count: uploadedFiles.length,
      },
    });
  } catch (error) {
    console.error('[Upload] Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload images',
    });
  }
};

/**
 * Delete image from S3
 * DELETE /api/upload/images/:imageUrl
 */
exports.deleteImage = async (req, res) => {
  try {
    // TODO: Implement S3 delete if needed
    return res.status(200).json({
      success: true,
      message: 'Image deletion not implemented yet',
    });
  } catch (error) {
    console.error('[Upload] Delete error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete image',
    });
  }
};

