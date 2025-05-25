import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { classAPI } from '../../../services/api.ts';

interface Class {
  _id: string;
  name: string;
  description: string;
  tutor: {
    _id: string;
    name: string;
  };
  location: {
    _id: string;
    name: string;
    address: string;
  };
  capacity: number;
  price: number;
  duration: number;
  schedule: {
    dayOfWeek: string;
    startTime: string;
    endTime: string;
  }[];
  status: 'active' | 'inactive' | 'cancelled';
  category: string;
  level: string;
  requirements: string[];
  equipment: string[];
  maxAge?: number;
  minAge?: number;
}

const ClassDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [classData, setClassData] = useState<Class | null>(null);

  useEffect(() => {
    fetchClassDetails();
  }, [id]);

  const fetchClassDetails = async () => {
    try {
      setLoading(true);
      const response = await classAPI.getById(id!);
      setClassData(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch class details');
      console.error('Error fetching class details:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !classData) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || 'Class not found'}
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/admin/classes')}
        >
          Back to Classes
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Class Details</Typography>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/admin/classes')}
        >
          Back to Classes
        </Button>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom>
              {classData.name}
            </Typography>
            <Chip
              label={classData.status}
              color={classData.status === 'active' ? 'success' : 'default'}
              sx={{ mb: 2 }}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Description
            </Typography>
            <Typography variant="body1" paragraph>
              {classData.description}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" gutterBottom>
              Category & Level
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip label={classData.category} />
              <Chip label={classData.level} />
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" gutterBottom>
              Duration & Capacity
            </Typography>
            <Typography variant="body1">
              {classData.duration} minutes • {classData.capacity} students
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" gutterBottom>
              Price
            </Typography>
            <Typography variant="body1">
              ${classData.price.toFixed(2)}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" gutterBottom>
              Tutor
            </Typography>
            <Typography variant="body1">
              {classData.tutor.name}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Location
            </Typography>
            <Typography variant="body1">
              {classData.location.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {classData.location.address}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" gutterBottom>
              Schedule
            </Typography>
            <Grid container spacing={2}>
              {classData.schedule.map((slot, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2">
                      {slot.dayOfWeek}
                    </Typography>
                    <Typography variant="body2">
                      {slot.startTime} - {slot.endTime}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Grid>

          {classData.requirements.length > 0 && (
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Requirements
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {classData.requirements.map((req, index) => (
                  <Chip key={index} label={req} />
                ))}
              </Box>
            </Grid>
          )}

          {classData.equipment.length > 0 && (
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Equipment
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {classData.equipment.map((item, index) => (
                  <Chip key={index} label={item} />
                ))}
              </Box>
            </Grid>
          )}

          {(classData.minAge || classData.maxAge) && (
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Age Requirements
              </Typography>
              <Typography variant="body1">
                {classData.minAge && `Minimum age: ${classData.minAge} years`}
                {classData.minAge && classData.maxAge && ' • '}
                {classData.maxAge && `Maximum age: ${classData.maxAge} years`}
              </Typography>
            </Grid>
          )}
        </Grid>
      </Paper>
    </Box>
  );
};

export default ClassDetails; 