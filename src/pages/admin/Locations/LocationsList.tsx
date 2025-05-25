import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Mock data - replace with actual API calls later
const mockLocations = [
  {
    id: '1',
    name: 'Downtown Studio',
    address: '123 Main St, Downtown',
    capacity: 50,
    contactPhone: '(555) 123-4567',
    contactEmail: 'downtown@yogacenter.com',
  },
  {
    id: '2',
    name: 'Westside Center',
    address: '456 West Ave, Westside',
    capacity: 40,
    contactPhone: '(555) 234-5678',
    contactEmail: 'westside@yogacenter.com',
  },
  {
    id: '3',
    name: 'Eastside Hub',
    address: '789 East Blvd, Eastside',
    capacity: 35,
    contactPhone: '(555) 345-6789',
    contactEmail: 'eastside@yogacenter.com',
  },
];

const LocationsList = () => {
  const navigate = useNavigate();
  const [locations, setLocations] = useState(mockLocations);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<typeof mockLocations[0] | null>(null);

  const handleDeleteClick = (location: typeof mockLocations[0]) => {
    setSelectedLocation(location);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedLocation) {
      setLocations((prev) => prev.filter((loc) => loc.id !== selectedLocation.id));
    }
    setDeleteDialogOpen(false);
    setSelectedLocation(null);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Locations</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/admin/locations/new')}
        >
          Add Location
        </Button>
      </Box>

      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Address</TableCell>
                  <TableCell>Capacity</TableCell>
                  <TableCell>Contact Phone</TableCell>
                  <TableCell>Contact Email</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {locations.map((location) => (
                  <TableRow key={location.id}>
                    <TableCell>{location.name}</TableCell>
                    <TableCell>{location.address}</TableCell>
                    <TableCell>{location.capacity}</TableCell>
                    <TableCell>{location.contactPhone}</TableCell>
                    <TableCell>{location.contactEmail}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        color="primary"
                        onClick={() => navigate(`/admin/locations/edit/${location.id}`)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteClick(location)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContent>
            Are you sure you want to delete {selectedLocation?.name}? This action cannot be undone.
          </DialogContent>
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

export default LocationsList; 