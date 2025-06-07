import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Text, List, Button, Appbar } from 'react-native-paper';

// Define a type for appointment data
type Appointment = {
  id: string;
  patientName: string;
  vetName: string;
  date: string; // ISO string
  reason: string;
};

const AppointmentListScreen = ({ navigation }: any) => {
  // Placeholder data
  const appointments: Appointment[] = [
    { id: '1', patientName: 'Buddy Mobile', vetName: 'Dr. Mobile Vet', date: new Date().toISOString(), reason: 'Mobile Checkup' },
    { id: '2', patientName: 'Lucy Mobile', vetName: 'Dr. Mobile Vet', date: new Date(Date.now() + 3600000).toISOString(), reason: 'Mobile Vaccination' },
  ];

  const renderItem = ({ item }: { item: Appointment }) => (
    <List.Item
      title={`${item.patientName} with ${item.vetName}`}
      description={`Reason: ${item.reason}\nDate: ${new Date(item.date).toLocaleString()}`}
      onPress={() => navigation.navigate('AppointmentDetail', { appointmentId: item.id })}
      left={props => <List.Icon {...props} icon="calendar-clock" />}
    />
  );

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="Appointments" />
        {/* <Appbar.Action icon="plus" onPress={() => navigation.navigate('CreateAppointment')} /> */}
      </Appbar.Header>
      <Button
        mode="contained"
        onPress={() => console.log('Schedule new appointment')}
        style={styles.button}
      >
        Schedule New Appointment
      </Button>
      <FlatList
        data={appointments}
        renderItem={renderItem}
        keyExtractor={item => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  button: {
    margin: 16,
  }
});

export default AppointmentListScreen;
