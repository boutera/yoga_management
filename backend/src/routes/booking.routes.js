const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.controller');
const auth = require('../middleware/auth');

// Routes
router.get('/', auth, bookingController.getBookings);
router.get('/:id', auth, bookingController.getBookingById);
router.post('/', auth, bookingController.createBooking);
router.put('/:id', auth, bookingController.updateBooking);
router.patch('/:id/status', auth, bookingController.updateBookingStatus);
router.delete('/:id', auth, bookingController.deleteBooking);
router.get('/user/bookings', auth, bookingController.getUserBookings);
router.get('/class/:classId', auth, bookingController.getClassBookings);

module.exports = router; 