import React from 'react';
import { Typography, Container, List, ListItem, ListItemText, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const PatientListPage: React.FC = () => {
  // Placeholder data
  const patients = [
    { id: '1', name: 'Buddy', species: 'Dog' },
    { id: '2', name: 'Lucy', species: 'Dog' },
    { id: '3', name: 'Whiskers', species: 'Cat' },
  ];

  return (
    <Container>
      <Typography variant="h4" gutterBottom sx={{mt: 2}}>
        Patient List
      </Typography>
      <Button variant="contained" component={RouterLink} to="/patients/new" sx={{mb: 2}}> {/* Assuming a route for new patient */}
        Add New Patient
      </Button>
      <List>
        {patients.map((patient) => (
          <ListItem
            key={patient.id}
            button
            component={RouterLink}
            to={`/patients/${patient.id}`}
            divider
          >
            <ListItemText primary={patient.name} secondary={patient.species} />
          </ListItem>
        ))}
      </List>
    </Container>
  );
};

export default PatientListPage;
