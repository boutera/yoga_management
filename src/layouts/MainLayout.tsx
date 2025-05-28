import { Box, AppBar, Toolbar, Typography, Button, Container, IconButton, Drawer, List, ListItem, ListItemText, useTheme, useMediaQuery, Avatar, Tooltip } from '@mui/material';
import { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import SpaIcon from '@mui/icons-material/Spa';
import { useAuth } from '../contexts/AuthContext';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'tutor' | 'user';
  isActive: boolean;
}

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Auth State:', { isAuthenticated, user });
  }, [isAuthenticated, user]);

  const menuItems = [
    { text: 'Home', path: '/' },
    { text: 'Classes', path: '/classes' },
    { text: 'Book a Session', path: '/booking' },
    { text: 'Our Centers', path: '/locations' },
    { text: 'Tutors', path: '/tutors' },
    { text: 'About Us', path: '/about' },
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleAuthClick = () => {
    if (isAuthenticated) {
      logout();
    } else {
      navigate('/login');
    }
  };

  const drawer = (
    <List>
      {menuItems.map((item) => (
        <ListItem button key={item.text} component={RouterLink} to={item.path} onClick={handleDrawerToggle}>
          <ListItemText primary={item.text} />
        </ListItem>
      ))}
    </List>
  );

  const displayName = user?.name || user?.email?.split('@')[0] || 'User';
  const avatarInitial = displayName[0].toUpperCase();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="sticky" color="primary" elevation={0}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <SpaIcon sx={{ mr: 1 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Yoga & Healing Centers
          </Typography>

          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 2 }}>
              {menuItems.map((item) => (
                <Button
                  key={item.text}
                  color="inherit"
                  component={RouterLink}
                  to={item.path}
                >
                  {item.text}
                </Button>
              ))}
            </Box>
          )}

          {isAuthenticated && user && (
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
              <Tooltip title={displayName} arrow>
                <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: 'secondary.main', cursor: 'pointer' }}>
                  {avatarInitial}
                </Avatar>
              </Tooltip>
              <Typography variant="body1" sx={{ display: { xs: 'none', sm: 'block' } }}>
                {displayName}
              </Typography>
            </Box>
          )}

          <Button 
            color="inherit" 
            onClick={handleAuthClick}
            sx={{ ml: 2 }}
          >
            {isAuthenticated ? 'Logout' : 'Login'}
          </Button>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        anchor="left"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
        }}
      >
        {drawer}
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1 }}>
        <Container maxWidth="xl">
          {children}
        </Container>
      </Box>

      <Box component="footer" sx={{ bgcolor: 'primary.main', color: 'white', py: 3, mt: 'auto' }}>
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h6" gutterBottom>
                Contact Us
              </Typography>
              <Typography variant="body2">
                Email: info@yogahealing.com
              </Typography>
              <Typography variant="body2">
                Phone: (555) 123-4567
              </Typography>
            </Box>
            <Box>
              <Typography variant="h6" gutterBottom>
                Quick Links
              </Typography>
              {menuItems.map((item) => (
                <Button
                  key={item.text}
                  color="inherit"
                  component={RouterLink}
                  to={item.path}
                  sx={{ display: 'block', textAlign: 'left' }}
                >
                  {item.text}
                </Button>
              ))}
            </Box>
            <Box>
              <Typography variant="h6" gutterBottom>
                Follow Us
              </Typography>
              <Typography variant="body2">
                Instagram
              </Typography>
              <Typography variant="body2">
                Facebook
              </Typography>
              <Typography variant="body2">
                Twitter
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default MainLayout; 