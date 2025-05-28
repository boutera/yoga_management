const Booking = require('../models/booking.model');
const Class = require('../models/class.model');
const Tutor = require('../models/tutor.model');
const Location = require('../models/location.model');
const { validateDate } = require('../utils/validation');

// Get booking report
exports.getBookingReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = {
      bookingDate: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };

    const bookings = await Booking.find(query)
      .populate('user', 'firstName lastName email phoneNumber')
      .populate('class', 'name tutor location')
      .populate('class.tutor', 'name')
      .populate('class.location', 'name')
      .select('-__v');

    const report = {
      totalBookings: bookings.length,
      byStatus: {},
      byClass: {},
      byLocation: {},
      byTutor: {},
      byPaymentStatus: {},
      byPaymentMethod: {},
      dailyBookings: {},
      userStats: {
        totalUsers: 0,
        newUsers: 0,
        returningUsers: 0
      }
    };

    const userSet = new Set();
    const newUserSet = new Set();

    bookings.forEach(booking => {
      // Count by status
      report.byStatus[booking.status] = (report.byStatus[booking.status] || 0) + 1;

      // Count by class
      const className = booking.class?.name || 'Unknown';
      report.byClass[className] = (report.byClass[className] || 0) + 1;

      // Count by location
      const locationName = booking.class?.location?.name || 'Unknown';
      report.byLocation[locationName] = (report.byLocation[locationName] || 0) + 1;

      // Count by tutor
      const tutorName = booking.class?.tutor?.name || 'Unknown';
      report.byTutor[tutorName] = (report.byTutor[tutorName] || 0) + 1;

      // Count by payment status
      report.byPaymentStatus[booking.paymentStatus] = (report.byPaymentStatus[booking.paymentStatus] || 0) + 1;

      // Count by payment method
      if (booking.paymentMethod) {
        report.byPaymentMethod[booking.paymentMethod] = (report.byPaymentMethod[booking.paymentMethod] || 0) + 1;
      }

      // Count daily bookings
      const date = booking.bookingDate.toISOString().split('T')[0];
      report.dailyBookings[date] = (report.dailyBookings[date] || 0) + 1;

      // Track unique users
      if (booking.user) {
        userSet.add(booking.user._id.toString());
        if (booking.user.createdAt && new Date(booking.user.createdAt) >= new Date(startDate)) {
          newUserSet.add(booking.user._id.toString());
        }
      }
    });

    report.userStats.totalUsers = userSet.size;
    report.userStats.newUsers = newUserSet.size;
    report.userStats.returningUsers = userSet.size - newUserSet.size;

    res.json(report);
  } catch (error) {
    console.error('Error generating booking report:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get revenue report
exports.getRevenueReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = {
      bookingDate: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };

    const bookings = await Booking.find(query)
      .populate('class', 'name tutor location')
      .populate('user', 'firstName lastName email')
      .select('-__v');

    const report = {
      totalBookings: bookings.length,
      byClass: {},
      byLocation: {},
      byTutor: {},
      dailyBookings: {},
      userStats: {
        totalUsers: 0,
        newUsers: 0,
        returningUsers: 0
      }
    };

    const userSet = new Set();
    const newUserSet = new Set();

    bookings.forEach(booking => {
      // Count by class
      const className = booking.class?.name || 'Unknown';
      report.byClass[className] = (report.byClass[className] || 0) + 1;

      // Count by location
      const locationName = booking.class?.location?.name || 'Unknown';
      report.byLocation[locationName] = (report.byLocation[locationName] || 0) + 1;

      // Count by tutor
      const tutorName = booking.class?.tutor?.name || 'Unknown';
      report.byTutor[tutorName] = (report.byTutor[tutorName] || 0) + 1;

      // Count daily bookings
      const date = booking.bookingDate.toISOString().split('T')[0];
      report.dailyBookings[date] = (report.dailyBookings[date] || 0) + 1;

      // Track unique users
      if (booking.user) {
        userSet.add(booking.user._id.toString());
        if (booking.user.createdAt && new Date(booking.user.createdAt) >= new Date(startDate)) {
          newUserSet.add(booking.user._id.toString());
        }
      }
    });

    report.userStats.totalUsers = userSet.size;
    report.userStats.newUsers = newUserSet.size;
    report.userStats.returningUsers = userSet.size - newUserSet.size;

    res.json(report);
  } catch (error) {
    console.error('Error generating revenue report:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get attendance report
exports.getAttendanceReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = {
      bookingDate: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };

    const bookings = await Booking.find(query)
      .populate('class', 'name tutor location')
      .populate('class.tutor', 'name')
      .populate('class.location', 'name')
      .select('-__v');

    const report = {
      totalBookings: bookings.length,
      attendance: {
        present: 0,
        absent: 0,
        not_checked: 0
      },
      byClass: {},
      byLocation: {},
      byTutor: {}
    };

    bookings.forEach(booking => {
      // Count attendance status
      const status = booking.attendanceStatus || 'not_checked';
      report.attendance[status]++;

      // Attendance by class
      const className = booking.class?.name || 'Unknown';
      if (!report.byClass[className]) {
        report.byClass[className] = { present: 0, absent: 0, not_checked: 0 };
      }
      report.byClass[className][status]++;

      // Attendance by location
      const locationName = booking.class?.location?.name || 'Unknown';
      if (!report.byLocation[locationName]) {
        report.byLocation[locationName] = { present: 0, absent: 0, not_checked: 0 };
      }
      report.byLocation[locationName][status]++;

      // Attendance by tutor
      const tutorName = booking.class?.tutor?.name || 'Unknown';
      if (!report.byTutor[tutorName]) {
        report.byTutor[tutorName] = { present: 0, absent: 0, not_checked: 0 };
      }
      report.byTutor[tutorName][status]++;
    });

    res.json(report);
  } catch (error) {
    console.error('Error generating attendance report:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get class report
exports.getClassReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = {
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };

    const classes = await Class.find(query)
      .populate('tutor', 'name')
      .populate('location', 'name')
      .select('-__v');

    const report = {
      totalClasses: classes.length,
      byCategory: {},
      byLevel: {},
      byTutor: {},
      byLocation: {},
      byStatus: {}
    };

    classes.forEach(cls => {
      // Count by category
      report.byCategory[cls.category] = (report.byCategory[cls.category] || 0) + 1;

      // Count by level
      report.byLevel[cls.level] = (report.byLevel[cls.level] || 0) + 1;

      // Count by tutor
      const tutorName = cls.tutor.name;
      report.byTutor[tutorName] = (report.byTutor[tutorName] || 0) + 1;

      // Count by location
      const locationName = cls.location.name;
      report.byLocation[locationName] = (report.byLocation[locationName] || 0) + 1;

      // Count by status
      report.byStatus[cls.status] = (report.byStatus[cls.status] || 0) + 1;
    });

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get tutor report
exports.getTutorReport = async (req, res) => {
  try {
    // Get all tutors
    const tutors = await Tutor.find().select('-__v');
    const classes = await Class.find({ 
      tutor: { $in: tutors.map(t => t._id) },
      status: 'active'
    })
      .populate('tutor', 'name')
      .select('-__v');

    // Get all bookings for these classes
    const bookings = await Booking.find({
      class: { $in: classes.map(c => c._id) },
      status: { $in: ['confirmed', 'completed'] }  // Only count confirmed and completed bookings
    })
      .populate('class', 'tutor')
      .select('-__v');

    const report = {
      totalTutors: tutors.length,
      byStatus: {},
      bySpecialty: {},
      classDistribution: {},
      ratingDistribution: {},
      studentDistribution: {}  // Add student count by tutor
    };

    tutors.forEach(tutor => {
      // Count by status
      report.byStatus[tutor.status] = (report.byStatus[tutor.status] || 0) + 1;

      // Count by specialty
      tutor.specialties.forEach(specialty => {
        report.bySpecialty[specialty] = (report.bySpecialty[specialty] || 0) + 1;
      });

      // Count active classes
      const tutorClasses = classes.filter(c => c.tutor._id.toString() === tutor._id.toString());
      report.classDistribution[tutor.name] = tutorClasses.length;

      // Count students (bookings) for this tutor
      const tutorClassIds = tutorClasses.map(c => c._id.toString());
      const tutorBookings = bookings.filter(b => tutorClassIds.includes(b.class._id.toString()));
      report.studentDistribution[tutor.name] = tutorBookings.length;

      // Store rating by tutor name
      report.ratingDistribution[tutor.name] = tutor.rating;
    });

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get location report
exports.getLocationReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Get all locations
    const locations = await Location.find().select('-__v');
    
    // Get active classes for these locations within date range
    const classes = await Class.find({ 
      location: { $in: locations.map(l => l._id) },
      status: 'active',
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    })
      .populate('location', 'name')
      .select('-__v');

    // Get bookings for these classes within date range
    const bookings = await Booking.find({
      class: { $in: classes.map(c => c._id) },
      status: { $in: ['confirmed', 'completed'] },
      bookingDate: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    })
      .populate('class', 'location')
      .select('-__v');

    const report = {
      totalLocations: locations.length,
      byStatus: {},
      byCity: {},
      classDistribution: {},
      capacityUtilization: {},
      bookingDistribution: {}
    };

    locations.forEach(location => {
      // Count by status
      report.byStatus[location.status] = (report.byStatus[location.status] || 0) + 1;

      // Count by city - safely handle missing address data
      const city = location.address?.city || 'Unknown';
      report.byCity[city] = (report.byCity[city] || 0) + 1;

      // Count active classes
      const locationClasses = classes.filter(c => c.location._id.toString() === location._id.toString());
      report.classDistribution[location.name] = locationClasses.length;

      // Count bookings for this location
      const locationClassIds = locationClasses.map(c => c._id.toString());
      const locationBookings = bookings.filter(b => locationClassIds.includes(b.class._id.toString()));
      report.bookingDistribution[location.name] = locationBookings.length;

      // Calculate capacity utilization
      report.capacityUtilization[location.name] = {
        totalCapacity: location.capacity || 0,
        classesCount: locationClasses.length,
        utilizationRate: Math.round((locationClasses.length / (location.capacity || 1)) * 100)
      };
    });

    res.json(report);
  } catch (error) {
    console.error('Error generating location report:', error);
    res.status(500).json({ message: error.message });
  }
};

// Export report
exports.exportReport = async (req, res) => {
  try {
    const { type, format, startDate, endDate } = req.body;

    // Get the appropriate report data
    let reportData;
    switch (type) {
      case 'bookings':
        reportData = await Booking.find({
          bookingDate: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        }).populate('user class');
        break;
      case 'revenue':
        reportData = await Booking.find({
          bookingDate: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          },
          paymentStatus: 'paid'
        }).populate('class');
        break;
      // Add other report types as needed
      default:
        return res.status(400).json({ message: 'Invalid report type' });
    }

    // TODO: Implement export functionality based on format (csv, pdf, excel)
    // For now, just return the data
    res.json({
      message: 'Export functionality to be implemented',
      data: reportData
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 