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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  TextareaAutosize,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';

// Mock data - replace with actual API calls later
const mockBookings = [
  {
    id: '1',
    classId: '1',
    className: 'Hatha Yoga',
    tutorId: '1',
    tutorName: 'Sarah Johnson',
    tutorAvatar: 'https://i.pravatar.cc/150?img=1',
    locationId: '1',
    locationName: 'Downtown Studio',
    date: '2024-03-20',
    startTime: '09:00',
    endTime: '10:00',
    capacity: 20,
    bookedSeats: 15,
    status: 'confirmed',
    price: 25.00,
  },
  {
    id: '2',
    classId: '2',
    className: 'Meditation',
    tutorId: '2',
    tutorName: 'Michael Chen',
    tutorAvatar: 'https://i.pravatar.cc/150?img=2',
    locationId: '2',
    locationName: 'Westside Center',
    date: '2024-03-20',
    startTime: '14:00',
    endTime: '14:45',
    capacity: 15,
    bookedSeats: 8,
    status: 'confirmed',
    price: 20.00,
  },
  {
    id: '3',
    classId: '3',
    className: 'Healing Therapy',
    tutorId: '3',
    tutorName: 'Emma Williams',
    tutorAvatar: 'https://i.pravatar.cc/150?img=3',
    locationId: '1',
    locationName: 'Downtown Studio',
    date: '2024-03-21',
    startTime: '16:00',
    endTime: '17:30',
    capacity: 10,
    bookedSeats: 3,
    status: 'pending',
    price: 50.00,
  },
];

const statusColors: Record<string, 'success' | 'warning' | 'error' | 'info'> = {
  confirmed: 'success',
  pending: 'warning',
  cancelled: 'error',
  completed: 'info',
};

const BookingsList = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<typeof mockBookings[0] | null>(null);
  const [bookings, setBookings] = useState(mockBookings);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

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

  const handleStatusFilterChange = (event: SelectChangeEvent) => {
    setStatusFilter(event.target.value);
    setPage(0);
  };

  const handleDeleteClick = (booking: typeof mockBookings[0]) => {
    setSelectedBooking(booking);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    // TODO: Implement delete functionality
    console.log('Deleting booking:', selectedBooking?.id);
    setDeleteDialogOpen(false);
    setSelectedBooking(null);
  };

  const handleApprove = (bookingId: string) => {
    setBookings((prev) => prev.map(b => b.id === bookingId ? { ...b, status: 'confirmed' } : b));
  };

  const handleRejectClick = (booking: typeof mockBookings[0]) => {
    setSelectedBooking(booking);
    setRejectionReason('');
    setRejectDialogOpen(true);
  };

  const handleRejectConfirm = () => {
    if (selectedBooking) {
      setBookings((prev) => prev.map(b => b.id === selectedBooking.id ? { ...b, status: 'rejected', rejectionReason } : b));
    }
    setRejectDialogOpen(false);
    setSelectedBooking(null);
    setRejectionReason('');
  };

  const filteredBookings = mockBookings.filter((booking) => {
    const matchesSearch = 
      booking.className.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.tutorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.locationName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Bookings Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/admin/bookings/new')}
        >
          Add New Booking
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Paper sx={{ flex: 1 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search bookings by class, tutor, or location..."
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
        <Paper sx={{ width: 200 }}>
          <FormControl fullWidth sx={{ p: 2 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              label="Status"
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="confirmed">Confirmed</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
            </Select>
          </FormControl>
        </Paper>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Class</TableCell>
              <TableCell>Tutor</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Date & Time</TableCell>
              <TableCell>Capacity</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredBookings
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>
                    <Typography variant="subtitle2">{booking.className}</Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar src={booking.tutorAvatar} alt={booking.tutorName} sx={{ width: 32, height: 32 }} />
                      <Typography variant="body2">{booking.tutorName}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{booking.locationName}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarIcon fontSize="small" color="action" />
                      <Box>
                        <Typography variant="body2">
                          {format(parseISO(`${booking.date}T${booking.startTime}`), 'MMM d, yyyy')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {booking.startTime} - {booking.endTime}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {booking.bookedSeats}/{booking.capacity}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {Math.round((booking.bookedSeats / booking.capacity) * 100)}% full
                    </Typography>
                  </TableCell>
                  <TableCell>${booking.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <Chip
                      label={booking.status}
                      color={statusColors[booking.status] || 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    {booking.status === 'pending' ? (
                      <>
                        <Button
                          color="success"
                          size="small"
                          onClick={() => handleApprove(booking.id)}
                          sx={{ mr: 1 }}
                        >
                          Approve
                        </Button>
                        <Button
                          color="error"
                          size="small"
                          onClick={() => handleRejectClick(booking)}
                          sx={{ mr: 1 }}
                        >
                          Reject
                        </Button>
                        <IconButton
                          color="primary"
                          onClick={() => navigate(`/admin/bookings/edit/${booking.id}`)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteClick(booking)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </>
                    ) : (
                      <>
                        <IconButton
                          color="primary"
                          onClick={() => navigate(`/admin/bookings/edit/${booking.id}`)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteClick(booking)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredBookings.length}
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
            Are you sure you want to delete the booking for {selectedBooking?.className} on {selectedBooking?.date}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Confirmation Dialog */}
      <Dialog
        open={rejectDialogOpen}
        onClose={() => setRejectDialogOpen(false)}
      >
        <DialogTitle>Reject Booking</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Optionally, provide a reason for rejecting this booking:
          </DialogContentText>
          <TextareaAutosize
            minRows={3}
            style={{ width: '100%', marginTop: 8 }}
            placeholder="Reason for rejection (optional)"
            value={rejectionReason}
            onChange={e => setRejectionReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleRejectConfirm} color="error" variant="contained">
            Reject
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BookingsList; 