import api from './api';

const feesService = {
  /**
   * Get all fees records
   */
  getAllFees: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/fees?${queryString}`);
    return response;
  },

  /**
   * Get fees by student ID
   */
  getFeesByStudent: async (studentId) => {
    const response = await api.get(`/fees/student/${studentId}`);
    return response;
  },

  /**
   * Create fee record
   */
  createFee: async (data) => {
    const response = await api.post('/fees', data);
    return response;
  },

  /**
   * Update fee record
   */
  updateFee: async (id, data) => {
    const response = await api.put(`/fees/${id}`, data);
    return response;
  },

  /**
   * Add payment to fee
   */
  addPayment: async (id, data) => {
    const response = await api.post(`/fees/${id}/payment`, data);
    return response;
  },

  /**
   * Delete fee record
   */
  deleteFee: async (id) => {
    const response = await api.delete(`/fees/${id}`);
    return response;
  },

  /**
   * Get fee statistics
   */
  getFeeStats: async () => {
    const response = await api.get('/fees/stats');
    return response;
  },
};

export default feesService;