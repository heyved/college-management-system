import api from './api';

const courseService = {
  /**
   * Get all courses
   */
  getAllCourses: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/courses?${queryString}`);
    return response;
  },

  /**
   * Get course by ID
   */
  getCourseById: async (id) => {
    const response = await api.get(`/courses/${id}`);
    return response;
  },

  /**
   * Create new course
   */
  createCourse: async (data) => {
    const response = await api.post('/courses', data);
    return response;
  },

  /**
   * Update course
   */
  updateCourse: async (id, data) => {
    const response = await api.put(`/courses/${id}`, data);
    return response;
  },

  /**
   * Delete course
   */
  deleteCourse: async (id) => {
    const response = await api.delete(`/courses/${id}`);
    return response;
  },

  /**
   * Enroll student in course
   */
  enrollStudent: async (courseId, studentId) => {
    const response = await api.post(`/courses/${courseId}/enroll`, { studentId });
    return response;
  },

  /**
   * Unenroll student from course
   */
  unenrollStudent: async (courseId, studentId) => {
    const response = await api.post(`/courses/${courseId}/unenroll`, { studentId });
    return response;
  },
};

export default courseService;