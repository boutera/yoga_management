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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, parseISO } from 'date-fns';
import { bookingAPI, classAPI, tutorAPI, userAPI } from '../../../services/api';

interface Class {
  _id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  capacity: number;
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
  firstName: string;
  lastName: string;
}

interface NewUser {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
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
  const [newUserDialogOpen, setNewUserDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState<NewUser>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
  });

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

      // Fetch users
      const usersResponse = await userAPI.getAll();
      if (usersResponse.success) {
        setUsers(usersResponse.data);
      } else {
        throw new Error(usersResponse.message || 'Failed to fetch users');
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
    } else if (event.target.value) {
      // If user enters a new email, open the new user dialog
      setNewUser(prev => ({ ...prev, email: event.target.value }));
      setNewUserDialogOpen(true);
    }
  };

  const handleNewUserChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setNewUser(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateNewUser = async () => {
    try {
      const response = await userAPI.create({
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        phoneNumber: newUser.phoneNumber,
      });
      if (response.success) {
        setUsers(prev => [...prev, response.data]);
        setFormData(prev => ({
          ...prev,
          user: response.data._id,
        }));
        setNewUserDialogOpen(false);
        setNewUser({
          firstName: '',
          lastName: '',
          email: '',
          phoneNumber: '',
        });
      } else {
        setError('Failed to create new user');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to create new user');
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
        bookingDate: formData.date,
        paymentAmount: formData.price,
        paymentMethod: 'cash', // Default payment method
        status: formData.status,
      };

      let response;
      if (isEditMode && id) {
        response = await bookingAPI.update(id, bookingData);
      } else {
        response = await bookingAPI.create(bookingData);
      }

      if (response.success) {
        navigate('/admin/bookings');
      } else {
        setError(response.message || 'Failed to save booking');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to save booking');
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
      <Typography variant="h4" sx={{ mb: 3 }}>
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
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Autocomplete
                  options={users}
                  getOptionLabel={(option) => `${option.firstName} ${option.lastName} (${option.email})`}
                  value={users.find(u => u._id === formData.user) || null}
                  onChange={(event, newValue) => {
                    if (newValue) {
                      setFormData(prev => ({
                        ...prev,
                        user: newValue._id,
                      }));
                    }
                  }}
                  sx={{ flex: 1 }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="User"
                      required
                    />
                  )}
                />
                <Button
                  variant="outlined"
                  onClick={() => {
                    setNewUser({ firstName: '', lastName: '', email: '', phoneNumber: '' });
                    setNewUserDialogOpen(true);
                  }}
                >
                  New User
                </Button>
              </Box>
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
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
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
                  disabled={submitting}
                >
                  {submitting ? <CircularProgress size={24} /> : 'Save'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <Dialog open={newUserDialogOpen} onClose={() => setNewUserDialogOpen(false)}>
        <DialogTitle>Create New User</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                name="firstName"
                value={newUser.firstName}
                onChange={handleNewUserChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                name="lastName"
                value={newUser.lastName}
                onChange={handleNewUserChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={newUser.email}
                onChange={handleNewUserChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                name="phoneNumber"
                value={newUser.phoneNumber}
                onChange={handleNewUserChange}
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewUserDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateNewUser} variant="contained">
            Create User
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BookingForm; 