import axiosInstance from './axiosInstance';

export const authAPI = {
  login: async (email, password) => {
    const response = await axiosInstance.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (userData) => {
    const response = await axiosInstance.post('/auth/register', userData);
    return response.data;
  },

  getMe: async () => {
    const response = await axiosInstance.get('/auth/me');
    return response.data;
  },

  logout: async () => {
    try {
      await axiosInstance.post('/auth/logout');
    } catch (e) {
      // Ignore network errors on logout
    }
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
  },
};

export default authAPI;
