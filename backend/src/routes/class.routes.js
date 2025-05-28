const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const classController = require('../controllers/class.controller');
const auth = require('../middleware/auth');

// Validation middleware
const validateClass = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('tutor').isMongoId().withMessage('Valid tutor ID is required'),
  body('location').isMongoId().withMessage('Valid location ID is required'),
  body('capacity').isInt({ min: 1 }).withMessage('Capacity must be at least 1'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('duration').isInt({ min: 15 }).withMessage('Duration must be at least 15 minutes'),
  body('schedule').isArray().withMessage('Schedule must be an array'),
  body('schedule.*.dayOfWeek').isIn(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])
    .withMessage('Invalid day of week'),
  body('schedule.*.startTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Invalid start time format (HH:mm)'),
  body('schedule.*.endTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Invalid end time format (HH:mm)'),
  body('category').isIn(['Hatha', 'Vinyasa', 'Ashtanga', 'Yin', 'Restorative', 'Power', 'Other'])
    .withMessage('Invalid category'),
  body('level').isIn(['Beginner', 'Intermediate', 'Advanced', 'All Levels'])
    .withMessage('Invalid level')
];

// Routes
router.get('/', auth, classController.getClasses);
router.get('/active', classController.getActiveClasses);

router.get('/:id', [
  auth,
  param('id').isMongoId().withMessage('Invalid class ID')
], classController.getClassById);

router.post('/', [
  auth,
  ...validateClass
], classController.createClass);

router.put('/:id', [
  auth,
  param('id').isMongoId().withMessage('Invalid class ID'),
  ...validateClass
], classController.updateClass);

router.delete('/:id', [
  auth,
  param('id').isMongoId().withMessage('Invalid class ID')
], classController.deleteClass);

// Additional routes
router.get('/tutor/:tutorId', [
  auth,
  param('tutorId').isMongoId().withMessage('Invalid tutor ID')
], classController.getClassesByTutor);

router.get('/location/:locationId', [
  auth,
  param('locationId').isMongoId().withMessage('Invalid location ID')
], classController.getClassesByLocation);

module.exports = router; 