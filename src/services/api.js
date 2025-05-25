import axios from 'axios';

// In Create React App, environment variables must start with REACT_APP_
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
  getProfile: () => api.get('/auth/profile'),
};

// User API calls
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  getBookings: () => api.get('/users/bookings'),
  changePassword: (data) => api.put('/users/change-password', data),
};

// Class API calls
export const classAPI = {
  getAll: () => api.get('/classes'),
  getById: (id) => api.get(`/classes/${id}`),
  create: (data) => api.post('/classes', data),
  update: (id, data) => api.put(`/classes/${id}`, data),
  delete: (id) => api.delete(`/classes/${id}`),
  getByTutor: (tutorId) => api.get(`/classes/tutor/${tutorId}`),
  getByLocation: (locationId) => api.get(`/classes/location/${locationId}`),
};

// Location API calls
export const locationAPI = {
  getAll: () => api.get('/locations'),
  getById: (id) => api.get(`/locations/${id}`),
  create: (data) => api.post('/locations', data),
  update: (id, data) => api.put(`/locations/${id}`, data),
  delete: (id) => api.delete(`/locations/${id}`),
  getByCity: (city) => api.get(`/locations/city/${city}`),
};

// Tutor API calls
export const tutorAPI = {
  getAll: () => api.get('/tutors'),
  getById: (id) => api.get(`/tutors/${id}`),
  create: (data) => api.post('/tutors', data),
  update: (id, data) => api.put(`/tutors/${id}`, data),
  delete: (id) => api.delete(`/tutors/${id}`),
  getSchedule: (id) => api.get(`/tutors/${id}/schedule`),
  getAvailable: (date) => api.get(`/tutors/available/${date}`),
};

// Booking API calls
export const bookingAPI = {
  getAll: () => api.get('/bookings'),
  getById: (id) => api.get(`/bookings/${id}`),
  create: (data) => api.post('/bookings', data),
  update: (id, data) => api.put(`/bookings/${id}`, data),
  delete: (id) => api.delete(`/bookings/${id}`),
  getUserBookings: () => api.get('/bookings/user'),
  cancel: (id) => api.put(`/bookings/${id}/cancel`),
  markAttendance: (id, status) => api.post(`/bookings/${id}/attendance`, { status }),
};

// Report API calls
export const reportAPI = {
  getBookingReport: (startDate, endDate) => 
    api.get('/reports/bookings', { params: { startDate, endDate } }),
  getRevenueReport: (startDate, endDate) => 
    api.get('/reports/revenue', { params: { startDate, endDate } }),
  getAttendanceReport: (startDate, endDate) => 
    api.get('/reports/attendance', { params: { startDate, endDate } }),
  getClassReport: (startDate, endDate) => 
    api.get('/reports/classes', { params: { startDate, endDate } }),
  getTutorReport: (startDate, endDate) => 
    api.get('/reports/tutors', { params: { startDate, endDate } }),
  getLocationReport: (startDate, endDate) => 
    api.get('/reports/locations', { params: { startDate, endDate } }),
  exportReport: (type, format, startDate, endDate) => 
    api.post('/reports/export', { type, format, startDate, endDate }),
};

export default api; 