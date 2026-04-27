/**
 * SAL Education - College Attendance Management System
 * Main Application Component
 * Sets up routing, authentication, and global providers
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context providers
import { AuthProvider } from './context/AuthContext';

// Layout and protected route components
import { Layout, ProtectedRoute } from './components';

// Pages
import {
  // Common pages
  Login,
  Profile,
  Unauthorized,
  NotFound,
  // Admin pages
  AdminDashboard,
  ManageClasses,
  ManageBatches,
  ManageStudents,
  ManageTeachers,
  ManageSubjects,
  ManageClassrooms,
  AttendanceReports,
  // Teacher pages
  TeacherDashboard,
  MarkAttendance,
  ViewAttendance,
  ManageLectureSlots,
  StartAttendance,
  LeaveRequests,
  ProxyRequests,
  ProxyApprovals,
  ProxyLectures,
  TeacherTimetable,
  // Student pages
  StudentDashboard,
  MyAttendance,
  ApplyLeave,
  StudentTimetable,
} from './pages';

/**
 * App Component
 * Root component that sets up the application structure
 */
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes - accessible without authentication */}
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Root redirect - redirects to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Admin routes - protected, accessible by admin role and elevated teachers */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']} allowElevated>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="classes" element={<ManageClasses />} />
            <Route path="batches" element={<ManageBatches />} />
            <Route path="students" element={<ManageStudents />} />
            <Route path="teachers" element={<ManageTeachers />} />
            <Route path="subjects" element={<ManageSubjects />} />
            <Route path="classrooms" element={<ManageClassrooms />} />
            <Route path="reports" element={<AttendanceReports />} />
          </Route>

          {/* Teacher routes - protected, only accessible by teacher role */}
          <Route
            path="/teacher"
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<TeacherDashboard />} />
            <Route path="mark-attendance" element={<MarkAttendance />} />
            <Route path="view-attendance" element={<ViewAttendance />} />
            <Route path="lecture-slots" element={<ManageLectureSlots />} />
            <Route path="start-attendance" element={<StartAttendance />} />
            <Route path="leave-requests" element={<LeaveRequests />} />
            <Route path="proxy-requests" element={<ProxyRequests />} />
            <Route path="proxy-approvals" element={<ProxyApprovals />} />
            <Route path="proxy-lectures" element={<ProxyLectures />} />
            <Route path="timetable" element={<TeacherTimetable />} />
          </Route>

          <Route
            path="/attendance"
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="mark" element={<MarkAttendance />} />
          </Route>

          {/* Student routes - protected, only accessible by student role */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="my-attendance" element={<MyAttendance />} />
            <Route path="apply-leave" element={<ApplyLeave />} />
            <Route path="timetable" element={<StudentTimetable />} />
          </Route>

          {/* Profile route - accessible by all authenticated users */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={['admin', 'teacher', 'student']}>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Profile />} />
          </Route>

          {/* 404 - Catch all unmatched routes */}
          <Route path="*" element={<NotFound />} />
        </Routes>

        {/* Toast notifications container */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
