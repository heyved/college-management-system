import api from './api';

const marksService = {
  /**
   * Get all marks
   */
  getAllMarks: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/marks?${queryString}`);
    return response;
  },

  /**
   * Get marks by student ID
   */
  getMarksByStudent: async (studentId) => {
    const response = await api.get(`/marks/student/${studentId}`);
    return response;
  },

  /**
   * Get marks by course ID
   */
  getMarksByCourse: async (courseId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/marks/course/${courseId}?${queryString}`);
    return response;
  },

  /**
   * Get student performance report
   */
  getStudentReport: async (studentId) => {
    const response = await api.get(`/marks/report/${studentId}`);
    return response;
  },

  /**
   * Create or update marks
   */
  createOrUpdateMarks: async (data) => {
    const response = await api.post('/marks', data);
    return response;
  },

  /**
   * Publish marks
   */
  publishMarks: async (id) => {
    const response = await api.put(`/marks/${id}/publish`);
    return response;
  },

  /**
   * Delete marks
   */
  deleteMarks: async (id) => {
    const response = await api.delete(`/marks/${id}`);
    return response;
  },
};

export default marksService;