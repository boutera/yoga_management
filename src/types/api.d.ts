declare module '../../../services/api' {
  interface ApiResponse<T = any> {
    data: T;
    status: number;
    statusText: string;
    headers: any;
  }

  interface User {
    _id: string;
    email: string;
    name: string;
    role: 'admin' | 'tutor' | 'user';
    status: 'active' | 'inactive';
  }

  interface Class {
    _id: string;
    name: string;
    description: string;
    requiredSkills: string[];
    duration: number;
    maxCapacity: number;
    price: number;
    status: 'active' | 'inactive';
  }

  interface Location {
    _id: string;
    name: string;
    address: string;
    city: string;
    capacity: number;
    status: 'active' | 'inactive';
  }

  interface Tutor {
    _id: string;
    name: string;
    email: string;
    specialties: string[];
    status: 'active' | 'inactive';
  }

  interface Booking {
    _id: string;
    classId: string;
    userId: string;
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
    attendance: 'present' | 'absent' | 'not_marked';
  }

  interface Api {
    get: <T = any>(url: string, config?: any) => Promise<ApiResponse<T>>;
    post: <T = any>(url: string, data?: any, config?: any) => Promise<ApiResponse<T>>;
    put: <T = any>(url: string, data?: any, config?: any) => Promise<ApiResponse<T>>;
    delete: <T = any>(url: string, config?: any) => Promise<ApiResponse<T>>;
  }

  interface AuthAPI {
    login: (credentials: { email: string; password: string }) => Promise<ApiResponse<{ token: string; user: User }>>;
    register: (userData: Partial<User>) => Promise<ApiResponse<{ token: string; user: User }>>;
    logout: () => Promise<ApiResponse>;
    forgotPassword: (email: string) => Promise<ApiResponse>;
    resetPassword: (token: string, password: string) => Promise<ApiResponse>;
    getProfile: () => Promise<ApiResponse<User>>;
  }

  interface UserAPI {
    getProfile: () => Promise<ApiResponse<User>>;
    updateProfile: (data: Partial<User>) => Promise<ApiResponse<User>>;
    getBookings: () => Promise<ApiResponse<Booking[]>>;
    changePassword: (data: { currentPassword: string; newPassword: string }) => Promise<ApiResponse>;
  }

  interface ClassAPI {
    getAll: () => Promise<ApiResponse<Class[]>>;
    getById: (id: string) => Promise<ApiResponse<Class>>;
    create: (data: Omit<Class, '_id'>) => Promise<ApiResponse<Class>>;
    update: (id: string, data: Partial<Class>) => Promise<ApiResponse<Class>>;
    delete: (id: string) => Promise<ApiResponse>;
    getByTutor: (tutorId: string) => Promise<ApiResponse<Class[]>>;
    getByLocation: (locationId: string) => Promise<ApiResponse<Class[]>>;
  }

  interface LocationAPI {
    getAll: () => Promise<ApiResponse<Location[]>>;
    getById: (id: string) => Promise<ApiResponse<Location>>;
    create: (data: Omit<Location, '_id'>) => Promise<ApiResponse<Location>>;
    update: (id: string, data: Partial<Location>) => Promise<ApiResponse<Location>>;
    delete: (id: string) => Promise<ApiResponse>;
    getByCity: (city: string) => Promise<ApiResponse<Location[]>>;
  }

  interface TutorAPI {
    getAll: () => Promise<ApiResponse<Tutor[]>>;
    getById: (id: string) => Promise<ApiResponse<Tutor>>;
    create: (data: Omit<Tutor, '_id'>) => Promise<ApiResponse<Tutor>>;
    update: (id: string, data: Partial<Tutor>) => Promise<ApiResponse<Tutor>>;
    delete: (id: string) => Promise<ApiResponse>;
    getSchedule: (id: string) => Promise<ApiResponse<any>>;
    getAvailable: (date: string) => Promise<ApiResponse<Tutor[]>>;
  }

  interface BookingAPI {
    getAll: () => Promise<ApiResponse<Booking[]>>;
    getById: (id: string) => Promise<ApiResponse<Booking>>;
    create: (data: Omit<Booking, '_id'>) => Promise<ApiResponse<Booking>>;
    update: (id: string, data: Partial<Booking>) => Promise<ApiResponse<Booking>>;
    delete: (id: string) => Promise<ApiResponse>;
    getUserBookings: () => Promise<ApiResponse<Booking[]>>;
    cancel: (id: string) => Promise<ApiResponse<Booking>>;
    markAttendance: (id: string, status: Booking['attendance']) => Promise<ApiResponse<Booking>>;
  }

  interface ReportAPI {
    getBookingReport: (startDate: string, endDate: string) => Promise<ApiResponse<any>>;
    getRevenueReport: (startDate: string, endDate: string) => Promise<ApiResponse<any>>;
    getAttendanceReport: (startDate: string, endDate: string) => Promise<ApiResponse<any>>;
    getClassReport: (startDate: string, endDate: string) => Promise<ApiResponse<any>>;
    getTutorReport: (startDate: string, endDate: string) => Promise<ApiResponse<any>>;
    getLocationReport: (startDate: string, endDate: string) => Promise<ApiResponse<any>>;
    exportReport: (type: string, format: string, startDate: string, endDate: string) => Promise<ApiResponse<any>>;
  }

  export const authAPI: AuthAPI;
  export const userAPI: UserAPI;
  export const classAPI: ClassAPI;
  export const locationAPI: LocationAPI;
  export const tutorAPI: TutorAPI;
  export const bookingAPI: BookingAPI;
  export const reportAPI: ReportAPI;
  export default Api;
} 