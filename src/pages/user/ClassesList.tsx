import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Paper,
  Divider,
  Collapse,
  Stack,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  Group as GroupIcon,
  ArrowForward as ArrowForwardIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Event as EventIcon,
} from '@mui/icons-material';
import { classAPI, bookingAPI, notificationAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../contexts/NotificationContext';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  name: string;
}

interface Class {
  _id: string;
  name: string;
  description: string;
  category: string;
  level: string;
  capacity: number;
  bookedCount: number;
  price: number;
  duration: number;
  tutor: {
    name: string;
  };
  location: {
    name: string;
    address: string;
  };
  schedule: Array<{
    dayOfWeek: string;
    startTime: string;
    endTime: string;
  }>;
  status: string;
}

const ClassesList = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [showFilters, setShowFilters] = useState(false);
  const [userBookings, setUserBookings] = useState<Record<string, any>>({});
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    fetchClasses();
    if (user) {
      fetchUserBookings();
    }
  }, [user]);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await classAPI.getActiveClasses();
      setClasses(response || []);
    } catch (err) {
      console.error('Error fetching classes:', err);
      setError('Failed to fetch classes. Please try again later.');
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserBookings = async () => {
    try {
      const response = await bookingAPI.getUserBookings();
      if (response.success) {
        const bookingsMap = response.data.reduce((acc: Record<string, any>, booking: any) => {
          acc[booking.class._id] = booking;
          return acc;
        }, {});
        setUserBookings(bookingsMap);
      }
    } catch (err) {
      console.error('Error fetching user bookings:', err);
    }
  };

  const handleBookClass = (classItem: Class) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setSelectedClass(classItem);
    setShowBookingDialog(true);
    setBookingError(null);
    setBookingSuccess(null);
  };

  const handleConfirmBooking = async () => {
    if (!selectedClass || !user) {
      setBookingError('Please select a class and ensure you are logged in');
      return;
    }

    try {
      setBookingLoading(true);
      setBookingError(null);
      setBookingSuccess(null);

      const bookingData = {
        classId: selectedClass._id,
        bookingDate: new Date().toISOString()
      };

      console.log('Sending booking data:', bookingData);

      const response = await bookingAPI.create(bookingData);
      console.log('Booking response:', response);

      if (response && response.success) {
        // First update the UI state
        setBookingSuccess('Class booked successfully!');
        setShowBookingDialog(false);

        // Update the userBookings state immediately
        setUserBookings(prev => ({
          ...prev,
          [selectedClass._id]: response.data
        }));

        // Then refresh the data
        try {
          await fetchClasses();
        } catch (refreshError) {
          console.error('Error refreshing data:', refreshError);
          // Show a warning but don't treat it as an error since the booking was successful
          setBookingSuccess('Class booked successfully! (Some data may need to be refreshed)');
        }
      } else {
        throw new Error(response?.message || 'Failed to book class');
      }
    } catch (error: any) {
      console.error('Booking error:', error);
      setBookingError(error.message || 'Failed to book class. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleCancelBooking = async (classId: string) => {
    try {
      const booking = userBookings[classId];
      if (!booking) return;

      let response;
      if (booking.status === 'pending') {
        // For pending bookings, delete them
        response = await bookingAPI.delete(booking._id);
      } else {
        // For confirmed bookings, update status to cancelled
        response = await bookingAPI.updateStatus(booking._id, 'cancelled');
      }

      if (response.success) {
        setUserBookings(prev => {
          const newBookings = { ...prev };
          delete newBookings[classId];
          return newBookings;
        });
        
        await fetchClasses();
      }
    } catch (err) {
      console.error('Error cancelling booking:', err);
    }
  };

  // Helper function to normalize level values
  const normalizeLevel = (level: string) => {
    if (!level) return '';
    const normalized = level.toLowerCase().trim();
    if (normalized === 'all-levels' || normalized === 'all levels' || normalized === 'all') {
      return 'all levels';
    }
    return normalized;
  };

  // Extract unique values for filters
  const categories = Array.from(new Set(classes.map(cls => cls.category)));
  const levels = Array.from(new Set(classes.map(cls => normalizeLevel(cls.level))));
  const locations = Array.from(new Set(classes.map(cls => cls.location?.name)));
  const days = Array.from(new Set(classes.flatMap(cls => 
    cls.schedule?.map(s => s.dayOfWeek?.toLowerCase()) || []
  )));

  // Filter classes based on all criteria
  const filteredClasses = classes.filter(cls => {
    const matchesSearch = cls.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cls.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || cls.category === selectedCategory;
    const matchesLevel = !selectedLevel || normalizeLevel(cls.level) === normalizeLevel(selectedLevel);
    const matchesLocation = !selectedLocation || cls.location?.name === selectedLocation;
    const matchesDay = !selectedDay || cls.schedule?.some(s => s.dayOfWeek?.toLowerCase() === selectedDay.toLowerCase());
    const matchesTime = !selectedTime || cls.schedule?.some(s => s.startTime === selectedTime);
    const matchesPrice = cls.price >= priceRange[0] && cls.price <= priceRange[1];
    
    return matchesSearch && matchesCategory && matchesLevel && matchesLocation && 
           matchesDay && matchesTime && matchesPrice;
  });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h3" gutterBottom sx={{ fontWeight: 700, mb: 4 }}>
        Explore Our Classes
      </Typography>

      {/* Search and Filter Bar */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search classes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={showFilters ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                onClick={() => setShowFilters(!showFilters)}
                sx={{ flexGrow: 1 }}
              >
                Advanced Filters
              </Button>
            </Box>
          </Grid>
        </Grid>

        {/* Advanced Filters */}
        <Collapse in={showFilters}>
          <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={selectedCategory}
                    label="Category"
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <MenuItem value="">All Categories</MenuItem>
                    {categories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Level</InputLabel>
                  <Select
                    value={selectedLevel}
                    label="Level"
                    onChange={(e) => setSelectedLevel(e.target.value)}
                  >
                    <MenuItem value="">All Levels</MenuItem>
                    {levels.map((level) => (
                      <MenuItem key={level} value={level}>
                        {level}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Location</InputLabel>
                  <Select
                    value={selectedLocation}
                    label="Location"
                    onChange={(e) => setSelectedLocation(e.target.value)}
                  >
                    <MenuItem value="">All Locations</MenuItem>
                    {locations.map((location) => (
                      <MenuItem key={location} value={location}>
                        {location}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Day</InputLabel>
                  <Select
                    value={selectedDay}
                    label="Day"
                    onChange={(e) => setSelectedDay(e.target.value)}
                  >
                    <MenuItem value="">All Days</MenuItem>
                    {days.map((day) => (
                      <MenuItem key={day} value={day}>
                        {day}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </Collapse>
      </Paper>

      {/* Classes Grid */}
      <Grid container spacing={3}>
        {filteredClasses.map((cls) => (
          <Grid item xs={12} sm={6} md={4} key={cls._id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                },
              }}
            >
              <CardMedia
                component="img"
                height="240"
                image={`/images/classes/${cls.category?.toLowerCase() || 'default'}.jpg`}
                alt={cls.name}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h5" gutterBottom>
                  {cls.name}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  {cls.description}
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Chip
                    label={cls.category}
                    size="small"
                    sx={{ mr: 1, mb: 1 }}
                  />
                  <Chip
                    label={cls.level}
                    size="small"
                    sx={{ mr: 1, mb: 1 }}
                  />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <PersonIcon sx={{ mr: 1, fontSize: 20 }} />
                  <Typography variant="body2">{cls.tutor?.name || 'Unknown Tutor'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationIcon sx={{ mr: 1, fontSize: 20 }} />
                  <Typography variant="body2">{cls.location?.name || 'Unknown Location'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <ScheduleIcon sx={{ mr: 1, fontSize: 20 }} />
                  <Typography variant="body2">
                    {cls.schedule?.[0]?.dayOfWeek} {cls.schedule?.[0]?.startTime} - {cls.schedule?.[0]?.endTime}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <GroupIcon sx={{ mr: 1, fontSize: 20 }} />
                  <Typography variant="body2">
                    {cls.bookedCount || 0}/{cls.capacity} spots filled
                  </Typography>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" color="primary">
                    £{cls.price}
                  </Typography>
                  {userBookings[cls._id] ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label={userBookings[cls._id].status.toUpperCase()}
                        color={
                          userBookings[cls._id].status === 'confirmed' ? 'success' :
                          userBookings[cls._id].status === 'pending' ? 'warning' :
                          'error'
                        }
                        size="small"
                      />
                      {userBookings[cls._id].status === 'pending' && (
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => handleCancelBooking(cls._id)}
                        >
                          Cancel
                        </Button>
                      )}
                    </Box>
                  ) : (
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={() => handleBookClass(cls)}
                      disabled={(cls.bookedCount || 0) >= cls.capacity}
                      endIcon={<ArrowForwardIcon />}
                    >
                      {(cls.bookedCount || 0) >= cls.capacity ? 'Full' : 'Book Now'}
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Booking Dialog */}
      <Dialog
        open={showBookingDialog}
        onClose={() => setShowBookingDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: 'primary.main', 
          color: 'white',
          py: 2,
          px: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <EventIcon />
          Book Your Class
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {selectedClass && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                {selectedClass.name}
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                {selectedClass.description}
              </Typography>
              
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 2,
                mt: 3,
                mb: 2
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon color="primary" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Instructor</Typography>
                    <Typography variant="body1">{selectedClass.tutor?.name || 'Unknown Tutor'}</Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationIcon color="primary" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Location</Typography>
                    <Typography variant="body1">{selectedClass.location?.name || 'Unknown Location'}</Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ScheduleIcon color="primary" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Schedule</Typography>
                    <Typography variant="body1">
                      {selectedClass.schedule?.[0]?.dayOfWeek} {selectedClass.schedule?.[0]?.startTime} - {selectedClass.schedule?.[0]?.endTime}
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <GroupIcon color="primary" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Availability</Typography>
                    <Typography variant="body1">
                      {selectedClass.bookedCount || 0}/{selectedClass.capacity} spots filled
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                bgcolor: 'grey.50',
                p: 2,
                borderRadius: 1
              }}>
                <Typography variant="h6" color="primary.main">
                  Total Price
                </Typography>
                <Typography variant="h5" color="primary.main" sx={{ fontWeight: 600 }}>
                  £{selectedClass.price}
                </Typography>
              </Box>

              {bookingError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {bookingError}
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button 
            onClick={() => setShowBookingDialog(false)}
            variant="outlined"
            sx={{ 
              borderRadius: '20px',
              px: 3,
              textTransform: 'none',
              '&:hover': {
                borderColor: 'primary.main',
                backgroundColor: 'rgba(25, 118, 210, 0.04)',
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmBooking} 
            variant="contained" 
            color="primary"
            disabled={!selectedClass || bookingLoading}
            sx={{ 
              borderRadius: '20px',
              px: 3,
              textTransform: 'none',
              '&:hover': {
                backgroundColor: 'primary.dark',
              }
            }}
          >
            {bookingLoading ? 'Confirming...' : 'Confirm Booking'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ClassesList; 