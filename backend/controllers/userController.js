const User = require('../models/User');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const logger = require('../utils/logger');

/**
 * @desc    Get all pending users
 * @route   GET /api/v1/users/pending
 * @access  Private (Admin)
 */
const getPendingUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const query = { role: 'pending', isActive: true };

    const users = await User.find(query)
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: users,
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
 * @desc    Get all users
 * @route   GET /api/v1/users
 * @access  Private (Admin)
 */
const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;

    const query = {};
    if (role) query.role = role;
    
    if (search) {
      query.email = { $regex: search, $options: 'i' };
    }

    const users = await User.find(query)
      .select('-password')
      .populate('studentId', 'firstName lastName studentCode')
      .populate('facultyId', 'firstName lastName facultyCode')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: users,
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
 * @desc    Approve pending user and assign role
 * @route   PUT /api/v1/users/:id/approve
 * @access  Private (Admin)
 */
const approveUser = async (req, res, next) => {
  try {
    const { role, profileData } = req.body;

    if (!role || !['student', 'faculty'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Valid role (student or faculty) is required.',
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    if (user.role !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'User is not in pending status.',
      });
    }

    // Update user role
    user.role = role;
    
    // Create profile based on role
    if (role === 'student' && profileData) {
      const student = await Student.create({
        userId: user._id,
        ...profileData,
      });
      user.studentId = student._id;
      user.profileCompleted = true;
    } else if (role === 'faculty' && profileData) {
      const faculty = await Faculty.create({
        userId: user._id,
        ...profileData,
      });
      user.facultyId = faculty._id;
      user.profileCompleted = true;
    }

    await user.save();

    logger.info(`User ${user.email} approved with role ${role} by ${req.user.email}`);

    const populatedUser = await User.findById(user._id)
      .select('-password')
      .populate('studentId')
      .populate('facultyId');

    res.status(200).json({
      success: true,
      message: 'User approved successfully.',
      data: populatedUser,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reject pending user
 * @route   PUT /api/v1/users/:id/reject
 * @access  Private (Admin)
 */
const rejectUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    if (user.role !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'User is not in pending status.',
      });
    }

    // Deactivate the user instead of deleting
    user.isActive = false;
    await user.save();

    logger.info(`User ${user.email} rejected by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'User registration rejected.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user role
 * @route   PUT /api/v1/users/:id/role
 * @access  Private (Admin)
 */
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;

    if (!role || !['admin', 'faculty', 'student', 'pending'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Valid role is required.',
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    logger.info(`User ${user.email} role updated to ${role} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'User role updated successfully.',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete user
 * @route   DELETE /api/v1/users/:id
 * @access  Private (Admin)
 */
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    // Prevent deleting your own account
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account.',
      });
    }

    // Delete associated profile
    if (user.studentId) {
      await Student.findByIdAndDelete(user.studentId);
    }
    if (user.facultyId) {
      await Faculty.findByIdAndDelete(user.facultyId);
    }

    await user.deleteOne();

    logger.info(`User ${user.email} deleted by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPendingUsers,
  getAllUsers,
  approveUser,
  rejectUser,
  updateUserRole,
  deleteUser,
};