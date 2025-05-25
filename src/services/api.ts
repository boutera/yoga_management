import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token (temporarily disabled)
api.interceptors.request.use(
  (config) => {
    // Temporarily bypass token requirement
    return config;
    /*
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
    */
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Temporarily bypass 401 handling
    return Promise.reject(error);
    /*
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
    */
  }
);

// Auth API
export const authAPI = {
  login: (credentials: { email: string; password: string }) => {
    console.log('API: Making login request with:', credentials);
    return api.post('/auth/login', credentials)
      .then(response => {
        console.log('API: Login response:', response);
        return response.data;
      })
      .catch(error => {
        console.error('API: Login error:', error);
        throw error;
      });
  },
  register: (userData: any) => api.post('/auth/register', userData).then(response => response.data),
  logout: () => api.post('/auth/logout').then(response => response.data),
  getProfile: () => api.get('/auth/profile').then(response => response.data),
};

// User API
export const userAPI = {
  getProfile: () => api.get('/users/profile').then(response => response.data),
  updateProfile: (data: any) => api.put('/users/profile', data).then(response => response.data),
  getBookings: () => api.get('/users/bookings').then(response => response.data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put('/users/change-password', data).then(response => response.data),
};

// Class API
export const classAPI = {
  getAll: () => api.get('/classes').then(response => response.data),
  getById: (id: string) => api.get(`/classes/${id}`).then(response => response.data),
  create: (data: any) => api.post('/classes', data).then(response => response.data),
  update: (id: string, data: any) => api.put(`/classes/${id}`, data).then(response => response.data),
  delete: (id: string) => api.delete(`/classes/${id}`).then(response => response.data),
  getByTutor: (tutorId: string) => api.get(`/classes/tutor/${tutorId}`).then(response => response.data),
  getByLocation: (locationId: string) => api.get(`/classes/location/${locationId}`).then(response => response.data),
};

// Location API
export const locationAPI = {
  getAll: () => api.get('/locations').then(response => response.data),
  getById: (id: string) => api.get(`/locations/${id}`).then(response => response.data),
  create: (data: any) => api.post('/locations', data).then(response => response.data),
  update: (id: string, data: any) => api.put(`/locations/${id}`, data).then(response => response.data),
  delete: (id: string) => api.delete(`/locations/${id}`).then(response => response.data),
  getByCity: (city: string) => api.get(`/locations/city/${city}`).then(response => response.data),
};

// Tutor API
export const tutorAPI = {
  getAll: () => api.get('/tutors').then(response => response.data),
  getById: (id: string) => api.get(`/tutors/${id}`).then(response => response.data),
  create: (data: any) => api.post('/tutors', data).then(response => response.data),
  update: (id: string, data: any) => api.put(`/tutors/${id}`, data).then(response => response.data),
  delete: (id: string) => api.delete(`/tutors/${id}`).then(response => response.data),
  getSchedule: (id: string) => api.get(`/tutors/${id}/schedule`).then(response => response.data),
  getAvailable: (date: string) => api.get(`/tutors/available?date=${date}`).then(response => response.data),
};

// Booking API
export const bookingAPI = {
  getAll: () => api.get('/bookings').then(response => response.data),
  getById: (id: string) => api.get(`/bookings/${id}`).then(response => response.data),
  create: (data: any) => api.post('/bookings', data).then(response => response.data),
  update: (id: string, data: any) => api.put(`/bookings/${id}`, data).then(response => response.data),
  delete: (id: string) => api.delete(`/bookings/${id}`).then(response => response.data),
  getUserBookings: () => api.get('/bookings/user').then(response => response.data),
  cancel: (id: string) => api.post(`/bookings/${id}/cancel`).then(response => response.data),
  markAttendance: (id: string, status: string) =>
    api.post(`/bookings/${id}/attendance`, { status }).then(response => response.data),
};

// Report API
export const reportAPI = {
  getBookingReport: (startDate: string, endDate: string) =>
    api.get(`/reports/bookings?startDate=${startDate}&endDate=${endDate}`).then(response => response.data),
  getRevenueReport: (startDate: string, endDate: string) =>
    api.get(`/reports/revenue?startDate=${startDate}&endDate=${endDate}`).then(response => response.data),
  getAttendanceReport: (startDate: string, endDate: string) =>
    api.get(`/reports/attendance?startDate=${startDate}&endDate=${endDate}`).then(response => response.data),
  getClassReport: (startDate: string, endDate: string) =>
    api.get(`/reports/classes?startDate=${startDate}&endDate=${endDate}`).then(response => response.data),
  getTutorReport: (startDate: string, endDate: string) =>
    api.get(`/reports/tutors?startDate=${startDate}&endDate=${endDate}`).then(response => response.data),
  getLocationReport: (startDate: string, endDate: string) =>
    api.get(`/reports/locations?startDate=${startDate}&endDate=${endDate}`).then(response => response.data),
  exportReport: (type: string, format: string, startDate: string, endDate: string) =>
    api.get(`/reports/export?type=${type}&format=${format}&startDate=${startDate}&endDate=${endDate}`).then(response => response.data),
};

export default api;