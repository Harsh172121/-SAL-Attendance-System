# SAL Education - College Attendance Management System Backend

A comprehensive backend API for managing college attendance with role-based access control.

## 📋 Features

### Authentication
- JWT-based authentication
- Common login API for Admin, Teacher, and Student
- Password hashing using bcrypt
- Role-based access control

### Admin Features
- **Class Management**: Create, Read, Update, Delete classes
- **Batch Management**: Create, Read, Update, Delete batches under classes
- **Student Management**: Full CRUD with class/batch assignment
- **Teacher Management**: Full CRUD with subject assignment
- **Subject Management**: 
  - Dynamic subject creation (Theory/Lab/Theory+Lab)
  - Separate faculty assignment for theory and lab
  - Class assignment

### Teacher Features
- View assigned subjects
- Get students by class (for theory) or batch (for lab)
- Mark attendance:
  - Theory attendance: Class-based
  - Lab attendance: Batch-based
- Prevent duplicate attendance
- Update same-day attendance
- View attendance reports

### Student Features
- View own attendance summary
- Subject-wise attendance percentage
- Separate theory and lab attendance display
- Monthly attendance calendar

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **ODM**: Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Environment Variables**: dotenv
- **CORS**: cors

## 📁 Project Structure

```
backend/
├── config/
│   └── db.js              # MongoDB connection
├── controllers/
│   ├── authController.js
│   ├── classController.js
│   ├── batchController.js
│   ├── studentController.js
│   ├── teacherController.js
│   ├── subjectController.js
│   ├── teacherAttendanceController.js
│   └── studentAttendanceController.js
├── middleware/
│   ├── authMiddleware.js   # JWT verification
│   └── roleMiddleware.js   # Role-based access
├── models/
│   ├── Admin.js
│   ├── Teacher.js
│   ├── Student.js
│   ├── Class.js
│   ├── Batch.js
│   ├── Subject.js
│   └── Attendance.js
├── routes/
│   ├── authRoutes.js
│   ├── classRoutes.js
│   ├── batchRoutes.js
│   ├── studentRoutes.js
│   ├── teacherRoutes.js
│   ├── subjectRoutes.js
│   ├── teacherAttendanceRoutes.js
│   └── studentAttendanceRoutes.js
├── .env
├── package.json
├── seeder.js              # Database seeder
└── server.js              # Entry point
```

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file (or update existing):
   ```env
   MONGO_URI=mongodb://localhost:27017/sal_attendance
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRE=7d
   PORT=5000
   NODE_ENV=development
   ```

4. **Start MongoDB**
   - Local: Ensure MongoDB service is running
   - Atlas: Use your connection string in MONGO_URI

5. **Seed the database (Optional)**
   ```bash
   npm run seed
   ```
   This creates sample data including:
   - 1 Admin
   - 5 Teachers
   - 12 Students
   - 6 Classes
   - 9 Batches
   - 8 Subjects
   - Sample attendance records

6. **Start the server**
   ```bash
   # Development (with nodemon)
   npm run dev
   
   # Production
   npm start
   ```

## 🔐 Default Login Credentials

After running the seeder:

| Role    | Email            | Password    |
|---------|------------------|-------------|
| Admin   | admin@sal.edu    | admin123    |
| Teacher | rajesh@sal.edu   | teacher123  |
| Student | rahul@sal.edu    | student123  |

## 📚 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login (all roles) |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/change-password` | Change password |

### Admin - Class Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/classes` | Get all classes |
| POST | `/api/admin/classes` | Create class |
| GET | `/api/admin/classes/:id` | Get class by ID |
| PUT | `/api/admin/classes/:id` | Update class |
| DELETE | `/api/admin/classes/:id` | Delete class |
| GET | `/api/admin/classes/:id/students` | Get students in class |

### Admin - Batch Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/batches` | Get all batches |
| POST | `/api/admin/batches` | Create batch |
| GET | `/api/admin/batches/:id` | Get batch by ID |
| PUT | `/api/admin/batches/:id` | Update batch |
| DELETE | `/api/admin/batches/:id` | Delete batch |
| GET | `/api/admin/batches/class/:classId` | Get batches by class |

### Admin - Student Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/students` | Get all students |
| POST | `/api/admin/students` | Create student |
| GET | `/api/admin/students/:id` | Get student by ID |
| PUT | `/api/admin/students/:id` | Update student |
| DELETE | `/api/admin/students/:id` | Delete student |
| PUT | `/api/admin/students/:id/assign-batch` | Assign batch |
| PUT | `/api/admin/students/:id/reset-password` | Reset password |

### Admin - Teacher Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/teachers` | Get all teachers |
| POST | `/api/admin/teachers` | Create teacher |
| GET | `/api/admin/teachers/:id` | Get teacher by ID |
| PUT | `/api/admin/teachers/:id` | Update teacher |
| DELETE | `/api/admin/teachers/:id` | Delete teacher |
| GET | `/api/admin/teachers/:id/subjects` | Get assigned subjects |

### Admin - Subject Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/subjects` | Get all subjects |
| POST | `/api/admin/subjects` | Create subject |
| GET | `/api/admin/subjects/:id` | Get subject by ID |
| PUT | `/api/admin/subjects/:id` | Update subject |
| DELETE | `/api/admin/subjects/:id` | Delete subject |
| PUT | `/api/admin/subjects/:id/assign-faculty` | Assign faculty |
| GET | `/api/admin/subjects/class/:classId` | Get subjects by class |

### Teacher - Attendance
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/teacher/my-subjects` | Get assigned subjects |
| GET | `/api/teacher/students/:subjectId` | Get students for attendance |
| GET | `/api/teacher/batches/:subjectId` | Get batches for subject |
| POST | `/api/teacher/attendance` | Mark attendance |
| GET | `/api/teacher/attendance/:subjectId` | Get attendance records |
| GET | `/api/teacher/reports/:subjectId` | Get attendance report |

### Student - Attendance
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/student/dashboard` | Get dashboard stats |
| GET | `/api/student/attendance` | Get attendance summary |
| GET | `/api/student/attendance/:subjectId` | Get subject attendance |
| GET | `/api/student/attendance/calendar/:year/:month` | Get monthly calendar |

## 📝 Request/Response Examples

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@sal.edu",
  "password": "admin123"
}
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "role": "admin",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Mark Attendance
```bash
POST /api/teacher/attendance
Authorization: Bearer <token>
Content-Type: application/json

{
  "subjectId": "65a1b2c3d4e5f6789012345",
  "date": "2026-01-30",
  "type": "theory",
  "attendanceData": [
    { "studentId": "65a1b2c3d4e5f6789012346", "status": "present" },
    { "studentId": "65a1b2c3d4e5f6789012347", "status": "absent" }
  ]
}
```

## ⚠️ Attendance Logic (Critical)

### Theory Attendance
- Marked for entire class
- One record per student per subject per day
- No batch required

### Lab Attendance
- Marked batch-wise
- `batchId` is **mandatory**
- Students must be assigned to a batch for lab attendance

### Duplicate Prevention
- System prevents duplicate entries
- Same-day attendance can be updated

## 🔒 Security Features

1. **JWT Authentication**: Stateless token-based auth
2. **Password Hashing**: bcrypt with salt rounds
3. **Role-Based Access**: Middleware protects routes
4. **Input Validation**: Mongoose schema validation
5. **Error Handling**: Centralized error responses

## 📖 VIVA Notes

Key concepts for viva preparation:

1. **MVC Architecture**: Models, Controllers, Routes separation
2. **Mongoose ODM**: Schema validation, virtuals, pre-save hooks
3. **JWT Flow**: Token generation, verification, expiry
4. **RBAC**: Role-based access control implementation
5. **REST API**: Resource-based endpoints, HTTP methods
6. **Middleware**: Request processing pipeline
7. **Async/Await**: Modern asynchronous JavaScript

## 📄 License

ISC License

---

**SAL Education** - Building the future of attendance management
