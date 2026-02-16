const Course = require('../models/Course');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const logger = require('../utils/logger');

/**
 * @desc    Get all courses
 * @route   GET /api/v1/courses
 * @access  Private
 */
const getAllCourses = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      department,
      semester,
      courseType,
      status = 'active',
      search,
    } = req.query;

    const query = {};

    if (department) query.department = department;
    if (semester) query.semester = semester;
    if (courseType) query.courseType = courseType;
    if (status) query.status = status;
    
    if (search) {
      query.$or = [
        { courseName: { $regex: search, $options: 'i' } },
        { courseCode: { $regex: search, $options: 'i' } },
      ];
    }

    const courses = await Course.find(query)
      .populate('faculty', 'firstName lastName facultyCode designation')
      .populate('enrolledStudents', 'firstName lastName studentCode')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ courseCode: 1 });

    const count = await Course.countDocuments(query);

    res.status(200).json({
      success: true,
      data: courses,
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
 * @desc    Get course by ID
 * @route   GET /api/v1/courses/:id
 * @access  Private
 */
const getCourseById = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('faculty', 'firstName lastName facultyCode email contactNumber')
      .populate('enrolledStudents', 'firstName lastName studentCode email')
      .populate('prerequisites', 'courseCode courseName');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: course,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new course
 * @route   POST /api/v1/courses
 * @access  Private (Admin)
 */
const createCourse = async (req, res, next) => {
  try {
    const {
      courseCode,
      courseName,
      description,
      department,
      credits,
      semester,
      courseType,
      faculty,
      maxStudents,
      syllabus,
      prerequisites,
      schedule,
      academicYear,
    } = req.body;

    // Check if course code already exists
    const existingCourse = await Course.findOne({ courseCode: courseCode.toUpperCase() });
    if (existingCourse) {
      return res.status(400).json({
        success: false,
        message: 'Course code already exists.',
      });
    }

    // Verify faculty exists if provided
    if (faculty) {
      const facultyExists = await Faculty.findById(faculty);
      if (!facultyExists) {
        return res.status(404).json({
          success: false,
          message: 'Faculty not found.',
        });
      }
    }

    const course = await Course.create({
      courseCode: courseCode.toUpperCase(),
      courseName,
      description,
      department,
      credits,
      semester,
      courseType,
      faculty,
      maxStudents,
      syllabus,
      prerequisites,
      schedule,
      academicYear,
    });

    // Update faculty's assigned courses if faculty is assigned
    if (faculty) {
      await Faculty.findByIdAndUpdate(
        faculty,
        { $addToSet: { assignedCourses: course._id } }
      );
    }

    logger.info(`New course created: ${course.courseCode} by ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Course created successfully.',
      data: course,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update course
 * @route   PUT /api/v1/courses/:id
 * @access  Private (Admin)
 */
const updateCourse = async (req, res, next) => {
  try {
    const allowedUpdates = [
      'courseName',
      'description',
      'credits',
      'faculty',
      'maxStudents',
      'syllabus',
      'schedule',
      'status',
    ];

    const updates = Object.keys(req.body);
    const isValidUpdate = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidUpdate) {
      return res.status(400).json({
        success: false,
        message: 'Invalid updates.',
      });
    }

    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found.',
      });
    }

    // If faculty is being updated, update both old and new faculty records
    if (req.body.faculty && req.body.faculty !== course.faculty?.toString()) {
      // Remove from old faculty
      if (course.faculty) {
        await Faculty.findByIdAndUpdate(
          course.faculty,
          { $pull: { assignedCourses: course._id } }
        );
      }

      // Add to new faculty
      await Faculty.findByIdAndUpdate(
        req.body.faculty,
        { $addToSet: { assignedCourses: course._id } }
      );
    }

    Object.assign(course, req.body);
    await course.save();

    logger.info(`Course updated: ${course.courseCode} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Course updated successfully.',
      data: course,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete course
 * @route   DELETE /api/v1/courses/:id
 * @access  Private (Admin)
 */
const deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found.',
      });
    }

    // Check if students are enrolled
    if (course.enrolledStudents && course.enrolledStudents.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete course with enrolled students. Please remove students first.',
      });
    }

    // Remove from faculty's assigned courses
    if (course.faculty) {
      await Faculty.findByIdAndUpdate(
        course.faculty,
        { $pull: { assignedCourses: course._id } }
      );
    }

    course.status = 'inactive';
    await course.save();

    logger.info(`Course deleted: ${course.courseCode} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Course deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Enroll student in course
 * @route   POST /api/v1/courses/:id/enroll
 * @access  Private (Admin)
 */
const enrollStudent = async (req, res, next) => {
  try {
    const { studentId } = req.body;

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found.',
      });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found.',
      });
    }

    // Check if course is full
    if (course.isFull()) {
      return res.status(400).json({
        success: false,
        message: 'Course is full. Cannot enroll more students.',
      });
    }

    // Check if student is already enrolled
    if (course.enrolledStudents.includes(studentId)) {
      return res.status(400).json({
        success: false,
        message: 'Student is already enrolled in this course.',
      });
    }

    // Enroll student
    course.enrolledStudents.push(studentId);
    await course.save();

    student.courses.push(course._id);
    await student.save();

    logger.info(`Student ${student.studentCode} enrolled in ${course.courseCode} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Student enrolled successfully.',
      data: course,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Unenroll student from course
 * @route   POST /api/v1/courses/:id/unenroll
 * @access  Private (Admin)
 */
const unenrollStudent = async (req, res, next) => {
  try {
    const { studentId } = req.body;

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found.',
      });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found.',
      });
    }

    // Remove student from course
    course.enrolledStudents = course.enrolledStudents.filter(
      (id) => id.toString() !== studentId
    );
    await course.save();

    student.courses = student.courses.filter(
      (id) => id.toString() !== course._id.toString()
    );
    await student.save();

    logger.info(`Student ${student.studentCode} unenrolled from ${course.courseCode} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Student unenrolled successfully.',
      data: course,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollStudent,
  unenrollStudent,
};