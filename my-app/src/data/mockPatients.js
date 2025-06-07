import { format, addDays, subDays } from 'date-fns';

export const mockPatients = [
  {
    id: '1',
    name: 'Buddy',
    species: 'Dog',
    breed: 'Golden Retriever',
    age: 5,
    ownerName: 'John Doe',
    ownerEmail: 'john.doe@example.com',
    petProfiles: [{ id: 'p1_1', name: 'Buddy', type: 'Dog', breed: 'Golden Retriever', age: 5, photoUrl: null }],
    medicalHistory: [
      { id: 'mh1_1', date: format(subDays(new Date(), 30), 'yyyy-MM-dd'), description: 'Annual Checkup', notes: 'All clear, recommended dental cleaning.'},
      { id: 'mh1_2', date: format(subDays(new Date(), 150), 'yyyy-MM-dd'), description: 'Vaccination', notes: 'Administered DHPP booster.'}
    ],
    photoGallery: [],
    vaccinationRecords: [
      {id: 'v1_1', vaccine: 'Rabies', date: format(subDays(new Date(), 365), 'yyyy-MM-dd'), nextDueDate: format(addDays(subDays(new Date(), 365), 365*3), 'yyyy-MM-dd')},
      {id: 'v1_2', vaccine: 'DHPP', date: format(subDays(new Date(), 150), 'yyyy-MM-dd'), nextDueDate: format(addDays(subDays(new Date(), 150), 365), 'yyyy-MM-dd')}
    ],
    treatmentPlans: [
      {id: 't1_1', startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'), description: 'Monthly Flea and Tick Prevention'}
    ]
  },
  {
    id: '2',
    name: 'Lucy',
    species: 'Cat',
    breed: 'Siamese',
    age: 3,
    ownerName: 'Jane Smith',
    ownerEmail: 'jane.smith@example.com',
    petProfiles: [{ id: 'p2_1', name: 'Lucy', type: 'Cat', breed: 'Siamese', age: 3, photoUrl: null }],
    medicalHistory: [
      { id: 'mh2_1', date: format(subDays(new Date(), 60), 'yyyy-MM-dd'), description: 'Spaying Procedure', notes: 'Successful, recovery normal.'},
    ],
    photoGallery: [],
    vaccinationRecords: [
      {id: 'v2_1', vaccine: 'FVRCP', date: format(subDays(new Date(), 300), 'yyyy-MM-dd'), nextDueDate: format(addDays(subDays(new Date(), 300), 365), 'yyyy-MM-dd')},
      {id: 'v2_2', vaccine: 'Rabies', date: format(subDays(new Date(), 300), 'yyyy-MM-dd'), nextDueDate: format(addDays(subDays(new Date(), 300), 365*3), 'yyyy-MM-dd')}
    ],
    treatmentPlans: []
  },
  {
    id: '3',
    name: 'Charlie',
    species: 'Bird',
    breed: 'Parakeet',
    age: 1,
    ownerName: 'Alice Brown',
    ownerEmail: 'alice.brown@example.com',
    petProfiles: [{ id: 'p3_1', name: 'Charlie', type: 'Bird', breed: 'Parakeet', age: 1, photoUrl: null }],
    medicalHistory: [],
    photoGallery: [],
    vaccinationRecords: [],
    treatmentPlans: []
  },
];

export const getMockPatientById = (id) => mockPatients.find(p => p.id === id);
