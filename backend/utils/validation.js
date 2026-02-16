const { validationResult } = require('express-validator');

/**
 * Validate request using express-validator
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((err) => ({
        field: err.param,
        message: err.msg,
      })),
    });
  }
  
  next();
};

/**
 * Common validation rules
 */
const validationRules = {
  email: {
    isEmail: {
      errorMessage: 'Please provide a valid email address',
    },
    normalizeEmail: true,
  },
  
  password: {
    isLength: {
      options: { min: 8 },
      errorMessage: 'Password must be at least 8 characters long',
    },
    matches: {
      options: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      errorMessage: 'Password must contain uppercase, lowercase, number, and special character',
    },
  },
  
  mongoId: {
    isMongoId: {
      errorMessage: 'Invalid ID format',
    },
  },
  
  phoneNumber: {
    matches: {
      options: /^[0-9]{10}$/,
      errorMessage: 'Please provide a valid 10-digit phone number',
    },
  },
};

module.exports = {
  validate,
  validationRules,
};