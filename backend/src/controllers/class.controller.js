const Class = require('../models/class.model');
const { validationResult } = require('express-validator');

// Get all classes with optional filters
exports.getClasses = async (req, res) => {
  try {
    const {
      status,
      category,
      tutor,
      location,
      level,
      search
    } = req.query;

    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (tutor) filter.tutor = tutor;
    if (location) filter.location = location;
    if (level) filter.level = level;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const classes = await Class.find(filter)
      .populate('tutor', 'name email')
      .populate('location', 'name address')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: classes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching classes',
      error: error.message
    });
  }
};

// Get a single class by ID
exports.getClassById = async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id)
      .populate('tutor', 'name email')
      .populate('location', 'name address');

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    res.json({
      success: true,
      data: classData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching class',
      error: error.message
    });
  }
};

// Create a new class
exports.createClass = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const classData = new Class(req.body);
    await classData.save();

    res.status(201).json({
      success: true,
      data: classData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating class',
      error: error.message
    });
  }
};

// Update a class
exports.updateClass = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const classData = await Class.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    res.json({
      success: true,
      data: classData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating class',
      error: error.message
    });
  }
};

// Delete a class
exports.deleteClass = async (req, res) => {
  try {
    const classData = await Class.findByIdAndDelete(req.params.id);

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    res.json({
      success: true,
      message: 'Class deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting class',
      error: error.message
    });
  }
};

// Get classes by tutor
exports.getClassesByTutor = async (req, res) => {
  try {
    const classes = await Class.find({ tutor: req.params.tutorId })
      .populate('location', 'name address')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: classes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching tutor classes',
      error: error.message
    });
  }
};

// Get classes by location
exports.getClassesByLocation = async (req, res) => {
  try {
    const classes = await Class.find({ location: req.params.locationId })
      .populate('tutor', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: classes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching location classes',
      error: error.message
    });
  }
};

// Get active classes
exports.getActiveClasses = async (req, res) => {
  try {
    const classes = await Class.find({ status: 'active' })
      .populate('tutor', 'name email')
      .populate('location', 'name address')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: classes
    });
  } catch (error) {
    console.error('Error fetching active classes:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching active classes',
      error: error.message
    });
  }
}; 