const Booking = require('../models/booking.model');
const Class = require('../models/class.model');
const Notification = require('../models/notification.model');
const User = require('../models/user.model');
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
    const { classId, bookingDate } = req.body;
    const userId = req.user._id;

    // Check if class exists and is available
    const yogaClass = await Class.findById(classId);
    if (!yogaClass) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Check if class is full
    if (yogaClass.bookedCount >= yogaClass.capacity) {
      return res.status(400).json({ message: 'Class is full' });
    }

    // Check if user already has a booking for this class
    const existingBooking = await Booking.findOne({
      user: userId,
      class: classId,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (existingBooking) {
      return res.status(400).json({ message: 'You already have a booking for this class' });
    }

    // Create booking
    const booking = new Booking({
      user: userId,
      class: classId,
      bookingDate,
      status: 'pending',
      paymentStatus: 'pending'
    });

    await booking.save();

    // Update class booked count
    yogaClass.bookedCount += 1;
    await yogaClass.save();

    // Populate booking data for notifications
    const populatedBooking = await Booking.findById(booking._id)
      .populate('user', 'firstName lastName')
      .populate('class', 'name');

    // Create notification for user
    try {
      await Notification.create({
        recipient: userId,
        type: 'info',
        title: 'Booking Created',
        message: `Your booking for ${populatedBooking.class.name} has been created and is pending approval.`,
        link: `/bookings/${booking._id}`
      });
    } catch (notificationError) {
      console.error('Error creating user notification:', notificationError);
    }

    // Create notification for admin
    try {
      // Find an admin user to receive the notification
      const adminUser = await User.findOne({ role: 'admin' });
      if (adminUser) {
        await Notification.create({
          recipient: adminUser._id,
          type: 'info',
          title: 'New Booking Request',
          message: `${populatedBooking.user.firstName} ${populatedBooking.user.lastName} has requested to book ${populatedBooking.class.name}.`,
          link: `/admin/bookings/${booking._id}`
        });
      }
    } catch (notificationError) {
      console.error('Error creating admin notification:', notificationError);
    }

    res.status(201).json({
      success: true,
      data: populatedBooking
    });
  } catch (error) {
    console.error('Error creating booking:', error);
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
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'firstName lastName email')
      .populate({
        path: 'class',
        select: 'name description duration price capacity tutor location',
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

    // If user is cancelling their own pending booking request
    if (status === 'cancelled' && booking.status === 'pending' && req.user._id.toString() === booking.user._id.toString()) {
      // Get the class to update its bookedCount
      const classData = await Class.findById(booking.class);
      if (classData) {
        // Use findOneAndUpdate to avoid validation
        await Class.findOneAndUpdate(
          { _id: booking.class },
          { $inc: { bookedCount: -1 } }
        );
      }

      // Create notification for user
      try {
        const userNotification = new Notification({
          recipient: booking.user._id,
          type: 'info',
          title: 'Booking Cancelled',
          message: `Your booking request for ${booking.class.name} has been cancelled.`,
          link: `/bookings/${booking._id}`
        });
        await userNotification.save();
      } catch (notificationError) {
        console.error('Error creating user notification:', notificationError);
      }

      // Delete the booking
      await Booking.findByIdAndDelete(booking._id);

      return res.json({
        success: true,
        message: 'Booking request cancelled successfully'
      });
    }

    // For admin cancellations or other status updates
    if (status === 'cancelled') {
      // Get the class to update its bookedCount
      const classData = await Class.findById(booking.class);
      if (classData) {
        // Use findOneAndUpdate to avoid validation
        await Class.findOneAndUpdate(
          { _id: booking.class },
          { $inc: { bookedCount: -1 } }
        );
      }

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

      // Create notification for user
      try {
        const userNotification = new Notification({
          recipient: booking.user._id,
          type: 'warning',
          title: 'Booking Cancelled',
          message: `Your booking for ${booking.class.name} has been cancelled.${cancellationReason ? ` Reason: ${cancellationReason}` : ''}`,
          link: `/bookings/${booking._id}`
        });
        await userNotification.save();
      } catch (notificationError) {
        console.error('Error creating user notification:', notificationError);
      }
    } else if (status === 'present' || status === 'absent') {
      await booking.markAttendance(status);

      // Create notification for user
      try {
        const userNotification = new Notification({
          recipient: booking.user._id,
          type: 'info',
          title: 'Attendance Marked',
          message: `Your attendance for ${booking.class.name} has been marked as ${status}.`,
          link: `/bookings/${booking._id}`
        });
        await userNotification.save();
      } catch (notificationError) {
        console.error('Error creating user notification:', notificationError);
      }
    } else {
      booking.status = status;
      await booking.save();

      // Create notification for user
      try {
        const userNotification = new Notification({
          recipient: booking.user._id,
          type: 'info',
          title: 'Booking Status Updated',
          message: `Your booking for ${booking.class.name} has been ${status}.`,
          link: `/bookings/${booking._id}`
        });
        await userNotification.save();
      } catch (notificationError) {
        console.error('Error creating user notification:', notificationError);
      }
    }

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Error updating booking status:', error);
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

// Delete a booking
exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Get the class to update its bookedCount
    const classData = await Class.findById(booking.class);
    if (classData) {
      classData.bookedCount = Math.max(0, classData.bookedCount - 1);
      await classData.save();
    }

    // Delete the booking
    await Booking.findByIdAndDelete(booking._id);

    res.json({
      success: true,
      message: 'Booking deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting booking',
      error: error.message
    });
  }
}; 