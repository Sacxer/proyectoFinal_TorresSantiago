import React, { useEffect, useState } from 'react';
import { AppBar, Toolbar, Typography, Container, Box, IconButton, useTheme, useMediaQuery, Button, Chip } from '@mui/material';
import Avatar from '@mui/material/Avatar'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import { db } from '../../Firebase/Firebase'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import { useAuth } from '../../contexts/AuthContext'
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import { Link } from 'react-router-dom';

const Header = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { currentUser, userRole, logout } = useAuth()
  const [anchorEl, setAnchorEl] = React.useState(null)
  const [sections, setSections] = useState([])

  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget)
  const handleMenuClose = () => setAnchorEl(null)
  const handleLogout = async () => {
    await logout()
    handleMenuClose()
  }

  useEffect(() => {
    const load = async () => {
      try {
        const q = query(collection(db, 'sections'), orderBy('name'))
        const snap = await getDocs(q)
        setSections(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      } catch (err) {
        console.error('Error loading header sections', err)
      }
    }
    load()
  }, [])

  return (
    <AppBar position="static" color="default" elevation={0}>
      <Container maxWidth="lg">
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          py: 1,
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}>
          <Typography variant="body2" color="text.secondary">
            {new Date().toLocaleDateString('es-ES', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Typography>
          <Box>
            <IconButton size="small" component="a" href="#" color="inherit">
              <FacebookIcon />
            </IconButton>
            <IconButton size="small" component="a" href="#" color="inherit">
              <TwitterIcon />
            </IconButton>
            <IconButton size="small" component="a" href="#" color="inherit">
              <InstagramIcon />
            </IconButton>
          </Box>
        </Box>
        
        <Toolbar sx={{ justifyContent: 'space-between', py: 3 }}>
          <Box component={Link} to="/" sx={{ textDecoration: 'none', color: 'inherit' }}>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
              Global News
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Tu ventana al mundo
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {!currentUser ? (
              <>
                <Button
                  component={Link}
                  to="/login"
                  color="inherit"
                  variant="text"
                  size={isMobile ? 'small' : 'medium'}
                >
                  Iniciar sesión
                </Button>

                <Button
                  component={Link}
                  to="/register"
                  color="secondary"
                  variant="contained"
                  size={isMobile ? 'small' : 'medium'}
                >
                  Registrarse
                </Button>
              </>
            ) : (
              <>
                <Button onClick={handleMenuOpen} color="inherit" startIcon={
                  <Avatar sx={{ width: 32, height: 32 }}>{currentUser.displayName ? currentUser.displayName[0] : (currentUser.email ? currentUser.email[0] : '?')}</Avatar>
                }>
                  {currentUser.displayName || currentUser.email}
                </Button>
                {/* Role debug chip */}
                <Chip label={userRole || 'Sin rol'} size="small" color={userRole === 'Editor' ? 'secondary' : 'default'} sx={{ ml: 1 }} />
                {/* Visible logout button for quick access */}
                <Button color="inherit" size="small" onClick={handleLogout} sx={{ ml: 1 }}>Cerrar sesión</Button>
                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                  <MenuItem disabled>{userRole || 'Sin rol'}</MenuItem>
                  <MenuItem component={Link} to="/dashboard" onClick={handleMenuClose}>Panel administrativo</MenuItem>
                  <MenuItem onClick={handleLogout}>Cerrar sesión</MenuItem>
                </Menu>
              </>
            )}
          </Box>
        </Toolbar>
        {/* Sections moved to NavBar to avoid duplication */}
      </Container>
    </AppBar>
  );
};

export default Header;
