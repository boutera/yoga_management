import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Autocomplete,
  CircularProgress,
  Alert,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, parseISO } from 'date-fns';
import { bookingAPI, classAPI, tutorAPI } from '../../../services/api.ts';

interface Class {
  _id: string;
  name: string;
  duration: number;
  price: number;
  tutor: {
    _id: string;
    name: string;
    email: string;
  };
  location: {
    _id: string;
    name: string;
    address: string;
  };
}

interface User {
  _id: string;
  name: string;
  email: string;
}

const BookingForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [classes, setClasses] = useState<Class[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [formData, setFormData] = useState({
    class: '',
    user: '',
    date: new Date(),
    startTime: new Date(),
    endTime: new Date(),
    status: 'pending',
    price: 0,
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch classes
      const classesResponse = await classAPI.getAll();
      if (classesResponse.success) {
        setClasses(classesResponse.data);
      } else {
        throw new Error(classesResponse.message || 'Failed to fetch classes');
      }

      // Fetch tutors
      const tutorsResponse = await tutorAPI.getAll();
      if (tutorsResponse.success) {
        setUsers(tutorsResponse.data);
      } else {
        throw new Error(tutorsResponse.message || 'Failed to fetch tutors');
      }

      // If editing, fetch booking data
      if (id) {
        const bookingResponse = await bookingAPI.getById(id);
        if (bookingResponse.success) {
          const bookingData = bookingResponse.data;
          setFormData({
            class: bookingData.class._id,
            user: bookingData.user._id,
            date: bookingData.date,
            startTime: bookingData.startTime,
            endTime: bookingData.endTime,
            status: bookingData.status,
            price: bookingData.paymentAmount,
          });
        } else {
          throw new Error(bookingResponse.message || 'Failed to fetch booking data');
        }
      }
    } catch (error: any) {
      console.error('Error fetching initial data:', error);
      setError(error.message || 'Failed to fetch initial data');
    } finally {
      setLoading(false);
    }
  };

  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'price' ? Number(value) : value,
    }));
  };

  const handleSelectChange = (event: SelectChangeEvent) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClassChange = (event: any, newValue: Class | null) => {
    if (newValue) {
      setFormData((prev) => ({
        ...prev,
        class: newValue._id,
        price: newValue.price,
      }));
    }
  };

  const handleUserChange = (event: any, newValue: User | null) => {
    if (newValue) {
      setFormData((prev) => ({
        ...prev,
        user: newValue._id,
      }));
    }
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setFormData((prev) => ({
        ...prev,
        date,
      }));
    }
  };

  const handleTimeChange = (field: 'startTime' | 'endTime') => (time: Date | null) => {
    if (time) {
      setFormData((prev) => ({
        ...prev,
        [field]: time,
      }));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      setSubmitting(true);
      setError(null);

      const bookingData = {
        class: formData.class,
        user: formData.user,
        bookingDate: format(formData.date, 'yyyy-MM-dd'),
        startTime: format(formData.startTime, 'HH:mm'),
        endTime: format(formData.endTime, 'HH:mm'),
        status: formData.status,
        paymentAmount: formData.price,
        paymentMethod: 'credit_card', // Default payment method
      };

      if (id) {
        await bookingAPI.update(id, bookingData);
      } else {
        await bookingAPI.create(bookingData);
      }

      navigate('/admin/bookings', { state: { refresh: true } });
    } catch (err) {
      setError('Failed to save booking');
      console.error('Error saving booking:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {isEditMode ? 'Edit Booking' : 'Add New Booking'}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Autocomplete
                options={classes}
                getOptionLabel={(option) => option.name}
                value={classes.find(c => c._id === formData.class) || null}
                onChange={handleClassChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Class"
                    required
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Autocomplete
                options={users}
                getOptionLabel={(option) => `${option.name} (${option.email})`}
                value={users.find(u => u._id === formData.user) || null}
                onChange={handleUserChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="User"
                    required
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Date"
                  value={formData.date}
                  onChange={handleDateChange}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                    },
                  }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleSelectChange}
                  label="Status"
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="confirmed">Confirmed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <TimePicker
                  label="Start Time"
                  value={formData.startTime}
                  onChange={handleTimeChange('startTime')}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                    },
                  }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <TimePicker
                  label="End Time"
                  value={formData.endTime}
                  onChange={handleTimeChange('endTime')}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                    },
                  }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleTextChange}
                required
                inputProps={{ min: 0, step: 0.01 }}
                InputProps={{
                  startAdornment: '$',
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/admin/bookings')}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={submitting}
                >
                  {submitting ? (
                    <CircularProgress size={24} />
                  ) : (
                    isEditMode ? 'Save Changes' : 'Create Booking'
                  )}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default BookingForm; 