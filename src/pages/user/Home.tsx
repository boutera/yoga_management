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
  Stack,
  Avatar,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  Group as GroupIcon,
  CalendarToday as CalendarIcon,
  Spa as SpaIcon,
  AccessTime as AccessTimeIcon,
  Star as StarIcon,
  ArrowForward as ArrowForwardIcon,
  Favorite as FavoriteIcon,
  EmojiEvents as EmojiEventsIcon,
  SelfImprovement as SelfImprovementIcon,
  NavigateNext as NavigateNextIcon,
  NavigateBefore as NavigateBeforeIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { classAPI, bookingAPI } from '../../services/api';
import { SelectChangeEvent } from '@mui/material/Select';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Link as RouterLink } from 'react-router-dom';

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

const staticFeaturedClasses = [
  {
    id: 1,
    title: 'Hatha Yoga',
    description: 'A traditional form of yoga that focuses on physical postures and breathing techniques.',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3',
    duration: '60 min',
    level: 'Beginner',
    price: '$25',
  },
  {
    id: 2,
    title: 'Vinyasa Flow',
    description: 'A dynamic style of yoga that links movement with breath in a flowing sequence.',
    image: 'https://images.unsplash.com/photo-1599902890901-1597fefb4076?ixlib=rb-4.0.3',
    duration: '75 min',
    level: 'Intermediate',
    price: '$30',
  },
  {
    id: 3,
    title: 'Yin Yoga',
    description: 'A slow-paced style of yoga that focuses on holding poses for longer periods.',
    image: 'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?ixlib=rb-4.0.3',
    duration: '90 min',
    level: 'All Levels',
    price: '$28',
  },
];

const testimonials = [
  {
    id: 1,
    name: 'Sarah Johnson',
    role: 'Regular Student',
    avatar: 'https://i.pravatar.cc/150?img=1',
    text: 'The classes here have transformed my life. The instructors are knowledgeable and supportive.',
    rating: 5,
  },
  {
    id: 2,
    name: 'Michael Chen',
    role: 'Yoga Enthusiast',
    avatar: 'https://i.pravatar.cc/150?img=2',
    text: 'I love the variety of classes offered. The studio has a peaceful atmosphere that makes practice enjoyable.',
    rating: 5,
  },
  {
    id: 3,
    name: 'Emma Davis',
    role: 'Beginner',
    avatar: 'https://i.pravatar.cc/150?img=3',
    text: 'As a beginner, I was nervous, but the instructors made me feel comfortable and supported.',
    rating: 5,
  },
];

const features = [
  {
    icon: <SpaIcon sx={{ fontSize: 40 }} />,
    title: 'Expert Instructors',
    description: 'Learn from certified yoga instructors with years of experience.',
  },
  {
    icon: <AccessTimeIcon sx={{ fontSize: 40 }} />,
    title: 'Flexible Schedule',
    description: 'Classes available throughout the day to fit your schedule.',
  },
  {
    icon: <GroupIcon sx={{ fontSize: 40 }} />,
    title: 'Small Class Sizes',
    description: 'Personal attention in intimate class settings.',
  },
  {
    icon: <LocationIcon sx={{ fontSize: 40 }} />,
    title: 'Prime Location',
    description: 'Conveniently located in the heart of the city.',
  },
];

const benefits = [
  {
    icon: <SelfImprovementIcon sx={{ fontSize: 40 }} />,
    title: 'Physical Wellness',
    description: 'Improve flexibility, strength, and overall physical health.',
  },
  {
    icon: <FavoriteIcon sx={{ fontSize: 40 }} />,
    title: 'Mental Clarity',
    description: 'Reduce stress and find inner peace through mindful practice.',
  },
  {
    icon: <EmojiEventsIcon sx={{ fontSize: 40 }} />,
    title: 'Personal Growth',
    description: 'Challenge yourself and achieve new milestones in your practice.',
  },
];

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
  const [currentSlide, setCurrentSlide] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchFilters, setSearchFilters] = useState({
    classId: ''
  });
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

  const handleSearchFilters = (event: SelectChangeEvent<string>) => {
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

  const itemsPerPage = isMobile ? 1 : 3;
  const totalSlides = Math.ceil(filteredClasses.length / itemsPerPage);

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
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
        setUserBookings(prev => {
          const newBookings = { ...prev };
          delete newBookings[classId];
          return newBookings;
        });
        
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

  // Choose which classes to show in featured section
  const featuredToShow = classes && classes.length > 0
    ? classes.slice(0, 3).map((cls) => ({
        id: cls._id,
        title: cls.name,
        description: cls.description,
        image: `/images/classes/${cls.category?.toLowerCase() || 'default'}.jpg`,
        duration: `${cls.duration || 60} min`,
        level: cls.level || 'All Levels',
        price: `£${cls.price || 0}`,
        tutor: cls.tutor?.name,
      }))
    : staticFeaturedClasses;

  const scrollToFeaturedClasses = () => {
    const featuredSection = document.getElementById('featured-classes');
    if (featuredSection) {
      featuredSection.scrollIntoView({ behavior: 'smooth' });
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
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          height: { xs: '70vh', md: '85vh' },
          display: 'flex',
          alignItems: 'center',
          backgroundImage: 'url(https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ maxWidth: 800, color: 'white' }}>
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '2.5rem', md: '4rem' },
                fontWeight: 700,
                mb: 2,
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
              }}
            >
              Find Your Inner Peace
            </Typography>
            <Typography
              variant="h5"
              sx={{ 
                mb: 4, 
                fontWeight: 400,
                textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
                opacity: 0.9,
              }}
            >
              Join our community and discover the transformative power of yoga
            </Typography>
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={2}
              sx={{ mb: 4 }}
            >
              <Button
                onClick={scrollToFeaturedClasses}
                variant="contained"
                color="secondary"
                size="large"
                endIcon={<ArrowForwardIcon />}
                sx={{
                  borderRadius: '30px',
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
                  },
                }}
              >
                Explore Classes
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: 8, bgcolor: 'grey.50' }}>
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            align="center"
            sx={{ mb: 6, fontWeight: 700 }}
          >
            Why Choose Us
          </Typography>
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    height: '100%',
                    textAlign: 'center',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                    },
                  }}
                >
                  <Box sx={{ color: 'secondary.main', mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography color="text.secondary">
                    {feature.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Benefits Section */}
      <Box sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            align="center"
            sx={{ mb: 6, fontWeight: 700 }}
          >
            Benefits of Yoga
          </Typography>
          <Grid container spacing={4}>
            {benefits.map((benefit, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    p: 4,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                    },
                  }}
                >
                  <Box sx={{ color: 'primary.main', mb: 2 }}>
                    {benefit.icon}
                  </Box>
                  <Typography variant="h5" gutterBottom align="center">
                    {benefit.title}
                  </Typography>
                  <Typography color="text.secondary" align="center">
                    {benefit.description}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Featured Classes Section with Carousel */}
      <Box id="featured-classes" sx={{ py: 8, bgcolor: 'grey.50' }}>
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            align="center"
            sx={{ mb: 6, fontWeight: 700 }}
          >
            Featured Classes
          </Typography>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : (
            <Box sx={{ position: 'relative' }}>
              {/* Navigation Buttons */}
              <IconButton
                onClick={handlePrevSlide}
                sx={{
                  position: 'absolute',
                  left: -20,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  bgcolor: 'white',
                  boxShadow: 2,
                  '&:hover': {
                    bgcolor: 'grey.100',
                  },
                  zIndex: 2,
                  display: { xs: 'none', md: 'flex' },
                }}
              >
                <NavigateBeforeIcon />
              </IconButton>
              <IconButton
                onClick={handleNextSlide}
                sx={{
                  position: 'absolute',
                  right: -20,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  bgcolor: 'white',
                  boxShadow: 2,
                  '&:hover': {
                    bgcolor: 'grey.100',
                  },
                  zIndex: 2,
                  display: { xs: 'none', md: 'flex' },
                }}
              >
                <NavigateNextIcon />
              </IconButton>

              {/* Carousel Container */}
              <Box
                sx={{
                  overflow: 'hidden',
                  position: 'relative',
                  px: { xs: 2, md: 0 },
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    transition: 'transform 0.5s ease',
                    transform: `translateX(-${currentSlide * 100}%)`,
                  }}
                >
                  {filteredClasses.map((cls) => (
                    <Box
                      key={cls._id}
                      sx={{
                        flex: `0 0 ${100 / itemsPerPage}%`,
                        px: 2,
                      }}
                    >
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
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* Carousel Indicators */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  mt: 4,
                  gap: 1,
                }}
              >
                {Array.from({ length: totalSlides }).map((_, index) => (
                  <Box
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: currentSlide === index ? 'primary.main' : 'grey.300',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        bgcolor: currentSlide === index ? 'primary.dark' : 'grey.400',
                      },
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Box sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            align="center"
            sx={{ mb: 6, fontWeight: 700 }}
          >
            What Our Students Say
          </Typography>
          <Grid container spacing={4}>
            {testimonials.map((testimonial) => (
              <Grid item xs={12} md={4} key={testimonial.id}>
                <Card
                  sx={{
                    height: '100%',
                    p: 4,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar
                      src={testimonial.avatar}
                      sx={{ width: 60, height: 60, mr: 2 }}
                    />
                    <Box>
                      <Typography variant="h6">
                        {testimonial.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {testimonial.role}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography
                    variant="body1"
                    sx={{ mb: 2, fontStyle: 'italic' }}
                  >
                    "{testimonial.text}"
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <StarIcon key={i} color="secondary" />
                    ))}
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Call to Action Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 8,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(45deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0) 100%)',
          },
        }}
      >
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <Typography
              variant="h3"
              sx={{ mb: 3, fontWeight: 700 }}
            >
              Start Your Yoga Journey Today
            </Typography>
            <Typography
              variant="h6"
              sx={{ mb: 4, fontWeight: 400, opacity: 0.9 }}
            >
              Join our community and experience the benefits of regular yoga practice
            </Typography>
            <Button
              component={RouterLink}
              to="/bookings"
              variant="contained"
              color="secondary"
              size="large"
              endIcon={<ArrowForwardIcon />}
              sx={{
                borderRadius: '30px',
                px: 6,
                py: 2,
                fontSize: '1.1rem',
                boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
                },
              }}
            >
              Book Your First Class
            </Button>
          </Box>
        </Container>
      </Box>

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
          <CalendarIcon />
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
    </Box>
  );
};

export default Home; 
