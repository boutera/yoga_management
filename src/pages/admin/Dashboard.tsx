import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  People as PeopleIcon,
  EventNote as EventIcon,
  LocationOn as LocationIcon,
  Class as ClassIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format, startOfDay, endOfDay } from 'date-fns';
import { reportAPI } from '../../services/api';

const StatCard = ({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}) => (
  <Card
    sx={{
      height: '100%',
      transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
      background: `linear-gradient(135deg, ${color}15 0%, ${color}08 100%)`,
      border: `1px solid ${color}30`,
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: `0 4px 20px ${color}20`,
      },
    }}
  >
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box
          sx={{
            backgroundColor: `${color}30`,
            borderRadius: '12px',
            p: 1.5,
            mr: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </Box>
        <Typography variant="h6" color="text.primary" sx={{ fontWeight: 500 }}>
          {title}
        </Typography>
      </Box>
      <Typography 
        variant="h4" 
        component="div" 
        sx={{ 
          fontWeight: 600,
          color: color,
          mb: 1,
        }}
      >
        {value}
      </Typography>
    </CardContent>
  </Card>
);

const QuickActionCard = ({
  title,
  description,
  icon,
  onClick,
  color,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  color: string;
}) => (
  <Card
    sx={{
      height: '100%',
      transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      },
    }}
  >
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box
          sx={{
            backgroundColor: `${color}15`,
            borderRadius: '12px',
            p: 1.5,
            mr: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 500 }}>
          {title}
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" paragraph>
        {description}
      </Typography>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={onClick}
        fullWidth
        sx={{
          bgcolor: color,
          '&:hover': {
            bgcolor: `${color}dd`,
          },
        }}
      >
        Add New
      </Button>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const today = new Date();
      const [tutorReport, bookingReport, locationReport] = await Promise.all([
        reportAPI.getTutorReport(format(startOfDay(today), 'yyyy-MM-dd'), format(endOfDay(today), 'yyyy-MM-dd')),
        reportAPI.getBookingReport(format(startOfDay(today), 'yyyy-MM-dd'), format(endOfDay(today), 'yyyy-MM-dd')),
        reportAPI.getLocationReport(format(startOfDay(today), 'yyyy-MM-dd'), format(endOfDay(today), 'yyyy-MM-dd')),
      ]);

      setDashboardData({
        tutors: tutorReport,
        bookings: bookingReport,
        locations: locationReport,
      });
    } catch (err) {
      setError('Failed to fetch dashboard data. Please try again later.');
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      title: 'Total Tutors',
      value: dashboardData?.tutors?.totalTutors || 0,
      icon: <PeopleIcon sx={{ color: '#2196f3' }} />,
      color: '#2196f3',
    },
    {
      title: 'Active Classes',
      value: dashboardData?.tutors?.classDistribution ? 
        Object.values(dashboardData.tutors.classDistribution).reduce((sum: number, count: unknown) => sum + (count as number), 0) : 0,
      icon: <ClassIcon sx={{ color: '#4caf50' }} />,
      color: '#4caf50',
    },
    {
      title: 'Today\'s Bookings',
      value: dashboardData?.bookings?.totalBookings || 0,
      icon: <EventIcon sx={{ color: '#ff9800' }} />,
      color: '#ff9800',
    },
    {
      title: 'Locations',
      value: dashboardData?.locations?.totalLocations || 0,
      icon: <LocationIcon sx={{ color: '#f44336' }} />,
      color: '#f44336',
    },
  ];

  const quickActions = [
    {
      title: 'Add New Class',
      description: 'Create a new yoga or healing class',
      icon: <ClassIcon sx={{ color: '#4caf50' }} />,
      onClick: () => navigate('/admin/classes/new'),
      color: '#4caf50',
    },
    {
      title: 'Add New Tutor',
      description: 'Register a new instructor',
      icon: <PeopleIcon sx={{ color: '#2196f3' }} />,
      onClick: () => navigate('/admin/tutors/new'),
      color: '#2196f3',
    },
    {
      title: 'Add New Location',
      description: 'Add a new center location',
      icon: <LocationIcon sx={{ color: '#f44336' }} />,
      onClick: () => navigate('/admin/locations/new'),
      color: '#f44336',
    },
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
        Dashboard
      </Typography>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.title}>
            <StatCard {...stat} />
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4, fontWeight: 600, color: 'primary.main' }}>
        Quick Actions
      </Typography>
      <Grid container spacing={3}>
        {quickActions.map((action) => (
          <Grid item xs={12} md={4} key={action.title}>
            <QuickActionCard {...action} />
          </Grid>
        ))}
      </Grid>

      {/* Recent Activity */}
      <Paper 
        sx={{ 
          p: 3, 
          mt: 4,
          borderRadius: 2,
          boxShadow: '0 2px 12px 0 rgba(0,0,0,0.05)',
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          },
        }}
      >
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
          Recent Activity
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {dashboardData?.bookings?.totalBookings ? `${dashboardData.bookings.totalBookings} bookings today` : 'No recent activity to display'}
        </Typography>
      </Paper>
    </Box>
  );
};

export default Dashboard; 