import api from './api';

const studentService = {
  /**
   * Get all students
   */
  getAllStudents: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/students?${queryString}`);
    return response;
  },

  /**
   * Get student by ID
   */
  getStudentById: async (id) => {
    const response = await api.get(`/students/${id}`);
    return response;
  },

  /**
   * Create new student
   */
  createStudent: async (data) => {
    const response = await api.post('/students', data);
    return response;
  },

  /**
   * Update student
   */
  updateStudent: async (id, data) => {
    const response = await api.put(`/students/${id}`, data);
    return response;
  },

  /**
   * Delete student
   */
  deleteStudent: async (id) => {
    const response = await api.delete(`/students/${id}`);
    return response;
  },

  /**
   * Get student statistics
   */
  getStudentStats: async () => {
    const response = await api.get('/students/stats');
    return response;
  },
};

export default studentService;