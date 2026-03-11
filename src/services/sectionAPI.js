import api from './api';

export const sectionAPI = {
  getSections: (params) => api.get('/sections', { params }),
  getSection: (id) => api.get(`/sections/${id}`),
  createSection: (data) => api.post('/sections', data),
  updateSection: (id, data) => api.put(`/sections/${id}`, data),
  deleteSection: (id) => api.delete(`/sections/${id}`)
};
