import axiosInstance from './axiosInstance';

export const usersAPI = {
  getUsers: async (params = {}) => {
    const response = await axiosInstance.get('/users', { params });
    return response.data.data;
  },

  getUserById: async (id) => {
    const response = await axiosInstance.get(`/users/${id}`);
    return response.data.data;
  },

  updateUser: async (id, userData) => {
    const response = await axiosInstance.put(`/users/${id}`, userData);
    return response.data.data;
  },

  deleteUser: async (id) => {
    const response = await axiosInstance.delete(`/users/${id}`);
    return response.data;
  },

  getPreferences: async (id) => {
    const response = await axiosInstance.get(`/users/${id}/preferences`);
    return response.data.data;
  },

  updatePreferences: async (id, preferences) => {
    const response = await axiosInstance.put(`/users/${id}/preferences`, preferences);
    return response.data.data;
  },
};

export default usersAPI;
