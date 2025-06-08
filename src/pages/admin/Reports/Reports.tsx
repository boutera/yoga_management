import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  AttachMoney as AttachMoneyIcon,
} from '@mui/icons-material';
import { format, subMonths, startOfMonth, subDays, subYears } from 'date-fns';
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
import { reportAPI } from '../../../services/api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

interface TutorReport {
  totalTutors: number;
  byStatus: Record<string, number>;
  bySpecialty: Record<string, number>;
  classDistribution: Record<string, number>;
  ratingDistribution: Record<string, number>;
  studentDistribution: Record<string, number>;
}

const Reports = () => {
  const [timeRange, setTimeRange] = useState('month');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revenueData, setRevenueData] = useState<any>(null);
  const [bookingData, setBookingData] = useState<any>(null);
  const [attendanceData, setAttendanceData] = useState<any>(null);
  const [tutorData, setTutorData] = useState<TutorReport | null>(null);
  const [locationData, setLocationData] = useState<any>(null);

  const getDateRange = () => {
    const now = new Date();
    let startDate: Date;
    let endDate = now;

    switch (timeRange) {
      case 'week':
        startDate = subDays(now, 7);
        return { startDate, endDate, label: 'Last 7 days' };
      case 'month':
        startDate = subMonths(now, 1);
        return { startDate, endDate, label: format(startDate, 'MMM yyyy') };
      case 'quarter':
        startDate = subMonths(now, 3);
        return { startDate, endDate, label: 'Last 3 months' };
      case 'year':
        startDate = subYears(now, 1);
        return { startDate, endDate, label: 'Last 12 months' };
      default:
        startDate = subMonths(now, 1);
        return { startDate, endDate, label: 'Last 30 days' };
    }
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const { startDate, endDate } = getDateRange();

      const [revenue, bookings, attendance, tutors, locations] = await Promise.all([
        reportAPI.getRevenueReport(format(startDate, 'yyyy-MM-dd'), format(endDate, 'yyyy-MM-dd')),
        reportAPI.getBookingReport(format(startDate, 'yyyy-MM-dd'), format(endDate, 'yyyy-MM-dd')),
        reportAPI.getAttendanceReport(format(startDate, 'yyyy-MM-dd'), format(endDate, 'yyyy-MM-dd')),
        reportAPI.getTutorReport(format(startDate, 'yyyy-MM-dd'), format(endDate, 'yyyy-MM-dd')),
        reportAPI.getLocationReport(format(startDate, 'yyyy-MM-dd'), format(endDate, 'yyyy-MM-dd')),
      ]);

      setRevenueData(revenue);
      setBookingData(bookings);
      setAttendanceData(attendance);
      setTutorData(tutors);
      setLocationData(locations);
    } catch (err) {
      setError('Failed to fetch reports. Please try again later.');
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [timeRange, selectedLocation]);

  const handleTimeRangeChange = (event: SelectChangeEvent) => {
    setTimeRange(event.target.value);
  };

  const handleLocationChange = (event: SelectChangeEvent) => {
    setSelectedLocation(event.target.value);
  };

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
        <Typography variant="h4">Reports & Analytics</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              onChange={handleTimeRangeChange}
              label="Time Range"
            >
              <MenuItem value="week">Last 7 days</MenuItem>
              <MenuItem value="month">Last 30 days</MenuItem>
              <MenuItem value="quarter">Last 3 months</MenuItem>
              <MenuItem value="year">Last 12 months</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Location</InputLabel>
            <Select
              value={selectedLocation}
              label="Location"
              onChange={handleLocationChange}
            >
              <MenuItem value="all">All Locations</MenuItem>
              {locationData?.byCity && Object.keys(locationData.byCity).map((city) => (
                <MenuItem key={city} value={city}>
                  {city}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Showing data for {getDateRange().label}
      </Typography>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PeopleIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Bookings</Typography>
              </Box>
              <Typography variant="h4" gutterBottom>
                {bookingData?.totalBookings || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {bookingData?.userStats?.newUsers || 0} new users
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUpIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Active Classes</Typography>
              </Box>
              <Typography variant="h4" gutterBottom>
                {tutorData?.classDistribution ? Object.values(tutorData.classDistribution).reduce((sum: number, count: number) => sum + count, 0) : 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {bookingData?.byStatus?.confirmed || 0} confirmed bookings
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PeopleIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Users</Typography>
              </Box>
              <Typography variant="h4" gutterBottom>
                {bookingData?.userStats?.totalUsers || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Location Statistics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Location Performance" />
            <CardContent>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={locationData?.classDistribution ? Object.entries(locationData.classDistribution).map(([name]) => ({
                      name,
                      bookings: locationData?.bookingDistribution?.[name] || 0,
                      classes: locationData?.classDistribution?.[name] || 0
                    })) : []}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="bookings" name="Total Bookings" fill="#82ca9d" />
                    <Bar yAxisId="right" dataKey="classes" name="Active Classes" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="User Booking Distribution" />
            <CardContent>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={Object.entries(bookingData?.byUser || {}).map(([name, count]) => ({
                      name,
                      count
                    })).sort((a, b) => (b.count as number) - (a.count as number))}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#8884d8" name="Number of Bookings" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Location Performance Table */}
      <Card sx={{ mt: 4 }}>
        <CardHeader
          title="Location Details"
          action={
            <IconButton>
              <MoreVertIcon />
            </IconButton>
          }
        />
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Location</TableCell>
                  <TableCell align="right">Total Bookings</TableCell>
                  <TableCell align="right">Active Classes</TableCell>
                  <TableCell align="right">Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {locationData?.classDistribution && Object.entries(locationData.classDistribution).map(([locationName, classes]) => (
                  <TableRow key={locationName}>
                    <TableCell component="th" scope="row">
                      {locationName}
                    </TableCell>
                    <TableCell align="right">
                      {locationData?.bookingDistribution?.[locationName] || 0}
                    </TableCell>
                    <TableCell align="right">
                      {classes as number}
                    </TableCell>
                    <TableCell align="right">
                      {locationData?.byStatus?.[locationName] || 'active'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Class Distribution Chart */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Booking Distribution by Tutor
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={Object.entries(tutorData?.studentDistribution || {}).map(([name, count]) => ({
                name,
                count
              }))}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" name="Bookings" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      {/* Tutor Performance Chart */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Tutor Distribution by Class
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={Object.entries(tutorData?.classDistribution || {}).map(([name, count]) => ({
                name,
                count
              }))}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#82ca9d" name="Classes" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      {/* Daily Booking Trends */}
      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Daily Booking Trends
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={Object.entries(bookingData?.dailyBookings || {}).map(([date, count]) => ({
                date,
                count
              }))}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#8884d8" name="Bookings" />
            </LineChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      {/* Booking Status Distribution */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Booking Status Distribution
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={Object.entries(bookingData?.byStatus || {}).map(([status, count]) => ({
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
                {Object.entries(bookingData?.byStatus || {}).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>
    </Box>
  );
};

export default Reports; 