import axiosInstance from './axiosInstance';

export const eventsAPI = {
  getEvents: async (params = {}) => {
    const response = await axiosInstance.get('/events', { params });
    return response.data.data;
  },

  getEventById: async (id) => {
    const response = await axiosInstance.get(`/events/${id}`);
    return response.data.data;
  },

  createEvent: async (eventData) => {
    const response = await axiosInstance.post('/events', eventData);
    return response.data.data;
  },

  updateEvent: async (id, eventData) => {
    const response = await axiosInstance.put(`/events/${id}`, eventData);
    return response.data.data;
  },

  deleteEvent: async (id) => {
    const response = await axiosInstance.delete(`/events/${id}`);
    return response.data;
  },

  registerEvent: async (id) => {
    const response = await axiosInstance.post(`/events/${id}/register`);
    return response.data;
  },
};

export default eventsAPI;
