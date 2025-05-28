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
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  Group as GroupIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { classAPI } from '../../services/api';
import { SelectChangeEvent } from '@mui/material/Select';

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

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await classAPI.getActiveClasses();
      setClasses(response || []); // Ensure we always set an array
    } catch (err) {
      console.error('Error fetching classes:', err);
      setError('Failed to fetch classes. Please try again later.');
      setClasses([]); // Set empty array on error
    } finally {
      setLoading(false);
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

  const filteredClasses = (classes || []).filter(cls => {
    if (!cls) return false; // Skip invalid class objects
    const matchesSearch = cls.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cls.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || cls.category === selectedCategory;
    const matchesLevel = !selectedLevel || cls.level === selectedLevel;
    const matchesLocation = !selectedLocation || cls.location?.name === selectedLocation;
    return matchesSearch && matchesCategory && matchesLevel && matchesLocation;
  });

  const handleBookClass = (cls: Class) => {
    setSelectedClass(cls);
    setShowBookingDialog(true);
  };

  const handleConfirmBooking = async () => {
    if (!selectedClass) return;

    try {
      // TODO: Implement booking logic
      console.log('Booking class:', selectedClass._id);
      setShowBookingDialog(false);
      setSelectedClass(null);
    } catch (err) {
      console.error('Error booking class:', err);
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
      {/* Search and Filter Section */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search classes..."
              value={searchTerm}
              onChange={handleSearch}
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
            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={() => setShowFilters(!showFilters)}
              fullWidth
            >
              Filters
            </Button>
          </Grid>
        </Grid>

        {/* Filter Options */}
        {showFilters && (
          <Grid container spacing={2} sx={{ mt: 2 }}>
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
        )}
      </Box>

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* No Classes State */}
      {!loading && !error && filteredClasses.length === 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          No classes found matching your criteria.
        </Alert>
      )}

      {/* Classes Grid */}
      <Grid container spacing={3}>
        {filteredClasses.map((cls) => (
          <Grid item xs={12} sm={6} md={4} key={cls._id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardMedia
                component="img"
                height="140"
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
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" color="primary">
                    ${cls.price}
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleBookClass(cls)}
                    disabled={(cls.bookedCount || 0) >= cls.capacity}
                  >
                    {(cls.bookedCount || 0) >= cls.capacity ? 'Full' : 'Book Now'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Booking Dialog */}
      <Dialog open={showBookingDialog} onClose={() => setShowBookingDialog(false)}>
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
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowBookingDialog(false)}>Cancel</Button>
          <Button onClick={handleConfirmBooking} variant="contained" color="primary">
            Confirm Booking
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Home; 