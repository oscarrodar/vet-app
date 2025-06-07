import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card, Title, Paragraph, Button, Appbar } from 'react-native-paper';

const AppointmentDetailScreen = ({ route, navigation }: any) => {
  // In a real app, fetch details based on route.params.appointmentId
  const { appointmentId } = route.params;

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Appointment Details" />
        {/* <Appbar.Action icon="pencil" onPress={() => navigation.navigate('EditAppointment', { appointmentId })} /> */}
      </Appbar.Header>
      <Card style={styles.card}>
        <Card.Content>
          <Title>Appointment Information</Title>
          <Paragraph>ID: {appointmentId}</Paragraph>
          <Paragraph>Patient: Placeholder Patient Name</Paragraph>
          <Paragraph>Veterinarian: Placeholder Vet Name</Paragraph>
          <Paragraph>Date & Time: {new Date().toLocaleString()}</Paragraph>
          <Paragraph>Type: Placeholder Type</Paragraph>
          <Paragraph>Reason: Placeholder Reason</Paragraph>
          <Paragraph>Status: Placeholder Status</Paragraph>
          <Paragraph>Notes: Placeholder Notes</Paragraph>
        </Card.Content>
        <Card.Actions>
          <Button onPress={() => console.log('Edit appointment')}>Edit</Button>
          <Button onPress={() => console.log('Cancel appointment')}>Cancel</Button>
        </Card.Actions>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    margin: 16,
  },
});

export default AppointmentDetailScreen;
