const Booking = require('../models/booking.model');
const Class = require('../models/class.model');
const { validationResult } = require('express-validator');

// Get all bookings with optional filters
exports.getBookings = async (req, res) => {
  try {
    const {
      status,
      paymentStatus,
      startDate,
      endDate,
      user,
      class: classId
    } = req.query;

    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (user) filter.user = user;
    if (classId) filter.class = classId;
    if (startDate || endDate) {
      filter.bookingDate = {};
      if (startDate) filter.bookingDate.$gte = new Date(startDate);
      if (endDate) filter.bookingDate.$lte = new Date(endDate);
    }

    const bookings = await Booking.find(filter)
      .populate('user', 'name email')
      .populate({
        path: 'class',
        populate: [
          { path: 'tutor', select: 'name email' },
          { path: 'location', select: 'name address' }
        ]
      })
      .sort({ bookingDate: -1 });

    res.json({
      success: true,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching bookings',
      error: error.message
    });
  }
};

// Get a single booking by ID
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name email')
      .populate({
        path: 'class',
        populate: [
          { path: 'tutor', select: 'name email' },
          { path: 'location', select: 'name address' }
        ]
      });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching booking',
      error: error.message
    });
  }
};

// Create a new booking
exports.createBooking = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { class: classId, bookingDate, paymentMethod } = req.body;

    // Check if class exists and is active
    const classData = await Class.findById(classId);
    if (!classData || classData.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Class is not available for booking'
      });
    }

    // Check if booking date is valid
    const bookingDateTime = new Date(bookingDate);
    if (bookingDateTime < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot book for past dates'
      });
    }

    // Check if class is already at capacity
    const existingBookings = await Booking.countDocuments({
      class: classId,
      bookingDate: bookingDateTime,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (existingBookings >= classData.capacity) {
      return res.status(400).json({
        success: false,
        message: 'Class is fully booked'
      });
    }

    // Create booking
    const booking = new Booking({
      user: req.user.id,
      class: classId,
      bookingDate: bookingDateTime,
      paymentAmount: classData.price,
      paymentMethod
    });

    await booking.save();

    res.status(201).json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating booking',
      error: error.message
    });
  }
};

// Update booking status
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (status === 'cancelled') {
      await booking.cancelBooking(req.body.cancellationReason);
    } else if (['present', 'absent'].includes(status)) {
      await booking.markAttendance(status);
    } else {
      booking.status = status;
      await booking.save();
    }

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating booking status',
      error: error.message
    });
  }
};

// Get user's bookings
exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate({
        path: 'class',
        populate: [
          { path: 'tutor', select: 'name email' },
          { path: 'location', select: 'name address' }
        ]
      })
      .sort({ bookingDate: -1 });

    res.json({
      success: true,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user bookings',
      error: error.message
    });
  }
};

// Get class bookings
exports.getClassBookings = async (req, res) => {
  try {
    const { date } = req.query;
    const query = { class: req.params.classId };

    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      query.bookingDate = { $gte: startDate, $lte: endDate };
    }

    const bookings = await Booking.find(query)
      .populate('user', 'name email')
      .sort({ bookingDate: 1 });

    res.json({
      success: true,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching class bookings',
      error: error.message
    });
  }
}; 