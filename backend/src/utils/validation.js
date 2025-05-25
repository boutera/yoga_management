const mongoose = require('mongoose');

// Validate MongoDB ObjectId
exports.validateObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// Validate email format
exports.validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Validate phone number format (basic validation)
exports.validatePhone = (phone) => {
  const re = /^\+?[\d\s-]{10,}$/;
  return re.test(phone);
};

// Validate time format (HH:mm)
exports.validateTime = (time) => {
  const re = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return re.test(time);
};

// Validate date format (YYYY-MM-DD)
exports.validateDate = (date) => {
  const re = /^\d{4}-\d{2}-\d{2}$/;
  if (!re.test(date)) return false;
  
  const d = new Date(date);
  return d instanceof Date && !isNaN(d);
};

// Validate password strength
exports.validatePassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
  return re.test(password);
}; 