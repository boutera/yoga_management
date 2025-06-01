const Booking = require('../models/booking.model');
const Class = require('../models/class.model');
const Tutor = require('../models/tutor.model');
const Location = require('../models/location.model');
const { validateDate } = require('../utils/validation');
const User = require('../models/user.model');

// Get booking report
exports.getBookingReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    console.log('Date range:', { startDate, endDate });

    // Set start date to beginning of day and end date to end of day
    const startDateTime = new Date(startDate);
    startDateTime.setHours(0, 0, 0, 0);
    
    const endDateTime = new Date(endDate);
    endDateTime.setHours(23, 59, 59, 999);

    const query = {
      bookingDate: {
        $gte: startDateTime,
        $lte: endDateTime
      }
    };

    console.log('Query date range:', {
      start: startDateTime,
      end: endDateTime
    });

    // Get all users created within the date range
    const newUsers = await User.find({
      createdAt: {
        $gte: startDateTime,
        $lte: endDateTime
      }
    }).select('_id');
    
    console.log('New users found:', newUsers.length);
    console.log('New users query:', {
      createdAt: {
        $gte: startDateTime,
        $lte: endDateTime
      }
    });

    const bookings = await Booking.find(query)
      .populate('user', 'firstName lastName email phoneNumber')
      .populate('class', 'name tutor location')
      .populate('class.tutor', 'name')
      .populate('class.location', 'name')
      .select('-__v');

    console.log('Total bookings found:', bookings.length);
    console.log('Sample booking user data:', bookings[0]?.user);

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
        newUsers: newUsers.length,
        returningUsers: 0
      },
      byUser: {}  // Add user booking distribution
    };

    const userSet = new Set();

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

      // Track unique users and their booking counts
      if (booking.user) {
        const userId = booking.user._id.toString();
        userSet.add(userId);
        const userName = `${booking.user.firstName} ${booking.user.lastName}`;
        report.byUser[userName] = (report.byUser[userName] || 0) + 1;
      }
    });

    console.log('User booking distribution:', report.byUser);
    console.log('Total unique users:', userSet.size);

    report.userStats.totalUsers = userSet.size;
    report.userStats.returningUsers = userSet.size - report.userStats.newUsers;

    console.log('Final report stats:', report.userStats);

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
    
    // Set start date to beginning of day and end date to end of day
    const startDateTime = new Date(startDate);
    startDateTime.setHours(0, 0, 0, 0);
    
    const endDateTime = new Date(endDate);
    endDateTime.setHours(23, 59, 59, 999);

    const query = {
      bookingDate: {
        $gte: startDateTime,
        $lte: endDateTime
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
    
    // Set start date to beginning of day and end date to end of day
    const startDateTime = new Date(startDate);
    startDateTime.setHours(0, 0, 0, 0);
    
    const endDateTime = new Date(endDate);
    endDateTime.setHours(23, 59, 59, 999);

    const query = {
      bookingDate: {
        $gte: startDateTime,
        $lte: endDateTime
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

    // Get all active classes for these tutors
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
      studentDistribution: {}  // This will be used for the chart
    };

    tutors.forEach(tutor => {
      // Count by status
      report.byStatus[tutor.status] = (report.byStatus[tutor.status] || 0) + 1;

      // Count by specialty
      tutor.specialties.forEach(specialty => {
        report.bySpecialty[specialty] = (report.bySpecialty[specialty] || 0) + 1;
      });

      // Count active classes for this tutor
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
    console.log('Location Report - Date range:', { startDate, endDate });
    
    // Set start date to beginning of day and end date to end of day
    const startDateTime = new Date(startDate);
    startDateTime.setHours(0, 0, 0, 0);
    
    const endDateTime = new Date(endDate);
    endDateTime.setHours(23, 59, 59, 999);

    console.log('Query date range:', {
      start: startDateTime,
      end: endDateTime
    });
    
    // Get all locations
    const locations = await Location.find().select('-__v');
    
    // Get all classes for these locations
    const classes = await Class.find({ 
      location: { $in: locations.map(l => l._id) }
    })
      .populate('location', 'name')
      .select('-__v');

    console.log('Found classes:', classes.map(c => ({
      name: c.name,
      location: c.location?.name,
      status: c.status
    })));

    // Get ALL confirmed bookings within date range
    const bookings = await Booking.find({
      status: 'confirmed',
      bookingDate: {
        $gte: startDateTime,
        $lte: endDateTime
      }
    })
    .populate({
      path: 'class',
      populate: {
        path: 'location',
        select: 'name'
      }
    });

    console.log('Total confirmed bookings found:', bookings.length);
    console.log('Confirmed bookings by location:', bookings.reduce((acc, b) => {
      const loc = b.class?.location?.name || 'Unknown';
      acc[loc] = (acc[loc] || 0) + 1;
      return acc;
    }, {}));

    // Log each confirmed booking for debugging
    console.log('Detailed confirmed bookings:');
    bookings.forEach((booking, index) => {
      console.log(`Booking ${index + 1}:`, {
        id: booking._id,
        status: booking.status,
        class: booking.class?.name,
        location: booking.class?.location?.name,
        bookingDate: booking.bookingDate
      });
    });

    // Simple booking count by location
    const bookingCounts = {};
    bookings.forEach(booking => {
      const locationName = booking.class?.location?.name;
      if (locationName) {
        bookingCounts[locationName] = (bookingCounts[locationName] || 0) + 1;
      }
    });

    console.log('Raw booking counts:', bookingCounts);

    const report = {
      totalLocations: locations.length,
      byStatus: {},
      byCity: {},
      classDistribution: {},
      capacityUtilization: {},
      bookingDistribution: bookingCounts  // Use the raw counts directly
    };

    // Process each location for other metrics
    locations.forEach(location => {
      // Count by status
      report.byStatus[location.status] = (report.byStatus[location.status] || 0) + 1;

      // Count by city
      const city = location.address?.city || 'Unknown';
      report.byCity[city] = (report.byCity[city] || 0) + 1;

      // Get active classes for this location
      const locationClasses = classes.filter(c => 
        c.location._id.toString() === location._id.toString() && 
        c.status === 'active'
      );
      report.classDistribution[location.name] = locationClasses.length;

      // Calculate capacity
      const totalCapacity = locationClasses.reduce((sum, cls) => sum + (cls.capacity || 0), 0);

      // Calculate utilization
      report.capacityUtilization[location.name] = {
        totalCapacity: totalCapacity,
        classesCount: locationClasses.length,
        utilizationRate: Math.round((bookingCounts[location.name] || 0) / (totalCapacity || 1) * 100)
      };
    });

    console.log('Final report:', report);
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