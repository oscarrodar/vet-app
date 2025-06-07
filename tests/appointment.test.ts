import request from 'supertest';
import app from '../src/app';
import { PrismaClient, User, Client, Patient, Appointment, UserRole as PrismaUserRole, AppointmentStatus } from '@prisma/client';
import { UserRole as AppUserRole } from '../src/models/userRoles';
import { generateToken, JwtPayload } from '../src/utils/jwtUtils';

const prisma = new PrismaClient();

describe('Appointment Endpoints', () => {
  let server: any;
  let adminUser: User, vetUser: User, receptionistUser: User;
  let adminToken: string, vetToken: string, receptionistToken: string;
  let testClient: Client;
  let testPatient: Patient;

  beforeAll(async () => {
    // Clear database in specific order due to foreign key constraints
    await prisma.appointment.deleteMany({});
    await prisma.patient.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.client.deleteMany({});

    adminUser = await prisma.user.create({
      data: { email: 'admin.appt@example.com', name: 'Admin Appt User', password: 'password', role: PrismaUserRole.ADMIN },
    });
    vetUser = await prisma.user.create({
      data: { email: 'vet.appt@example.com', name: 'Vet Appt User', password: 'password', role: PrismaUserRole.VETERINARIAN },
    });
    receptionistUser = await prisma.user.create({
      data: { email: 'receptionist.appt@example.com', name: 'Receptionist Appt User', password: 'password', role: PrismaUserRole.RECEPTIONIST },
    });

    testClient = await prisma.client.create({
      data: { email: 'client.appt@example.com', name: 'Test Client Appt' },
    });
    testPatient = await prisma.patient.create({
      data: { name: 'Fluffy', species: 'Cat', age: 2, ownerId: testClient.id, breed: 'Persian' }
    });

    const adminPayload: JwtPayload = { userId: adminUser.id, email: adminUser.email, role: AppUserRole.ADMIN };
    adminToken = generateToken(adminPayload);
    const vetPayload: JwtPayload = { userId: vetUser.id, email: vetUser.email, role: AppUserRole.VETERINARIAN };
    vetToken = generateToken(vetPayload);
    const receptionistPayload: JwtPayload = { userId: receptionistUser.id, email: receptionistUser.email, role: AppUserRole.RECEPTIONIST };
    receptionistToken = generateToken(receptionistPayload);

    server = app.listen(process.env.TEST_PORT_APPOINTMENT || 3003);
  });

  afterAll(async () => {
    await prisma.appointment.deleteMany({});
    await prisma.patient.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.client.deleteMany({});
    await prisma.$disconnect();
    if (server) server.close();
  });

  let appointmentId: string;

  describe('POST /api/appointments', () => {
    it('should create a new appointment with vet token', async () => {
      const newAppointmentData = {
        patientId: testPatient.id,
        userId: vetUser.id, // Vet is assigned to the appointment
        appointmentDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        reason: 'Annual Checkup',
        type: 'CHECKUP',
        status: AppointmentStatus.SCHEDULED,
      };
      const response = await request(server)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${vetToken}`)
        .send(newAppointmentData);
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      appointmentId = response.body.id; // Save for later tests
      expect(response.body.patientId).toBe(newAppointmentData.patientId);
      expect(response.body.userId).toBe(newAppointmentData.userId);
      expect(response.body.status).toBe(AppointmentStatus.SCHEDULED);
    });

    it('should fail if patient does not exist', async () => {
        const newAppointmentData = {
            patientId: 'nonexistent-patient-id',
            userId: vetUser.id,
            appointmentDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
            reason: 'Checkup',
        };
        const response = await request(server)
            .post('/api/appointments')
            .set('Authorization', `Bearer ${receptionistToken}`)
            .send(newAppointmentData);
        expect(response.status).toBe(500); // Assuming service throws a generic error
        expect(response.body.message).toContain('Patient with ID nonexistent-patient-id not found.');
    });

    it('should fail if vet (user) is double-booked', async () => {
        const conflictingAppointmentData = {
            patientId: testPatient.id,
            userId: vetUser.id, // Same vet
            appointmentDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Same time as first appointment
            reason: 'Emergency',
        };
        const response = await request(server)
            .post('/api/appointments')
            .set('Authorization', `Bearer ${adminToken}`)
            .send(conflictingAppointmentData);
        expect(response.status).toBe(500);
        expect(response.body.message).toContain(`User ${vetUser.id} already has an appointment scheduled around this time (within the same minute).`);
    });
  });

  describe('GET /api/appointments', () => {
    it('should get a list of appointments with receptionist token', async () => {
      const response = await request(server)
        .get('/api/appointments')
        .set('Authorization', `Bearer ${receptionistToken}`);
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('should filter appointments by patientId', async () => {
        const response = await request(server)
          .get(`/api/appointments?patientId=${testPatient.id}`)
          .set('Authorization', `Bearer ${vetToken}`);
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body.data)).toBe(true);
        response.body.data.forEach((appt: Appointment) => {
            expect(appt.patientId).toBe(testPatient.id);
        });
    });

    it('should filter appointments by date range', async () => {
      // Create appointments for different dates
      const dateTodayISO = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const dateTomorrow = new Date();
      dateTomorrow.setDate(dateTomorrow.getDate() + 1);
      const dateTomorrowISO = dateTomorrow.toISOString().split('T')[0];

      // This appointment (appointmentId) is already created for "tomorrow" (relative to test run start)
      // Let's create one for today for vetUser and testPatient
      await prisma.appointment.create({
        data: {
          patientId: testPatient.id,
          userId: vetUser.id,
          appointmentDate: new Date(dateTodayISO + 'T10:00:00Z'), // Today 10 AM
          reason: 'Follow-up Today',
          status: AppointmentStatus.SCHEDULED,
        },
      });

      const response = await request(server)
        .get(`/api/appointments?dateFrom=${dateTodayISO}&dateTo=${dateTodayISO}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(1);
      response.body.data.forEach((appt: any) => {
        expect(new Date(appt.appointmentDate).toISOString().split('T')[0]).toBe(dateTodayISO);
      });
    });

    it('should sort appointments by patient name ascending', async () => {
      // Create another patient and appointment for sorting
      const anotherClient = await prisma.client.create({ data: { name: 'Another Client ApptSort', email: 'csort.appt@example.com'}});
      const patientAlpha = await prisma.patient.create({ data: { name: 'Alpha Pet', species: 'Dog', age: 1, ownerId: anotherClient.id }});
      await prisma.appointment.create({
          data: { patientId: patientAlpha.id, userId: vetUser.id, appointmentDate: new Date(), reason: 'Alpha Pet Appt'}
      });

      const response = await request(server)
        .get('/api/appointments?sortBy=patientName&sortOrder=asc')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);
      for (let i = 0; i < response.body.data.length - 1; i++) {
        expect(response.body.data[i].patient.name.localeCompare(response.body.data[i+1].patient.name)).toBeLessThanOrEqual(0);
      }
    });

    it('should sort appointments by vet name descending', async () => {
        // Create another vet and appointment for sorting
        const anotherVet = await prisma.user.create({data: { name: 'Zulu Vet', email: 'zvetsort.appt@example.com', password: 'pw', role: PrismaUserRole.VETERINARIAN }});
        await prisma.appointment.create({
            data: { patientId: testPatient.id, userId: anotherVet.id, appointmentDate: new Date(), reason: 'Zulu Vet Appt'}
        });

        const response = await request(server)
          .get('/api/appointments?sortBy=vetName&sortOrder=desc')
          .set('Authorization', `Bearer ${adminToken}`);
        expect(response.status).toBe(200);
        expect(response.body.data.length).toBeGreaterThanOrEqual(2);
        for (let i = 0; i < response.body.data.length - 1; i++) {
          expect(response.body.data[i].user.name.localeCompare(response.body.data[i+1].user.name)).toBeGreaterThanOrEqual(0);
        }
      });

    it('should return 400 for invalid sortBy parameter for appointments', async () => {
        const response = await request(server)
            .get('/api/appointments?sortBy=invalidSortKey')
            .set('Authorization', `Bearer ${vetToken}`);
        expect(response.status).toBe(400);
        expect(response.body.message).toContain('Invalid sortBy parameter.');
    });

  });

  describe('GET /api/appointments/:id', () => {
    it('should get a specific appointment by ID with admin token', async () => {
        const response = await request(server)
          .get(`/api/appointments/${appointmentId}`)
          .set('Authorization', `Bearer ${adminToken}`);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('id', appointmentId);
    });

    it('should return 404 for non-existent appointment ID', async () => {
        const response = await request(server)
          .get('/api/appointments/nonexistent-appointment-id')
          .set('Authorization', `Bearer ${adminToken}`);
        expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/appointments/:id', () => {
    it('should update an appointment status with vet token', async () => {
        const updates = { status: AppointmentStatus.CONFIRMED, notes: "Patient confirmed via phone." };
        const response = await request(server)
            .put(`/api/appointments/${appointmentId}`)
            .set('Authorization', `Bearer ${vetToken}`)
            .send(updates);
        expect(response.status).toBe(200);
        expect(response.body.status).toBe(AppointmentStatus.CONFIRMED);
        expect(response.body.notes).toBe(updates.notes);
    });

    it('should return 404 when trying to update non-existent appointment', async () => {
        const updates = { status: AppointmentStatus.CANCELLED };
        const response = await request(server)
            .put('/api/appointments/nonexistent-id-for-update')
            .set('Authorization', `Bearer ${adminToken}`)
            .send(updates);
        expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/appointments/:id', () => {
    it('should delete an appointment with admin token', async () => {
        const response = await request(server)
            .delete(`/api/appointments/${appointmentId}`)
            .set('Authorization', `Bearer ${adminToken}`);
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Appointment deleted successfully');

        // Verify appointment is actually deleted
        const findResponse = await request(server)
            .get(`/api/appointments/${appointmentId}`)
            .set('Authorization', `Bearer ${adminToken}`);
        expect(findResponse.status).toBe(404);
    });

    it('should return 404 when trying to delete non-existent appointment', async () => {
        const response = await request(server)
            .delete('/api/appointments/nonexistent-id-for-delete')
            .set('Authorization', `Bearer ${adminToken}`);
        expect(response.status).toBe(404);
    });
  });
});
