import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layout
import Layout from './components/common/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';

// Auth Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Unauthorized from './components/auth/Unauthorized';
import ChangePassword from './components/auth/ChangePassword';

// Dashboard Components
import AdminDashboard from './components/admin/Dashboard';
import FacultyDashboard from './components/faculty/FacultyDashboard';
import StudentDashboard from './components/student/StudentDashboard';

// Admin Components
import ManageStudents from './components/admin/ManageStudents';
import StudentForm from './components/admin/StudentForm';
import ManageFaculty from './components/admin/ManageFaculty';
import FacultyForm from './components/admin/FacultyForm';
import ManageCourses from './components/admin/ManageCourses';
import CourseForm from './components/admin/CourseForm';
import ManageMarks from './components/admin/ManageMarks';
import MarksForm from './components/admin/MarksForm';
import ManageFees from './components/admin/ManageFees';
import FeeForm from './components/admin/FeeForm';
import StudentDetail from './components/admin/StudentDetail';

// Faculty Components
import MyCourses from './components/faculty/MyCourses';
import ViewStudents from './components/faculty/ViewStudents';
import EnterMarks from './components/faculty/EnterMarks';

// Student Components
import StudentCourses from './components/student/ViewCourses';
import ViewMarks from './components/student/ViewMarks';
import ViewFees from './components/student/ViewFees';

// Common Components
import Profile from './components/common/Profile';
import NotFound from './components/common/NotFound';

import PendingUsers from './components/admin/PendingUsers';
import './App.css';

// Dashboard Router - routes to appropriate dashboard based on role
const DashboardRouter = () => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'faculty':
      return <FacultyDashboard />;
    case 'student':
      return <StudentDashboard />;
    default:
      return <Navigate to="/unauthorized" replace />;
  }
};

// At the top of App.js, add this component
const MyCoursesRouter = () => {
  const { user } = useAuth();
  
  if (user?.role === 'faculty') {
    return <MyCourses />;
  }
  
  if (user?.role === 'student') {
    return <StudentCourses />;
  }
  
  return null;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Protected Routes with Layout */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              {/* Dashboard */}
              <Route index element={<DashboardRouter />} />

              {/* Common Routes */}
              <Route path="profile" element={<Profile />} />
              <Route path="change-password" element={<ChangePassword />} />

              {/* Admin Routes */}
              <Route
                path="students"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'faculty']}>
                    <ManageStudents />
                  </ProtectedRoute>
                }
              />
              <Route
                path="students/new"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <StudentForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="students/:id/edit"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <StudentForm />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="students/:id"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'faculty']}>
                    <StudentDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="faculty"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <ManageFaculty />
                  </ProtectedRoute>
                }
              />
              <Route
                path="faculty/new"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <FacultyForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="faculty/:id/edit"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <FacultyForm />
                  </ProtectedRoute>
                }
              />
              //user can be student or faculty.
              <Route
                path="pending-users"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <PendingUsers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="courses"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <ManageCourses />
                  </ProtectedRoute>
                }
              />
              <Route
                path="courses/new"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <CourseForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="courses/:id/edit"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <CourseForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="courses/:id"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'faculty', 'student']}>
                    <CourseForm mode="view" />
                  </ProtectedRoute>
                }
              />

              <Route
                path="marks"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <ManageMarks />
                  </ProtectedRoute>
                }
              />
              <Route
                path="marks/new"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'faculty']}>
                    <MarksForm />
                  </ProtectedRoute>
                }
              />

              <Route
                path="fees"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <ManageFees />
                  </ProtectedRoute>
                }
              />
              <Route
                path="fees/new"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <FeeForm />
                  </ProtectedRoute>
                }
              />

              {/* Faculty Routes */}
              <Route
  path="my-courses"
  element={
    <ProtectedRoute allowedRoles={['faculty', 'student']}>
      <MyCoursesRouter />
    </ProtectedRoute>
  }
/>
              <Route
                path="enter-marks"
                element={
                  <ProtectedRoute allowedRoles={['faculty']}>
                    <EnterMarks />
                  </ProtectedRoute>
                }
              />

              {/* Student Routes */}
              <Route
                path="my-marks"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <ViewMarks />
                  </ProtectedRoute>
                }
              />
              <Route
                path="my-fees"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <ViewFees />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* 404 Not Found */}
            <Route path="*" element={<NotFound />} />
          </Routes>

          {/* Toast Notifications */}
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={true}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;