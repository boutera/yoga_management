import { Box, AppBar, Toolbar, Typography, Button, Container, IconButton, Drawer, List, ListItem, ListItemText, useTheme, useMediaQuery, Avatar, Tooltip, Stack, Link } from '@mui/material';
import { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import SpaIcon from '@mui/icons-material/Spa';
import { useAuth } from '../contexts/AuthContext';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import TwitterIcon from '@mui/icons-material/Twitter';
import NotificationCenter from '../components/NotificationCenter';

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
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar 
        position="sticky" 
        elevation={0}
        sx={{
          backdropFilter: 'blur(8px)',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          color: 'text.primary',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
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
          
          <SpaIcon sx={{ mr: 1, color: 'secondary.main' }} />
          <Typography 
            variant="h6" 
            component={RouterLink} 
            to="/"
            sx={{ 
              flexGrow: 1,
              textDecoration: 'none',
              color: 'primary.main',
              fontWeight: 600,
              '&:hover': {
                color: 'secondary.main',
              }
            }}
          >
            Yoga & Healing Centers
          </Typography>

          {!isMobile && (
            <Stack direction="row" spacing={2} sx={{ mr: 2 }}>
              {menuItems.map((item) => (
                <Button
                  key={item.text}
                  color="inherit"
                  component={RouterLink}
                  to={item.path}
                  sx={{
                    position: 'relative',
                    color: 'text.primary',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      width: '0%',
                      height: '2px',
                      bottom: 0,
                      left: '50%',
                      backgroundColor: 'secondary.main',
                      transition: 'all 0.3s ease',
                      transform: 'translateX(-50%)',
                    },
                    '&:hover': {
                      color: 'secondary.main',
                      backgroundColor: 'transparent',
                    },
                    '&:hover::after': {
                      width: '100%',
                    },
                  }}
                >
                  {item.text}
                </Button>
              ))}
            </Stack>
          )}

          {isAuthenticated && user && (
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
              <NotificationCenter />
              <Tooltip title={displayName} arrow>
                <Avatar 
                  sx={{ 
                    width: 32, 
                    height: 32, 
                    mr: 1, 
                    bgcolor: 'secondary.main',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'scale(1.1)',
                    }
                  }}
                >
                  {avatarInitial}
                </Avatar>
              </Tooltip>
              <Typography 
                variant="body1" 
                sx={{ 
                  display: { xs: 'none', sm: 'block' },
                  fontWeight: 500,
                  color: 'text.primary',
                }}
              >
                {displayName}
              </Typography>
            </Box>
          )}

          <Button 
            variant="contained"
            color="secondary"
            onClick={handleAuthClick}
            sx={{ 
              ml: 2,
              borderRadius: '20px',
              textTransform: 'none',
              px: 3,
              boxShadow: 'none',
              '&:hover': {
                boxShadow: 'none',
                backgroundColor: 'secondary.dark',
              }
            }}
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
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: 240,
            borderRight: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
          },
        }}
      >
        {drawer}
      </Drawer>

      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1,
          py: 4,
          bgcolor: 'background.default',
        }}
      >
        <Container maxWidth="xl">
          {children}
        </Container>
      </Box>

      <Box 
        component="footer" 
        sx={{ 
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          py: 6,
          mt: 'auto',
        }}
      >
        <Container maxWidth="xl">
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={{ xs: 4, md: 8 }}
            justifyContent="space-between"
          >
            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'white' }}>
                Contact Us
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2" color="rgba(255, 255, 255, 0.8)">
                  Email: info@yogahealing.com
                </Typography>
                <Typography variant="body2" color="rgba(255, 255, 255, 0.8)">
                  Phone: (555) 123-4567
                </Typography>
              </Stack>
            </Box>
            
            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'white' }}>
                Quick Links
              </Typography>
              <Stack spacing={1}>
                {menuItems.map((item) => (
                  <Link
                    key={item.text}
                    component={RouterLink}
                    to={item.path}
                    sx={{
                      textDecoration: 'none',
                      color: 'rgba(255, 255, 255, 0.8)',
                      '&:hover': {
                        color: 'secondary.main',
                      }
                    }}
                  >
                    {item.text}
                  </Link>
                ))}
              </Stack>
            </Box>
            
            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'white' }}>
                Follow Us
              </Typography>
              <Stack direction="row" spacing={2}>
                <IconButton 
                  sx={{ 
                    color: 'rgba(255, 255, 255, 0.8)',
                    '&:hover': {
                      color: 'secondary.main',
                    }
                  }} 
                  aria-label="Facebook"
                >
                  <FacebookIcon />
                </IconButton>
                <IconButton 
                  sx={{ 
                    color: 'rgba(255, 255, 255, 0.8)',
                    '&:hover': {
                      color: 'secondary.main',
                    }
                  }} 
                  aria-label="Instagram"
                >
                  <InstagramIcon />
                </IconButton>
                <IconButton 
                  sx={{ 
                    color: 'rgba(255, 255, 255, 0.8)',
                    '&:hover': {
                      color: 'secondary.main',
                    }
                  }} 
                  aria-label="Twitter"
                >
                  <TwitterIcon />
                </IconButton>
              </Stack>
            </Box>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
};

export default MainLayout; 