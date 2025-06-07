import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import PatientListScreen from '../screens/PatientListScreen';
import PatientDetailsScreen from '../screens/PatientDetailsScreen';
import AddPatientScreen from '../screens/AddPatientScreen';
import AppointmentListScreen from '../screens/AppointmentListScreen';
import AppointmentDetailsScreen from '../screens/AppointmentDetailsScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="PatientList">
        <Stack.Screen
          name="PatientList"
          component={PatientListScreen}
          options={{ title: 'Patients' }}
        />
        <Stack.Screen
          name="PatientDetails"
          component={PatientDetailsScreen}
          options={{ title: 'Patient Details' }}
        />
        <Stack.Screen
          name="AddPatient"
          component={AddPatientScreen}
          options={{ title: 'Add New Patient' }}
        />
        <Stack.Screen
          name="AppointmentList"
          component={AppointmentListScreen}
          options={{ title: 'Appointments' }}
        />
        <Stack.Screen
          name="AppointmentDetails"
          component={AppointmentDetailsScreen}
          options={{ title: 'Appointment Details' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
