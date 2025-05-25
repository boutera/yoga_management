const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const reportController = require('../controllers/report.controller');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

// Validation middleware
const validateDateRange = [
  query('startDate')
    .isDate()
    .withMessage('Start date must be a valid date (YYYY-MM-DD)'),
  query('endDate')
    .isDate()
    .withMessage('End date must be a valid date (YYYY-MM-DD)')
    .custom((endDate, { req }) => {
      if (new Date(endDate) < new Date(req.query.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  validate
];

// Routes
router.get(
  '/bookings',
  [auth, ...validateDateRange],
  reportController.getBookingReport
);

router.get(
  '/revenue',
  [auth, ...validateDateRange],
  reportController.getRevenueReport
);

router.get(
  '/attendance',
  [auth, ...validateDateRange],
  reportController.getAttendanceReport
);

router.get(
  '/classes',
  [auth, ...validateDateRange],
  reportController.getClassReport
);

router.get(
  '/tutors',
  [auth, ...validateDateRange],
  reportController.getTutorReport
);

router.get(
  '/locations',
  [auth, ...validateDateRange],
  reportController.getLocationReport
);

// Export reports
router.post(
  '/export',
  [
    auth,
    body('type')
      .isIn(['bookings', 'revenue', 'attendance', 'classes', 'tutors', 'locations'])
      .withMessage('Invalid report type'),
    body('format')
      .isIn(['csv', 'pdf', 'excel'])
      .withMessage('Invalid export format'),
    ...validateDateRange
  ],
  reportController.exportReport
);

module.exports = router; 