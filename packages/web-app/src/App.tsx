import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import PatientListPage from './pages/PatientListPage';
import PatientDetailPage from './pages/PatientDetailPage';
import AppointmentListPage from './pages/AppointmentListPage';
import AppointmentDetailPage from './pages/AppointmentDetailPage';
import Navbar from './components/Navbar';
import { Container, Typography } from '@mui/material';

// Basic placeholder for a home page or dashboard
const HomePage = () => (
  <Container>
    <Typography variant="h3" component="h1" gutterBottom sx={{mt:2}} className="text-3xl font-bold underline">
      Welcome to the Vet App Portal
    </Typography>
    <Typography>
      Please use the navigation bar to access different sections.
    </Typography>
  </Container>
);


const App: React.FC = () => {
  return (
    <>
      <Navbar />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}> {/* Added a main container for padding */}
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route path="/patients" element={<PatientListPage />} />
          <Route path="/patients/:id" element={<PatientDetailPage />} />
          {/* Add routes for creating/editing patients, e.g., /patients/new, /patients/:id/edit */}

          <Route path="/appointments" element={<AppointmentListPage />} />
          <Route path="/appointments/:id" element={<AppointmentDetailPage />} />
          {/* Add routes for creating/editing appointments */}

          <Route path="/" element={<HomePage />} />
          <Route path="*" element={<Navigate to="/" replace />} /> {/* Redirect unmatched to home */}
        </Routes>
      </Container>
    </>
  );
};

export default App;
