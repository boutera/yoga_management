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
import { classAPI } from '../../../services/api.ts';

interface Class {
  _id: string;
  name: string;
  description: string;
  requiredSkills: string[];
  duration: number;
  maxCapacity: number;
  price: number;
  status: 'active' | 'inactive';
}

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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Class, '_id'>>({
    name: '',
    description: '',
    requiredSkills: [],
    duration: 60,
    maxCapacity: 20,
    price: 0,
    status: 'active',
  });

  useEffect(() => {
    if (isEditMode && id) {
      fetchClass(id);
    }
  }, [isEditMode, id]);

  const fetchClass = async (classId: string) => {
    try {
      setLoading(true);
      const response = await classAPI.getById(classId);
      const { _id, ...classData } = response.data;
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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      setLoading(true);
      if (isEditMode && id) {
        await classAPI.update(id, formData);
      } else {
        await classAPI.create(formData);
      }
      navigate('/admin/classes');
    } catch (err) {
      setError('Failed to save class');
      console.error('Error saving class:', err);
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
                  disabled={loading}
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
                disabled={loading}
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
                disabled={loading}
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
                </Select>
              </FormControl>
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