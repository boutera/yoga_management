const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/user.model');
const Class = require('../models/class.model');
const Tutor = require('../models/tutor.model');
const Location = require('../models/location.model');
const Booking = require('../models/booking.model');
require('dotenv').config();

// Sample data
const users = [
  {
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@yoga.com',
    password: 'admin123',
    role: 'admin',
    isActive: true
  },
  {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    password: 'user123',
    role: 'user'
  },
  {
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane@example.com',
    password: 'user123',
    role: 'user'
  },
  {
    firstName: 'Mike',
    lastName: 'Johnson',
    email: 'mike@example.com',
    password: 'user123',
    role: 'user'
  },
  {
    firstName: 'Sarah',
    lastName: 'Wilson',
    email: 'sarah@example.com',
    password: 'user123',
    role: 'user'
  }
];

const locations = [
  {
    name: 'Downtown Studio',
    address: '123 Main St, New York, NY 10001, USA',
    capacity: 30,
    contactEmail: 'downtown@yoga.com',
    contactPhone: '212-555-0101',
    facilities: ['Mats', 'Props', 'Showers', 'Lockers', 'Retail Shop', 'Cafe'],
    status: 'active',
    description: 'Our flagship studio in the heart of downtown',
    operatingHours: {
      monday: { open: '06:00', close: '21:00' },
      tuesday: { open: '06:00', close: '21:00' },
      wednesday: { open: '06:00', close: '21:00' },
      thursday: { open: '06:00', close: '21:00' },
      friday: { open: '06:00', close: '21:00' },
      saturday: { open: '07:00', close: '20:00' },
      sunday: { open: '07:00', close: '20:00' }
    }
  },
  {
    name: 'Uptown Studio',
    address: '456 Park Ave, New York, NY 10022, USA',
    capacity: 25,
    contactEmail: 'uptown@yoga.com',
    contactPhone: '212-555-0202',
    facilities: ['Mats', 'Props', 'Showers', 'Lockers'],
    status: 'active',
    description: 'Peaceful studio in the uptown area',
    operatingHours: {
      monday: { open: '07:00', close: '20:00' },
      tuesday: { open: '07:00', close: '20:00' },
      wednesday: { open: '07:00', close: '20:00' },
      thursday: { open: '07:00', close: '20:00' },
      friday: { open: '07:00', close: '20:00' },
      saturday: { open: '08:00', close: '19:00' },
      sunday: { open: '08:00', close: '19:00' }
    }
  },
  {
    name: 'Brooklyn Studio',
    address: '789 Atlantic Ave, Brooklyn, NY 11238, USA',
    capacity: 35,
    contactEmail: 'brooklyn@yoga.com',
    contactPhone: '718-555-0303',
    facilities: ['Mats', 'Props', 'Showers', 'Lockers', 'Retail Shop', 'Garden'],
    status: 'active',
    description: 'Spacious studio with garden access in Brooklyn',
    operatingHours: {
      monday: { open: '06:30', close: '21:30' },
      tuesday: { open: '06:30', close: '21:30' },
      wednesday: { open: '06:30', close: '21:30' },
      thursday: { open: '06:30', close: '21:30' },
      friday: { open: '06:30', close: '21:30' },
      saturday: { open: '07:30', close: '20:30' },
      sunday: { open: '07:30', close: '20:30' }
    }
  }
];

const tutors = [
  {
    firstName: 'Sarah',
    lastName: 'Smith',
    name: 'Sarah Smith',
    email: 'sarah@yoga.com',
    phone: '212-555-0102',
    specialties: ['Hatha Yoga', 'Vinyasa Flow', 'Meditation'],
    experience: 8,
    bio: 'Certified yoga instructor with 8 years of experience in various styles.',
    status: 'active',
    certifications: [
      {
        name: 'RYT 500',
        issuer: 'Yoga Alliance',
        year: 2015
      },
      {
        name: 'Meditation Teacher',
        issuer: 'Mindfulness Institute',
        year: 2018
      }
    ],
    availability: {
      monday: [{ start: '09:00', end: '17:00' }],
      tuesday: [{ start: '09:00', end: '17:00' }],
      wednesday: [{ start: '09:00', end: '17:00' }],
      thursday: [{ start: '09:00', end: '17:00' }],
      friday: [{ start: '09:00', end: '17:00' }]
    },
    rating: 4.8,
    totalRatings: 156
  },
  {
    firstName: 'Michael',
    lastName: 'Chen',
    name: 'Michael Chen',
    email: 'michael@yoga.com',
    phone: '212-555-0103',
    specialties: ['Ashtanga Yoga', 'Power Yoga', 'Yoga Therapy'],
    experience: 10,
    bio: 'Experienced yoga therapist specializing in injury prevention and recovery.',
    status: 'active',
    certifications: [
      {
        name: 'RYT 500',
        issuer: 'Yoga Alliance',
        year: 2013
      },
      {
        name: 'Yoga Therapy',
        issuer: 'International Association of Yoga Therapists',
        year: 2016
      }
    ],
    availability: {
      monday: [{ start: '08:00', end: '16:00' }],
      tuesday: [{ start: '08:00', end: '16:00' }],
      wednesday: [{ start: '08:00', end: '16:00' }],
      thursday: [{ start: '08:00', end: '16:00' }],
      friday: [{ start: '08:00', end: '16:00' }]
    },
    rating: 4.9,
    totalRatings: 203
  },
  {
    firstName: 'Emma',
    lastName: 'Wilson',
    name: 'Emma Wilson',
    email: 'emma@yoga.com',
    phone: '212-555-0104',
    specialties: ['Yin Yoga', 'Restorative Yoga', 'Prenatal Yoga'],
    experience: 6,
    bio: 'Specialized in gentle and therapeutic yoga styles for all levels.',
    status: 'active',
    certifications: [
      {
        name: 'RYT 200',
        issuer: 'Yoga Alliance',
        year: 2017
      },
      {
        name: 'Prenatal Yoga',
        issuer: 'Prenatal Yoga Center',
        year: 2018
      }
    ],
    availability: {
      monday: [{ start: '10:00', end: '18:00' }],
      tuesday: [{ start: '10:00', end: '18:00' }],
      wednesday: [{ start: '10:00', end: '18:00' }],
      thursday: [{ start: '10:00', end: '18:00' }],
      friday: [{ start: '10:00', end: '18:00' }]
    },
    rating: 4.7,
    totalRatings: 128
  }
];

const classes = [
  {
    name: 'Morning Hatha',
    description: 'Gentle morning practice to start your day',
    tutor: null,
    location: null,
    capacity: 20,
    price: 25,
    duration: 60,
    schedule: [
      {
        dayOfWeek: 'monday',
        startTime: '07:00',
        endTime: '08:00'
      },
      {
        dayOfWeek: 'wednesday',
        startTime: '07:00',
        endTime: '08:00'
      },
      {
        dayOfWeek: 'friday',
        startTime: '07:00',
        endTime: '08:00'
      }
    ],
    status: 'active',
    category: 'Hatha',
    level: 'beginner'
  },
  {
    name: 'Power Vinyasa',
    description: 'Dynamic flow for strength and flexibility',
    tutor: null,
    location: null,
    capacity: 25,
    price: 30,
    duration: 75,
    schedule: [
      {
        dayOfWeek: 'tuesday',
        startTime: '18:00',
        endTime: '19:15'
      },
      {
        dayOfWeek: 'thursday',
        startTime: '18:00',
        endTime: '19:15'
      }
    ],
    status: 'active',
    category: 'Vinyasa',
    level: 'intermediate'
  },
  {
    name: 'Yin & Restore',
    description: 'Deep stretching and relaxation practice',
    tutor: null,
    location: null,
    capacity: 20,
    price: 25,
    duration: 90,
    schedule: [
      {
        dayOfWeek: 'monday',
        startTime: '19:00',
        endTime: '20:30'
      },
      {
        dayOfWeek: 'sunday',
        startTime: '17:00',
        endTime: '18:30'
      }
    ],
    status: 'active',
    category: 'Yin',
    level: 'all'
  },
  {
    name: 'Hot Power Flow',
    description: 'Intense flow in heated room',
    tutor: null,
    location: null,
    capacity: 30,
    price: 35,
    duration: 90,
    schedule: [
      {
        dayOfWeek: 'tuesday',
        startTime: '06:00',
        endTime: '07:30'
      },
      {
        dayOfWeek: 'thursday',
        startTime: '06:00',
        endTime: '07:30'
      },
      {
        dayOfWeek: 'saturday',
        startTime: '08:00',
        endTime: '09:30'
      }
    ],
    status: 'active',
    category: 'Hot Yoga',
    level: 'advanced'
  },
  {
    name: 'Prenatal Yoga',
    description: 'Safe and supportive practice for expectant mothers',
    tutor: null,
    location: null,
    capacity: 15,
    price: 30,
    duration: 60,
    schedule: [
      {
        dayOfWeek: 'wednesday',
        startTime: '10:00',
        endTime: '11:00'
      },
      {
        dayOfWeek: 'saturday',
        startTime: '10:00',
        endTime: '11:00'
      }
    ],
    status: 'active',
    category: 'Prenatal',
    level: 'all'
  }
];

// Connect to database
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/yoga_management', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Destroy all data
const destroyData = async () => {
  try {
    await User.deleteMany();
    await Location.deleteMany();
    await Tutor.deleteMany();
    await Class.deleteMany();
    await Booking.deleteMany();
    console.log('Data Destroyed...');
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

// Generate random bookings
const generateBookings = (users, classes) => {
  const bookings = [];
  const statuses = ['confirmed', 'rejected'];
  const paymentMethods = ['cash', 'credit_card', 'debit_card', 'online_transfer'];
  const attendanceStatuses = ['present', 'absent', 'not_checked'];

  // Generate 20 random bookings
  for (let i = 0; i < 20; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const classData = classes[Math.floor(Math.random() * classes.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
    const attendanceStatus = attendanceStatuses[Math.floor(Math.random() * attendanceStatuses.length)];

    // Generate a random date within the last 30 days
    const bookingDate = new Date();
    bookingDate.setDate(bookingDate.getDate() - Math.floor(Math.random() * 30));

    bookings.push({
      user: user._id,
      class: classData._id,
      bookingDate,
      status,
      paymentStatus: status === 'rejected' ? 'refunded' : 'paid',
      paymentAmount: classData.price,
      paymentMethod,
      attendanceStatus,
      notes: status === 'rejected' ? 'Rejected due to schedule conflict' : undefined,
      cancellationReason: status === 'rejected' ? 'Schedule conflict' : undefined,
      cancellationDate: status === 'rejected' ? bookingDate : undefined,
      refundAmount: status === 'rejected' ? classData.price : undefined
    });
  }

  return bookings;
};

// Seed data
const seedData = async () => {
  try {
    // Create users
    const createdUsers = await Promise.all(
      users.map(async (user) => {
        const newUser = new User(user);
        await newUser.save(); // This will trigger the password hashing middleware
        return newUser;
      })
    );
    console.log('Users Created');

    // Create locations
    const createdLocations = await Location.insertMany(locations);
    console.log('Locations Created');

    // Create tutors
    const createdTutors = await Tutor.insertMany(tutors);
    console.log('Tutors Created');

    // Create classes with references
    const classesWithRefs = classes.map((cls, index) => ({
      ...cls,
      tutor: createdTutors[index % createdTutors.length]._id,
      location: createdLocations[index % createdLocations.length]._id
    }));
    const createdClasses = await Class.insertMany(classesWithRefs);
    console.log('Classes Created');

    // Generate and create bookings
    const bookings = generateBookings(createdUsers, createdClasses);
    await Booking.insertMany(bookings);
    console.log('Bookings Created');

    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

// Run seeder
const runSeeder = async () => {
  await connectDB();
  await destroyData();
  await seedData();
};

runSeeder(); 