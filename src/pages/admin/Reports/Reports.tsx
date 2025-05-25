import { useState } from 'react';
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
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  AttachMoney as AttachMoneyIcon,
} from '@mui/icons-material';
import { format, subMonths, startOfMonth, subDays } from 'date-fns';
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

// Mock data - replace with actual API calls later
const mockRevenueData = {
  totalRevenue: 12500,
  monthlyGrowth: 15.5,
  byClass: [
    { name: 'Hatha Yoga', revenue: 4500, bookings: 180 },
    { name: 'Meditation', revenue: 3200, bookings: 160 },
    { name: 'Healing Therapy', revenue: 4800, bookings: 96 },
  ],
};

const mockAttendanceData = {
  totalBookings: 436,
  averageAttendance: 78.5,
};

const mockTutorPerformance = [
  {
    id: '1',
    name: 'Sarah Johnson',
    classes: 45,
    students: 180,
    rating: 4.8,
    revenue: 4500,
  },
  {
    id: '2',
    name: 'Michael Chen',
    classes: 38,
    students: 152,
    rating: 4.7,
    revenue: 3800,
  },
  {
    id: '3',
    name: 'Emma Williams',
    classes: 32,
    students: 96,
    rating: 4.9,
    revenue: 4800,
  },
];

// New mock data for trends and time slots
const mockAttendanceTrend = Array.from({ length: 30 }, (_, i) => ({
  date: format(subDays(new Date(), 29 - i), 'MMM dd'),
  attendance: Math.floor(Math.random() * 30) + 50,
  bookings: Math.floor(Math.random() * 40) + 60,
}));

const mockPopularTimeSlots = [
  { time: '6:00 AM', bookings: 45 },
  { time: '8:00 AM', bookings: 78 },
  { time: '10:00 AM', bookings: 65 },
  { time: '12:00 PM', bookings: 42 },
  { time: '2:00 PM', bookings: 38 },
  { time: '4:00 PM', bookings: 85 },
  { time: '6:00 PM', bookings: 92 },
  { time: '8:00 PM', bookings: 68 },
];

const mockClassDistribution = [
  { name: 'Hatha Yoga', value: 35 },
  { name: 'Meditation', value: 25 },
  { name: 'Healing Therapy', value: 20 },
  { name: 'Vinyasa', value: 15 },
  { name: 'Yin Yoga', value: 5 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const Reports = () => {
  const [timeRange, setTimeRange] = useState('month');

  const handleTimeRangeChange = (event: SelectChangeEvent) => {
    setTimeRange(event.target.value);
  };

  const getDateRange = () => {
    const now = new Date();
    switch (timeRange) {
      case 'week':
        return 'Last 7 days';
      case 'month':
        return format(startOfMonth(subMonths(now, 1)), 'MMM yyyy');
      case 'quarter':
        return 'Last 3 months';
      case 'year':
        return 'Last 12 months';
      default:
        return 'Last 30 days';
    }
  };

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
        </Box>
      </Box>

      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Showing data for {getDateRange()}
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
                ${mockRevenueData.totalRevenue.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="success.main">
                +{mockRevenueData.monthlyGrowth}% from last month
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
                {mockAttendanceData.totalBookings}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {mockAttendanceData.averageAttendance}% average attendance
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
                115
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Currently active
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Attendance Trends Chart */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title="Attendance Trends"
              action={
                <IconButton>
                  <MoreVertIcon />
                </IconButton>
              }
            />
            <CardContent>
              <Box sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={mockAttendanceTrend}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="attendance"
                      stroke="#8884d8"
                      name="Attendance %"
                    />
                    <Line
                      type="monotone"
                      dataKey="bookings"
                      stroke="#82ca9d"
                      name="Bookings"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Popular Time Slots and Class Distribution */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="Popular Time Slots"
              action={
                <IconButton>
                  <MoreVertIcon />
                </IconButton>
              }
            />
            <CardContent>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={mockPopularTimeSlots}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="bookings" fill="#8884d8" name="Number of Bookings" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="Class Distribution"
              action={
                <IconButton>
                  <MoreVertIcon />
                </IconButton>
              }
            />
            <CardContent>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={mockClassDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {mockClassDistribution.map((entry, index) => (
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
      </Grid>

      {/* Revenue by Class and Tutor Performance */}
      <Grid container spacing={3}>
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
                    {mockRevenueData.byClass.map((row) => (
                      <TableRow key={row.name}>
                        <TableCell>{row.name}</TableCell>
                        <TableCell align="right">{row.bookings}</TableCell>
                        <TableCell align="right">${row.revenue}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

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
                      <TableCell align="right">Classes</TableCell>
                      <TableCell align="right">Students</TableCell>
                      <TableCell align="right">Rating</TableCell>
                      <TableCell align="right">Revenue</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mockTutorPerformance.map((tutor) => (
                      <TableRow key={tutor.id}>
                        <TableCell>{tutor.name}</TableCell>
                        <TableCell align="right">{tutor.classes}</TableCell>
                        <TableCell align="right">{tutor.students}</TableCell>
                        <TableCell align="right">{tutor.rating}</TableCell>
                        <TableCell align="right">${tutor.revenue}</TableCell>
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

export default Reports; 