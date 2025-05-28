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
  <Card>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box
          sx={{
            backgroundColor: `${color}15`,
            borderRadius: '50%',
            p: 1,
            mr: 2,
          }}
        >
          {icon}
        </Box>
        <Typography variant="h6" color="text.secondary">
          {title}
        </Typography>
      </Box>
      <Typography variant="h4" component="div">
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
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}) => (
  <Card>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        {icon}
        <Typography variant="h6" sx={{ ml: 1 }}>
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

  const quickActions = [
    {
      title: 'Add New Class',
      description: 'Create a new yoga or healing class',
      icon: <ClassIcon color="primary" />,
      onClick: () => navigate('/admin/classes/new'),
    },
    {
      title: 'Add New Tutor',
      description: 'Register a new instructor',
      icon: <PeopleIcon color="primary" />,
      onClick: () => navigate('/admin/tutors/new'),
    },
    {
      title: 'Add New Location',
      description: 'Add a new center location',
      icon: <LocationIcon color="primary" />,
      onClick: () => navigate('/admin/locations/new'),
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

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
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
      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
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
      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h5" gutterBottom>
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