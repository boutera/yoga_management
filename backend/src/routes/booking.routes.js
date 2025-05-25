const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const bookingController = require('../controllers/booking.controller');
const auth = require('../middleware/auth');

// Validation middleware
const validateBooking = [
  body('class').isMongoId().withMessage('Invalid class ID'),
  body('bookingDate').isISO8601().withMessage('Invalid booking date'),
  body('paymentMethod')
    .isIn(['cash', 'credit_card', 'debit_card', 'online_transfer'])
    .withMessage('Invalid payment method')
];

const validateStatus = [
  body('status')
    .isIn(['pending', 'confirmed', 'cancelled', 'completed', 'no-show'])
    .withMessage('Invalid status'),
  body('cancellationReason')
    .optional()
    .isString()
    .isLength({ min: 3 })
    .withMessage('Cancellation reason must be at least 3 characters long')
];

// Routes
router.get(
  '/',
  auth,
  [
    query('status').optional().isIn(['pending', 'confirmed', 'cancelled', 'completed', 'no-show']),
    query('paymentStatus').optional().isIn(['pending', 'paid', 'refunded', 'failed']),
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
    query('user').optional().isMongoId(),
    query('class').optional().isMongoId()
  ],
  bookingController.getBookings
);

router.get(
  '/:id',
  auth,
  param('id').isMongoId().withMessage('Invalid booking ID'),
  bookingController.getBookingById
);

router.post(
  '/',
  auth,
  validateBooking,
  bookingController.createBooking
);

router.patch(
  '/:id/status',
  auth,
  [
    param('id').isMongoId().withMessage('Invalid booking ID'),
    ...validateStatus
  ],
  bookingController.updateBookingStatus
);

router.get(
  '/user/bookings',
  auth,
  bookingController.getUserBookings
);

router.get(
  '/class/:classId',
  auth,
  [
    param('classId').isMongoId().withMessage('Invalid class ID'),
    query('date').optional().isISO8601()
  ],
  bookingController.getClassBookings
);

module.exports = router; 