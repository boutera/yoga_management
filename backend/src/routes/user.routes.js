const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const auth = require('../middleware/auth');
const { checkRole } = require('../middleware/checkRole');

// Admin routes
router.get('/', auth, checkRole('admin'), userController.getAllUsers);
router.get('/:id', auth, checkRole('admin'), userController.getUserById);
router.put('/:id', auth, checkRole('admin'), userController.updateUser);
router.delete('/:id', auth, checkRole('admin'), userController.deleteUser);

module.exports = router; 