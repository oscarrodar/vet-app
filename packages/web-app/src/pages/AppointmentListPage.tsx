import React from 'react';
import { Typography, Container, List, ListItem, ListItemText, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const AppointmentListPage: React.FC = () => {
  // Placeholder data
  const appointments = [
    { id: '1', patientName: 'Buddy', vetName: 'Dr. Smith', date: '2024-07-15T10:00:00Z', reason: 'Checkup' },
    { id: '2', patientName: 'Lucy', vetName: 'Dr. Jones', date: '2024-07-15T11:00:00Z', reason: 'Vaccination' },
  ];

  return (
    <Container>
      <Typography variant="h4" gutterBottom sx={{mt: 2}}>
        Appointment List
      </Typography>
      <Button variant="contained" component={RouterLink} to="/appointments/new" sx={{mb: 2}}> {/* Assuming a route for new appointment */}
        Schedule New Appointment
      </Button>
      <List>
        {appointments.map((appt) => (
          <ListItem
            key={appt.id}
            button
            component={RouterLink}
            to={`/appointments/${appt.id}`}
            divider
          >
            <ListItemText
              primary={`Patient: ${appt.patientName} with ${appt.vetName}`}
              secondary={`Date: ${new Date(appt.date).toLocaleString()} - Reason: ${appt.reason}`}
            />
          </ListItem>
        ))}
      </List>
    </Container>
  );
};

export default AppointmentListPage;
