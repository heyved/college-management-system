const mongoose = require('mongoose');

const facultySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    facultyCode: {
      type: String,
      // Remove required: true from here
      unique: true,
      uppercase: true,
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    // ... rest of the schema remains the same
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: true,
    },
    contactNumber: {
      type: String,
      required: true,
      match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit contact number'],
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: { type: String, default: 'India' },
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
    designation: {
      type: String,
      required: true,
      enum: [
        'Professor',
        'Associate Professor',
        'Assistant Professor',
        'Lecturer',
        'Senior Lecturer',
      ],
    },
    qualification: {
      type: String,
      required: true,
      enum: ['PhD', 'M.Tech', 'M.E', 'M.Sc', 'B.Tech', 'B.E'],
    },
    specialization: {
      type: String,
      required: true,
    },
    experience: {
      type: Number,
      required: true,
      min: 0,
    },
    joiningDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    salary: {
      type: Number,
      required: true,
      min: 0,
    },
    assignedCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
      },
    ],
    status: {
      type: String,
      enum: ['active', 'inactive', 'on-leave', 'retired'],
      default: 'active',
    },
    officeLocation: {
      building: String,
      roomNumber: String,
    },
    officeHours: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
facultySchema.index({ facultyCode: 1 });
facultySchema.index({ userId: 1 });
facultySchema.index({ department: 1 });
facultySchema.index({ status: 1 });

// Virtual for full name
facultySchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Pre-save middleware to generate faculty code
facultySchema.pre('save', async function (next) {
  if (!this.isNew) return next();

  try {
    const deptCode = this.department.substring(0, 3).toUpperCase();
    const count = await this.constructor.countDocuments({
      department: this.department,
    });

    this.facultyCode = `FAC${deptCode}${String(count + 1).padStart(4, '0')}`;
    next();
  } catch (error) {
    next(error);
  }
});

facultySchema.set('toJSON', { virtuals: true });
facultySchema.set('toObject', { virtuals: true });

const Faculty = mongoose.model('Faculty', facultySchema);

module.exports = Faculty;