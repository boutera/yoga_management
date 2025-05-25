# Yoga Management System - Backend API

This is the backend API for the Yoga Management System, built with Node.js, Express.js, and MongoDB.

## Features

- User Authentication (Register, Login, Profile Management)
- Class Management
- Location Management
- Booking System
- Reporting and Analytics
- Role-based Access Control

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Setup

1. Clone the repository
2. Navigate to the backend directory:
   ```bash
   cd backend
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Create a `.env` file in the root directory with the following variables:
   ```
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # MongoDB Configuration
   MONGODB_URI=mongodb://localhost:27017/yoga_management

   # JWT Configuration
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRE=30d

   # Email Configuration (for password reset)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_email_password
   FROM_EMAIL=noreply@yogamanagement.com
   FROM_NAME=Yoga Management System
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## API Documentation

### Authentication

#### Register User
- **POST** `/api/auth/register`
- Body:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "student"
  }
  ```

#### Login
- **POST** `/api/auth/login`
- Body:
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```

#### Get Current User
- **GET** `/api/auth/me`
- Headers: `Authorization: Bearer <token>`

#### Update Profile
- **PUT** `/api/auth/profile`
- Headers: `Authorization: Bearer <token>`
- Body:
  ```json
  {
    "name": "John Doe",
    "phone": "1234567890",
    "address": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "USA"
    },
    "bio": "Yoga enthusiast"
  }
  ```

#### Change Password
- **PUT** `/api/auth/change-password`
- Headers: `Authorization: Bearer <token>`
- Body:
  ```json
  {
    "currentPassword": "oldpassword",
    "newPassword": "newpassword"
  }
  ```

### Classes

#### Get All Classes
- **GET** `/api/classes`
- Query Parameters:
  - `status`: Filter by status (active/inactive)
  - `category`: Filter by category
  - `tutor`: Filter by tutor ID
  - `location`: Filter by location ID
  - `level`: Filter by level
  - `search`: Search by name or description

#### Get Class by ID
- **GET** `/api/classes/:id`

#### Create Class
- **POST** `/api/classes`
- Body:
  ```json
  {
    "name": "Morning Yoga",
    "description": "Start your day with energy",
    "tutor": "tutor_id",
    "location": "location_id",
    "capacity": 20,
    "price": 15,
    "duration": 60,
    "schedule": [
      {
        "dayOfWeek": "Monday",
        "startTime": "08:00",
        "endTime": "09:00"
      }
    ],
    "category": "Hatha",
    "level": "Beginner"
  }
  ```

#### Update Class
- **PUT** `/api/classes/:id`
- Body: Same as Create Class

#### Delete Class
- **DELETE** `/api/classes/:id`

## Error Handling

The API uses a consistent error response format:

```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error information (in development)"
}
```

## Security

- All routes except registration and login require authentication
- Passwords are hashed using bcrypt
- JWT tokens are used for authentication
- Input validation using express-validator
- CORS enabled for frontend access

## Development

- Run tests: `npm test`
- Lint code: `npm run lint`
- Format code: `npm run format`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request 