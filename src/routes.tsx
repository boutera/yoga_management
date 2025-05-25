import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout';

// Auth Pages
import Login from './pages/auth/Login';

// Admin Pages
import Dashboard from './pages/admin/Dashboard';
import ClassesList from './pages/admin/Classes/ClassesList';
import ClassForm from './pages/admin/Classes/ClassForm';
import TutorsList from './pages/admin/Tutors/TutorsList';
import TutorForm from './pages/admin/Tutors/TutorForm';
import LocationsList from './pages/admin/Locations/LocationsList';
import LocationForm from './pages/admin/Locations/LocationForm';
import BookingsList from './pages/admin/Bookings/BookingsList';
import BookingForm from './pages/admin/Bookings/BookingForm';
import Reports from './pages/admin/Reports/Reports';

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/admin/dashboard" replace /> : <Login />
      } />

      {/* Protected Admin Routes */}
      <Route path="/admin/*" element={
        <ProtectedRoute requiredRole="admin">
          <AdminLayout>
            <Routes>
              <Route path="dashboard" element={<Dashboard />} />
              
              {/* Classes Routes */}
              <Route path="classes" element={<ClassesList />} />
              <Route path="classes/new" element={<ClassForm />} />
              <Route path="classes/edit/:id" element={<ClassForm />} />
              
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

      {/* Redirect root to dashboard if authenticated, otherwise to login */}
      <Route path="/" element={
        isAuthenticated ? <Navigate to="/admin/dashboard" replace /> : <Navigate to="/login" replace />
      } />

      {/* Catch all route - redirect to dashboard */}
      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes; 