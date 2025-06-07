import React from 'react';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './screens/LoginScreen';
import PatientListScreen from './screens/PatientListScreen';
import PatientDetailScreen from './screens/PatientDetailScreen';
import AppointmentListScreen from './screens/AppointmentListScreen';
import AppointmentDetailScreen from './screens/AppointmentDetailScreen';

// Define your navigation stack
const Stack = createStackNavigator();

// Define a theme for React Native Paper (optional)
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#6200ee',
    accent: '#03dac4',
  },
};

// A placeholder for a combined Home/Dashboard screen that might show links or tabs
const HomeScreen = ({ navigation }: any) => (
  // For now, let's just make PatientList the "home" after login
  // In a real app, this might be a tab navigator or a dashboard screen
  <PatientListScreen navigation={navigation} />
);

// This would be your main navigator after login
function MainAppStack() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false // Headers are managed within each screen using Appbar.Header
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="PatientList" component={PatientListScreen} />
      <Stack.Screen name="PatientDetail" component={PatientDetailScreen} />
      <Stack.Screen name="AppointmentList" component={AppointmentListScreen} />
      <Stack.Screen name="AppointmentDetail" component={AppointmentDetailScreen} />
      {/* Add other screens like Create/Edit Patient/Appointment here */}
    </Stack.Navigator>
  );
}


export default function App() {
  // Placeholder for auth state
  const [isLoggedIn, setIsLoggedIn] = React.useState(true); // Default to true for now to see main app

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {isLoggedIn ? (
            <Stack.Screen name="MainApp" component={MainAppStack} />
          ) : (
            <Stack.Screen name="Login" component={LoginScreen} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
