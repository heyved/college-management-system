const express = require('express');
const router = express.Router();
const {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentStats,
} = require('../controllers/studentController');
const { authenticate, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/students/stats
 * @desc    Get student statistics
 * @access  Private (Admin)
 */
router.get('/stats', authorize('admin'), getStudentStats);

/**
 * @route   GET /api/v1/students
 * @desc    Get all students
 * @access  Private (Admin, Faculty)
 */
router.get('/', authorize('admin', 'faculty'), getAllStudents);

/**
 * @route   GET /api/v1/students/:id
 * @desc    Get student by ID
 * @access  Private
 */
router.get('/:id', getStudentById);

/**
 * @route   POST /api/v1/students
 * @desc    Create new student
 * @access  Private (Admin)
 */
router.post('/', authorize('admin'), createStudent);

/**
 * @route   PUT /api/v1/students/:id
 * @desc    Update student
 * @access  Private (Admin)
 */
router.put('/:id', authorize('admin'), updateStudent);

/**
 * @route   DELETE /api/v1/students/:id
 * @desc    Delete student
 * @access  Private (Admin)
 */
router.delete('/:id', authorize('admin'), deleteStudent);

module.exports = router;