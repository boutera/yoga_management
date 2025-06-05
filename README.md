# Yoga Management System

A comprehensive yoga studio management system built with React, Node.js, and MongoDB.

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm (v6 or higher)

## Project Structure

```
yogaManagement/
├── frontend/          # React frontend application
├── backend/           # Node.js backend application
└── README.md
```

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd yogaManagement
```

### 2. Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory with the following variables:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/yoga_management
JWT_SECRET=your_jwt_secret_key
```

4. Start MongoDB:
```bash
# On Windows
net start MongoDB

# On macOS/Linux
sudo service mongod start
```

5. Seed the database (optional):
```bash
npm run seed
```

6. Start the backend server:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

The backend server will start on http://localhost:5000

### 3. Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the frontend directory:
```env
VITE_API_URL=http://localhost:5000/api
```

4. Start the frontend development server:
```bash
npm run dev
```

The frontend application will start on http://localhost:5173

## Available Scripts

### Backend Scripts

- `npm run dev`: Start the backend in development mode with hot reload
- `npm start`: Start the backend in production mode
- `npm run seed`: Seed the database with initial data
- `npm test`: Run backend tests

### Frontend Scripts

- `npm run dev`: Start the frontend development server
- `npm run build`: Build the frontend for production
- `npm run preview`: Preview the production build locally
- `npm test`: Run frontend tests

## Default Admin Account

After seeding the database, you can log in with the following admin credentials:
- Email: admin@example.com
- Password: admin123

## API Documentation

The API documentation is available at http://localhost:5000/api-docs when the backend server is running.

## Features

- User authentication and authorization
- Class management
- Booking system
- Payment processing
- Admin dashboard
- Student management
- Location management
- Tutor management
- Reporting and analytics

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@yogamanagement.com or create an issue in the repository.
