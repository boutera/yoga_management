import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { tutorAPI } from '../../../services/api.ts';

interface Tutor {
  _id: string;
  name: string;
  email: string;
  phone: string;
  specialties: string[];
  certifications: string[];
  experience: number;
  status: 'active' | 'inactive';
  avatar?: string;
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
      const response = await tutorAPI.delete(selectedTutor._id);
      if (response.success) {
        setTutors(tutors.filter(t => t._id !== selectedTutor._id));
        setDeleteDialogOpen(false);
        setSelectedTutor(null);
      } else {
        setError('Failed to delete tutor');
      }
    } catch (err) {
      setError('An error occurred while deleting the tutor');
      console.error('Error deleting tutor:', err);
    }
  };

  const filteredTutors = tutors.filter((tutor) =>
    tutor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tutor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tutor.specialties.some(specialty => specialty.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
        <Button onClick={fetchTutors} sx={{ mt: 2 }}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Tutors Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/admin/tutors/new')}
        >
          Add New Tutor
        </Button>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search tutors by name, email, or specialty..."
          value={searchQuery}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ p: 2 }}
        />
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tutor</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Specialties</TableCell>
              <TableCell>Certifications</TableCell>
              <TableCell>Experience (years)</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTutors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography>No tutors found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredTutors
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((tutor) => (
                  <TableRow key={tutor._id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar src={tutor.avatar} alt={tutor.name} />
                        <Box>
                          <Typography variant="subtitle2">
                            {tutor.name}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{tutor.email}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {tutor.phone}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {tutor.specialties.map((specialty) => (
                        <Chip
                          key={specialty}
                          label={specialty}
                          size="small"
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      ))}
                    </TableCell>
                    <TableCell>
                      {tutor.certifications?.map((cert) => (
                        <Chip
                          key={cert}
                          label={cert}
                          size="small"
                          color="primary"
                          variant="outlined"
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      ))}
                    </TableCell>
                    <TableCell>{tutor.experience}</TableCell>
                    <TableCell>
                      <Chip
                        label={tutor.status}
                        color={tutor.status === 'active' ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        color="primary"
                        onClick={() => navigate(`/admin/tutors/edit/${tutor._id}`)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteClick(tutor)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredTutors.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete {selectedTutor?.name}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TutorsList; 