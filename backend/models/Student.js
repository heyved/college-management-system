const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    studentCode: {
      type: String,
      // Remove required: true from here
      unique: true,
      uppercase: true,
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      minlength: [2, 'First name must be at least 2 characters'],
      maxlength: [50, 'First name cannot exceed 50 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      minlength: [2, 'Last name must be at least 2 characters'],
      maxlength: [50, 'Last name cannot exceed 50 characters'],
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required'],
    },
    gender: {
      type: String,
      enum: {
        values: ['male', 'female', 'other'],
        message: '{VALUE} is not a valid gender',
      },
      required: true,
    },
    contactNumber: {
      type: String,
      required: [true, 'Contact number is required'],
      match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit contact number'],
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: { type: String, default: 'India' },
    },
    guardianName: {
      type: String,
      required: [true, 'Guardian name is required'],
    },
    guardianContact: {
      type: String,
      required: [true, 'Guardian contact is required'],
      match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit contact number'],
    },
    guardianRelation: {
      type: String,
      enum: ['father', 'mother', 'guardian', 'other'],
      required: true,
    },
    enrollmentDate: {
      type: Date,
      default: Date.now,
    },
    currentSemester: {
      type: Number,
      min: 1,
      max: 8,
      default: 1,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      enum: [
        'Computer Science',
        'Information Technology',
        'Electronics',
        'Mechanical',
        'Civil',
        'Electrical',
      ],
    },
    courses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
      },
    ],
    status: {
      type: String,
      enum: ['active', 'inactive', 'graduated', 'suspended'],
      default: 'active',
    },
    admissionYear: {
      type: Number,
      required: true,
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
studentSchema.index({ studentCode: 1 });
studentSchema.index({ userId: 1 });
studentSchema.index({ department: 1, currentSemester: 1 });
studentSchema.index({ status: 1 });

// Virtual for full name
studentSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for age
studentSchema.virtual('age').get(function () {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

// Pre-save middleware to generate student code
studentSchema.pre('save', async function (next) {
  if (!this.isNew) return next();

  try {
    const year = this.admissionYear.toString().slice(-2);
    const deptCode = this.department.substring(0, 3).toUpperCase();
    
    const count = await this.constructor.countDocuments({
      admissionYear: this.admissionYear,
      department: this.department,
    });

    this.studentCode = `STU${year}${deptCode}${String(count + 1).padStart(4, '0')}`;
    next();
  } catch (error) {
    next(error);
  }
});

// Configure toJSON to include virtuals
studentSchema.set('toJSON', { virtuals: true });
studentSchema.set('toObject', { virtuals: true });

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;