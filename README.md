# College Management System

A comprehensive web-based College Management System built with MERN stack (MongoDB, Express.js, React, Node.js) following modern development practices.

## Features

### Admin Features
- Manage students, faculty, and courses
- Enter and manage student marks
- Manage fee records and payments
- View comprehensive reports and statistics
- Full CRUD operations on all entities

### Faculty Features
- View assigned courses
- Enter and update marks for students
- View student lists and performance
- Manage course-related activities

### Student Features
- View enrolled courses
- Check marks and academic performance
- View fee details and payment status
- Access personal profile information

## Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Bcrypt** for password hashing
- **Winston** for logging
- **Express Validator** for input validation
- **Helmet** for security
- **CORS** for cross-origin requests
- **Rate Limiting** for API protection

### Frontend
- **React** 18 with Hooks
- **React Router** v6 for routing
- **Axios** for API calls
- **React Toastify** for notifications
- **React Icons** for icons
- **Formik & Yup** for form handling
- **Chart.js** for data visualization

## Project Structure
```
college-management-system/
├── backend/
│   ├── config/          # Database and JWT configuration
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Authentication, logging, error handling
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API routes
│   ├── utils/           # Helper functions
│   ├── logs/            # Application logs
│   └── server.js        # Entry point
│
└── frontend/
    ├── public/          # Static files
    └── src/
        ├── components/  # React components
        ├── context/     # React context (Auth)
        ├── services/    # API service layer
        ├── styles/      # CSS files
        └── utils/       # Helper functions
```

## Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/college_management_system
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=24h
DEFAULT_ADMIN_EMAIL=admin@hexaware.com
DEFAULT_ADMIN_PASSWORD=Admin@123
```

4. Seed the database:
```bash
npm run seed
```

5. Start the server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
REACT_APP_API_URL=http://localhost:5000/api/v1
```

4. Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:3000`

## Default Login Credentials

### Admin
- Email: admin@hexaware.com
- Password: Admin@123

### Faculty
- Email: rajesh.kumar@hexaware.com
- Password: Faculty@123

### Student
- Email: arjun.reddy@student.hexaware.com
- Password: Student@123

## API Documentation

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/me` - Get current user
- `PUT /api/v1/auth/update-password` - Update password

### Students
- `GET /api/v1/students` - Get all students
- `GET /api/v1/students/:id` - Get student by ID
- `POST /api/v1/students` - Create student
- `PUT /api/v1/students/:id` - Update student
- `DELETE /api/v1/students/:id` - Delete student

### Faculty
- `GET /api/v1/faculty` - Get all faculty
- `GET /api/v1/faculty/:id` - Get faculty by ID
- `POST /api/v1/faculty` - Create faculty
- `PUT /api/v1/faculty/:id` - Update faculty
- `DELETE /api/v1/faculty/:id` - Delete faculty

### Courses
- `GET /api/v1/courses` - Get all courses
- `GET /api/v1/courses/:id` - Get course by ID
- `POST /api/v1/courses` - Create course
- `PUT /api/v1/courses/:id` - Update course
- `DELETE /api/v1/courses/:id` - Delete course
- `POST /api/v1/courses/:id/enroll` - Enroll student
- `POST /api/v1/courses/:id/unenroll` - Unenroll student

### Marks
- `GET /api/v1/marks` - Get all marks
- `GET /api/v1/marks/student/:id` - Get marks by student
- `GET /api/v1/marks/course/:id` - Get marks by course
- `POST /api/v1/marks` - Create/update marks
- `PUT /api/v1/marks/:id/publish` - Publish marks
- `DELETE /api/v1/marks/:id` - Delete marks

### Fees
- `GET /api/v1/fees` - Get all fees
- `GET /api/v1/fees/student/:id` - Get fees by student
- `POST /api/v1/fees` - Create fee record
- `PUT /api/v1/fees/:id` - Update fee record
- `POST /api/v1/fees/:id/payment` - Add payment
- `DELETE /api/v1/fees/:id` - Delete fee record

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Account lockout after failed login attempts
- Rate limiting on API endpoints
- Helmet for HTTP headers security
- Input validation and sanitization
- Role-based access control

## Testing

Run backend tests:
```bash
cd backend
npm test
```

## License

This project is licensed under the MIT License.

## Authors

Hexaware Technologies

## Acknowledgments

- Built as part of Web Development Major Project
- Designed with Hexaware's brand guidelines
- Modern UI/UX following industry standards
