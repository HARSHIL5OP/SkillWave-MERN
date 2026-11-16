import axiosInstance from './axiosInstance';

export const categoriesAPI = {
  getCategories: async () => {
    const response = await axiosInstance.get('/categories');
    return response.data.data;
  },

  createCategory: async (categoryData) => {
    const response = await axiosInstance.post('/categories', categoryData);
    return response.data.data;
  },

  addSubcategory: async (categoryId, subcategoryData) => {
    const response = await axiosInstance.post(`/categories/${categoryId}/subcategories`, subcategoryData);
    return response.data.data;
  },

  addTopic: async (categoryId, subcategoryId, topic) => {
    const response = await axiosInstance.patch(`/categories/${categoryId}/subcategories/${subcategoryId}/topics`, { topic });
    return response.data.data;
  },
};

export default categoriesAPI;
