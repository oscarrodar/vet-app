import { format, addDays, setHours, setMinutes } from 'date-fns';

// Helper to create date objects easily
const createDateTime = (date, hour, minute) => format(setMinutes(setHours(date, hour), minute), "yyyy-MM-dd'T'HH:mm:ss");

export const mockAppointments = [
  {
    id: '1',
    patientName: 'Buddy (Dog)', // For display, ideally link to patient object
    patientId: '1',
    time: createDateTime(new Date(), 10, 0), // Today at 10:00 AM
    type: 'Checkup'
  },
  {
    id: '2',
    patientName: 'Lucy (Cat)',
    patientId: '2',
    time: createDateTime(new Date(), 14, 0), // Today at 2:00 PM
    type: 'Vaccination'
  },
  {
    id: '3',
    patientName: 'Charlie (Bird)',
    patientId: '3',
    time: createDateTime(addDays(new Date(), 1), 11, 30), // Tomorrow at 11:30 AM
    type: 'Grooming'
  },
  {
    id: '4',
    patientName: 'Buddy (Dog)', // Example of same patient, different appointment
    patientId: '1',
    time: createDateTime(addDays(new Date(), 2), 9, 0), // Day after tomorrow at 9:00 AM
    type: 'Dental Cleaning'
  },
  {
    id: '5',
    patientName: 'Lucy (Cat)',
    patientId: '2',
    time: createDateTime(addDays(new Date(), 2), 16, 0), // Day after tomorrow at 4:00 PM
    type: 'Follow-up'
  },
   {
    id: '6',
    patientName: 'Max (New Dog)', // A patient not in the initial mockPatients list
    patientId: 'new_dog_123',
    time: createDateTime(addDays(new Date(), 3), 10, 0),
    type: 'First Visit'
  },
];
