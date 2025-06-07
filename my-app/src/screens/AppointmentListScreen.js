import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Appbar, List, Divider, Card, FAB } from 'react-native-paper';
import { Calendar, Agenda } from 'react-native-calendars';
import { format, parseISO, addDays } from 'date-fns'; // For date manipulation
import { mockAppointments as importedMockAppointments } from '../data/mockAppointments'; // Import and alias mock data

// Function to get today's date in 'YYYY-MM-DD' format
const getTodayDateString = () => format(new Date(), 'yyyy-MM-dd');

const AppointmentListScreen = ({ navigation }) => {
  const [selectedDate, setSelectedDate] = useState(getTodayDateString());
  const [appointments, setAppointments] = useState(importedMockAppointments); // Use imported mock data

  const onDayPress = (day) => {
    setSelectedDate(day.dateString);
  };

  const appointmentsForSelectedDate = useMemo(() => {
    return appointments.filter(appt => format(parseISO(appt.time), 'yyyy-MM-dd') === selectedDate);
  }, [appointments, selectedDate]);

  const markedDates = useMemo(() => {
    const marks = {};
    appointments.forEach(appt => {
      const date = format(parseISO(appt.time), 'yyyy-MM-dd');
      if (!marks[date]) {
        marks[date] = { marked: true, dotColor: 'blue' };
      }
    });
    if (marks[selectedDate]) {
      marks[selectedDate] = { ...marks[selectedDate], selected: true, selectedColor: 'blue' };
    } else {
      marks[selectedDate] = { selected: true, selectedColor: 'blue' };
    }
    return marks;
  }, [appointments, selectedDate]);

  const addAppointmentToList = (newAppointment) => {
    setAppointments(prev => [...prev, {
        id: String(Date.now() + Math.random()),
        ...newAppointment,
    }]);
  };

  const navigateToAppointmentDetails = (appointment) => {
    navigation.navigate('AppointmentDetails', { appointment: appointment });
  };

  const navigateToScheduleNew = () => {
    navigation.navigate('AppointmentDetails', {
        selectedDate: selectedDate, // Pass selected date to prefill in new appointment screen
        addAppointmentToList: addAppointmentToList
    });
  };

  const renderAppointmentItem = ({ item }) => (
    <TouchableOpacity onPress={() => navigateToAppointmentDetails(item)}>
      <Card style={styles.appointmentCard}>
        <Card.Content>
          <Text style={styles.patientName}>{item.patientName}</Text>
          <Text>Time: {format(parseISO(item.time), 'p')} ({item.type})</Text>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  return (
    <>
      {/* Appbar can be part of the screen options in AppNavigator if preferred */}
      {/* <Appbar.Header>
        <Appbar.Content title="Appointments" />
      </Appbar.Header> */}

      <Calendar
        current={selectedDate}
        onDayPress={onDayPress}
        markedDates={markedDates}
        monthFormat={'yyyy MMMM'}
        theme={{
          todayTextColor: 'blue',
          arrowColor: 'blue',
        }}
        style={styles.calendar}
      />

      <Text style={styles.listHeader}>Appointments for {format(parseISO(selectedDate), 'MMMM d, yyyy')}:</Text>

      {appointmentsForSelectedDate.length > 0 ? (
        <FlatList
          data={appointmentsForSelectedDate}
          renderItem={renderAppointmentItem}
          keyExtractor={item => item.id}
          style={styles.list}
        />
      ) : (
        <View style={styles.noAppointmentsContainer}>
          <Text>No appointments scheduled for this day.</Text>
        </View>
      )}

      <FAB
        style={styles.fab}
        icon="plus"
        label="New Appointment"
        onPress={navigateToScheduleNew}
      />
    </>
  );
};

const styles = StyleSheet.create({
  calendar: {
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
    // marginBottom: 10, // Add some space below the calendar
  },
  listHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    padding: 15,
    backgroundColor: '#f0f0f0', // Light background for header
  },
  appointmentCard: {
    marginHorizontal: 10,
    marginVertical: 5,
  },
  patientName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  list: {
    flex: 1, // Ensure list takes available space
  },
  noAppointmentsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default AppointmentListScreen;
