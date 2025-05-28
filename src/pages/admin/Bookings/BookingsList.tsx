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
  CircularProgress,
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
import { bookingAPI } from '../../../services/api.ts';

interface Booking {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  class: {
    _id: string;
    name: string;
    description: string;
    duration: number;
    price: number;
    capacity: number;
    tutor: {
      _id: string;
      name: string;
      email: string;
    };
    location: {
      _id: string;
      name: string;
      address: string;
    };
  };
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no-show';
  bookingDate: string;
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'failed';
  paymentAmount: number;
  paymentMethod: 'cash' | 'credit_card' | 'debit_card' | 'online_transfer';
  paymentDetails?: {
    transactionId?: string;
    paymentDate?: string;
    refundDate?: string;
    refundAmount?: number;
  };
  attendanceStatus: 'not_checked' | 'present' | 'absent';
  notes?: string;
  cancellationReason?: string;
  cancellationDate?: string;
  refundAmount?: number;
}

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
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    const handleLocationChange = () => {
      const state = window.history.state;
      if (state?.refresh) {
        fetchBookings();
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await bookingAPI.getAll();
      if (response.success) {
        setBookings(response.data);
      } else {
        setError('Failed to fetch bookings');
      }
    } catch (err) {
      setError('An error occurred while fetching bookings');
      console.error('Error fetching bookings:', err);
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

  const handleStatusFilterChange = (event: SelectChangeEvent) => {
    setStatusFilter(event.target.value);
    setPage(0);
  };

  const handleDeleteClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedBooking) return;

    try {
      const response = await bookingAPI.updateStatus(selectedBooking._id, 'cancelled');
      if (response.success) {
        setBookings(prev => prev.map(b => b._id === selectedBooking._id ? { 
          ...b, 
          status: 'cancelled',
          cancellationDate: new Date().toISOString()
        } : b));
        setDeleteDialogOpen(false);
        setSelectedBooking(null);
      } else {
        setError('Failed to delete booking');
      }
    } catch (err) {
      setError('An error occurred while deleting the booking');
      console.error('Error deleting booking:', err);
    }
  };

  const handleApprove = async (bookingId: string) => {
    try {
      const response = await bookingAPI.update(bookingId, { status: 'confirmed' });
      if (response.success) {
        setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status: 'confirmed' } : b));
      } else {
        setError('Failed to approve booking');
      }
    } catch (err) {
      setError('An error occurred while approving the booking');
      console.error('Error approving booking:', err);
    }
  };

  const handleRejectClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setRejectionReason('');
    setRejectDialogOpen(true);
  };

  const handleRejectConfirm = async () => {
    if (!selectedBooking) return;

    try {
      const response = await bookingAPI.updateStatus(selectedBooking._id, 'cancelled', rejectionReason);
      if (response.success) {
        setBookings(prev => prev.map(b => b._id === selectedBooking._id ? { 
          ...b, 
          status: 'cancelled',
          cancellationReason: rejectionReason,
          cancellationDate: new Date().toISOString()
        } : b));
        setRejectDialogOpen(false);
        setSelectedBooking(null);
        setRejectionReason('');
      } else {
        setError('Failed to reject booking');
      }
    } catch (err) {
      setError('An error occurred while rejecting the booking');
      console.error('Error rejecting booking:', err);
    }
  };

  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'confirmed':
        return 'info';
      case 'completed':
        return 'success';
      case 'cancelled':
      case 'no-show':
        return 'error';
      default:
        return 'default';
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch = 
      booking.class?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.class?.tutor?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.class?.location?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

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
        <Button onClick={fetchBookings} sx={{ mt: 2 }}>
          Retry
        </Button>
      </Box>
    );
  }

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
              <TableCell>User</TableCell>
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
            {filteredBookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography variant="body1">No bookings found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredBookings
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((booking) => (
                  <TableRow key={booking._id}>
                    <TableCell>
                      <Typography variant="subtitle2">
                        {booking.class?.name || 'Unnamed Class'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {booking.class?.duration ? `${booking.class.duration} minutes` : 'Duration not set'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar 
                          alt={booking.user?.name || 'User'} 
                          sx={{ width: 32, height: 32 }}
                        >
                          {booking.user?.name?.charAt(0) || 'U'}
                        </Avatar>
                        <Box>
                          <Typography variant="body2">
                            {booking.user?.name || 'Unknown User'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {booking.user?.email || 'N/A'}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar 
                          alt={booking.class.tutor?.name || 'Tutor'} 
                          sx={{ width: 32, height: 32 }}
                        >
                          {booking.class.tutor?.name?.charAt(0) || 'T'}
                        </Avatar>
                        <Typography variant="body2">
                          {booking.class.tutor?.name || 'Unassigned Tutor'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{booking.class.location?.name}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {format(new Date(booking.bookingDate), 'MMM d, yyyy')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {format(new Date(booking.bookingDate), 'HH:mm')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {booking.class.capacity}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        ${booking.paymentAmount}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={booking.status.replace('_', ' ')}
                        color={getStatusColor(booking.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      {booking.status === 'pending' ? (
                        <>
                          <Button
                            color="success"
                            size="small"
                            onClick={() => handleApprove(booking._id)}
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
                            onClick={() => navigate(`/admin/bookings/edit/${booking._id}`)}
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
                            onClick={() => navigate(`/admin/bookings/edit/${booking._id}`)}
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
                ))
            )}
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

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this booking? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

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