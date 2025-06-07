import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Appbar, Card, Title, Paragraph, Button, Divider, List } from 'react-native-paper';
import { getMockPatientById, mockPatients } from '../data/mockPatients'; // Import mock data utilities

const PatientDetailsScreen = ({ route, navigation }) => {
  const passedPatient = route.params?.patient;
  const patientId = route.params?.patientId || passedPatient?.id;

  // Attempt to get patient from mock data if ID is available,
  // otherwise use passed patient, or fallback to the first mock patient or a default structure.
  let patient;
  if (patientId) {
    patient = getMockPatientById(patientId) || passedPatient;
  } else {
    patient = passedPatient;
  }

  if (!patient) {
    // Fallback if no patient data is available at all (e.g. direct navigation without params)
    patient = mockPatients.length > 0 ? mockPatients[0] : {
      id: 'fallback',
      name: 'Fallback Patient',
      species: 'Unknown',
      ownerName: 'N/A',
      petProfiles: [], medicalHistory: [], photoGallery: [], vaccinationRecords: [], treatmentPlans: []
    };
  }


  return (
    <>
      <ScrollView style={styles.container}>
        <Card style={styles.card}>
          <Card.Content>
            <Title>{patient.name}</Title>
            <Paragraph>Species: {patient.species}</Paragraph>
            <Paragraph>Owner: {patient.ownerName || 'N/A'}</Paragraph>
            {patient.breed && <Paragraph>Breed: {patient.breed}</Paragraph>}
            {patient.age && <Paragraph>Age: {patient.age}</Paragraph>}
          </Card.Content>
          <Card.Actions>
            <Button onPress={() => console.log('Edit basic info')}>Edit Info</Button>
          </Card.Actions>
        </Card>

        <List.Section title="Pet Profiles">
          {patient.petProfiles?.map(profile => (
            <List.Item
              key={profile.id}
              title={profile.name}
              description={`Type: ${profile.type}, Breed: ${profile.breed}, Age: ${profile.age}`}
              left={props => <List.Icon {...props} icon="paw" />}
            />
          ))}
          <Button mode="contained" onPress={() => console.log('Add Pet Profile')} style={styles.addButton}>
            Add Pet Profile
          </Button>
        </List.Section>
        <Divider />

        <List.Section title="Medical History">
          {patient.medicalHistory?.map(entry => (
            <List.Item
              key={entry.id}
              title={entry.description}
              description={`Date: ${entry.date} - Notes: ${entry.notes}`}
              left={props => <List.Icon {...props} icon="medical-bag" />}
            />
          ))}
          <Button mode="contained" onPress={() => console.log('Add Medical History')} style={styles.addButton}>
            Add Medical Record
          </Button>
        </List.Section>
        <Divider />

        <List.Section title="Vaccination Records">
          {patient.vaccinationRecords?.map(record => (
            <List.Item
              key={record.id}
              title={record.vaccine}
              description={`Date: ${record.date}, Next Due: ${record.nextDueDate}`}
              left={props => <List.Icon {...props} icon="needle" />}
            />
          ))}
          <Button mode="contained" onPress={() => console.log('Add Vaccination Record')} style={styles.addButton}>
            Add Vaccination
          </Button>
        </List.Section>
        <Divider />

        <List.Section title="Treatment Plans">
          {patient.treatmentPlans?.map(plan => (
            <List.Item
              key={plan.id}
              title={plan.description}
              description={`Start Date: ${plan.startDate}`}
              left={props => <List.Icon {...props} icon="clipboard-text-outline" />}
            />
          ))}
          <Button mode="contained" onPress={() => console.log('Add Treatment Plan')} style={styles.addButton}>
            Add Treatment Plan
          </Button>
        </List.Section>
        <Divider />

        <List.Section title="Photo Gallery">
          {/* Placeholder for photo gallery - will require image handling */}
          <Paragraph style={styles.placeholderText}>Photo gallery will be implemented here.</Paragraph>
          <Button mode="contained" onPress={() => console.log('Add Photo')} style={styles.addButton}>
            Add Photo
          </Button>
        </List.Section>

      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    margin: 10,
  },
  addButton: {
    margin: 10,
  },
  placeholderText: {
    padding: 10,
    fontStyle: 'italic',
    textAlign: 'center'
  }
});

export default PatientDetailsScreen;
