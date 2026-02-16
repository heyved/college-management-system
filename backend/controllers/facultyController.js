const Faculty = require('../models/Faculty');
const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * @desc    Get all faculty
 * @route   GET /api/v1/faculty
 * @access  Private
 */
const getAllFaculty = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      department,
      designation,
      status = 'active',
      search,
    } = req.query;

    const query = {};

    if (department) query.department = department;
    if (designation) query.designation = designation;
    if (status) query.status = status;
    
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { facultyCode: { $regex: search, $options: 'i' } },
        { specialization: { $regex: search, $options: 'i' } },
      ];
    }

    const faculty = await Faculty.find(query)
      .populate('userId', 'email')
      .populate('assignedCourses', 'courseCode courseName')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Faculty.countDocuments(query);

    res.status(200).json({
      success: true,
      data: faculty,
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
 * @desc    Get faculty by ID
 * @route   GET /api/v1/faculty/:id
 * @access  Private
 */
const getFacultyById = async (req, res, next) => {
  try {
    const faculty = await Faculty.findById(req.params.id)
      .populate('userId', 'email lastLogin')
      .populate('assignedCourses', 'courseCode courseName credits semester');

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: 'Faculty not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: faculty,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new faculty
 * @route   POST /api/v1/faculty
 * @access  Private (Admin)
 */
const createFaculty = async (req, res, next) => {
  try {
    const {
      email,
      firstName,
      lastName,
      dateOfBirth,
      gender,
      contactNumber,
      address,
      department,
      designation,
      qualification,
      specialization,
      experience,
      joiningDate,
      salary,
      officeLocation,
      officeHours,
    } = req.body;

    // Check if user exists
    let user = await User.findOne({ email: email.toLowerCase() });
    let tempPassword = null;

    if (!user) {
      // Create new user account with temporary password
      tempPassword = `Faculty@${Math.random().toString(36).slice(-8)}`;
      user = await User.create({
        email: email.toLowerCase(),
        password: tempPassword,
        role: 'faculty',
      });
    } else if (user.role !== 'pending' && user.role !== 'faculty') {
      return res.status(400).json({
        success: false,
        message: 'User already exists with a different role.',
      });
    }

    // Create faculty profile
    const faculty = await Faculty.create({
      userId: user._id,
      firstName,
      lastName,
      dateOfBirth,
      gender,
      contactNumber,
      address,
      department,
      designation,
      qualification,
      specialization,
      experience,
      joiningDate: joiningDate || new Date(),
      salary,
      officeLocation,
      officeHours,
    });

    // Update user with faculty reference
    user.facultyId = faculty._id;
    user.role = 'faculty';
    user.profileCompleted = true;
    await user.save();

    logger.info(`New faculty created: ${faculty.facultyCode} by ${req.user.email}`);

    // Populate faculty data for response
    const populatedFaculty = await Faculty.findById(faculty._id).populate('userId', 'email');

    res.status(201).json({
      success: true,
      message: 'Faculty created successfully.',
      data: {
        faculty: populatedFaculty,
        // Only return password if it was generated
        ...(tempPassword && { 
          credentials: {
            email: user.email,
            temporaryPassword: tempPassword,
            message: 'Please share these credentials with the faculty member. They should change their password after first login.'
          }
        })
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update faculty
 * @route   PUT /api/v1/faculty/:id
 * @access  Private (Admin)
 */
const updateFaculty = async (req, res, next) => {
  try {
    const allowedUpdates = [
      'contactNumber',
      'address',
      'designation',
      'specialization',
      'experience',
      'salary',
      'officeLocation',
      'officeHours',
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

    const faculty = await Faculty.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: 'Faculty not found.',
      });
    }

    logger.info(`Faculty updated: ${faculty.facultyCode} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Faculty updated successfully.',
      data: faculty,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete faculty
 * @route   DELETE /api/v1/faculty/:id
 * @access  Private (Admin)
 */
const deleteFaculty = async (req, res, next) => {
  try {
    const faculty = await Faculty.findById(req.params.id);

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: 'Faculty not found.',
      });
    }

    faculty.status = 'inactive';
    await faculty.save();

    await User.findByIdAndUpdate(faculty.userId, { isActive: false });

    logger.info(`Faculty deleted: ${faculty.facultyCode} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Faculty deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllFaculty,
  getFacultyById,
  createFaculty,
  updateFaculty,
  deleteFaculty,
};