import axiosInstance from './axiosInstance';

export const analyticsAPI = {
  getAdminStats: async () => {
    const response = await axiosInstance.get('/analytics/admin');
    return response.data.data;
  },

  getTeacherStats: async () => {
    const response = await axiosInstance.get('/analytics/teacher');
    return response.data.data;
  },
};

export default analyticsAPI;
