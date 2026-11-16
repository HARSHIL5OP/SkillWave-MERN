import axiosInstance from './axiosInstance';

export const challengesAPI = {
  getChallenges: async (params = {}) => {
    const response = await axiosInstance.get('/challenges', { params });
    return response.data.data;
  },

  getChallengeById: async (id) => {
    const response = await axiosInstance.get(`/challenges/${id}`);
    return response.data.data;
  },

  createChallenge: async (challengeData) => {
    const response = await axiosInstance.post('/challenges', challengeData);
    return response.data.data;
  },

  updateChallenge: async (id, challengeData) => {
    const response = await axiosInstance.put(`/challenges/${id}`, challengeData);
    return response.data.data;
  },

  deleteChallenge: async (id) => {
    const response = await axiosInstance.delete(`/challenges/${id}`);
    return response.data;
  },
};

export default challengesAPI;
