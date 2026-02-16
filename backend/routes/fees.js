const express = require('express');
const router = express.Router();
const {
  getAllFees,
  getFeesByStudent,
  createFee,
  updateFee,
  addPayment,
  deleteFee,
  getFeeStats,
} = require('../controllers/feesController');
const { authenticate, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/fees/stats
 * @desc    Get fee statistics
 * @access  Private (Admin)
 */
router.get('/stats', authorize('admin'), getFeeStats);

/**
 * @route   GET /api/v1/fees
 * @desc    Get all fees records
 * @access  Private
 */
router.get('/', getAllFees);

/**
 * @route   GET /api/v1/fees/student/:studentId
 * @desc    Get fees by student ID
 * @access  Private
 */
router.get('/student/:studentId', getFeesByStudent);

/**
 * @route   POST /api/v1/fees
 * @desc    Create fee record
 * @access  Private (Admin)
 */
router.post('/', authorize('admin'), createFee);

/**
 * @route   PUT /api/v1/fees/:id
 * @desc    Update fee record
 * @access  Private (Admin)
 */
router.put('/:id', authorize('admin'), updateFee);

/**
 * @route   POST /api/v1/fees/:id/payment
 * @desc    Add payment to fee
 * @access  Private (Admin)
 */
router.post('/:id/payment', authorize('admin'), addPayment);

/**
 * @route   DELETE /api/v1/fees/:id
 * @desc    Delete fee record
 * @access  Private (Admin)
 */
router.delete('/:id', authorize('admin'), deleteFee);

module.exports = router;