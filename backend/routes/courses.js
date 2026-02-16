const express = require('express');
const router = express.Router();
const {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollStudent,
  unenrollStudent,
} = require('../controllers/courseController');
const { authenticate, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/courses
 * @desc    Get all courses
 * @access  Private
 */
router.get('/', getAllCourses);

/**
 * @route   GET /api/v1/courses/:id
 * @desc    Get course by ID
 * @access  Private
 */
router.get('/:id', getCourseById);

/**
 * @route   POST /api/v1/courses
 * @desc    Create new course
 * @access  Private (Admin)
 */
router.post('/', authorize('admin'), createCourse);

/**
 * @route   PUT /api/v1/courses/:id
 * @desc    Update course
 * @access  Private (Admin)
 */
router.put('/:id', authorize('admin'), updateCourse);

/**
 * @route   DELETE /api/v1/courses/:id
 * @desc    Delete course
 * @access  Private (Admin)
 */
router.delete('/:id', authorize('admin'), deleteCourse);

/**
 * @route   POST /api/v1/courses/:id/enroll
 * @desc    Enroll student in course
 * @access  Private (Admin)
 */
router.post('/:id/enroll', authorize('admin'), enrollStudent);

/**
 * @route   POST /api/v1/courses/:id/unenroll
 * @desc    Unenroll student from course
 * @access  Private (Admin)
 */
router.post('/:id/unenroll', authorize('admin'), unenrollStudent);

module.exports = router;