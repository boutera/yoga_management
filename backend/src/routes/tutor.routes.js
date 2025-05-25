const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const tutorController = require('../controllers/tutor.controller');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

// Validation middleware
const validateTutor = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  body('phone').notEmpty().withMessage('Phone number is required'),
  body('specialties')
    .isArray({ min: 1 })
    .withMessage('At least one specialty is required'),
  body('experience')
    .isInt({ min: 0 })
    .withMessage('Experience must be a positive number'),
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'on_leave'])
    .withMessage('Invalid status'),
  body('availability')
    .optional()
    .isObject()
    .withMessage('Availability must be an object'),
  validate
];

// Routes
router.get('/', auth, tutorController.getTutors);
router.get('/:id', auth, tutorController.getTutorById);
router.post('/', [auth, ...validateTutor], tutorController.createTutor);
router.put('/:id', [auth, ...validateTutor], tutorController.updateTutor);
router.delete('/:id', auth, tutorController.deleteTutor);
router.get('/available/:date', auth, tutorController.getAvailableTutors);

// Additional routes for tutor-specific operations
router.patch(
  '/:id/status',
  [
    auth,
    param('id').isMongoId().withMessage('Invalid tutor ID'),
    body('status')
      .isIn(['active', 'inactive', 'on_leave'])
      .withMessage('Invalid status'),
    validate
  ],
  tutorController.updateTutorStatus
);

router.get(
  '/:id/schedule',
  [
    auth,
    param('id').isMongoId().withMessage('Invalid tutor ID'),
    validate
  ],
  tutorController.getTutorSchedule
);

router.post(
  '/:id/availability',
  [
    auth,
    param('id').isMongoId().withMessage('Invalid tutor ID'),
    body('availability').isObject().withMessage('Availability must be an object'),
    validate
  ],
  tutorController.updateTutorAvailability
);

module.exports = router; 