import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import ClassesList from './pages/admin/Classes/ClassesList';
import ClassForm from './pages/admin/Classes/ClassForm';

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
          <Route path="/admin/tutors" element={<AdminLayout><div>Tutors Management (Coming Soon)</div></AdminLayout>} />
          <Route path="/admin/locations" element={<AdminLayout><div>Locations Management (Coming Soon)</div></AdminLayout>} />
          <Route path="/admin/bookings" element={<AdminLayout><div>Bookings Management (Coming Soon)</div></AdminLayout>} />
          <Route path="/admin/reports" element={<AdminLayout><div>Reports (Coming Soon)</div></AdminLayout>} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App; 