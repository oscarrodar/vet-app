import React, { useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { List, FAB, Appbar, Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import { mockPatients } from '../data/mockPatients'; // Import mock data

const PatientListScreen = ({ navigation }) => {
  const [patients, setPatients] = useState(mockPatients); // Use imported mock data

  const navigateToPatientDetails = (patient) => {
    // Pass the whole patient object, or just ID if fetching full data in details screen
    navigation.navigate('PatientDetails', { patient: patient });
  };

  // Callback function to add a new patient to the list
  const addPatientToList = (newPatient) => {
    setPatients(prevPatients => [...prevPatients, newPatient]);
  };

  const navigateToAddPatient = () => {
    navigation.navigate('AddPatient', { addPatientToList: addPatientToList });
  };

  const renderPatientItem = ({ item }) => (
    <List.Item
      title={item.name}
      description={`Species: ${item.species} - Owner: ${item.ownerName}`}
      left={props => <List.Icon {...props} icon="paw" />} // Changed icon
      onPress={() => navigateToPatientDetails(item)}
    />
  );

  return (
    <>
      {/* Appbar removed as it's part of AppNavigator's screen options now if needed */}
      <FlatList
        data={patients}
        renderItem={renderPatientItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
      />
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={navigateToAddPatient}
      />
    </>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: DefaultTheme.colors.primary, // Example color
  },
  listContent: {
    paddingBottom: 80, // Ensure FAB doesn't overlap last item
  }
});

// Note: No PaperProvider here, it's in App.js
export default PatientListScreen;
