import api from './api';

const userService = {
  /**
   * Get all pending users
   */
  getPendingUsers: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/users/pending?${queryString}`);
    return response;
  },

  /**
   * Get all users
   */
  getAllUsers: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/users?${queryString}`);
    return response;
  },

  /**
   * Approve pending user
   */
  approveUser: async (id, data) => {
    const response = await api.put(`/users/${id}/approve`, data);
    return response;
  },

  /**
   * Reject pending user
   */
  rejectUser: async (id) => {
    const response = await api.put(`/users/${id}/reject`);
    return response;
  },

  /**
   * Update user role
   */
  updateUserRole: async (id, role) => {
    const response = await api.put(`/users/${id}/role`, { role });
    return response;
  },

  /**
   * Delete user
   */
  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response;
  },
};

export default userService;