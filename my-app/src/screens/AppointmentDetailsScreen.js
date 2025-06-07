import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, Platform } from 'react-native';
import { Appbar, TextInput, Button, Card, Title, Paragraph, HelperText } from 'react-native-paper';
import { Formik } from 'formik';
import * as Yup from 'yup';
import DateTimePicker from '@react-native-community/datetimepicker'; // For date/time picking
import { format, parseISO, isValid } from 'date-fns'; // For date manipulation

// Validation Schema
const AppointmentSchema = Yup.object().shape({
  patientName: Yup.string().required('Patient name is required'), // Simplified for now
  // patientId: Yup.string().required('Patient ID is required'), // Ideally, select from a list
  appointmentType: Yup.string().required('Appointment type is required'),
  appointmentDate: Yup.date().required('Date is required').min(new Date(), "Cannot book in the past"),
  appointmentTime: Yup.date().required('Time is required'), // Will store as a full Date object then extract time
});

const AppointmentDetailsScreen = ({ route, navigation }) => {
  const { appointment, selectedDate, addAppointmentToList, updateAppointmentInList } = route.params || {};
  const isEditing = !!appointment;

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Initial form values
  const initialValues = {
    patientName: appointment?.patientName || '', // In a real app, this would be an object {id, name}
    // patientId: appointment?.patientId || '',
    appointmentType: appointment?.type || '',
    appointmentDate: appointment?.time ? parseISO(appointment.time) : (selectedDate ? parseISO(selectedDate) : new Date()),
    appointmentTime: appointment?.time ? parseISO(appointment.time) : (selectedDate ? parseISO(selectedDate) : new Date()),
  };

  // Ensure initial dates are valid Date objects
  if (!isValid(initialValues.appointmentDate)) {
    initialValues.appointmentDate = new Date();
  }
  if (!isValid(initialValues.appointmentTime)) {
    initialValues.appointmentTime = new Date(); // Default to now if invalid
  }


  const handleSubmitForm = (values) => {
    const combinedDateTime = new Date(
      values.appointmentDate.getFullYear(),
      values.appointmentDate.getMonth(),
      values.appointmentDate.getDate(),
      values.appointmentTime.getHours(),
      values.appointmentTime.getMinutes()
    );

    const appointmentData = {
      patientName: values.patientName, // This would be patientId in a real scenario
      // patientId: values.patientId,
      type: values.appointmentType,
      time: format(combinedDateTime, "yyyy-MM-dd'T'HH:mm:ss"),
    };

    if (isEditing) {
      // updateAppointmentInList({ ...appointment, ...appointmentData }); // TODO: Implement this callback
      console.log('Updating appointment:', { ...appointment, ...appointmentData });
    } else if (addAppointmentToList) {
      addAppointmentToList(appointmentData);
    }
    navigation.goBack();
  };

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={isEditing ? 'Edit Appointment' : 'Schedule Appointment'} />
      </Appbar.Header>
      <ScrollView style={styles.container}>
        <Card style={styles.card}>
          <Card.Content>
            <Formik
              initialValues={initialValues}
              validationSchema={AppointmentSchema}
              onSubmit={handleSubmitForm}
            >
              {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue }) => (
                <View>
                  <TextInput
                    label="Patient Name" // Should be a picker later
                    mode="outlined"
                    onChangeText={handleChange('patientName')}
                    onBlur={handleBlur('patientName')}
                    value={values.patientName}
                    style={styles.input}
                    error={touched.patientName && !!errors.patientName}
                  />
                  <HelperText type="error" visible={touched.patientName && !!errors.patientName}>
                    {errors.patientName}
                  </HelperText>

                  <TextInput
                    label="Appointment Type"
                    mode="outlined"
                    onChangeText={handleChange('appointmentType')}
                    onBlur={handleBlur('appointmentType')}
                    value={values.appointmentType}
                    style={styles.input}
                    error={touched.appointmentType && !!errors.appointmentType}
                  />
                  <HelperText type="error" visible={touched.appointmentType && !!errors.appointmentType}>
                    {errors.appointmentType}
                  </HelperText>

                  {/* Date Picker */}
                  <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                    <TextInput
                      label="Appointment Date"
                      value={format(values.appointmentDate, 'MMMM d, yyyy')}
                      mode="outlined"
                      editable={false}
                      style={styles.input}
                      error={touched.appointmentDate && !!errors.appointmentDate}
                    />
                  </TouchableOpacity>
                  <HelperText type="error" visible={touched.appointmentDate && !!errors.appointmentDate}>
                    {errors.appointmentDate}
                  </HelperText>
                  {showDatePicker && (
                    <DateTimePicker
                      value={values.appointmentDate}
                      mode="date"
                      display="default"
                      onChange={(event, selected) => {
                        setShowDatePicker(false);
                        if (selected) {
                          setFieldValue('appointmentDate', selected);
                        }
                      }}
                      minimumDate={new Date()} // Optional: prevent past dates
                    />
                  )}

                  {/* Time Picker */}
                  <TouchableOpacity onPress={() => setShowTimePicker(true)}>
                    <TextInput
                      label="Appointment Time"
                      value={format(values.appointmentTime, 'p')} // e.g., 2:00 PM
                      mode="outlined"
                      editable={false}
                      style={styles.input}
                      error={touched.appointmentTime && !!errors.appointmentTime}
                    />
                  </TouchableOpacity>
                  <HelperText type="error" visible={touched.appointmentTime && !!errors.appointmentTime}>
                    {errors.appointmentTime}
                  </HelperText>
                  {showTimePicker && (
                    <DateTimePicker
                      value={values.appointmentTime}
                      mode="time"
                      display="default"
                      onChange={(event, selected) => {
                        setShowTimePicker(false);
                        if (selected) {
                          setFieldValue('appointmentTime', selected);
                        }
                      }}
                    />
                  )}

                  <Button mode="contained" onPress={handleSubmit} style={styles.button}>
                    {isEditing ? 'Save Changes' : 'Schedule Appointment'}
                  </Button>
                </View>
              )}
            </Formik>
          </Card.Content>
        </Card>
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
    padding: 8,
  },
  input: {
    marginBottom: 10,
  },
  button: {
    marginTop: 10,
  },
});

export default AppointmentDetailsScreen;
