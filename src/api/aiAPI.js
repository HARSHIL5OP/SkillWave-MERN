import axiosInstance from './axiosInstance';

export const aiAPI = {
  summarize: async ({ topic, mode, language, focus }) => {
    const response = await axiosInstance.post('/ai/summarize', {
      topic,
      mode,
      language,
      focus,
    });
    return response.data.data.content;
  },

  generateRoadmap: async ({ topic, duration }) => {
    const response = await axiosInstance.post('/ai/roadmap', {
      topic,
      duration,
    });
    return response.data.data;
  },

  chat: async (messages) => {
    const response = await axiosInstance.post('/ai/chat', { messages });
    return response.data.data.reply;
  },
};

export default aiAPI;
