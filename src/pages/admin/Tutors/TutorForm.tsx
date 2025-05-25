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
} from '@mui/material';

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

const TutorForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialties: [] as string[],
    certifications: [] as string[],
    experience: 0,
    status: 'active',
    avatar: '',
  });

  useEffect(() => {
    if (isEditMode) {
      // TODO: Replace with actual API call
      setFormData(mockTutor);
    }
  }, [isEditMode]);

  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'experience' ? Number(value) : value,
    }));
  };

  const handleSelectChange = (event: SelectChangeEvent) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMultiSelectChange = (event: SelectChangeEvent<string[]>, field: 'specialties' | 'certifications') => {
    const { value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [field]: typeof value === 'string' ? value.split(',') : value,
    }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // TODO: Implement save functionality
    console.log('Saving tutor:', formData);
    navigate('/admin/tutors');
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {isEditMode ? 'Edit Tutor' : 'Add New Tutor'}
      </Typography>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <Avatar
                src={formData.avatar}
                alt={`${formData.firstName} ${formData.lastName}`}
                sx={{ width: 100, height: 100 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleTextChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleTextChange}
                required
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
                  value={formData.certifications}
                  onChange={(e) => handleMultiSelectChange(e, 'certifications')}
                  input={<OutlinedInput label="Certifications" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} color="primary" variant="outlined" />
                      ))}
                    </Box>
                  )}
                >
                  {availableCertifications.map((cert) => (
                    <MenuItem key={cert} value={cert}>
                      {cert}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
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
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/admin/tutors')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
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