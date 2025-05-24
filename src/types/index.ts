export type UserRole = 'admin' | 'tutor' | 'customer';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tutor extends User {
  role: 'tutor';
  skills: string[];
  bio?: string;
  hourlyRate: number;
  locations: string[]; // Location IDs
}

export interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  rooms: Room[];
}

export interface Room {
  id: string;
  name: string;
  capacity: number;
  equipment: string[];
}

export interface Class {
  id: string;
  name: string;
  description: string;
  requiredSkills: string[];
  duration: number; // in minutes
  maxCapacity: number;
  price: number;
}

export interface Session {
  id: string;
  classId: string;
  tutorId: string;
  locationId: string;
  roomId: string;
  startTime: Date;
  endTime: Date;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  currentBookings: number;
}

export interface Booking {
  id: string;
  sessionId: string;
  customerId: string;
  status: 'confirmed' | 'cancelled' | 'waitlisted';
  bookingDate: Date;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  paymentAmount: number;
} 