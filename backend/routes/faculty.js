const express = require('express');
const router = express.Router();
const {
  getAllFaculty,
  getFacultyById,
  createFaculty,
  updateFaculty,
  deleteFaculty,
} = require('../controllers/facultyController');
const { authenticate, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/faculty
 * @desc    Get all faculty
 * @access  Private
 */
router.get('/', getAllFaculty);

/**
 * @route   GET /api/v1/faculty/:id
 * @desc    Get faculty by ID
 * @access  Private
 */
router.get('/:id', getFacultyById);

/**
 * @route   POST /api/v1/faculty
 * @desc    Create new faculty
 * @access  Private (Admin)
 */
router.post('/', authorize('admin'), createFaculty);

/**
 * @route   PUT /api/v1/faculty/:id
 * @desc    Update faculty
 * @access  Private (Admin)
 */
router.put('/:id', authorize('admin'), updateFaculty);

/**
 * @route   DELETE /api/v1/faculty/:id
 * @desc    Delete faculty
 * @access  Private (Admin)
 */
router.delete('/:id', authorize('admin'), deleteFaculty);

module.exports = router;