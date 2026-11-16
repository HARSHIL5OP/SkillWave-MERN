import axiosInstance from './axiosInstance';

export const roadmapsAPI = {
  getUserRoadmaps: async () => {
    const response = await axiosInstance.get('/roadmaps');
    return response.data.data;
  },

  getRoadmapById: async (id) => {
    const response = await axiosInstance.get(`/roadmaps/${id}`);
    return response.data.data;
  },

  saveRoadmap: async (roadmapData) => {
    const response = await axiosInstance.post('/roadmaps', roadmapData);
    return response.data.data;
  },

  updateRoadmap: async (id, roadmapData) => {
    const response = await axiosInstance.put(`/roadmaps/${id}`, roadmapData);
    return response.data.data;
  },

  deleteRoadmap: async (id) => {
    const response = await axiosInstance.delete(`/roadmaps/${id}`);
    return response.data;
  },
};

export default roadmapsAPI;
