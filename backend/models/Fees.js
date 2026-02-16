const mongoose = require('mongoose');

const feesSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
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
    feeType: {
      type: String,
      enum: ['tuition', 'examination', 'library', 'sports', 'hostel', 'transport', 'other'],
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    dueAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'partial', 'paid', 'overdue'],
      default: 'pending',
    },
    paymentHistory: [
      {
        amount: {
          type: Number,
          required: true,
        },
        paymentDate: {
          type: Date,
          default: Date.now,
        },
        paymentMode: {
          type: String,
          enum: ['cash', 'card', 'upi', 'netbanking', 'cheque'],
          required: true,
        },
        transactionId: {
          type: String,
        },
        remarks: String,
        receivedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      },
    ],
    lateFee: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    remarks: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
feesSchema.index({ student: 1, academicYear: 1, semester: 1 });
feesSchema.index({ status: 1, dueDate: 1 });

// Pre-save middleware to calculate due amount and status
feesSchema.pre('save', function (next) {
  this.dueAmount = this.totalAmount - this.paidAmount + this.lateFee - this.discount;

  if (this.dueAmount <= 0) {
    this.status = 'paid';
  } else if (this.paidAmount > 0) {
    this.status = 'partial';
  } else if (new Date() > this.dueDate) {
    this.status = 'overdue';
  } else {
    this.status = 'pending';
  }

  next();
});

// Method to add payment
feesSchema.methods.addPayment = function (paymentData) {
  this.paymentHistory.push(paymentData);
  this.paidAmount += paymentData.amount;
  return this.save();
};

const Fees = mongoose.model('Fees', feesSchema);

module.exports = Fees;