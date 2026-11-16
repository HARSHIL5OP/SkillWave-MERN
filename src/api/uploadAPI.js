import axiosInstance from './axiosInstance';

export const uploadAPI = {
  uploadFile: async (file, folder = 'skillwave') => {
    if (!file) throw new Error('No file provided');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const response = await axiosInstance.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.data.url;
  },

  uploadVideo: async (videoFile) => {
    return await uploadAPI.uploadFile(videoFile, 'skillwave/videos');
  },

  uploadThumbnail: async (imageFile) => {
    return await uploadAPI.uploadFile(imageFile, 'skillwave/thumbnails');
  },

  uploadPDF: async (pdfFile) => {
    return await uploadAPI.uploadFile(pdfFile, 'skillwave/documents');
  },
};

export default uploadAPI;
