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
  Chip,
  OutlinedInput,
  SelectChangeEvent,
  Avatar,
  Alert,
  CircularProgress,
} from '@mui/material';
import { tutorAPI } from '../../../services/api.ts';

// Mock data - replace with actual API calls later
const mockTutor = {
  id: '1',
  firstName: 'Sarah',
  lastName: 'Johnson',
  email: 'sarah.johnson@example.com',
  phone: '+1 (555) 123-4567',
  specialties: ['Hatha Yoga', 'Meditation'],
  certifications: ['Yoga Certification', 'Meditation Training'],
  experience: 5,
  status: 'active',
  avatar: 'https://i.pravatar.cc/150?img=1',
};

const availableSpecialties = [
  'Hatha Yoga',
  'Vinyasa Yoga',
  'Meditation',
  'Pilates',
  'Healing Therapy',
  'Reiki',
  'Yin Yoga',
  'Power Yoga',
];

const availableCertifications = [
  'Yoga Certification',
  'Meditation Training',
  'Pilates Certification',
  'Healing Certification',
  'Reiki Certification',
  'Energy Work',
];

interface Certification {
  name: string;
  issuer: string;
  year: number;
}

const TutorForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialties: [] as string[],
    experience: 0,
    status: 'active',
    bio: '',
    certifications: [] as Certification[],
  });

  useEffect(() => {
    if (isEditMode && id) {
      fetchTutor(id);
    }
  }, [isEditMode, id]);

  const fetchTutor = async (tutorId: string) => {
    try {
      setLoading(true);
      const response = await tutorAPI.getById(tutorId);
      console.log('Fetched tutor data:', response);
      setFormData(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching tutor:', err);
      setError('Failed to fetch tutor details');
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
        [name]: name === 'experience' ? Number(value) : value,
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

  const handleMultiSelectChange = (event: SelectChangeEvent<string[]>, field: 'specialties' | 'certifications') => {
    const { value } = event.target;
    console.log('Multi-select change:', { field, value });
    setFormData((prev) => {
      if (field === 'specialties') {
        return {
          ...prev,
          specialties: typeof value === 'string' ? value.split(',') : value,
        };
      } else {
        // For certifications, create objects with the selected values
        const selectedCerts = typeof value === 'string' ? value.split(',') : value;
        const currentYear = new Date().getFullYear();
        return {
          ...prev,
          certifications: selectedCerts.map(cert => ({
            name: cert,
            issuer: 'Yoga Alliance', // Default issuer
            year: currentYear // Default to current year
          }))
        };
      }
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      setLoading(true);
      console.log('Submitting tutor data:', formData);
      
      if (isEditMode && id) {
        await tutorAPI.update(id, formData);
      } else {
        const response = await tutorAPI.create(formData);
        console.log('Create response:', response);
      }
      
      navigate('/admin/tutors');
    } catch (err: any) {
      console.error('Error saving tutor:', err);
      if (err.response?.data?.errors) {
        // Handle validation errors
        const errorMessages = err.response.data.errors.map((error: any) => error.msg).join(', ');
        setError(errorMessages);
      } else if (err.response?.data?.message) {
        // Handle other error messages
        setError(err.response.data.message);
      } else {
        setError('Failed to save tutor');
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
        {isEditMode ? 'Edit Tutor' : 'Add New Tutor'}
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
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleTextChange}
                required
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleTextChange}
                required
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleTextChange}
                required
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Years of Experience"
                name="experience"
                type="number"
                value={formData.experience}
                onChange={handleTextChange}
                required
                inputProps={{ min: 0 }}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Specialties</InputLabel>
                <Select
                  multiple
                  value={formData.specialties}
                  onChange={(e) => handleMultiSelectChange(e, 'specialties')}
                  input={<OutlinedInput label="Specialties" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} />
                      ))}
                    </Box>
                  )}
                  disabled={loading}
                >
                  {availableSpecialties.map((specialty) => (
                    <MenuItem key={specialty} value={specialty}>
                      {specialty}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Certifications</InputLabel>
                <Select
                  multiple
                  value={formData.certifications.map(cert => cert.name)}
                  onChange={(e) => handleMultiSelectChange(e, 'certifications')}
                  input={<OutlinedInput label="Certifications" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} color="primary" variant="outlined" />
                      ))}
                    </Box>
                  )}
                  disabled={loading}
                >
                  {availableCertifications.map((cert) => (
                    <MenuItem key={cert} value={cert}>
                      {cert}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Bio"
                name="bio"
                value={formData.bio}
                onChange={handleTextChange}
                multiline
                rows={4}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleSelectChange}
                  label="Status"
                  disabled={loading}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="on_leave">On Leave</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/admin/tutors')}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                >
                  {isEditMode ? 'Save Changes' : 'Create Tutor'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default TutorForm; 