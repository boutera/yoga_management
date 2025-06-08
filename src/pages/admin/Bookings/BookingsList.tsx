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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  TextareaAutosize,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { bookingAPI } from '../../../services/api.ts';
import DataTable from '../../../components/DataTable';
import { useNotifications } from '../../../contexts/NotificationContext';

interface Booking {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    firstName: string;
    lastName: string;
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
      firstName: string;
      lastName: string;
    };
    location: {
      _id: string;
      name: string;
      address: string;
    };
  };
  status: 'pending' | 'confirmed' | 'rejected' | 'completed' | 'no-show';
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
  const { addNotification } = useNotifications();

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
      const response = await bookingAPI.delete(selectedBooking._id);
      if (response.success) {
        setBookings(prev => prev.filter(b => b._id !== selectedBooking._id));
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
      const response = await bookingAPI.updateStatus(bookingId, 'confirmed');
      if (!response.success) {
        throw new Error('Failed to approve booking');
      }

      // Add notification for admin
      addNotification({
        type: 'success',
        title: 'Booking Approved',
        message: `Booking #${bookingId} has been approved`,
        link: `/admin/bookings/${bookingId}`,
        recipient: 'admin'
      });

      // Add notification for user
      const booking = bookings.find(b => b._id === bookingId);
      if (booking) {
        addNotification({
          type: 'info',
          title: 'Booking Status Update',
          message: `Your booking #${bookingId} has been approved`,
          link: `/bookings/${bookingId}`,
          recipient: booking.user._id
        });
      }

      fetchBookings();
    } catch (error) {
      console.error('Error approving booking:', error);
      setError('Failed to approve booking');
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
      const response = await bookingAPI.updateStatus(selectedBooking._id, 'rejected');
      if (!response.success) {
        throw new Error('Failed to reject booking');
      }

      // Add notification for admin
      addNotification({
        type: 'warning',
        title: 'Booking Rejected',
        message: `Booking #${selectedBooking._id} has been rejected`,
        link: `/admin/bookings/${selectedBooking._id}`,
        recipient: 'admin'
      });

      // Add notification for user
      addNotification({
        type: 'error',
        title: 'Booking Status Update',
        message: `Your booking #${selectedBooking._id} has been rejected. Reason: ${rejectionReason}`,
        link: `/bookings/${selectedBooking._id}`,
        recipient: selectedBooking.user._id
      });

      setRejectDialogOpen(false);
      setSelectedBooking(null);
      fetchBookings();
    } catch (error) {
      console.error('Error rejecting booking:', error);
      setError('Failed to reject booking');
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
      case 'rejected':
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

  const columns = [
    {
      id: 'class',
      label: 'Class',
      minWidth: 200,
      render: (row: Booking) => (
        <Box>
          <Typography variant="subtitle2">
            {row.class?.name || 'Unnamed Class'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {row.class?.duration ? `${row.class.duration} minutes` : 'Duration not set'}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'user',
      label: 'User',
      minWidth: 200,
      render: (row: Booking) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar 
            alt={`${row.user?.firstName} ${row.user?.lastName}`} 
            sx={{ width: 32, height: 32 }}
          >
            {row.user?.firstName?.charAt(0) || 'U'}
          </Avatar>
          <Box>
            <Typography variant="body2">
              {`${row.user?.firstName} ${row.user?.lastName}`}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.user?.email || 'N/A'}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'tutor',
      label: 'Tutor',
      minWidth: 170,
      render: (row: Booking) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar 
            alt={row.class?.tutor ? row.class.tutor.name : 'Tutor'} 
            sx={{ width: 32, height: 32 }}
          >
            {row.class?.tutor?.name?.charAt(0) || 'T'}
          </Avatar>
          <Typography variant="body2">
            {row.class?.tutor?.name || 'Unassigned Tutor'}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'location',
      label: 'Location',
      minWidth: 170,
      render: (row: Booking) => (
        <Typography variant="body2">{row.class.location?.name}</Typography>
      ),
    },
    {
      id: 'date',
      label: 'Date & Time',
      minWidth: 150,
      render: (row: Booking) => (
        <Box>
          <Typography variant="body2">
            {format(new Date(row.bookingDate), 'MMM d, yyyy')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {format(new Date(row.bookingDate), 'HH:mm')}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'capacity',
      label: 'Capacity',
      minWidth: 100,
      align: 'right' as const,
      render: (row: Booking) => (
        <Typography variant="body2">
          {row.class.capacity}
        </Typography>
      ),
    },
    {
      id: 'price',
      label: 'Price',
      minWidth: 100,
      align: 'right' as const,
      render: (row: Booking) => (
        <Typography variant="body2">
          £{row.paymentAmount}
        </Typography>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      minWidth: 120,
      render: (row: Booking) => (
        <Chip
          label={row.status.replace('_', ' ')}
          color={getStatusColor(row.status)}
          size="small"
        />
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      minWidth: 150,
      align: 'right' as const,
      render: (row: Booking) => (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          {row.status === 'pending' && (
            <>
              <Button
                color="success"
                size="small"
                onClick={() => handleApprove(row._id)}
                sx={{ mr: 1 }}
              >
                Approve
              </Button>
              <Button
                color="error"
                size="small"
                onClick={() => handleRejectClick(row)}
                sx={{ mr: 1 }}
              >
                Reject
              </Button>
            </>
          )}
          <IconButton
            color="primary"
            onClick={() => navigate(`/admin/bookings/edit/${row._id}`)}
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
        <Typography variant="h4">Bookings Management</Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
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
        />
        <FormControl sx={{ width: 200 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            onChange={handleStatusFilterChange}
            label="Status"
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="confirmed">Confirmed</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <DataTable
        columns={columns}
        data={filteredBookings}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={filteredBookings.length}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        loading={loading}
        error={error}
        emptyMessage="No bookings found"
      />

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