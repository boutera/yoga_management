import { Box, AppBar, Toolbar, Typography, Button, Container, IconButton, Drawer, List, ListItem, ListItemText, useTheme, useMediaQuery } from '@mui/material';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import SpaIcon from '@mui/icons-material/Spa';

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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

  const drawer = (
    <List>
      {menuItems.map((item) => (
        <ListItem button key={item.text} component={RouterLink} to={item.path} onClick={handleDrawerToggle}>
          <ListItemText primary={item.text} />
        </ListItem>
      ))}
    </List>
  );

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

          <Button color="inherit" component={RouterLink} to="/login" sx={{ ml: 2 }}>
            Login
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