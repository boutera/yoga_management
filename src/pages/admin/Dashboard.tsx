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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  People as PeopleIcon,
  EventNote as EventIcon,
  LocationOn as LocationIcon,
  Class as ClassIcon,
  Add as AddIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as AttachMoneyIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format, startOfDay, endOfDay } from 'date-fns';
import { reportAPI } from '../../services/api';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

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
      const startDate = new Date();
      startDate.setDate(today.getDate() - 30); // Get data for the last 30 days

      console.log('Fetching dashboard data for date range:', {
        startDate: format(startOfDay(startDate), 'yyyy-MM-dd'),
        endDate: format(endOfDay(today), 'yyyy-MM-dd')
      });

      const [tutorReport, bookingReport, locationReport] = await Promise.all([
        reportAPI.getTutorReport(format(startOfDay(startDate), 'yyyy-MM-dd'), format(endOfDay(today), 'yyyy-MM-dd')),
        reportAPI.getBookingReport(format(startOfDay(startDate), 'yyyy-MM-dd'), format(endOfDay(today), 'yyyy-MM-dd')),
        reportAPI.getLocationReport(format(startOfDay(startDate), 'yyyy-MM-dd'), format(endOfDay(today), 'yyyy-MM-dd')),
      ]);

      console.log('Received location report:', locationReport);

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

  const handleRefresh = () => {
    fetchDashboardData();
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
    {
      title: 'Total Users',
      value: dashboardData?.bookings?.userStats?.totalUsers || 0,
      icon: <PeopleIcon sx={{ color: '#9c27b0' }} />,
      color: '#9c27b0',
    }
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main' }}>
          Dashboard
        </Typography>
        <Button
          variant="contained"
          onClick={handleRefresh}
          startIcon={<RefreshIcon />}
        >
          Refresh Data
        </Button>
      </Box>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat) => (
          <Grid item xs={12} sm={6} md={4} key={stat.title}>
            <StatCard {...stat} />
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4, fontWeight: 600, color: 'primary.main' }}>
        Quick Actions
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {quickActions.map((action) => (
          <Grid item xs={12} md={4} key={action.title}>
            <QuickActionCard {...action} />
          </Grid>
        ))}
      </Grid>

      {/* Booking Status Distribution */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Booking Status Distribution" />
            <CardContent>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={Object.entries(dashboardData?.bookings?.byStatus || {}).map(([status, count]) => ({
                        name: status,
                        value: count
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {Object.entries(dashboardData?.bookings?.byStatus || {}).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Location Performance */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Location Performance" />
            <CardContent>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Location</TableCell>
                      <TableCell align="right">Bookings</TableCell>
                      <TableCell align="right">Utilization</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dashboardData?.locations?.classDistribution && 
                      Object.entries(dashboardData.locations.classDistribution).map(([locationName, classes]) => (
                        <TableRow key={locationName}>
                          <TableCell>{locationName}</TableCell>
                          <TableCell align="right">
                            {dashboardData.locations.bookingDistribution?.[locationName] || 0}
                          </TableCell>
                          <TableCell align="right">
                            {dashboardData.locations.capacityUtilization?.[locationName]?.utilizationRate || 0}%
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tutor Performance */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardHeader title="Tutor Performance" />
            <CardContent>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Tutor</TableCell>
                      <TableCell align="right">Active Classes</TableCell>
                      <TableCell align="right">Students</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dashboardData?.tutors?.classDistribution && 
                      Object.entries(dashboardData.tutors.classDistribution).map(([tutorName, classes]) => (
                        <TableRow key={tutorName}>
                          <TableCell>{tutorName}</TableCell>
                          <TableCell align="right">{classes}</TableCell>
                          <TableCell align="right">
                            {dashboardData.tutors.studentDistribution?.[tutorName] || 0}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 