import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Appbar, TextInput, Button, Card, Title } from 'react-native-paper';
import { Formik } from 'formik';
import * as Yup from 'yup';

const PatientSchema = Yup.object().shape({
  name: Yup.string().required('Required'),
  species: Yup.string().required('Required'),
  ownerName: Yup.string().required('Required'),
  ownerEmail: Yup.string().email('Invalid email'),
  // Add more fields and validation as needed
});

const AddPatientScreen = ({ navigation, route }) => {
  // The route.params.addPatient function will be passed from PatientListScreen
  const { addPatientToList } = route.params;

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Add New Patient" />
      </Appbar.Header>
      <ScrollView style={styles.container}>
        <Card style={styles.card}>
          <Card.Content>
            <Formik
              initialValues={{ name: '', species: '', ownerName: '', ownerEmail: '' }}
              validationSchema={PatientSchema}
              onSubmit={(values, { resetForm }) => {
                const newPatient = {
                  id: String(Date.now() + Math.random()), // Temporary unique ID
                  ...values,
                  // Initialize empty arrays for other details if needed
                  petProfiles: [],
                  medicalHistory: [],
                  photoGallery: [],
                  vaccinationRecords: [],
                  treatmentPlans: []
                };
                addPatientToList(newPatient); // Call the function passed via route params
                resetForm();
                navigation.goBack(); // Go back to the patient list
              }}
            >
              {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                <View>
                  <TextInput
                    label="Patient Name"
                    mode="outlined"
                    onChangeText={handleChange('name')}
                    onBlur={handleBlur('name')}
                    value={values.name}
                    style={styles.input}
                    error={touched.name && errors.name}
                  />
                  {touched.name && errors.name && (
                    <Text style={styles.errorText}>{errors.name}</Text>
                  )}

                  <TextInput
                    label="Species"
                    mode="outlined"
                    onChangeText={handleChange('species')}
                    onBlur={handleBlur('species')}
                    value={values.species}
                    style={styles.input}
                    error={touched.species && errors.species}
                  />
                  {touched.species && errors.species && (
                    <Text style={styles.errorText}>{errors.species}</Text>
                  )}

                  <TextInput
                    label="Owner's Name"
                    mode="outlined"
                    onChangeText={handleChange('ownerName')}
                    onBlur={handleBlur('ownerName')}
                    value={values.ownerName}
                    style={styles.input}
                    error={touched.ownerName && errors.ownerName}
                  />
                  {touched.ownerName && errors.ownerName && (
                    <Text style={styles.errorText}>{errors.ownerName}</Text>
                  )}

                  <TextInput
                    label="Owner's Email (Optional)"
                    mode="outlined"
                    onChangeText={handleChange('ownerEmail')}
                    onBlur={handleBlur('ownerEmail')}
                    value={values.ownerEmail}
                    keyboardType="email-address"
                    style={styles.input}
                    error={touched.ownerEmail && errors.ownerEmail}
                  />
                  {touched.ownerEmail && errors.ownerEmail && (
                    <Text style={styles.errorText}>{errors.ownerEmail}</Text>
                  )}

                  <Button mode="contained" onPress={handleSubmit} style={styles.button}>
                    Add Patient
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

// Need to import Text from react-native for error messages
import { Text } from 'react-native';

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
  errorText: {
    fontSize: 12,
    color: 'red',
    marginLeft: 8,
    marginBottom: 5,
  },
});

export default AddPatientScreen;
