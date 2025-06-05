import React, { useState, useEffect } from 'react';
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
  Chip,
  OutlinedInput,
  SelectChangeEvent,
  Alert,
  CircularProgress,
} from '@mui/material';
import { classAPI, tutorAPI, locationAPI } from '../../../services/api.ts';

interface Class {
  _id: string;
  name: string;
  description: string;
  tutor: string;
  location: string;
  capacity: number;
  price: number;
  duration: number;
  schedule: {
    dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
    startTime: string;
    endTime: string;
  }[];
  status: 'active' | 'inactive' | 'cancelled';
  category: 'Hatha' | 'Vinyasa' | 'Ashtanga' | 'Yin' | 'Restorative' | 'Power' | 'Other';
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
  maxAge?: number;
  minAge?: number;
}

const availableCategories = [
  'Hatha',
  'Vinyasa',
  'Ashtanga',
  'Yin',
  'Restorative',
  'Power',
  'Other'
];

const availableLevels = [
  'Beginner',
  'Intermediate',
  'Advanced',
  'All Levels'
];

const daysOfWeek = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

const ClassForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tutors, setTutors] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [formData, setFormData] = useState<Omit<Class, '_id'>>({
    name: '',
    description: '',
    tutor: '',
    location: '',
    capacity: 10,
    price: 0,
    duration: 60,
    schedule: [
      {
        dayOfWeek: 'Monday',
        startTime: '09:00',
        endTime: '10:00'
      }
    ],
    status: 'active',
    category: 'Hatha',
    level: 'Beginner',
    maxAge: undefined,
    minAge: undefined
  });

  useEffect(() => {
    if (isEditMode && id) {
      fetchClass(id);
    }
    fetchTutorsAndLocations();
  }, [isEditMode, id]);

  const fetchTutorsAndLocations = async () => {
    try {
      const [tutorsRes, locationsRes] = await Promise.all([
        tutorAPI.getAll(),
        locationAPI.getAll()
      ]);
      setTutors(tutorsRes.data);
      setLocations(locationsRes.data);
    } catch (err) {
      console.error('Error fetching tutors and locations:', err);
      setError('Failed to fetch tutors and locations');
    }
  };

  const fetchClass = async (classId: string) => {
    try {
      setLoading(true);
      const response = await classAPI.getById(classId);
      console.log('Fetched class data:', response.data);
      
      // Ensure we have the tutor and location IDs
      const classData = {
        ...response.data,
        tutor: response.data.tutor._id || response.data.tutor,
        location: response.data.location._id || response.data.location
      };
      
      console.log('Processed class data:', classData);
      setFormData(classData);
      setError(null);
    } catch (err) {
      setError('Failed to fetch class details');
      console.error('Error fetching class:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    console.log('Text change:', { name, value });
    setFormData((prev) => {
      const newData = {
        ...prev,
        [name]: name === 'duration' || name === 'capacity' || name === 'price'
          ? Number(value)
          : value,
      };
      console.log('Updated form data:', newData);
      return newData;
    });
  };

  const handleSelectChange = (event: SelectChangeEvent) => {
    const { name, value } = event.target;
    console.log('Select change:', { name, value });
    setFormData((prev) => {
      const newData = {
        ...prev,
        [name]: value,
      };
      console.log('Updated form data:', newData);
      return newData;
    });
  };

  const handleScheduleChange = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      schedule: prev.schedule.map((slot, i) => 
        i === index ? { ...slot, [field]: value } : slot
      )
    }));
  };

  const addScheduleSlot = () => {
    setFormData(prev => ({
      ...prev,
      schedule: [...prev.schedule, { dayOfWeek: 'Monday', startTime: '09:00', endTime: '10:00' }]
    }));
  };

  const removeScheduleSlot = (index: number) => {
    setFormData(prev => ({
      ...prev,
      schedule: prev.schedule.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      setLoading(true);
      console.log('Submitting form data:', formData);
      if (isEditMode && id) {
        await classAPI.update(id, formData);
      } else {
        const response = await classAPI.create(formData);
        console.log('Create response:', response);
      }
      navigate('/admin/classes');
    } catch (err: any) {
      console.error('Error saving class:', err);
      if (err.response?.data?.errors) {
        // Handle validation errors
        const errorMessages = err.response.data.errors.map((error: any) => error.msg).join(', ');
        setError(errorMessages);
      } else if (err.response?.data?.message) {
        // Handle other error messages
        setError(err.response.data.message);
      } else {
        setError('Failed to save class');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {isEditMode ? 'Edit Class' : 'Add New Class'}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Class Name"
                name="name"
                value={formData.name}
                onChange={handleTextChange}
                required
                disabled={loading}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleTextChange}
                multiline
                rows={4}
                required
                disabled={loading}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="tutor-label">Tutor</InputLabel>
                <Select
                  labelId="tutor-label"
                  name="tutor"
                  value={formData.tutor}
                  onChange={handleSelectChange}
                  required
                  disabled={loading}
                  label="Tutor"
                >
                  {tutors.map((tutor) => (
                    <MenuItem key={tutor._id} value={tutor._id}>
                      {tutor.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="location-label">Location</InputLabel>
                <Select
                  labelId="location-label"
                  name="location"
                  value={formData.location}
                  onChange={handleSelectChange}
                  required
                  disabled={loading}
                  label="Location"
                >
                  {locations.map((location) => (
                    <MenuItem key={location._id} value={location._id}>
                      {location.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Capacity"
                name="capacity"
                type="number"
                value={formData.capacity}
                onChange={handleTextChange}
                required
                inputProps={{ min: 1 }}
                disabled={loading}
                InputLabelProps={{ shrink: true }}
              />
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
                  startAdornment: '£',
                }}
                disabled={loading}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Duration (minutes)"
                name="duration"
                type="number"
                value={formData.duration}
                onChange={handleTextChange}
                required
                inputProps={{ min: 15, step: 15 }}
                disabled={loading}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="category-label">Category</InputLabel>
                <Select
                  labelId="category-label"
                  name="category"
                  value={formData.category}
                  onChange={handleSelectChange}
                  required
                  disabled={loading}
                  label="Category"
                >
                  {availableCategories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="level-label">Level</InputLabel>
                <Select
                  labelId="level-label"
                  name="level"
                  value={formData.level}
                  onChange={handleSelectChange}
                  required
                  disabled={loading}
                  label="Level"
                >
                  {availableLevels.map((level) => (
                    <MenuItem key={level} value={level}>
                      {level}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Schedule
              </Typography>
              {formData.schedule.map((slot, index) => (
                <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                  <Grid item xs={12} sm={3}>
                    <FormControl fullWidth>
                      <InputLabel id={`day-label-${index}`}>Day</InputLabel>
                      <Select
                        labelId={`day-label-${index}`}
                        value={slot.dayOfWeek}
                        onChange={(e) => handleScheduleChange(index, 'dayOfWeek', e.target.value)}
                        required
                        disabled={loading}
                        label="Day"
                      >
                        {daysOfWeek.map((day) => (
                          <MenuItem key={day} value={day}>
                            {day}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      fullWidth
                      label="Start Time"
                      type="time"
                      value={slot.startTime}
                      onChange={(e) => handleScheduleChange(index, 'startTime', e.target.value)}
                      required
                      disabled={loading}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      fullWidth
                      label="End Time"
                      type="time"
                      value={slot.endTime}
                      onChange={(e) => handleScheduleChange(index, 'endTime', e.target.value)}
                      required
                      disabled={loading}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => removeScheduleSlot(index)}
                      disabled={loading || formData.schedule.length === 1}
                      sx={{ height: '100%' }}
                    >
                      Remove
                    </Button>
                  </Grid>
                </Grid>
              ))}
              <Button
                variant="outlined"
                onClick={addScheduleSlot}
                disabled={loading}
                sx={{ mt: 1 }}
              >
                Add Time Slot
              </Button>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/admin/classes')}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                >
                  {isEditMode ? 'Save Changes' : 'Create Class'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default ClassForm; 