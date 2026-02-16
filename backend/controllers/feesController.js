const Fees = require('../models/Fees');
const Student = require('../models/Student');
const logger = require('../utils/logger');

/**
 * @desc    Get all fees records
 * @route   GET /api/v1/fees
 * @access  Private
 */
const getAllFees = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      student,
      status,
      semester,
      academicYear,
      feeType,
    } = req.query;

    const query = {};

    // If user is a student, only show their fees
    if (req.user.role === 'student') {
      const studentRecord = await Student.findOne({ userId: req.user._id });
      if (studentRecord) {
        query.student = studentRecord._id;
      }
    }

    if (student) query.student = student;
    if (status) query.status = status;
    if (semester) query.semester = semester;
    if (academicYear) query.academicYear = academicYear;
    if (feeType) query.feeType = feeType;

    const fees = await Fees.find(query)
      .populate('student', 'firstName lastName studentCode department')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Fees.countDocuments(query);

    res.status(200).json({
      success: true,
      data: fees,
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
 * @desc    Get fees by student ID
 * @route   GET /api/v1/fees/student/:studentId
 * @access  Private
 */
const getFeesByStudent = async (req, res, next) => {
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

    const fees = await Fees.find({ student: req.params.studentId })
      .sort({ academicYear: -1, semester: -1 });

    // Calculate totals
    const totals = fees.reduce(
      (acc, fee) => {
        acc.totalAmount += fee.totalAmount;
        acc.paidAmount += fee.paidAmount;
        acc.dueAmount += fee.dueAmount;
        return acc;
      },
      { totalAmount: 0, paidAmount: 0, dueAmount: 0 }
    );

    res.status(200).json({
      success: true,
      data: {
        student,
        fees,
        summary: totals,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create fee record
 * @route   POST /api/v1/fees
 * @access  Private (Admin)
 */
const createFee = async (req, res, next) => {
  try {
    const {
      student,
      academicYear,
      semester,
      feeType,
      totalAmount,
      dueDate,
      discount,
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

    const fee = await Fees.create({
      student,
      academicYear,
      semester,
      feeType,
      totalAmount,
      dueDate,
      discount: discount || 0,
      remarks,
    });

    logger.info(
      `Fee created for student ${studentExists.studentCode} - ${feeType} by ${req.user.email}`
    );

    const populatedFee = await Fees.findById(fee._id).populate(
      'student',
      'firstName lastName studentCode'
    );

    res.status(201).json({
      success: true,
      message: 'Fee record created successfully.',
      data: populatedFee,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update fee record
 * @route   PUT /api/v1/fees/:id
 * @access  Private (Admin)
 */
const updateFee = async (req, res, next) => {
  try {
    const allowedUpdates = [
      'totalAmount',
      'dueDate',
      'discount',
      'lateFee',
      'remarks',
    ];

    const updates = Object.keys(req.body);
    const isValidUpdate = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidUpdate) {
      return res.status(400).json({
        success: false,
        message: 'Invalid updates.',
      });
    }

    const fee = await Fees.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('student', 'firstName lastName studentCode');

    if (!fee) {
      return res.status(404).json({
        success: false,
        message: 'Fee record not found.',
      });
    }

    logger.info(`Fee updated: ${fee._id} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Fee record updated successfully.',
      data: fee,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add payment to fee
 * @route   POST /api/v1/fees/:id/payment
 * @access  Private (Admin)
 */
const addPayment = async (req, res, next) => {
  try {
    const { amount, paymentMode, transactionId, remarks } = req.body;

    const fee = await Fees.findById(req.params.id);

    if (!fee) {
      return res.status(404).json({
        success: false,
        message: 'Fee record not found.',
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Payment amount must be greater than zero.',
      });
    }

    if (amount > fee.dueAmount) {
      return res.status(400).json({
        success: false,
        message: 'Payment amount cannot exceed due amount.',
      });
    }

    const payment = {
      amount,
      paymentMode,
      transactionId,
      remarks,
      receivedBy: req.user._id,
    };

    await fee.addPayment(payment);

    logger.info(
      `Payment of ₹${amount} received for fee ${fee._id} by ${req.user.email}`
    );

    const updatedFee = await Fees.findById(fee._id).populate(
      'student',
      'firstName lastName studentCode'
    );

    res.status(200).json({
      success: true,
      message: 'Payment added successfully.',
      data: updatedFee,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete fee record
 * @route   DELETE /api/v1/fees/:id
 * @access  Private (Admin)
 */
const deleteFee = async (req, res, next) => {
  try {
    const fee = await Fees.findById(req.params.id);

    if (!fee) {
      return res.status(404).json({
        success: false,
        message: 'Fee record not found.',
      });
    }

    if (fee.paidAmount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete fee record with payments. Please refund first.',
      });
    }

    await fee.deleteOne();

    logger.info(`Fee deleted: ${fee._id} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Fee record deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get fee statistics
 * @route   GET /api/v1/fees/stats
 * @access  Private (Admin)
 */
const getFeeStats = async (req, res, next) => {
  try {
    const stats = await Fees.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' },
          paidAmount: { $sum: '$paidAmount' },
          dueAmount: { $sum: '$dueAmount' },
        },
      },
    ]);

    const overall = await Fees.aggregate([
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$totalAmount' },
          paidAmount: { $sum: '$paidAmount' },
          dueAmount: { $sum: '$dueAmount' },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        statusWise: stats,
        overall: overall[0] || { totalAmount: 0, paidAmount: 0, dueAmount: 0 },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllFees,
  getFeesByStudent,
  createFee,
  updateFee,
  addPayment,
  deleteFee,
  getFeeStats,
};