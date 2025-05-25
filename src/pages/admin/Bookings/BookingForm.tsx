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
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, parseISO } from 'date-fns';

// Mock data - replace with actual API calls later
const mockBooking = {
  id: '1',
  classId: '1',
  className: 'Hatha Yoga',
  tutorId: '1',
  tutorName: 'Sarah Johnson',
  locationId: '1',
  locationName: 'Downtown Studio',
  date: '2024-03-20',
  startTime: '09:00',
  endTime: '10:00',
  capacity: 20,
  bookedSeats: 15,
  status: 'confirmed',
  price: 25.00,
};

const mockClasses = [
  { id: '1', name: 'Hatha Yoga', duration: 60, price: 25.00 },
  { id: '2', name: 'Meditation', duration: 45, price: 20.00 },
  { id: '3', name: 'Healing Therapy', duration: 90, price: 50.00 },
];

const mockTutors = [
  { id: '1', name: 'Sarah Johnson', specialties: ['Hatha Yoga', 'Meditation'] },
  { id: '2', name: 'Michael Chen', specialties: ['Vinyasa Yoga', 'Pilates'] },
  { id: '3', name: 'Emma Williams', specialties: ['Healing Therapy', 'Reiki'] },
];

const mockLocations = [
  { id: '1', name: 'Downtown Studio', address: '123 Main St' },
  { id: '2', name: 'Westside Center', address: '456 West Ave' },
  { id: '3', name: 'Eastside Hub', address: '789 East Blvd' },
];

const BookingForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    classId: '',
    className: '',
    tutorId: '',
    tutorName: '',
    locationId: '',
    locationName: '',
    date: new Date(),
    startTime: new Date(),
    endTime: new Date(),
    capacity: 20,
    bookedSeats: 0,
    status: 'pending',
    price: 0,
  });

  useEffect(() => {
    if (isEditMode) {
      // TODO: Replace with actual API call
      const booking = mockBooking;
      setFormData({
        ...booking,
        date: parseISO(booking.date),
        startTime: parseISO(`2000-01-01T${booking.startTime}`),
        endTime: parseISO(`2000-01-01T${booking.endTime}`),
      });
    }
  }, [isEditMode]);

  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'capacity' || name === 'bookedSeats' || name === 'price'
        ? Number(value)
        : value,
    }));
  };

  const handleSelectChange = (event: SelectChangeEvent) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClassChange = (event: any, newValue: typeof mockClasses[0] | null) => {
    if (newValue) {
      setFormData((prev) => ({
        ...prev,
        classId: newValue.id,
        className: newValue.name,
        price: newValue.price,
      }));
    }
  };

  const handleTutorChange = (event: any, newValue: typeof mockTutors[0] | null) => {
    if (newValue) {
      setFormData((prev) => ({
        ...prev,
        tutorId: newValue.id,
        tutorName: newValue.name,
      }));
    }
  };

  const handleLocationChange = (event: any, newValue: typeof mockLocations[0] | null) => {
    if (newValue) {
      setFormData((prev) => ({
        ...prev,
        locationId: newValue.id,
        locationName: newValue.name,
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

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // TODO: Implement save functionality
    console.log('Saving booking:', formData);
    navigate('/admin/bookings');
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {isEditMode ? 'Edit Booking' : 'Add New Booking'}
      </Typography>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Autocomplete
                options={mockClasses}
                getOptionLabel={(option) => option.name}
                value={mockClasses.find(c => c.id === formData.classId) || null}
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

            <Grid item xs={12}>
              <Autocomplete
                options={mockTutors}
                getOptionLabel={(option) => option.name}
                value={mockTutors.find(t => t.id === formData.tutorId) || null}
                onChange={handleTutorChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Tutor"
                    required
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Autocomplete
                options={mockLocations}
                getOptionLabel={(option) => option.name}
                value={mockLocations.find(l => l.id === formData.locationId) || null}
                onChange={handleLocationChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Location"
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

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Capacity"
                name="capacity"
                type="number"
                value={formData.capacity}
                onChange={handleTextChange}
                required
                inputProps={{ min: 1 }}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Booked Seats"
                name="bookedSeats"
                type="number"
                value={formData.bookedSeats}
                onChange={handleTextChange}
                required
                inputProps={{ min: 0, max: formData.capacity }}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
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
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                >
                  {isEditMode ? 'Save Changes' : 'Create Booking'}
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