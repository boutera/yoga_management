const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no-show'],
    default: 'pending'
  },
  bookingDate: {
    type: Date,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded', 'failed'],
    default: 'pending'
  },
  paymentAmount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'credit_card', 'debit_card', 'online_transfer'],
    required: true
  },
  paymentDetails: {
    transactionId: String,
    paymentDate: Date,
    refundDate: Date,
    refundAmount: Number
  },
  attendanceStatus: {
    type: String,
    enum: ['not_checked', 'present', 'absent'],
    default: 'not_checked'
  },
  notes: {
    type: String,
    trim: true
  },
  cancellationReason: {
    type: String,
    trim: true
  },
  cancellationDate: {
    type: Date
  },
  refundAmount: {
    type: Number,
    min: 0
  }
}, {
  timestamps: true
});

// Indexes for better query performance
bookingSchema.index({ user: 1 });
bookingSchema.index({ class: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ bookingDate: 1 });
bookingSchema.index({ paymentStatus: 1 });

// Virtual for checking if booking is active
bookingSchema.virtual('isActive').get(function() {
  return ['pending', 'confirmed'].includes(this.status);
});

// Virtual for checking if booking is refundable
bookingSchema.virtual('isRefundable').get(function() {
  const now = new Date();
  const bookingDate = new Date(this.bookingDate);
  const hoursUntilClass = (bookingDate - now) / (1000 * 60 * 60);
  return hoursUntilClass >= 24 && this.status === 'confirmed';
});

// Method to cancel booking
bookingSchema.methods.cancelBooking = async function(reason) {
  if (!this.isRefundable) {
    throw new Error('Booking cannot be cancelled less than 24 hours before class');
  }

  this.status = 'cancelled';
  this.cancellationReason = reason;
  this.cancellationDate = new Date();
  this.refundAmount = this.paymentAmount;
  this.paymentStatus = 'refunded';
  this.paymentDetails.refundDate = new Date();
  this.paymentDetails.refundAmount = this.paymentAmount;

  return this.save();
};

// Method to mark attendance
bookingSchema.methods.markAttendance = async function(status) {
  if (!['present', 'absent'].includes(status)) {
    throw new Error('Invalid attendance status');
  }

  this.attendanceStatus = status;
  if (status === 'absent') {
    this.status = 'no-show';
  } else if (status === 'present') {
    this.status = 'completed';
  }

  return this.save();
};

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking; 