import React from 'react';
import { Container, Typography, Paper, Box, Button } from '@mui/material';
import { useParams, Link as RouterLink } from 'react-router-dom';

const PatientDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  // Placeholder data - in a real app, fetch this based on ID
  const patientDetails = {
    id,
    name: `Patient ${id}`,
    species: 'Unknown Species',
    breed: 'Unknown Breed',
    age: 0,
    weight: 0,
    ownerId: 'owner-placeholder-id',
    medical_history_summary: 'No summary available.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom sx={{mt: 2}}>
        Patient Details: {patientDetails.name}
      </Typography>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box mb={2}>
          <Typography variant="h6">ID:</Typography>
          <Typography>{patientDetails.id}</Typography>
        </Box>
        <Box mb={2}>
          <Typography variant="h6">Species:</Typography>
          <Typography>{patientDetails.species}</Typography>
        </Box>
        <Box mb={2}>
          <Typography variant="h6">Breed:</Typography>
          <Typography>{patientDetails.breed}</Typography>
        </Box>
        <Box mb={2}>
          <Typography variant="h6">Age:</Typography>
          <Typography>{patientDetails.age}</Typography>
        </Box>
        <Box mb={2}>
          <Typography variant="h6">Weight:</Typography>
          <Typography>{patientDetails.weight} kg</Typography>
        </Box>
        <Box mb={2}>
          <Typography variant="h6">Medical History Summary:</Typography>
          <Typography>{patientDetails.medical_history_summary || 'N/A'}</Typography>
        </Box>
         <Box mb={2}>
          <Typography variant="h6">Owner ID:</Typography>
          <Typography>{patientDetails.ownerId}</Typography>
        </Box>
      </Paper>
      <Button variant="outlined" component={RouterLink} to="/patients" sx={{mt: 2, mr: 1}}>
        Back to List
      </Button>
      <Button variant="contained" component={RouterLink} to={`/patients/${id}/edit`} sx={{mt: 2}}> {/* Assuming edit route */}
        Edit Patient
      </Button>
    </Container>
  );
};

export default PatientDetailPage;
