import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
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

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),
  register: (userData: any) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
};

// User API
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data: any) => api.put('/users/profile', data),
  getBookings: () => api.get('/users/bookings'),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put('/users/change-password', data),
};

// Class API
export const classAPI = {
  getAll: () => api.get('/classes'),
  getById: (id: string) => api.get(`/classes/${id}`),
  create: (data: any) => api.post('/classes', data),
  update: (id: string, data: any) => api.put(`/classes/${id}`, data),
  delete: (id: string) => api.delete(`/classes/${id}`),
  getByTutor: (tutorId: string) => api.get(`/classes/tutor/${tutorId}`),
  getByLocation: (locationId: string) => api.get(`/classes/location/${locationId}`),
};

// Location API
export const locationAPI = {
  getAll: () => api.get('/locations'),
  getById: (id: string) => api.get(`/locations/${id}`),
  create: (data: any) => api.post('/locations', data),
  update: (id: string, data: any) => api.put(`/locations/${id}`, data),
  delete: (id: string) => api.delete(`/locations/${id}`),
  getByCity: (city: string) => api.get(`/locations/city/${city}`),
};

// Tutor API
export const tutorAPI = {
  getAll: () => api.get('/tutors'),
  getById: (id: string) => api.get(`/tutors/${id}`),
  create: (data: any) => api.post('/tutors', data),
  update: (id: string, data: any) => api.put(`/tutors/${id}`, data),
  delete: (id: string) => api.delete(`/tutors/${id}`),
  getSchedule: (id: string) => api.get(`/tutors/${id}/schedule`),
  getAvailable: (date: string) => api.get(`/tutors/available?date=${date}`),
};

// Booking API
export const bookingAPI = {
  getAll: () => api.get('/bookings'),
  getById: (id: string) => api.get(`/bookings/${id}`),
  create: (data: any) => api.post('/bookings', data),
  update: (id: string, data: any) => api.put(`/bookings/${id}`, data),
  delete: (id: string) => api.delete(`/bookings/${id}`),
  getUserBookings: () => api.get('/bookings/user'),
  cancel: (id: string) => api.post(`/bookings/${id}/cancel`),
  markAttendance: (id: string, status: string) =>
    api.post(`/bookings/${id}/attendance`, { status }),
};

// Report API
export const reportAPI = {
  getBookingReport: (startDate: string, endDate: string) =>
    api.get(`/reports/bookings?startDate=${startDate}&endDate=${endDate}`),
  getRevenueReport: (startDate: string, endDate: string) =>
    api.get(`/reports/revenue?startDate=${startDate}&endDate=${endDate}`),
  getAttendanceReport: (startDate: string, endDate: string) =>
    api.get(`/reports/attendance?startDate=${startDate}&endDate=${endDate}`),
  getClassReport: (startDate: string, endDate: string) =>
    api.get(`/reports/classes?startDate=${startDate}&endDate=${endDate}`),
  getTutorReport: (startDate: string, endDate: string) =>
    api.get(`/reports/tutors?startDate=${startDate}&endDate=${endDate}`),
  getLocationReport: (startDate: string, endDate: string) =>
    api.get(`/reports/locations?startDate=${startDate}&endDate=${endDate}`),
  exportReport: (type: string, format: string, startDate: string, endDate: string) =>
    api.get(`/reports/export?type=${type}&format=${format}&startDate=${startDate}&endDate=${endDate}`),
};

export default api; 