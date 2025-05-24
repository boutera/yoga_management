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
} from '@mui/material';

// Mock data - replace with actual API calls later
const mockClass = {
  id: '1',
  name: 'Hatha Yoga',
  description: 'Traditional yoga practice focusing on physical postures and breathing techniques.',
  requiredSkills: ['Yoga Certification', 'Meditation Training'],
  duration: 60,
  maxCapacity: 20,
  price: 25.00,
  status: 'active',
};

const availableSkills = [
  'Yoga Certification',
  'Meditation Training',
  'Healing Certification',
  'Energy Work',
  'Reiki Certification',
  'Pilates Certification',
];

const ClassForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    requiredSkills: [] as string[],
    duration: 60,
    maxCapacity: 20,
    price: 0,
    status: 'active',
  });

  useEffect(() => {
    if (isEditMode) {
      // TODO: Replace with actual API call
      setFormData(mockClass);
    }
  }, [isEditMode]);

  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'duration' || name === 'maxCapacity' || name === 'price'
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

  const handleSkillsChange = (event: SelectChangeEvent<string[]>) => {
    const { value } = event.target;
    setFormData((prev) => ({
      ...prev,
      requiredSkills: typeof value === 'string' ? value.split(',') : value,
    }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // TODO: Implement save functionality
    console.log('Saving class:', formData);
    navigate('/admin/classes');
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {isEditMode ? 'Edit Class' : 'Add New Class'}
      </Typography>

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
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Required Skills</InputLabel>
                <Select
                  multiple
                  value={formData.requiredSkills}
                  onChange={handleSkillsChange}
                  input={<OutlinedInput label="Required Skills" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} />
                      ))}
                    </Box>
                  )}
                >
                  {availableSkills.map((skill) => (
                    <MenuItem key={skill} value={skill}>
                      {skill}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
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
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Maximum Capacity"
                name="maxCapacity"
                type="number"
                value={formData.maxCapacity}
                onChange={handleTextChange}
                required
                inputProps={{ min: 1 }}
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
                  startAdornment: '$',
                }}
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
                  onClick={() => navigate('/admin/classes')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
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