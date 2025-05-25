import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';

// Mock data - replace with actual API calls later
const mockLocations = [
  {
    id: '1',
    name: 'Downtown Studio',
    address: '123 Main St, Downtown',
    capacity: 50,
    contactPhone: '(555) 123-4567',
    contactEmail: 'downtown@yogacenter.com',
  },
  {
    id: '2',
    name: 'Westside Center',
    address: '456 West Ave, Westside',
    capacity: 40,
    contactPhone: '(555) 234-5678',
    contactEmail: 'westside@yogacenter.com',
  },
  {
    id: '3',
    name: 'Eastside Hub',
    address: '789 East Blvd, Eastside',
    capacity: 35,
    contactPhone: '(555) 345-6789',
    contactEmail: 'eastside@yogacenter.com',
  },
];

const LocationForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    capacity: '',
    contactPhone: '',
    contactEmail: '',
  });

  useEffect(() => {
    if (isEditMode) {
      // In a real app, this would be an API call
      const location = mockLocations.find((loc) => loc.id === id);
      if (location) {
        setFormData({
          name: location.name,
          address: location.address,
          capacity: location.capacity.toString(),
          contactPhone: location.contactPhone,
          contactEmail: location.contactEmail,
        });
      }
    }
  }, [id, isEditMode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would be an API call
    console.log('Form submitted:', formData);
    navigate('/admin/locations');
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {isEditMode ? 'Edit Location' : 'Add New Location'}
      </Typography>

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
                />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/admin/locations')}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
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