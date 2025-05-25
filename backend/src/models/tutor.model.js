const mongoose = require('mongoose');

const tutorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  specialties: [{
    type: String,
    required: [true, 'At least one specialty is required']
  }],
  experience: {
    type: Number,
    required: [true, 'Years of experience is required'],
    min: [0, 'Experience cannot be negative']
  },
  bio: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'on_leave'],
    default: 'active'
  },
  profilePicture: {
    type: String
  },
  certifications: [{
    name: String,
    issuer: String,
    year: Number
  }],
  availability: {
    monday: [{ start: String, end: String }],
    tuesday: [{ start: String, end: String }],
    wednesday: [{ start: String, end: String }],
    thursday: [{ start: String, end: String }],
    friday: [{ start: String, end: String }],
    saturday: [{ start: String, end: String }],
    sunday: [{ start: String, end: String }]
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  totalRatings: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for better query performance
tutorSchema.index({ email: 1 });
tutorSchema.index({ status: 1 });
tutorSchema.index({ specialties: 1 });

// Virtual for average rating
tutorSchema.virtual('averageRating').get(function() {
  return this.totalRatings > 0 ? (this.rating / this.totalRatings).toFixed(1) : 0;
});

// Method to update rating
tutorSchema.methods.updateRating = async function(newRating) {
  this.rating += newRating;
  this.totalRatings += 1;
  return this.save();
};

// Method to check availability
tutorSchema.methods.isAvailable = function(day, time) {
  if (!this.availability[day]) return false;
  
  return this.availability[day].some(slot => {
    const slotStart = new Date(`2000-01-01T${slot.start}`);
    const slotEnd = new Date(`2000-01-01T${slot.end}`);
    const checkTime = new Date(`2000-01-01T${time}`);
    
    return checkTime >= slotStart && checkTime <= slotEnd;
  });
};

const Tutor = mongoose.model('Tutor', tutorSchema);

module.exports = Tutor; 