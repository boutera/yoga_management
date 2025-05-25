import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { locationAPI } from '../../../services/api.ts';

interface LocationFormData {
  name: string;
  address: string;
  capacity: number;
  contactPhone: string;
  contactEmail: string;
  status: 'active' | 'inactive';
}

const LocationForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<LocationFormData>({
    name: '',
    address: '',
    capacity: 0,
    contactPhone: '',
    contactEmail: '',
    status: 'active',
  });

  useEffect(() => {
    if (isEditMode && id) {
      fetchLocation(id);
    }
  }, [id, isEditMode]);

  const fetchLocation = async (locationId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await locationAPI.getById(locationId);
      console.log('Fetched location:', response);
      if (response.success) {
        setFormData(response.data);
      } else {
        setError('Failed to fetch location details');
      }
    } catch (err) {
      console.error('Error fetching location:', err);
      setError('Failed to fetch location details');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'capacity' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      
      if (isEditMode && id) {
        const response = await locationAPI.update(id, formData);
        if (!response.success) {
          setError(response.message || 'Failed to update location');
          return;
        }
      } else {
        const response = await locationAPI.create(formData);
        if (!response.success) {
          setError(response.message || 'Failed to create location');
          return;
        }
      }
      
      navigate('/admin/locations');
    } catch (err: any) {
      if (err.response?.data?.errors) {
        // Handle validation errors
        const errorMessages = err.response.data.errors.map((error: any) => error.msg).join(', ');
        setError(errorMessages);
      } else if (err.response?.data?.message) {
        // Handle other error messages
        setError(err.response.data.message);
      } else {
        setError('Failed to save location. Please try again.');
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
        {isEditMode ? 'Edit Location' : 'Add New Location'}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Location Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Capacity"
                  name="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={handleChange}
                  required
                  inputProps={{ min: 1 }}
                  disabled={loading}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Contact Phone"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Contact Email"
                  name="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/admin/locations')}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                  >
                    {isEditMode ? 'Save Changes' : 'Add Location'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LocationForm; 