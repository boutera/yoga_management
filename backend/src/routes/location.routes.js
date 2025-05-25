const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const locationController = require('../controllers/location.controller');
const auth = require('../middleware/auth');

// Validation middleware
const validateLocation = [
  body('name').trim().notEmpty().withMessage('Location name is required'),
  body('address.street').trim().notEmpty().withMessage('Street address is required'),
  body('address.city').trim().notEmpty().withMessage('City is required'),
  body('address.state').trim().notEmpty().withMessage('State is required'),
  body('address.zipCode').trim().notEmpty().withMessage('Zip code is required'),
  body('address.country').trim().notEmpty().withMessage('Country is required'),
  body('capacity').isInt({ min: 1 }).withMessage('Capacity must be at least 1'),
  body('contactPhone').trim().notEmpty().withMessage('Contact phone is required'),
  body('contactEmail').isEmail().withMessage('Please enter a valid email'),
  body('status').optional().isIn(['active', 'inactive', 'maintenance'])
    .withMessage('Invalid status'),
  body('facilities').optional().isArray().withMessage('Facilities must be an array'),
  body('description').optional().trim(),
  body('images').optional().isArray().withMessage('Images must be an array'),
  body('operatingHours').optional().isObject().withMessage('Operating hours must be an object')
];

const validateOperatingHours = [
  body('operatingHours.*.open').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Invalid opening time format (HH:mm)'),
  body('operatingHours.*.close').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Invalid closing time format (HH:mm)')
];

// Routes
router.get('/', auth, locationController.getLocations);

router.get('/:id', [
  auth,
  param('id').isMongoId().withMessage('Invalid location ID')
], locationController.getLocationById);

router.post('/', [
  auth,
  ...validateLocation,
  ...validateOperatingHours
], locationController.createLocation);

router.put('/:id', [
  auth,
  param('id').isMongoId().withMessage('Invalid location ID'),
  ...validateLocation,
  ...validateOperatingHours
], locationController.updateLocation);

router.delete('/:id', [
  auth,
  param('id').isMongoId().withMessage('Invalid location ID')
], locationController.deleteLocation);

// Additional routes
router.get('/city/:city', [
  auth,
  param('city').trim().notEmpty().withMessage('City is required')
], locationController.getLocationsByCity);

router.patch('/:id/status', [
  auth,
  param('id').isMongoId().withMessage('Invalid location ID'),
  body('status').isIn(['active', 'inactive', 'maintenance'])
    .withMessage('Invalid status')
], locationController.updateLocationStatus);

module.exports = router; 