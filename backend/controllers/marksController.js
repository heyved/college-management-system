const Marks = require('../models/Marks');
const Student = require('../models/Student');
const Course = require('../models/Course');
const Faculty = require('../models/Faculty');
const logger = require('../utils/logger');

/**
 * @desc    Get all marks
 * @route   GET /api/v1/marks
 * @access  Private
 */
const getAllMarks = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      student,
      course,
      semester,
      examType,
      academicYear,
    } = req.query;

    const query = {};

    // If user is a student, only show their marks
    if (req.user.role === 'student') {
      const studentRecord = await Student.findOne({ userId: req.user._id });
      if (studentRecord) {
        query.student = studentRecord._id;
      }
    }

    // If user is faculty, only show marks for their courses
    if (req.user.role === 'faculty') {
      const facultyRecord = await Faculty.findOne({ userId: req.user._id });
      if (facultyRecord) {
        query.course = { $in: facultyRecord.assignedCourses };
      }
    }

    if (student) query.student = student;
    if (course) query.course = course;
    if (semester) query.semester = semester;
    if (examType) query.examType = examType;
    if (academicYear) query.academicYear = academicYear;

    const marks = await Marks.find(query)
      .populate('student', 'firstName lastName studentCode')
      .populate('course', 'courseCode courseName')
      .populate('enteredBy', 'firstName lastName facultyCode')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Marks.countDocuments(query);

    res.status(200).json({
      success: true,
      data: marks,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalRecords: count,
        recordsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get marks by student ID
 * @route   GET /api/v1/marks/student/:studentId
 * @access  Private
 */
const getMarksByStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.studentId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found.',
      });
    }

    // Authorization check
    if (
      req.user.role === 'student' &&
      student.userId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied.',
      });
    }

    const marks = await Marks.find({ student: req.params.studentId })
      .populate('course', 'courseCode courseName credits')
      .populate('enteredBy', 'firstName lastName')
      .sort({ semester: 1, examType: 1 });

    // Group marks by semester
    const groupedMarks = marks.reduce((acc, mark) => {
      const sem = mark.semester;
      if (!acc[sem]) {
        acc[sem] = [];
      }
      acc[sem].push(mark);
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: {
        student,
        marks: groupedMarks,
        totalRecords: marks.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get marks by course ID
 * @route   GET /api/v1/marks/course/:courseId
 * @access  Private (Admin, Faculty)
 */
const getMarksByCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found.',
      });
    }

    // Check if faculty is authorized to view these marks
    if (req.user.role === 'faculty') {
      const faculty = await Faculty.findOne({ userId: req.user._id });
      if (!faculty.assignedCourses.includes(req.params.courseId)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You are not assigned to this course.',
        });
      }
    }

    const { examType } = req.query;
    const query = { course: req.params.courseId };
    if (examType) query.examType = examType;

    const marks = await Marks.find(query)
      .populate('student', 'firstName lastName studentCode')
      .sort({ 'student.studentCode': 1 });

    res.status(200).json({
      success: true,
      data: {
        course,
        marks,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create or update marks
 * @route   POST /api/v1/marks
 * @access  Private (Admin, Faculty)
 */
const createOrUpdateMarks = async (req, res, next) => {
  try {
    const {
      student,
      course,
      academicYear,
      semester,
      examType,
      marksObtained,
      totalMarks,
      remarks,
    } = req.body;

    // Verify student exists
    const studentExists = await Student.findById(student);
    if (!studentExists) {
      return res.status(404).json({
        success: false,
        message: 'Student not found.',
      });
    }

    // Verify course exists
    const courseExists = await Course.findById(course);
    if (!courseExists) {
      return res.status(404).json({
        success: false,
        message: 'Course not found.',
      });
    }

    // If faculty, verify they are assigned to this course
    let enteredBy;
    if (req.user.role === 'faculty') {
      const faculty = await Faculty.findOne({ userId: req.user._id });
      if (!faculty.assignedCourses.includes(course)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You are not assigned to this course.',
        });
      }
      enteredBy = faculty._id;
    } else {
      // For admin, we still need a faculty reference - use the course faculty
      enteredBy = courseExists.faculty;
    }

    // Validate marks
    if (marksObtained < 0 || marksObtained > totalMarks) {
      return res.status(400).json({
        success: false,
        message: 'Marks obtained cannot be negative or greater than total marks.',
      });
    }

    // Check if marks already exist
    const existingMarks = await Marks.findOne({
      student,
      course,
      examType,
      academicYear,
    });

    let marks;
    if (existingMarks) {
      // Update existing marks
      existingMarks.marksObtained = marksObtained;
      existingMarks.totalMarks = totalMarks;
      existingMarks.remarks = remarks;
      existingMarks.enteredBy = enteredBy;
      marks = await existingMarks.save();
      
      logger.info(
        `Marks updated for student ${studentExists.studentCode} in ${courseExists.courseCode} by ${req.user.email}`
      );
    } else {
      // Create new marks entry
      marks = await Marks.create({
        student,
        course,
        academicYear,
        semester,
        examType,
        marksObtained,
        totalMarks,
        remarks,
        enteredBy,
      });

      logger.info(
        `Marks created for student ${studentExists.studentCode} in ${courseExists.courseCode} by ${req.user.email}`
      );
    }

    const populatedMarks = await Marks.findById(marks._id)
      .populate('student', 'firstName lastName studentCode')
      .populate('course', 'courseCode courseName')
      .populate('enteredBy', 'firstName lastName');

    res.status(existingMarks ? 200 : 201).json({
      success: true,
      message: existingMarks ? 'Marks updated successfully.' : 'Marks created successfully.',
      data: populatedMarks,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Publish marks
 * @route   PUT /api/v1/marks/:id/publish
 * @access  Private (Admin, Faculty)
 */
const publishMarks = async (req, res, next) => {
  try {
    const marks = await Marks.findById(req.params.id);

    if (!marks) {
      return res.status(404).json({
        success: false,
        message: 'Marks not found.',
      });
    }

    marks.isPublished = true;
    marks.publishedDate = Date.now();
    await marks.save();

    logger.info(`Marks published: ${marks._id} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Marks published successfully.',
      data: marks,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete marks
 * @route   DELETE /api/v1/marks/:id
 * @access  Private (Admin)
 */
const deleteMarks = async (req, res, next) => {
  try {
    const marks = await Marks.findById(req.params.id);

    if (!marks) {
      return res.status(404).json({
        success: false,
        message: 'Marks not found.',
      });
    }

    await marks.deleteOne();

    logger.info(`Marks deleted: ${marks._id} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Marks deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get student performance report
 * @route   GET /api/v1/marks/report/:studentId
 * @access  Private
 */
const getStudentReport = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.studentId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found.',
      });
    }

    // Authorization check
    if (
      req.user.role === 'student' &&
      student.userId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied.',
      });
    }

    // Get all marks for the student
    const marks = await Marks.find({ student: req.params.studentId })
      .populate('course', 'courseCode courseName credits');

    // Calculate semester-wise statistics
    const semesterStats = {};
    marks.forEach((mark) => {
      const sem = mark.semester;
      if (!semesterStats[sem]) {
        semesterStats[sem] = {
          totalMarks: 0,
          obtainedMarks: 0,
          subjects: 0,
          credits: 0,
        };
      }
      semesterStats[sem].totalMarks += mark.totalMarks;
      semesterStats[sem].obtainedMarks += mark.marksObtained;
      semesterStats[sem].subjects += 1;
      if (mark.course && mark.course.credits) {
        semesterStats[sem].credits += mark.course.credits;
      }
    });

    // Calculate overall statistics
    const overallStats = {
      totalMarks: 0,
      obtainedMarks: 0,
      totalSubjects: marks.length,
      percentage: 0,
    };

    Object.values(semesterStats).forEach((sem) => {
      overallStats.totalMarks += sem.totalMarks;
      overallStats.obtainedMarks += sem.obtainedMarks;
    });

    if (overallStats.totalMarks > 0) {
      overallStats.percentage = (
        (overallStats.obtainedMarks / overallStats.totalMarks) *
        100
      ).toFixed(2);
    }

    res.status(200).json({
      success: true,
      data: {
        student,
        semesterWise: semesterStats,
        overall: overallStats,
        detailedMarks: marks,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllMarks,
  getMarksByStudent,
  getMarksByCourse,
  createOrUpdateMarks,
  publishMarks,
  deleteMarks,
  getStudentReport,
};