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
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AttachMoneyIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Revenue</Typography>
              </Box>
              <Typography variant="h4" gutterBottom>
                ${revenueData?.totalRevenue?.toLocaleString() || 0}
              </Typography>
              <Typography variant="body2" color="success.main">
                Revenue by class type
              </Typography>
            </CardContent>
          </Card>
        </Grid>
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
                {attendanceData?.attendance?.present || 0}% attendance rate
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
                Total classes across all tutors
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Revenue by Class */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="Revenue by Class"
              action={
                <IconButton>
                  <MoreVertIcon />
                </IconButton>
              }
            />
            <CardContent>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Class</TableCell>
                      <TableCell align="right">Bookings</TableCell>
                      <TableCell align="right">Revenue</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {revenueData?.byClass && Object.entries(revenueData.byClass).map(([className, revenue]) => (
                      <TableRow key={className}>
                        <TableCell>{className}</TableCell>
                        <TableCell align="right">
                          {bookingData?.byClass?.[className] || 0}
                        </TableCell>
                        <TableCell align="right">
                          ${Number(revenue).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Tutor Performance */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="Tutor Performance"
              action={
                <IconButton>
                  <MoreVertIcon />
                </IconButton>
              }
            />
            <CardContent>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Tutor</TableCell>
                      <TableCell align="right">Active Classes</TableCell>
                      <TableCell align="right">Students</TableCell>
                      <TableCell align="right">Rating</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tutorData?.classDistribution && Object.entries(tutorData.classDistribution).map(([tutor, classes]) => (
                      <TableRow key={tutor}>
                        <TableCell component="th" scope="row">
                          {tutor}
                        </TableCell>
                        <TableCell align="right">{classes}</TableCell>
                        <TableCell align="right">
                          {tutorData?.studentDistribution?.[tutor] || 0}
                        </TableCell>
                        <TableCell align="right">
                          {tutorData?.ratingDistribution?.[tutor]?.toFixed(1) || 'N/A'}
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

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Revenue by Location */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Revenue by Location" />
            <CardContent>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={locationData?.classDistribution ? Object.entries(locationData.classDistribution).map(([name]) => ({
                      name,
                      revenue: locationData?.revenueDistribution?.[name] || 0
                    })) : []}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
                    <Bar dataKey="revenue" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Bookings by Location */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Bookings by Location" />
            <CardContent>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={locationData?.classDistribution ? Object.entries(locationData.classDistribution).map(([name]) => ({
                      name,
                      bookings: locationData?.bookingDistribution?.[name] || 0
                    })) : []}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="bookings" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Class Distribution */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Class Distribution" />
            <CardContent>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={locationData?.classDistribution ? Object.entries(locationData.classDistribution).map(([name, value]) => ({
                        name,
                        value
                      })) : []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {Object.entries(locationData?.classDistribution || {}).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Utilization Rate */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Location Utilization" />
            <CardContent>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={locationData?.classDistribution ? Object.entries(locationData.classDistribution).map(([name]) => ({
                      name,
                      utilization: locationData?.capacityUtilization?.[name]?.utilizationRate || 0
                    })) : []}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip formatter={(value) => [`${value}%`, 'Utilization']} />
                    <Bar dataKey="utilization" fill="#ffc658" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Location Performance */}
      <Card sx={{ mt: 4 }}>
        <CardHeader
          title="Location Performance"
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
                  <TableCell align="right">Total Revenue</TableCell>
                  <TableCell align="right">Total Bookings</TableCell>
                  <TableCell align="right">Active Classes</TableCell>
                  <TableCell align="right">Utilization Rate</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {locationData?.classDistribution && Object.entries(locationData.classDistribution).map(([locationName, classes]) => (
                  <TableRow key={locationName}>
                    <TableCell component="th" scope="row">
                      {locationName}
                    </TableCell>
                    <TableCell align="right">
                      ${locationData?.revenueDistribution?.[locationName]?.toLocaleString() || 0}
                    </TableCell>
                    <TableCell align="right">
                      {locationData?.bookingDistribution?.[locationName] || 0}
                    </TableCell>
                    <TableCell align="right">
                      {classes}
                    </TableCell>
                    <TableCell align="right">
                      {locationData?.capacityUtilization?.[locationName]?.utilizationRate || 0}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Reports; 