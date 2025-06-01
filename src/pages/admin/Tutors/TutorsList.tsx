import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  IconButton,
  TextField,
  InputAdornment,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Avatar,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { tutorAPI } from '../../../services/api.ts';
import DataTable from '../../../components/DataTable';

interface Certification {
  _id?: string;
  name: string;
  issuer: string;
  year: number;
}

interface Tutor {
  _id: string;
  name: string;
  email: string;
  phone: string;
  specialties: string[];
  certifications: Certification[];
  experience: number;
  status: 'active' | 'inactive';
}

const TutorsList = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null);
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTutors();
  }, []);

  const fetchTutors = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await tutorAPI.getAll();
      console.log('Fetched tutors:', response);
      if (response.success) {
        setTutors(response.data);
      } else {
        setError('Failed to fetch tutors');
      }
    } catch (err) {
      setError('An error occurred while fetching tutors');
      console.error('Error fetching tutors:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setPage(0);
  };

  const handleDeleteClick = (tutor: Tutor) => {
    setSelectedTutor(tutor);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedTutor) return;

    try {
      await tutorAPI.delete(selectedTutor._id);
      await fetchTutors();
      setDeleteDialogOpen(false);
      setSelectedTutor(null);
    } catch (err) {
      setError('Failed to delete tutor');
      console.error('Error deleting tutor:', err);
    }
  };

  const filteredTutors = tutors.filter((tutor) =>
    tutor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tutor.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = [
    {
      id: 'name',
      label: 'Name',
      minWidth: 170,
      render: (row: Tutor) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ width: 32, height: 32 }}>
            {row.name.charAt(0)}
          </Avatar>
          <Typography variant="body2">{row.name}</Typography>
        </Box>
      ),
    },
    {
      id: 'email',
      label: 'Email',
      minWidth: 200,
    },
    {
      id: 'phone',
      label: 'Phone',
      minWidth: 130,
    },
    {
      id: 'specialties',
      label: 'Specialties',
      minWidth: 200,
      render: (row: Tutor) => (
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {row.specialties.map((specialty) => (
            <Chip key={specialty} label={specialty} size="small" />
          ))}
        </Box>
      ),
    },
    {
      id: 'certifications',
      label: 'Certifications',
      minWidth: 200,
      render: (row: Tutor) => (
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {row.certifications.map((cert) => (
            <Chip 
              key={cert._id || cert.name} 
              label={`${cert.name} (${cert.year})`} 
              size="small" 
              color="primary" 
              variant="outlined" 
            />
          ))}
        </Box>
      ),
    },
    {
      id: 'experience',
      label: 'Experience',
      minWidth: 100,
      align: 'right' as const,
      format: (value: number) => `${value} years`,
    },
    {
      id: 'status',
      label: 'Status',
      minWidth: 100,
      render: (row: Tutor) => (
        <Chip
          label={row.status}
          color={row.status === 'active' ? 'success' : 'default'}
          size="small"
        />
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      minWidth: 120,
      align: 'right' as const,
      render: (row: Tutor) => (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <IconButton
            color="primary"
            onClick={() => navigate(`/admin/tutors/edit/${row._id}`)}
            size="small"
          >
            <EditIcon />
          </IconButton>
          <IconButton
            color="error"
            onClick={() => handleDeleteClick(row)}
            size="small"
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Tutors</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate('/admin/tutors/new')}
        >
          Add New Tutor
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search tutors..."
          value={searchQuery}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <DataTable
        columns={columns}
        data={filteredTutors}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={filteredTutors.length}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        loading={loading}
        error={error}
        emptyMessage="No tutors found"
      />

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Tutor</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this tutor? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TutorsList; 