import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Text, List, Button, Appbar } from 'react-native-paper';

// Define a type for your patient data for clarity
type Patient = {
  id: string;
  name: string;
  species: string;
};

const PatientListScreen = ({ navigation }: any) => { // Add navigation prop
  // Placeholder data
  const patients: Patient[] = [
    { id: '1', name: 'Buddy Mobile', species: 'Dog' },
    { id: '2', name: 'Lucy Mobile', species: 'Dog' },
    { id: '3', name: 'Whiskers Mobile', species: 'Cat' },
  ];

  const renderItem = ({ item }: { item: Patient }) => (
    <List.Item
      title={item.name}
      description={item.species}
      onPress={() => navigation.navigate('PatientDetail', { patientId: item.id, patientName: item.name })} // Navigate to detail
      left={props => <List.Icon {...props} icon="paw" />}
    />
  );

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="Patients" />
        {/* <Appbar.Action icon="plus" onPress={() => navigation.navigate('CreatePatient')} /> */}
      </Appbar.Header>
      <Button
        mode="contained"
        onPress={() => console.log('Add new patient')}
        style={styles.button}
      >
        Add New Patient
      </Button>
      <FlatList
        data={patients}
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

export default PatientListScreen;
