import axiosInstance from './axiosInstance';

export const videosAPI = {
  getVideos: async (params = {}) => {
    const response = await axiosInstance.get('/videos', { params });
    return response.data.data;
  },

  getVideoById: async (id) => {
    const response = await axiosInstance.get(`/videos/${id}`);
    return response.data.data;
  },

  createVideo: async (videoData) => {
    const response = await axiosInstance.post('/videos', videoData);
    return response.data.data;
  },

  updateVideo: async (id, videoData) => {
    const response = await axiosInstance.put(`/videos/${id}`, videoData);
    return response.data.data;
  },

  deleteVideo: async (id) => {
    const response = await axiosInstance.delete(`/videos/${id}`);
    return response.data;
  },

  toggleLike: async (id) => {
    const response = await axiosInstance.post(`/videos/${id}/like`);
    return response.data.data;
  },

  rateVideo: async (id, rating) => {
    const response = await axiosInstance.post(`/videos/${id}/rate`, { rating });
    return response.data.data;
  },

  reportVideo: async (id, reason) => {
    const response = await axiosInstance.post(`/videos/${id}/report`, { reason });
    return response.data.data;
  },

  getComments: async (id) => {
    const response = await axiosInstance.get(`/videos/${id}/comments`);
    return response.data.data;
  },

  addComment: async (id, comment) => {
    const response = await axiosInstance.post(`/videos/${id}/comments`, { comment });
    return response.data.data;
  },

  addReply: async (id, commentId, reply) => {
    const response = await axiosInstance.post(`/videos/${id}/comments/${commentId}/replies`, { reply });
    return response.data.data;
  },

  deleteComment: async (id, commentId) => {
    const response = await axiosInstance.delete(`/videos/${id}/comments/${commentId}`);
    return response.data;
  },
};

export default videosAPI;
