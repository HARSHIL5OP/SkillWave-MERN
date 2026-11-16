import axiosInstance from '../../api/axiosInstance';
import axios from 'axios';

const CLOUDINARY_CLOUD_NAME = 'dakkqbr4g';
const CLOUDINARY_UPLOAD_PRESET = 'demo-upload';

// Function to upload video via backend or Cloudinary direct
export const uploadVideoToCloudinary = async (videoFile) => {
  if (!videoFile) throw new Error("No video file provided");

  try {
    const formData = new FormData();
    formData.append("file", videoFile);
    formData.append("folder", "skillwave/videos");

    const response = await axiosInstance.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data.url;
  } catch (err) {
    console.warn("Backend upload failed, attempting direct Cloudinary preset fallback:", err.message);
    const formData = new FormData();
    formData.append("file", videoFile);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`,
      formData
    );
    return response.data.secure_url;
  }
};

// Function to upload thumbnail
export const uploadThumbnailToCloudinary = async (thumbnailFile) => {
  if (!thumbnailFile) throw new Error("No thumbnail file provided");

  try {
    const formData = new FormData();
    formData.append("file", thumbnailFile);
    formData.append("folder", "skillwave/thumbnails");

    const response = await axiosInstance.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data.url;
  } catch (err) {
    console.warn("Backend upload failed, attempting direct Cloudinary preset fallback:", err.message);
    const formData = new FormData();
    formData.append("file", thumbnailFile);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      formData
    );
    return response.data.secure_url;
  }
};

// Function to upload PDF
export const uploadPDFToCloudinary = async (pdfFile) => {
  if (!pdfFile) throw new Error("No PDF file provided");

  try {
    const formData = new FormData();
    formData.append("file", pdfFile);
    formData.append("folder", "skillwave/documents");

    const response = await axiosInstance.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data.url;
  } catch (err) {
    console.warn("Backend upload failed, attempting direct Cloudinary preset fallback:", err.message);
    const formData = new FormData();
    formData.append("file", pdfFile);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    formData.append("resource_type", "raw");

    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/raw/upload`,
      formData
    );
    return response.data.secure_url;
  }
};

export default {
  uploadVideoToCloudinary,
  uploadThumbnailToCloudinary,
  uploadPDFToCloudinary,
};
