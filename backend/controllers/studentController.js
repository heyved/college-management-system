const Student = require('../models/Student');
const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * @desc    Get all students
 * @route   GET /api/v1/students
 * @access  Private (Admin, Faculty)
 */
const getAllStudents = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      department,
      semester,
      status = 'active',
      search,
    } = req.query;

    const query = {};

    if (department) query.department = department;
    if (semester) query.currentSemester = semester;
    if (status) query.status = status;
    
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { studentCode: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const students = await Student.find(query)
      .populate('userId', 'email')
      .populate('courses', 'courseCode courseName')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Student.countDocuments(query);

    res.status(200).json({
      success: true,
      data: students,
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
 * @desc    Get student by ID
 * @route   GET /api/v1/students/:id
 * @access  Private
 */
const getStudentById = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('userId', 'email lastLogin')
      .populate('courses', 'courseCode courseName credits');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found.',
      });
    }

    // Check authorization
    if (
      req.user.role === 'student' &&
      student.userId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied.',
      });
    }

    res.status(200).json({
      success: true,
      data: student,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new student
 * @route   POST /api/v1/students
 * @access  Private (Admin)
 */
const createStudent = async (req, res, next) => {
  try {
    const {
      email,
      firstName,
      lastName,
      dateOfBirth,
      gender,
      contactNumber,
      address,
      guardianName,
      guardianContact,
      guardianRelation,
      department,
      admissionYear,
      currentSemester,
      bloodGroup,
    } = req.body;

    // Check if user exists
    let user = await User.findOne({ email: email.toLowerCase() });
    let tempPassword = null;

    if (!user) {
      // Create new user account with temporary password
      tempPassword = `Student@${Math.random().toString(36).slice(-8)}`;
      user = await User.create({
        email: email.toLowerCase(),
        password: tempPassword,
        role: 'student',
      });
    } else if (user.role !== 'pending' && user.role !== 'student') {
      return res.status(400).json({
        success: false,
        message: 'User already exists with a different role.',
      });
    }

    // Create student profile
    const student = await Student.create({
      userId: user._id,
      firstName,
      lastName,
      dateOfBirth,
      gender,
      contactNumber,
      address,
      guardianName,
      guardianContact,
      guardianRelation,
      department,
      admissionYear,
      currentSemester: currentSemester || 1,
      bloodGroup,
    });
  
    // Update user with student reference
    user.studentId = student._id;
    user.role = 'student';
    user.profileCompleted = true;
    await user.save();

    logger.info(`New student created: ${student.studentCode} by ${req.user.email}`);

    // Populate student data for response
    const populatedStudent = await Student.findById(student._id).populate('userId', 'email');

    res.status(201).json({
      success: true,
      message: 'Student created successfully.',
      data: {
        student: populatedStudent,
        // Only return password if it was generated
        ...(tempPassword && { 
          credentials: {
            email: user.email,
            temporaryPassword: tempPassword,
            message: 'Please share these credentials with the student. They should change their password after first login.'
          }
        })
      },
    });
  } catch (error) {
    next(error);
  }
};
/**
 * @desc    Update student
 * @route   PUT /api/v1/students/:id
 * @access  Private (Admin)
 */
const updateStudent = async (req, res, next) => {
  try {
    const allowedUpdates = [
      'firstName',
      'lastName',
      'contactNumber',
      'address',
      'guardianName',
      'guardianContact',
      'guardianRelation',
      'currentSemester',
      'status',
      'bloodGroup',
    ];

    const updates = Object.keys(req.body);
    const isValidUpdate = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidUpdate) {
      return res.status(400).json({
        success: false,
        message: 'Invalid updates.',
      });
    }

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found.',
      });
    }

    logger.info(`Student updated: ${student.studentCode} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Student updated successfully.',
      data: student,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete student
 * @route   DELETE /api/v1/students/:id
 * @access  Private (Admin)
 */
const deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found.',
      });
    }

    // Soft delete - update status instead of removing
    student.status = 'inactive';
    await student.save();

    // Also deactivate user account
    await User.findByIdAndUpdate(student.userId, { isActive: false });

    logger.info(`Student deleted: ${student.studentCode} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Student deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get student statistics
 * @route   GET /api/v1/students/stats
 * @access  Private (Admin)
 */
const getStudentStats = async (req, res, next) => {
  try {
    const totalStudents = await Student.countDocuments({ status: 'active' });
    const departmentStats = await Student.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const semesterStats = await Student.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$currentSemester', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalStudents,
        departmentWise: departmentStats,
        semesterWise: semesterStats,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentStats,
};