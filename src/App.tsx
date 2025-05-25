import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import ClassesList from './pages/admin/Classes/ClassesList';
import ClassForm from './pages/admin/Classes/ClassForm';
import TutorsList from './pages/admin/Tutors/TutorsList';
import TutorForm from './pages/admin/Tutors/TutorForm';
import BookingForm from './pages/admin/Bookings/BookingForm';
import BookingsList from './pages/admin/Bookings/BookingsList';
import Reports from './pages/admin/Reports/Reports';
import LocationsList from './pages/admin/Locations/LocationsList';
import LocationForm from './pages/admin/Locations/LocationForm';

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: '#2E7D32', // Green shade
    },
    secondary: {
      main: '#FF6B6B', // Coral shade
    },
    background: {
      default: '#F5F5F5',
    },
  },
  typography: {
    fontFamily: '"Poppins", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Redirect root to admin dashboard */}
          <Route path="/" element={<Navigate to="/admin" replace />} />
          
          {/* Admin routes */}
          <Route path="/admin" element={<AdminLayout><Dashboard /></AdminLayout>} />
          <Route path="/admin/classes" element={<AdminLayout><ClassesList /></AdminLayout>} />
          <Route path="/admin/classes/new" element={<AdminLayout><ClassForm /></AdminLayout>} />
          <Route path="/admin/classes/edit/:id" element={<AdminLayout><ClassForm /></AdminLayout>} />
          <Route path="/admin/tutors" element={<AdminLayout><TutorsList /></AdminLayout>} />
          <Route path="/admin/tutors/new" element={<AdminLayout><TutorForm /></AdminLayout>} />
          <Route path="/admin/tutors/edit/:id" element={<AdminLayout><TutorForm /></AdminLayout>} />
          <Route path="/admin/locations" element={<AdminLayout><LocationsList /></AdminLayout>} />
          <Route path="/admin/locations/new" element={<AdminLayout><LocationForm /></AdminLayout>} />
          <Route path="/admin/locations/edit/:id" element={<AdminLayout><LocationForm /></AdminLayout>} />
          <Route path="/admin/bookings" element={<AdminLayout><BookingsList /></AdminLayout>} />
          <Route path="/admin/bookings/new" element={<AdminLayout><BookingForm /></AdminLayout>} />
          <Route path="/admin/bookings/:id" element={<AdminLayout><BookingForm /></AdminLayout>} />
          <Route path="/admin/reports" element={<AdminLayout><Reports /></AdminLayout>} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App; 