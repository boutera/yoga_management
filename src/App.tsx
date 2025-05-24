import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';

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
      default: '#FFFFFF',
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
        <MainLayout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            {/* Add more routes as we create them */}
            <Route path="/classes" element={<div>Classes Page (Coming Soon)</div>} />
            <Route path="/booking" element={<div>Booking Page (Coming Soon)</div>} />
            <Route path="/locations" element={<div>Locations Page (Coming Soon)</div>} />
            <Route path="/tutors" element={<div>Tutors Page (Coming Soon)</div>} />
            <Route path="/about" element={<div>About Page (Coming Soon)</div>} />
            <Route path="/login" element={<div>Login Page (Coming Soon)</div>} />
          </Routes>
        </MainLayout>
      </Router>
    </ThemeProvider>
  );
}

export default App; 