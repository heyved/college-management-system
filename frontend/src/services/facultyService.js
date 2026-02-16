import api from './api';

const facultyService = {
  /**
   * Get all faculty
   */
  getAllFaculty: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/faculty?${queryString}`);
    return response;
  },

  /**
   * Get faculty by ID
   */
  getFacultyById: async (id) => {
    const response = await api.get(`/faculty/${id}`);
    return response;
  },

  /**
   * Create new faculty
   */
  createFaculty: async (data) => {
    const response = await api.post('/faculty', data);
    return response;
  },

  /**
   * Update faculty
   */
  updateFaculty: async (id, data) => {
    const response = await api.put(`/faculty/${id}`, data);
    return response;
  },

  /**
   * Delete faculty
   */
  deleteFaculty: async (id) => {
    const response = await api.delete(`/faculty/${id}`);
    return response;
  },
};

export default facultyService;