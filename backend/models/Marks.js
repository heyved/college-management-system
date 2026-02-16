const mongoose = require('mongoose');

const marksSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    academicYear: {
      type: String,
      required: true,
    },
    semester: {
      type: Number,
      required: true,
      min: 1,
      max: 8,
    },
    examType: {
      type: String,
      enum: ['internal', 'midterm', 'endterm', 'assignment', 'project'],
      required: true,
    },
    marksObtained: {
      type: Number,
      required: true,
      min: 0,
    },
    totalMarks: {
      type: Number,
      required: true,
      min: 0,
    },
    percentage: {
      type: Number,
      min: 0,
      max: 100,
    },
    grade: {
      type: String,
      enum: ['O', 'A+', 'A', 'B+', 'B', 'C', 'P', 'F', 'AB'],
    },
    remarks: {
      type: String,
    },
    enteredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Faculty',
      required: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    publishedDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for unique marks entry
marksSchema.index({ student: 1, course: 1, examType: 1, academicYear: 1 }, { unique: true });
marksSchema.index({ course: 1, examType: 1 });
marksSchema.index({ student: 1, semester: 1 });

// Pre-save middleware to calculate percentage and grade
marksSchema.pre('save', function (next) {
  if (this.marksObtained !== undefined && this.totalMarks !== undefined) {
    this.percentage = (this.marksObtained / this.totalMarks) * 100;
    this.grade = calculateGrade(this.percentage);
  }
  next();
});

// Function to calculate grade based on percentage
function calculateGrade(percentage) {
  if (percentage >= 90) return 'O';
  if (percentage >= 80) return 'A+';
  if (percentage >= 70) return 'A';
  if (percentage >= 60) return 'B+';
  if (percentage >= 50) return 'B';
  if (percentage >= 40) return 'C';
  if (percentage >= 35) return 'P';
  return 'F';
}

const Marks = mongoose.model('Marks', marksSchema);

module.exports = Marks;