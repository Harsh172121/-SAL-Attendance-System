/**
 * SAL Education - College Attendance Management System
 * Main Server Entry Point
 * 
 * VIVA NOTE: This is the main entry point of our Express application.
 * It initializes middleware, connects to database, and sets up routes.
 */

const path = require('path');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');

// Load environment variables from .env file BEFORE importing db
dotenv.config({ path: path.join(__dirname, '.env') });

const { connectDB } = require('./config/db');

// Connect to MySQL
connectDB();

// Initialize Express application
const app = express();

// ============================================
// MIDDLEWARE SETUP
// ============================================

/**
 * CORS Middleware
 * Allows cross-origin requests from React frontend.
 * Accept both localhost and 127.0.0.1 because Vite may be opened on either host.
 */
const allowedOrigins = (process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean)
  : [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:5174',
      'http://127.0.0.1:5174',
      'http://localhost:3000',
      'http://127.0.0.1:3000'
    ]);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true
}));

/**
 * Body Parser Middleware
 * Parses incoming JSON request bodies
 */
app.use(express.json({ limit: '2mb' }));

/**
 * URL Encoded Parser
 * Parses URL-encoded request bodies
 */
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// QA-FIXED: Cookie parser middleware for httpOnly cookie extraction
app.use(cookieParser());

// ============================================
// API ROUTES
// ============================================

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'SAL Attendance API is running',
    timestamp: new Date().toISOString()
  });
});

// Authentication routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/classrooms', require('./routes/classroomRoutes'));

// Admin routes
app.use('/api/admin/classes', require('./routes/classRoutes'));
app.use('/api/admin/batches', require('./routes/batchRoutes'));
app.use('/api/admin/students', require('./routes/studentRoutes'));
app.use('/api/admin/teachers', require('./routes/teacherRoutes'));
app.use('/api/admin/subjects', require('./routes/subjectRoutes'));
app.use('/api/admin/import', require('./routes/importRoutes'));
app.use('/api/admin/reports', require('./routes/adminAttendanceRoutes'));
const leaveRoutes = require('./routes/leaveApplicationRoutes');
app.use('/api/admin/reports/leave-requests', leaveRoutes.adminRouter);

// Teacher routes
app.use('/api/teacher', require('./routes/teacherAttendanceRoutes'));
app.use('/api/teacher/lecture-slots', require('./routes/lectureSlotRoutes'));
app.use('/api/teacher/leave-requests', leaveRoutes.teacherRouter);
app.use('/api/attendance/slots', require('./routes/slotAttendanceRoutes'));
app.use('/api/proxy', require('./routes/proxyRoutes'));
app.use('/api/teacher/proxy', require('./routes/proxyRoutes'));
app.use('/api/timetable', require('./routes/timetableRoutes'));

// Student routes
app.use('/api/student', require('./routes/studentAttendanceRoutes'));
app.use('/api/student/leave', leaveRoutes.studentRouter);

// ============================================
// ERROR HANDLING
// ============================================

/**
 * 404 Not Found Handler
 */
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`
  });
});

/**
 * Global Error Handler
 * VIVA NOTE: Centralized error handling improves code maintainability
 */
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ============================================
// START SERVER
// ============================================

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════════════╗
  ║     SAL Education Attendance System API       ║
  ║                                               ║
  ║     Server running on port: ${PORT}              ║
  ║     Environment: ${process.env.NODE_ENV || 'development'}               ║
  ╚═══════════════════════════════════════════════╝
  `);
});

module.exports = app;
