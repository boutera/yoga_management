const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

// Simple user creation route
router.post('/', userController.createUser);

// Other routes
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router; 