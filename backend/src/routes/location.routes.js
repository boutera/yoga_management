const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const locationController = require('../controllers/location.controller');
const auth = require('../middleware/auth');

// Validation middleware
const validateLocation = [
  body('name').trim().notEmpty().withMessage('Location name is required'),
  body('address').trim().notEmpty().withMessage('Address is required'),
  body('capacity').isInt({ min: 1 }).withMessage('Capacity must be at least 1'),
  body('contactPhone').trim().notEmpty().withMessage('Contact phone is required'),
  body('contactEmail').isEmail().withMessage('Please enter a valid email'),
  body('status').optional().isIn(['active', 'inactive'])
    .withMessage('Invalid status')
];

// Routes
router.get('/', auth, locationController.getLocations);
router.get('/:id', auth, locationController.getLocationById);
router.post('/', [auth, ...validateLocation], locationController.createLocation);
router.put('/:id', [auth, ...validateLocation], locationController.updateLocation);
router.delete('/:id', auth, locationController.deleteLocation);

module.exports = router; 