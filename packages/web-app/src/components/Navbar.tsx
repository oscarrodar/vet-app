import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Navbar: React.FC = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component={RouterLink} to="/" sx={{ flexGrow: 1, color: 'inherit', textDecoration: 'none' }}>
          Vet App Portal
        </Typography>
        <Box>
          <Button color="inherit" component={RouterLink} to="/patients">
            Patients
          </Button>
          <Button color="inherit" component={RouterLink} to="/appointments">
            Appointments
          </Button>
          <Button color="inherit" component={RouterLink} to="/login">
            Login
          </Button>
          {/* Add more navigation buttons as needed */}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
