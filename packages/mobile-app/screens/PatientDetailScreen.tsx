import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card, Title, Paragraph, Button, Appbar } from 'react-native-paper';

const PatientDetailScreen = ({ route, navigation }: any) => { // Add route and navigation props
  // In a real app, fetch details based on route.params.patientId
  const { patientId, patientName } = route.params;

  return (
    <View style={styles.container}>
       <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={patientName || "Patient Details"} />
        {/* <Appbar.Action icon="pencil" onPress={() => navigation.navigate('EditPatient', { patientId })} /> */}
      </Appbar.Header>
      <Card style={styles.card}>
        <Card.Content>
          <Title>Patient Information</Title>
          <Paragraph>ID: {patientId}</Paragraph>
          <Paragraph>Name: {patientName || 'N/A'}</Paragraph>
          <Paragraph>Species: Placeholder Species</Paragraph>
          <Paragraph>Breed: Placeholder Breed</Paragraph>
          <Paragraph>Age: Placeholder Age</Paragraph>
          <Paragraph>Weight: Placeholder Weight kg</Paragraph>
          <Paragraph>Medical History: Placeholder Summary</Paragraph>
        </Card.Content>
        <Card.Actions>
          <Button onPress={() => console.log('Edit patient')}>Edit</Button>
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

export default PatientDetailScreen;
