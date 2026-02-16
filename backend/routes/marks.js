const express = require('express');
const router = express.Router();
const {
  getAllMarks,
  getMarksByStudent,
  getMarksByCourse,
  createOrUpdateMarks,
  publishMarks,
  deleteMarks,
  getStudentReport,
} = require('../controllers/marksController');
const { authenticate, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/marks
 * @desc    Get all marks
 * @access  Private
 */
router.get('/', getAllMarks);

/**
 * @route   GET /api/v1/marks/student/:studentId
 * @desc    Get marks by student ID
 * @access  Private
 */
router.get('/student/:studentId', getMarksByStudent);

/**
 * @route   GET /api/v1/marks/course/:courseId
 * @desc    Get marks by course ID
 * @access  Private (Admin, Faculty)
 */
router.get('/course/:courseId', authorize('admin', 'faculty'), getMarksByCourse);

/**
 * @route   GET /api/v1/marks/report/:studentId
 * @desc    Get student performance report
 * @access  Private
 */
router.get('/report/:studentId', getStudentReport);

/**
 * @route   POST /api/v1/marks
 * @desc    Create or update marks
 * @access  Private (Admin, Faculty)
 */
router.post('/', authorize('admin', 'faculty'), createOrUpdateMarks);

/**
 * @route   PUT /api/v1/marks/:id/publish
 * @desc    Publish marks
 * @access  Private (Admin, Faculty)
 */
router.put('/:id/publish', authorize('admin', 'faculty'), publishMarks);

/**
 * @route   DELETE /api/v1/marks/:id
 * @desc    Delete marks
 * @access  Private (Admin)
 */
router.delete('/:id', authorize('admin'), deleteMarks);

module.exports = router;