const express = require('express');
const router = express.Router();
const {
  getPendingUsers,
  getAllUsers,
  approveUser,
  rejectUser,
  updateUserRole,
  deleteUser,
} = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');

// All routes require admin authentication
router.use(authenticate);
router.use(authorize('admin'));

/**
 * @route   GET /api/v1/users/pending
 * @desc    Get all pending users
 * @access  Private (Admin)
 */
router.get('/pending', getPendingUsers);

/**
 * @route   GET /api/v1/users
 * @desc    Get all users
 * @access  Private (Admin)
 */
router.get('/', getAllUsers);

/**
 * @route   PUT /api/v1/users/:id/approve
 * @desc    Approve pending user
 * @access  Private (Admin)
 */
router.put('/:id/approve', approveUser);

/**
 * @route   PUT /api/v1/users/:id/reject
 * @desc    Reject pending user
 * @access  Private (Admin)
 */
router.put('/:id/reject', rejectUser);

/**
 * @route   PUT /api/v1/users/:id/role
 * @desc    Update user role
 * @access  Private (Admin)
 */
router.put('/:id/role', updateUserRole);

/**
 * @route   DELETE /api/v1/users/:id
 * @desc    Delete user
 * @access  Private (Admin)
 */
router.delete('/:id', deleteUser);

module.exports = router;