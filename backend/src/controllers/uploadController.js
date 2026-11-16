import { uploadBufferToCloudinary } from '../services/cloudinaryService.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

// @desc    Upload media file to Cloudinary
// @route   POST /api/upload
// @access  Private (Teacher or Admin)
export const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return sendError(res, 400, 'No file uploaded');
    }

    let resourceType = 'auto';
    if (req.file.mimetype.startsWith('video/')) {
      resourceType = 'video';
    } else if (req.file.mimetype.startsWith('image/')) {
      resourceType = 'image';
    } else if (req.file.mimetype === 'application/pdf') {
      resourceType = 'raw';
    }

    const folder = req.body.folder || 'skillwave';
    const result = await uploadBufferToCloudinary(req.file.buffer, resourceType, folder);

    return sendSuccess(res, 201, 'File uploaded successfully', {
      url: result.url,
      secure_url: result.url,
      publicId: result.publicId,
      format: result.format,
      duration: result.duration,
      bytes: result.bytes,
    });
  } catch (error) {
    console.error('[UploadController] Error uploading file:', error.message);
    next(error);
  }
};
