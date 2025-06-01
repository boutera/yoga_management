const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Class name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  tutor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tutor',
    required: [true, 'Tutor is required']
  },
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    required: [true, 'Location is required']
  },
  capacity: {
    type: Number,
    required: [true, 'Capacity is required'],
    min: [1, 'Capacity must be at least 1']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  duration: {
    type: Number,
    required: [true, 'Duration is required'],
    min: [15, 'Duration must be at least 15 minutes']
  },
  schedule: [{
    dayOfWeek: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      required: true
    },
    startTime: {
      type: String,
      required: true,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time (HH:mm)']
    },
    endTime: {
      type: String,
      required: true,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time (HH:mm)']
    }
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'cancelled'],
    default: 'active'
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Hatha', 'Vinyasa', 'Ashtanga', 'Yin', 'Restorative', 'Power', 'Prenatal', 'Other']
  },
  level: {
    type: String,
    required: [true, 'Level is required'],
    enum: ['Beginner', 'Intermediate', 'Advanced', 'All Levels', 'all']
  },
  requirements: [{
    type: String,
    trim: true
  }],
  equipment: [{
    type: String,
    trim: true
  }],
  maxAge: {
    type: Number,
    min: 0
  },
  minAge: {
    type: Number,
    min: 0
  }
}, {
  timestamps: true
});

// Indexes for better query performance
classSchema.index({ tutor: 1 });
classSchema.index({ location: 1 });
classSchema.index({ status: 1 });
classSchema.index({ category: 1 });
classSchema.index({ level: 1 });

// Virtual for checking if class is full
classSchema.virtual('isFull').get(async function() {
  const Booking = mongoose.model('Booking');
  const activeBookings = await Booking.countDocuments({
    class: this._id,
    status: { $in: ['pending', 'confirmed'] }
  });
  return activeBookings >= this.capacity;
});

// Method to check if class is available at a specific time
classSchema.methods.isAvailableAt = function(day, time) {
  return this.schedule.some(slot => {
    if (slot.dayOfWeek.toLowerCase() !== day.toLowerCase()) return false;
    
    const slotStart = new Date(`2000-01-01T${slot.startTime}`);
    const slotEnd = new Date(`2000-01-01T${slot.endTime}`);
    const checkTime = new Date(`2000-01-01T${time}`);
    
    return checkTime >= slotStart && checkTime <= slotEnd;
  });
};

const Class = mongoose.model('Class', classSchema);

module.exports = Class; 