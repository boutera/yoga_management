import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Paper,
  Divider,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  Group as GroupIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { classAPI, bookingAPI } from '../../services/api';
import { SelectChangeEvent } from '@mui/material/Select';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

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
  userBooking?: {
    _id: string;
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  };
}

const Home = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [userBookings, setUserBookings] = useState<Record<string, any>>({});
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchFilters, setSearchFilters] = useState({
    classId: ''
  });

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

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleFilterChange = (event: SelectChangeEvent<string>, type: string) => {
    switch (type) {
      case 'category':
        setSelectedCategory(event.target.value);
        break;
      case 'level':
        setSelectedLevel(event.target.value);
        break;
      case 'location':
        setSelectedLocation(event.target.value);
        break;
    }
  };

  const handleSearchFilters = (
    event: SelectChangeEvent<string>
  ) => {
    const { name, value } = event.target;
    setSearchFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const searchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await bookingAPI.getAll();
      if (response.success) {
        // Filter the classes based on search criteria
        const filteredClasses = response.data.filter((cls: Class) => {
          const matchesClass = !searchFilters.classId || cls._id === searchFilters.classId;
          return matchesClass;
        });
        setClasses(filteredClasses);
      } else {
        setError('Failed to fetch bookings');
      }
    } catch (err) {
      console.error('Error searching bookings:', err);
      setError('An error occurred while searching bookings');
    } finally {
      setLoading(false);
    }
  };

  const filteredClasses = (classes || []).filter(cls => {
    if (!cls) return false;
    const matchesSearch = cls.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cls.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || cls.category === selectedCategory;
    const matchesLevel = !selectedLevel || cls.level === selectedLevel;
    const matchesLocation = !selectedLocation || cls.location?.name === selectedLocation;
    return matchesSearch && matchesCategory && matchesLevel && matchesLocation;
  });

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

      // Simplified booking data with default values
      const bookingData = {
        class: selectedClass._id,
        user: user._id,
        bookingDate: new Date().toISOString(),
        paymentAmount: selectedClass.price || 0,
        paymentMethod: 'cash',
        status: 'pending',
        paymentStatus: 'pending',
        attendanceStatus: 'not_checked'
      };

      console.log('Sending booking data:', bookingData);

      const response = await bookingAPI.create(bookingData);
      console.log('Booking response:', response);

      setBookingSuccess('Class booked successfully!');
      setShowBookingDialog(false);
      
      // Refresh both classes and user bookings data
      await Promise.all([
        fetchClasses(),
        fetchUserBookings()
      ]);

    } catch (error: any) {
      console.error('Booking error:', error);
      setBookingError('Failed to book class. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleCancelBooking = async (classId: string) => {
    try {
      const booking = userBookings[classId];
      if (!booking) return;

      const response = await bookingAPI.updateStatus(booking._id, 'cancelled');
      if (response.success) {
        // Remove the booking from userBookings to show the Book Now button
        setUserBookings(prev => {
          const newBookings = { ...prev };
          delete newBookings[classId];
          return newBookings;
        });
        
        // Refresh classes to update the bookedCount
        await fetchClasses();
        setBookingSuccess('Booking cancelled successfully');
      } else {
        throw new Error(response.message || 'Failed to cancel booking');
      }
    } catch (err: any) {
      console.error('Error cancelling booking:', err);
      setBookingError(
        err.response?.data?.message || 
        err.response?.data?.error || 
        err.message ||
        'Failed to cancel booking. Please try again.'
      );
    }
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
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Hero Section */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 4, 
          mb: 4, 
          background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
          color: 'white',
          borderRadius: 2
        }}
      >
        <Typography variant="h3" component="h1" gutterBottom>
          Find Your Perfect Yoga Class
        </Typography>
        <Typography variant="h6" sx={{ mb: 3 }}>
          Discover classes that match your style and schedule
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search classes..."
              value={searchTerm}
              onChange={handleSearch}
              sx={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderRadius: 1
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Button
              variant="contained"
              startIcon={<FilterIcon />}
              onClick={() => setShowFilters(!showFilters)}
              fullWidth
              sx={{ 
                backgroundColor: 'white',
                color: '#2196F3',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                }
              }}
            >
              Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Filter Options */}
      {showFilters && (
        <Paper sx={{ p: 2, mb: 4 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={selectedCategory}
                  label="Category"
                  onChange={(e) => handleFilterChange(e, 'category')}
                >
                  <MenuItem value="">All Categories</MenuItem>
                  <MenuItem value="Hatha">Hatha</MenuItem>
                  <MenuItem value="Vinyasa">Vinyasa</MenuItem>
                  <MenuItem value="Ashtanga">Ashtanga</MenuItem>
                  <MenuItem value="Yin">Yin</MenuItem>
                  <MenuItem value="Restorative">Restorative</MenuItem>
                  <MenuItem value="Power">Power</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Level</InputLabel>
                <Select
                  value={selectedLevel}
                  label="Level"
                  onChange={(e) => handleFilterChange(e, 'level')}
                >
                  <MenuItem value="">All Levels</MenuItem>
                  <MenuItem value="Beginner">Beginner</MenuItem>
                  <MenuItem value="Intermediate">Intermediate</MenuItem>
                  <MenuItem value="Advanced">Advanced</MenuItem>
                  <MenuItem value="All Levels">All Levels</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Location</InputLabel>
                <Select
                  value={selectedLocation}
                  label="Location"
                  onChange={(e) => handleFilterChange(e, 'location')}
                >
                  <MenuItem value="">All Locations</MenuItem>
                  {Array.from(new Set(classes.map(cls => cls.location?.name).filter(Boolean))).map(location => (
                    <MenuItem key={location} value={location}>{location}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Success Message */}
      {bookingSuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {bookingSuccess}
        </Alert>
      )}

      {/* Classes Grid */}
      <Grid container spacing={3}>
        {filteredClasses.map((cls) => (
          <Grid item xs={12} sm={6} md={4} key={cls._id}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                }
              }}
            >
              <CardMedia
                component="img"
                height="200"
                image={`/images/classes/${cls.category?.toLowerCase() || 'default'}.jpg`}
                alt={cls.name}
                sx={{ objectFit: 'cover' }}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="h2">
                  {cls.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
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
                    ${cls.price}
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
                      color="primary"
                      onClick={() => handleBookClass(cls)}
                      disabled={(cls.bookedCount || 0) >= cls.capacity}
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
      >
        <DialogTitle>Book Class</DialogTitle>
        <DialogContent>
          {selectedClass && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6">{selectedClass.name}</Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {selectedClass.description}
              </Typography>
              <Typography variant="body2">
                <strong>Instructor:</strong> {selectedClass.tutor?.name || 'Unknown Tutor'}
              </Typography>
              <Typography variant="body2">
                <strong>Location:</strong> {selectedClass.location?.name || 'Unknown Location'}
              </Typography>
              <Typography variant="body2">
                <strong>Schedule:</strong> {selectedClass.schedule?.[0]?.dayOfWeek} {selectedClass.schedule?.[0]?.startTime} - {selectedClass.schedule?.[0]?.endTime}
              </Typography>
              <Typography variant="body2">
                <strong>Price:</strong> ${selectedClass.price}
              </Typography>

              {bookingError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {bookingError}
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowBookingDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleConfirmBooking} 
            variant="contained" 
            color="primary"
            disabled={!selectedClass}
          >
            Confirm Booking
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Home; 