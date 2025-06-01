import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout';
import MainLayout from './layouts/MainLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// User Pages
import Home from './pages/user/Home';
import UserClassesList from './pages/user/ClassesList';

// Admin Pages
import Dashboard from './pages/admin/Dashboard';
import AdminClassesList from './pages/admin/Classes/ClassesList';
import ClassForm from './pages/admin/Classes/ClassForm';
import ClassDetails from './pages/admin/Classes/ClassDetails';
import TutorsList from './pages/admin/Tutors/TutorsList';
import TutorForm from './pages/admin/Tutors/TutorForm';
import LocationsList from './pages/admin/Locations/LocationsList';
import LocationForm from './pages/admin/Locations/LocationForm';
import BookingsList from './pages/admin/Bookings/BookingsList';
import BookingForm from './pages/admin/Bookings/BookingForm';
import Reports from './pages/admin/Reports/Reports';

const AppRoutes = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={
        isAuthenticated ? (
          user?.role === 'admin' ? 
            <Navigate to="/admin/dashboard" replace /> : 
            <Navigate to="/" replace />
        ) : <Login />
      } />
      <Route path="/register" element={
        isAuthenticated ? (
          user?.role === 'admin' ? 
            <Navigate to="/admin/dashboard" replace /> : 
            <Navigate to="/" replace />
        ) : <Register />
      } />

      {/* User Routes */}
      <Route path="/" element={
        isAuthenticated && user?.role === 'admin' ? (
          <Navigate to="/admin/dashboard" replace />
        ) : (
          <MainLayout>
            <Home />
          </MainLayout>
        )
      } />

      <Route path="/classes" element={
        isAuthenticated && user?.role === 'admin' ? (
          <Navigate to="/admin/dashboard" replace />
        ) : (
          <MainLayout>
            <UserClassesList />
          </MainLayout>
        )
      } />

      {/* Protected Admin Routes */}
      <Route path="/admin/*" element={
        <ProtectedRoute requiredRole="admin">
          <AdminLayout>
            <Routes>
              <Route path="dashboard" element={<Dashboard />} />
              
              {/* Classes Routes */}
              <Route path="classes" element={<AdminClassesList />} />
              <Route path="classes/new" element={<ClassForm />} />
              <Route path="classes/edit/:id" element={<ClassForm />} />
              <Route path="classes/:id" element={<ClassDetails />} />
              
              {/* Tutors Routes */}
              <Route path="tutors" element={<TutorsList />} />
              <Route path="tutors/new" element={<TutorForm />} />
              <Route path="tutors/edit/:id" element={<TutorForm />} />
              
              {/* Locations Routes */}
              <Route path="locations" element={<LocationsList />} />
              <Route path="locations/new" element={<LocationForm />} />
              <Route path="locations/edit/:id" element={<LocationForm />} />
              
              {/* Bookings Routes */}
              <Route path="bookings" element={<BookingsList />} />
              <Route path="bookings/new" element={<BookingForm />} />
              <Route path="bookings/edit/:id" element={<BookingForm />} />
              
              {/* Reports Route */}
              <Route path="reports" element={<Reports />} />
            </Routes>
          </AdminLayout>
        </ProtectedRoute>
      } />

      {/* Catch all route - redirect based on role */}
      <Route path="*" element={
        isAuthenticated ? (
          user?.role === 'admin' ? 
            <Navigate to="/admin/dashboard" replace /> : 
            <Navigate to="/" replace />
        ) : <Navigate to="/" replace />
      } />
    </Routes>
  );
};

export default AppRoutes; 