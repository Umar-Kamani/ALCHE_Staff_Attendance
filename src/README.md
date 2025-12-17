# Security Post Attendance & Vehicle Management App

A comprehensive security post management system for universities that tracks staff attendance, vehicle entries, and parking space availability.

## Features

- **Role-Based Access Control**
  - Super Admin: User management and password resets
  - Security Guards: Attendance and vehicle tracking
  - HR Users: Employee management and report generation

- **Attendance Management**
  - Staff and guest entry/exit tracking
  - Timeline-based export functionality
  - Real-time attendance monitoring

- **Vehicle Management**
  - Employee vehicle registration
  - Override capability during attendance marking
  - Vehicle entry/exit tracking

- **Parking Management**
  - Real-time parking space monitoring
  - Capacity management
  - Availability tracking

## Tech Stack

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL
- **Deployment**: Docker + Docker Compose + Nginx

## Getting Started

### Prerequisites

- Docker and Docker Compose installed
- Node.js 18+ (for local development)

### Quick Start with Docker

1. Clone the repository
2. Create environment file:
```bash
cp .env.example .env
cp backend/.env.example backend/.env
```

3. Build and run with Docker Compose:
```bash
docker-compose up -d
```

4. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - Database: localhost:5432

### Default Credentials

- Username: `admin`
- Password: `admin123`

### Local Development

#### Backend

```bash
cd backend
npm install
cp .env.example .env
# Update DATABASE_URL in .env if needed
npm run migrate  # Run database migrations
npm run dev      # Start development server
```

#### Frontend

```bash
npm install
npm run dev
```

## Database Schema

### Users Table
- Stores user credentials and roles
- Bcrypt password hashing
- Roles: admin, security, hr

### Employees Table
- Employee information and vehicle registration
- Unique employee IDs
- Department and position tracking

### Attendance Records Table
- Entry and exit timestamps
- Guest tracking with purpose
- Vehicle plate number association

### Parking Config Table
- Total and occupied space tracking
- Real-time availability updates

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login

### Users (Admin only)
- `GET /api/users` - Get all users
- `POST /api/users` - Create new user
- `POST /api/users/:id/reset-password` - Reset password
- `DELETE /api/users/:id` - Delete user

### Employees
- `GET /api/employees` - Get all employees
- `POST /api/employees` - Create employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

### Attendance
- `GET /api/attendance` - Get attendance records (with date range filter)
- `POST /api/attendance` - Create attendance entry
- `PUT /api/attendance/:id` - Update attendance (mark exit)
- `DELETE /api/attendance/:id` - Delete attendance record

### Parking
- `GET /api/parking` - Get parking configuration
- `PUT /api/parking` - Update parking configuration

## Deployment

### Production Deployment

1. Update environment variables in `.env` files
2. Change JWT_SECRET to a secure random string
3. Update database credentials
4. Build and deploy:

```bash
docker-compose up -d --build
```

### Scaling

The application can be scaled horizontally by:
- Running multiple backend instances behind a load balancer
- Using managed PostgreSQL (AWS RDS, Google Cloud SQL, etc.)
- Implementing Redis for session management

## Security Considerations

- All passwords are hashed using bcrypt
- JWT tokens for API authentication
- Role-based access control
- SQL injection prevention using parameterized queries
- CORS configuration for production

## Brand Colors

- Primary: #002E6D (ALCHE Dark Blue)
- Secondary/Accent: #BF2C34 (ALCHE Red)

## License

Proprietary - All rights reserved
