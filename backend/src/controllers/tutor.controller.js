const Tutor = require('../models/tutor.model');
const Class = require('../models/class.model');
const Booking = require('../models/booking.model');
const { validateObjectId } = require('../utils/validation');

// Get all tutors
exports.getTutors = async (req, res) => {
  try {
    const { status, specialty, search } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }

    if (specialty) {
      query.specialties = specialty;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const tutors = await Tutor.find(query)
      .select('-__v')
      .sort({ name: 1 });

    res.json({
      success: true,
      data: tutors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get tutor by ID
exports.getTutorById = async (req, res) => {
  try {
    if (!validateObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid tutor ID'
      });
    }

    const tutor = await Tutor.findById(req.params.id).select('-__v');
    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: 'Tutor not found'
      });
    }

    res.json({
      success: true,
      data: tutor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Create new tutor
exports.createTutor = async (req, res) => {
  try {
    const tutor = new Tutor(req.body);
    await tutor.save();
    res.status(201).json({
      success: true,
      data: tutor
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Update tutor
exports.updateTutor = async (req, res) => {
  try {
    if (!validateObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid tutor ID'
      });
    }

    const tutor = await Tutor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-__v');

    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: 'Tutor not found'
      });
    }

    res.json({
      success: true,
      data: tutor
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Delete tutor
exports.deleteTutor = async (req, res) => {
  try {
    if (!validateObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid tutor ID'
      });
    }

    const tutor = await Tutor.findByIdAndDelete(req.params.id);
    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: 'Tutor not found'
      });
    }

    // Also delete associated classes and bookings
    await Class.deleteMany({ tutor: req.params.id });
    await Booking.deleteMany({ tutor: req.params.id });

    res.json({
      success: true,
      message: 'Tutor deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get available tutors for a specific date
exports.getAvailableTutors = async (req, res) => {
  try {
    const { date } = req.params;
    const dayOfWeek = new Date(date).toLocaleLowerCase('en-US', { weekday: 'long' });

    const tutors = await Tutor.find({
      status: 'active',
      [`availability.${dayOfWeek}`]: { $exists: true, $ne: [] }
    }).select('-__v');

    res.json({
      success: true,
      data: tutors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update tutor status
exports.updateTutorStatus = async (req, res) => {
  try {
    if (!validateObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid tutor ID'
      });
    }

    const tutor = await Tutor.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true }
    ).select('-__v');

    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: 'Tutor not found'
      });
    }

    res.json({
      success: true,
      data: tutor
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get tutor schedule
exports.getTutorSchedule = async (req, res) => {
  try {
    if (!validateObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid tutor ID'
      });
    }

    const tutor = await Tutor.findById(req.params.id);
    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: 'Tutor not found'
      });
    }

    const classes = await Class.find({ tutor: req.params.id })
      .populate('location', 'name address')
      .select('-__v');

    res.json({
      success: true,
      data: {
        availability: tutor.availability,
        classes
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update tutor availability
exports.updateTutorAvailability = async (req, res) => {
  try {
    if (!validateObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid tutor ID'
      });
    }

    const tutor = await Tutor.findByIdAndUpdate(
      req.params.id,
      { availability: req.body.availability },
      { new: true, runValidators: true }
    ).select('-__v');

    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: 'Tutor not found'
      });
    }

    res.json({
      success: true,
      data: tutor
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}; 