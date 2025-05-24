import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Button,
} from '@mui/material';
import {
  People as PeopleIcon,
  EventNote as EventIcon,
  LocationOn as LocationIcon,
  Class as ClassIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const StatCard = ({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}) => (
  <Card>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box
          sx={{
            backgroundColor: `${color}15`,
            borderRadius: '50%',
            p: 1,
            mr: 2,
          }}
        >
          {icon}
        </Box>
        <Typography variant="h6" color="text.secondary">
          {title}
        </Typography>
      </Box>
      <Typography variant="h4" component="div">
        {value}
      </Typography>
    </CardContent>
  </Card>
);

const QuickActionCard = ({
  title,
  description,
  icon,
  onClick,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}) => (
  <Card>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        {icon}
        <Typography variant="h6" sx={{ ml: 1 }}>
          {title}
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" paragraph>
        {description}
      </Typography>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={onClick}
        fullWidth
      >
        Add New
      </Button>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const navigate = useNavigate();

  const stats = [
    {
      title: 'Total Tutors',
      value: 24,
      icon: <PeopleIcon sx={{ color: '#2196f3' }} />,
      color: '#2196f3',
    },
    {
      title: 'Active Classes',
      value: 12,
      icon: <ClassIcon sx={{ color: '#4caf50' }} />,
      color: '#4caf50',
    },
    {
      title: 'Today\'s Bookings',
      value: 45,
      icon: <EventIcon sx={{ color: '#ff9800' }} />,
      color: '#ff9800',
    },
    {
      title: 'Locations',
      value: 5,
      icon: <LocationIcon sx={{ color: '#f44336' }} />,
      color: '#f44336',
    },
  ];

  const quickActions = [
    {
      title: 'Add New Class',
      description: 'Create a new yoga or healing class',
      icon: <ClassIcon color="primary" />,
      onClick: () => navigate('/admin/classes/new'),
    },
    {
      title: 'Add New Tutor',
      description: 'Register a new instructor',
      icon: <PeopleIcon color="primary" />,
      onClick: () => navigate('/admin/tutors/new'),
    },
    {
      title: 'Add New Location',
      description: 'Add a new center location',
      icon: <LocationIcon color="primary" />,
      onClick: () => navigate('/admin/locations/new'),
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.title}>
            <StatCard {...stat} />
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        Quick Actions
      </Typography>
      <Grid container spacing={3}>
        {quickActions.map((action) => (
          <Grid item xs={12} md={4} key={action.title}>
            <QuickActionCard {...action} />
          </Grid>
        ))}
      </Grid>

      {/* Recent Activity */}
      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Recent Activity
        </Typography>
        <Typography variant="body2" color="text.secondary">
          No recent activity to display
        </Typography>
      </Paper>
    </Box>
  );
};

export default Dashboard; 