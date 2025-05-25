import { AxiosResponse } from 'axios';

interface User {
  _id: string;
  email: string;
  name: string;
  role: 'admin' | 'tutor' | 'user';
  status: 'active' | 'inactive';
}

interface LoginResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export const authAPI: {
  login: (credentials: { email: string; password: string }) => Promise<LoginResponse>;
  register: (userData: any) => Promise<ApiResponse<User>>;
  logout: () => Promise<ApiResponse<void>>;
  getProfile: () => Promise<ApiResponse<User>>;
};

export const userAPI: {
  getProfile: () => Promise<ApiResponse<User>>;
  updateProfile: (data: any) => Promise<ApiResponse<User>>;
  getBookings: () => Promise<ApiResponse<any[]>>;
  changePassword: (data: { currentPassword: string; newPassword: string }) => Promise<ApiResponse<void>>;
};

export const classAPI: {
  getAll: () => Promise<ApiResponse<any[]>>;
  getById: (id: string) => Promise<ApiResponse<any>>;
  create: (data: any) => Promise<ApiResponse<any>>;
  update: (id: string, data: any) => Promise<ApiResponse<any>>;
  delete: (id: string) => Promise<ApiResponse<void>>;
  getByTutor: (tutorId: string) => Promise<ApiResponse<any[]>>;
  getByLocation: (locationId: string) => Promise<ApiResponse<any[]>>;
};

export const locationAPI: {
  getAll: () => Promise<ApiResponse<any[]>>;
  getById: (id: string) => Promise<ApiResponse<any>>;
  create: (data: any) => Promise<ApiResponse<any>>;
  update: (id: string, data: any) => Promise<ApiResponse<any>>;
  delete: (id: string) => Promise<ApiResponse<void>>;
  getByCity: (city: string) => Promise<ApiResponse<any[]>>;
};

export const tutorAPI: {
  getAll: () => Promise<ApiResponse<any[]>>;
  getById: (id: string) => Promise<ApiResponse<any>>;
  create: (data: any) => Promise<ApiResponse<any>>;
  update: (id: string, data: any) => Promise<ApiResponse<any>>;
  delete: (id: string) => Promise<ApiResponse<void>>;
  getSchedule: (id: string) => Promise<ApiResponse<any>>;
  getAvailable: (date: string) => Promise<ApiResponse<any[]>>;
};

export const bookingAPI: {
  getAll: () => Promise<ApiResponse<any[]>>;
  getById: (id: string) => Promise<ApiResponse<any>>;
  create: (data: any) => Promise<ApiResponse<any>>;
  update: (id: string, data: any) => Promise<ApiResponse<any>>;
  delete: (id: string) => Promise<ApiResponse<void>>;
  getUserBookings: () => Promise<ApiResponse<any[]>>;
  cancel: (id: string) => Promise<ApiResponse<void>>;
  markAttendance: (id: string, status: string) => Promise<ApiResponse<void>>;
};

export const reportAPI: {
  getBookingReport: (startDate: string, endDate: string) => Promise<ApiResponse<any>>;
  getRevenueReport: (startDate: string, endDate: string) => Promise<ApiResponse<any>>;
  getAttendanceReport: (startDate: string, endDate: string) => Promise<ApiResponse<any>>;
  getClassReport: (startDate: string, endDate: string) => Promise<ApiResponse<any>>;
  getTutorReport: (startDate: string, endDate: string) => Promise<ApiResponse<any>>;
  getLocationReport: (startDate: string, endDate: string) => Promise<ApiResponse<any>>;
  exportReport: (type: string, format: string, startDate: string, endDate: string) => Promise<ApiResponse<any>>;
}; 