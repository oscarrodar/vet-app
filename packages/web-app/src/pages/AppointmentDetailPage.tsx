import React from 'react';
import { Container, Typography, Paper, Box, Button } from '@mui/material';
import { useParams, Link as RouterLink } from 'react-router-dom';

const AppointmentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  // Placeholder data
  const appointmentDetails = {
    id,
    patientName: `Patient for Appt ${id}`,
    vetName: 'Dr. Placeholder',
    appointmentDate: new Date().toISOString(),
    type: 'CONSULTATION',
    reason: 'General checkup',
    notes: 'No specific notes.',
    status: 'SCHEDULED',
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom sx={{mt: 2}}>
        Appointment Details
      </Typography>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box mb={2}>
          <Typography variant="h6">ID:</Typography>
          <Typography>{appointmentDetails.id}</Typography>
        </Box>
        <Box mb={2}>
          <Typography variant="h6">Patient:</Typography>
          <Typography>{appointmentDetails.patientName}</Typography>
        </Box>
        <Box mb={2}>
          <Typography variant="h6">Veterinarian:</Typography>
          <Typography>{appointmentDetails.vetName}</Typography>
        </Box>
        <Box mb={2}>
          <Typography variant="h6">Date & Time:</Typography>
          <Typography>{new Date(appointmentDetails.appointmentDate).toLocaleString()}</Typography>
        </Box>
        <Box mb={2}>
          <Typography variant="h6">Type:</Typography>
          <Typography>{appointmentDetails.type}</Typography>
        </Box>
        <Box mb={2}>
          <Typography variant="h6">Reason:</Typography>
          <Typography>{appointmentDetails.reason}</Typography>
        </Box>
        <Box mb={2}>
          <Typography variant="h6">Status:</Typography>
          <Typography>{appointmentDetails.status}</Typography>
        </Box>
        <Box mb={2}>
          <Typography variant="h6">Notes:</Typography>
          <Typography>{appointmentDetails.notes}</Typography>
        </Box>
      </Paper>
      <Button variant="outlined" component={RouterLink} to="/appointments" sx={{mt: 2, mr: 1}}>
        Back to List
      </Button>
       <Button variant="contained" component={RouterLink} to={`/appointments/${id}/edit`} sx={{mt: 2}}> {/* Assuming edit route */}
        Edit Appointment
      </Button>
    </Container>
  );
};

export default AppointmentDetailPage;
