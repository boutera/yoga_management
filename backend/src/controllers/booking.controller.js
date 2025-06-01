const Booking = require('../models/booking.model');
const Class = require('../models/class.model');
const Notification = require('../models/notification.model');
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
      .populate('user', 'firstName lastName email')
      .populate({
        path: 'class',
        select: 'name description duration price capacity tutor location',
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
    const {
      class: classId,
      user,
      bookingDate,
      paymentAmount,
      paymentMethod,
      status,
      paymentStatus,
      attendanceStatus
    } = req.body;

    // Check if class exists and has available spots
    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    // Get current number of active bookings for this class
    const activeBookings = await Booking.countDocuments({
      class: classId,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (activeBookings >= classData.capacity) {
      return res.status(400).json({
        success: false,
        message: 'Class is full'
      });
    }

    // Create the booking
    const booking = new Booking({
      class: classId,
      user,
      bookingDate,
      paymentAmount,
      paymentMethod,
      status,
      paymentStatus,
      attendanceStatus
    });

    await booking.save();

    // Update the class's bookedCount
    classData.bookedCount = activeBookings + 1;
    await classData.save();

    // Populate the booking with class and user information
    const populatedBooking = await Booking.findById(booking._id)
      .populate('user', 'firstName lastName email')
      .populate({
        path: 'class',
        populate: [
          { path: 'tutor', select: 'firstName lastName email' },
          { path: 'location', select: 'name address' }
        ]
      });

    // Create notification for admin
    const adminNotification = new Notification({
      recipient: 'admin', // You'll need to get the admin's ID from your system
      type: 'info',
      title: 'New Booking Request',
      message: `${booking.user.firstName} ${booking.user.lastName} has requested to book ${booking.class.name}`,
      link: `/admin/bookings/${booking._id}`
    });

    await adminNotification.save();

    // Create notification for user
    const userNotification = new Notification({
      recipient: user,
      type: 'info',
      title: 'Booking Confirmation',
      message: `Your booking for ${booking.class.name} has been received and is pending approval.`,
      link: `/bookings/${booking._id}`
    });

    await userNotification.save();

    res.status(201).json({
      success: true,
      data: populatedBooking
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
    const { status, cancellationReason } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (status === 'cancelled') {
      booking.status = 'cancelled';
      booking.cancellationReason = cancellationReason;
      booking.cancellationDate = new Date();
      booking.paymentStatus = 'refunded';
      booking.paymentDetails = {
        ...booking.paymentDetails,
        refundDate: new Date(),
        refundAmount: booking.paymentAmount
      };
      await booking.save();
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

// Update a booking
exports.updateBooking = async (req, res) => {
  try {
    const { status, ...updateData } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Update the booking
    Object.assign(booking, updateData);
    if (status) {
      booking.status = status;
    }
    await booking.save();

    // Populate the updated booking
    const updatedBooking = await Booking.findById(booking._id)
      .populate('user', 'firstName lastName email')
      .populate({
        path: 'class',
        select: 'name description duration price capacity tutor location',
        populate: [
          { path: 'tutor', select: 'name email' },
          { path: 'location', select: 'name address' }
        ]
      });

    res.json({
      success: true,
      data: updatedBooking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating booking',
      error: error.message
    });
  }
}; 