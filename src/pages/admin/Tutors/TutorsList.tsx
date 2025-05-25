import { useState } from 'react';
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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Mock data - replace with actual API calls later
const mockTutors = [
  {
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
  },
  {
    id: '2',
    firstName: 'Michael',
    lastName: 'Chen',
    email: 'michael.chen@example.com',
    phone: '+1 (555) 234-5678',
    specialties: ['Vinyasa Yoga', 'Pilates'],
    certifications: ['Yoga Certification', 'Pilates Certification'],
    experience: 3,
    status: 'active',
    avatar: 'https://i.pravatar.cc/150?img=2',
  },
  {
    id: '3',
    firstName: 'Emma',
    lastName: 'Williams',
    email: 'emma.williams@example.com',
    phone: '+1 (555) 345-6789',
    specialties: ['Healing Therapy', 'Reiki'],
    certifications: ['Healing Certification', 'Reiki Certification'],
    experience: 7,
    status: 'inactive',
    avatar: 'https://i.pravatar.cc/150?img=3',
  },
];

const TutorsList = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState<typeof mockTutors[0] | null>(null);

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

  const handleDeleteClick = (tutor: typeof mockTutors[0]) => {
    setSelectedTutor(tutor);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    // TODO: Implement delete functionality
    console.log('Deleting tutor:', selectedTutor?.id);
    setDeleteDialogOpen(false);
    setSelectedTutor(null);
  };

  const filteredTutors = mockTutors.filter((tutor) =>
    `${tutor.firstName} ${tutor.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tutor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tutor.specialties.some(specialty => specialty.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
            {filteredTutors
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((tutor) => (
                <TableRow key={tutor.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar src={tutor.avatar} alt={`${tutor.firstName} ${tutor.lastName}`} />
                      <Box>
                        <Typography variant="subtitle2">
                          {tutor.firstName} {tutor.lastName}
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
                    {tutor.certifications.map((cert) => (
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
                      onClick={() => navigate(`/admin/tutors/edit/${tutor.id}`)}
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
              ))}
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete {selectedTutor?.firstName} {selectedTutor?.lastName}? This action cannot be undone.
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