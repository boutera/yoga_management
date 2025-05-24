import { Box, Typography, Button, Grid, Card, CardContent, CardMedia, Container, Paper } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PeopleIcon from '@mui/icons-material/People';
import SpaIcon from '@mui/icons-material/Spa';

const HomePage = () => {
  const featuredClasses = [
    {
      title: 'Hatha Yoga',
      description: 'Traditional yoga practice focusing on physical postures and breathing techniques.',
      image: '/images/hatha-yoga.jpg',
    },
    {
      title: 'Meditation',
      description: 'Guided meditation sessions for stress relief and mental clarity.',
      image: '/images/meditation.jpg',
    },
    {
      title: 'Healing Therapy',
      description: 'Holistic healing sessions combining various therapeutic techniques.',
      image: '/images/healing.jpg',
    },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Paper
        sx={{
          position: 'relative',
          backgroundColor: 'grey.800',
          color: '#fff',
          mb: 4,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundImage: 'url(/images/hero-bg.jpg)',
          height: '60vh',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            right: 0,
            left: 0,
            backgroundColor: 'rgba(0,0,0,.5)',
          }}
        />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h2" component="h1" gutterBottom>
            Find Your Inner Peace
          </Typography>
          <Typography variant="h5" paragraph>
            Join our community of wellness seekers and discover the path to holistic health
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="large"
            component={RouterLink}
            to="/booking"
            sx={{ mt: 2 }}
          >
            Book Your Session
          </Button>
        </Container>
      </Paper>

      {/* Quick Actions */}
      <Container maxWidth="lg" sx={{ mb: 6 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <CalendarMonthIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" component="h2" gutterBottom>
                  Book a Session
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  Schedule your yoga class or healing session online
                </Typography>
                <Button variant="outlined" component={RouterLink} to="/booking">
                  Book Now
                </Button>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <LocationOnIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" component="h2" gutterBottom>
                  Find a Center
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  Locate our nearest yoga and healing center
                </Typography>
                <Button variant="outlined" component={RouterLink} to="/locations">
                  View Centers
                </Button>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <PeopleIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" component="h2" gutterBottom>
                  Meet Our Tutors
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  Learn from experienced and certified instructors
                </Typography>
                <Button variant="outlined" component={RouterLink} to="/tutors">
                  View Tutors
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Featured Classes */}
      <Box sx={{ bgcolor: 'grey.100', py: 6 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" gutterBottom align="center">
            Featured Classes
          </Typography>
          <Grid container spacing={4} sx={{ mt: 2 }}>
            {featuredClasses.map((classItem) => (
              <Grid item key={classItem.title} xs={12} md={4}>
                <Card sx={{ height: '100%' }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={classItem.image}
                    alt={classItem.title}
                  />
                  <CardContent>
                    <Typography variant="h5" component="h3" gutterBottom>
                      {classItem.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {classItem.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Why Choose Us */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography variant="h3" component="h2" gutterBottom align="center">
          Why Choose Us
        </Typography>
        <Grid container spacing={4} sx={{ mt: 2 }}>
          <Grid item xs={12} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <SpaIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Expert Tutors
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Learn from certified and experienced instructors
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <LocationOnIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Multiple Locations
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Convenient centers across the city
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <CalendarMonthIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Flexible Scheduling
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Book classes that fit your schedule
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <PeopleIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Community
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Join a supportive wellness community
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Call to Action */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 6 }}>
        <Container maxWidth="md">
          <Typography variant="h4" component="h2" gutterBottom align="center">
            Start Your Wellness Journey Today
          </Typography>
          <Typography variant="h6" align="center" paragraph>
            Join our community and experience the transformative power of yoga and healing
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              component={RouterLink}
              to="/booking"
            >
              Book a Session
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              size="large"
              component={RouterLink}
              to="/about"
            >
              Learn More
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage; 