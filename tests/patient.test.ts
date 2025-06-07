import request from 'supertest';
import app from '../src/app';
import { PrismaClient, User, Client, UserRole as PrismaUserRole } from '@prisma/client';
import { UserRole as AppUserRole } from '../src/models/userRoles';
import { generateToken, JwtPayload } from '../src/utils/jwtUtils';

const prisma = new PrismaClient();

describe('Patient Endpoints', () => {
  let server: any;
  let adminUser: User, vetUser: User, receptionistUser: User;
  let adminToken: string, vetToken: string, receptionistToken: string;
  let testClient: Client;

  beforeAll(async () => {
    await prisma.appointment.deleteMany({});
    await prisma.patient.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.client.deleteMany({});

    adminUser = await prisma.user.create({
      data: { email: 'admin.patient@example.com', name: 'AdminP User', password: 'password', role: PrismaUserRole.ADMIN },
    });
    vetUser = await prisma.user.create({
      data: { email: 'vet.patient@example.com', name: 'VetP User', password: 'password', role: PrismaUserRole.VETERINARIAN },
    });
    receptionistUser = await prisma.user.create({
        data: { email: 'receptionist.patient@example.com', name: 'ReceptionistP User', password: 'password', role: PrismaUserRole.RECEPTIONIST },
    });

    testClient = await prisma.client.create({
      data: { email: 'client.patient@example.com', name: 'Test ClientP' },
    });

    const adminPayload: JwtPayload = { userId: adminUser.id, email: adminUser.email, role: AppUserRole.ADMIN };
    adminToken = generateToken(adminPayload);
    const vetPayload: JwtPayload = { userId: vetUser.id, email: vetUser.email, role: AppUserRole.VETERINARIAN };
    vetToken = generateToken(vetPayload);
    const receptionistPayload: JwtPayload = { userId: receptionistUser.id, email: receptionistUser.email, role: AppUserRole.RECEPTIONIST };
    receptionistToken = generateToken(receptionistPayload);

    server = app.listen(process.env.TEST_PORT_PATIENT || 3002);
  });

  afterAll(async () => {
    await prisma.appointment.deleteMany({});
    await prisma.patient.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.client.deleteMany({});
    await prisma.$disconnect();
    if (server) server.close();
  });

  describe('POST /api/patients', () => {
    it('should create a new patient with receptionist token', async () => {
      const newPatientData = {
        name: 'Buddy', species: 'Dog', age: 5, ownerId: testClient.id, breed: 'Golden Retriever', weight: 30,
      };
      const response = await request(server)
        .post('/api/patients')
        .set('Authorization', `Bearer ${receptionistToken}`)
        .send(newPatientData);
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(newPatientData.name);
      expect(response.body.ownerId).toBe(testClient.id);
    });

    it('should fail to create patient if owner does not exist', async () => {
        const newPatientData = {
          name: 'Ghost', species: 'Dog', age: 3, ownerId: 'nonexistent-client-id', breed: 'Direwolf',
        };
        const response = await request(server)
          .post('/api/patients')
          .set('Authorization', `Bearer ${vetToken}`) // Corrected: Template literal for vetToken
          .send(newPatientData);
        expect(response.status).toBe(500); // Service layer throws error, controller sends 500
        expect(response.body.message).toContain('Client with ID nonexistent-client-id not found');
      });

    it('should fail to create patient with same name for same owner', async () => {
        // Buddy was created for testClient already
        const newPatientData = { name: 'Buddy', species: 'Cat', age: 2, ownerId: testClient.id };
        const response = await request(server)
            .post('/api/patients')
            .set('Authorization', `Bearer ${vetToken}`)
            .send(newPatientData);
        expect(response.status).toBe(500); // Prisma P2002 error caught by service
        expect(response.body.message).toContain('Patient with name "Buddy" already exists for this owner.');
    });
  });

  describe('GET /api/patients', () => {
    let patientId: string;
    beforeAll(async () => {
        // Create a patient first to ensure there's data to GET
        const patient = await prisma.patient.create({
            data: { name: 'Lucy', species: 'Dog', age: 3, ownerId: testClient.id, breed: 'Beagle' }
        });
        patientId = patient.id;
    });

    it('should get a list of patients with vet token', async () => {
      const response = await request(server)
        .get('/api/patients')
        .set('Authorization', `Bearer ${vetToken}`);
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(1); // Buddy and Lucy
    });

    it('should get a specific patient by ID with admin token', async () => {
        const response = await request(server)
          .get(`/api/patients/${patientId}`)
          .set('Authorization', `Bearer ${adminToken}`);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('id', patientId);
        expect(response.body.name).toBe('Lucy');
      });

    it('should return 404 for non-existent patient ID', async () => {
        const response = await request(server)
          .get('/api/patients/nonexistent-patient-id')
          .set('Authorization', `Bearer ${adminToken}`);
        expect(response.status).toBe(404);
    });

    it('should filter patients by species (Dog)', async () => {
      // Assuming 'Buddy' and 'Lucy' are Dogs, and 'Whiskers' (created in previous test) is a Cat
      // Let's ensure 'Whiskers' exists for this test or create another cat.
      await prisma.patient.create({
        data: { name: 'WhiskersTest', species: 'Cat', age: 1, ownerId: testClient.id }
      });
      const response = await request(server)
        .get('/api/patients?species=Dog')
        .set('Authorization', `Bearer ${vetToken}`);
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThanOrEqual(2); // Buddy, Lucy
      response.body.data.forEach((patient: any) => {
        expect(patient.species.toLowerCase()).toContain('dog');
      });
    });

    it('should sort patients by name ascending', async () => {
      const response = await request(server)
        .get('/api/patients?sortBy=name&sortOrder=asc')
        .set('Authorization', `Bearer ${vetToken}`);
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);
      for (let i = 0; i < response.body.data.length - 1; i++) {
        expect(response.body.data[i].name.localeCompare(response.body.data[i+1].name)).toBeLessThanOrEqual(0);
      }
    });

    it('should sort patients by age descending', async () => {
        const response = await request(server)
          .get('/api/patients?sortBy=age&sortOrder=desc')
          .set('Authorization', `Bearer ${vetToken}`);
        expect(response.status).toBe(200);
        expect(response.body.data.length).toBeGreaterThanOrEqual(2);
        for (let i = 0; i < response.body.data.length - 1; i++) {
          expect(response.body.data[i].age).toBeGreaterThanOrEqual(response.body.data[i+1].age);
        }
      });

    it('should return 400 for invalid sortBy parameter', async () => {
        const response = await request(server)
            .get('/api/patients?sortBy=invalidField&sortOrder=asc')
            .set('Authorization', `Bearer ${vetToken}`);
        expect(response.status).toBe(400);
        expect(response.body.message).toContain('Invalid sortBy parameter');
    });

    it('should return 400 for invalid sortOrder parameter', async () => {
        const response = await request(server)
            .get('/api/patients?sortBy=name&sortOrder=invalidOrder')
            .set('Authorization', `Bearer ${vetToken}`);
        expect(response.status).toBe(400);
        expect(response.body.message).toContain('Invalid sortOrder parameter');
    });

  });

  describe('PUT /api/patients/:id', () => {
    let patientToUpdateId: string;
    beforeAll(async () => {
        const patient = await prisma.patient.create({
            data: { name: 'Charlie', species: 'Dog', age: 4, ownerId: testClient.id, breed: 'Poodle' }
        });
        patientToUpdateId = patient.id;
    });

    it('should update a patient with admin token', async () => {
        const updates = { name: 'Charlie Brown', age: 5, medical_history_summary: 'Updated history' };
        const response = await request(server)
            .put(`/api/patients/${patientToUpdateId}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send(updates);
        expect(response.status).toBe(200);
        expect(response.body.name).toBe(updates.name);
        expect(response.body.age).toBe(updates.age);
        expect(response.body.medical_history_summary).toBe(updates.medical_history_summary);
    });

    it('should return 404 when trying to update non-existent patient', async () => {
        const updates = { name: 'NonExistent', age: 1 };
        const response = await request(server)
            .put('/api/patients/nonexistent-id-for-update')
            .set('Authorization', `Bearer ${adminToken}`)
            .send(updates);
        expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/patients/:id', () => {
    let patientToDeleteId: string;
    beforeAll(async () => {
        const patient = await prisma.patient.create({
            data: { name: 'Daisy', species: 'Cat', age: 2, ownerId: testClient.id, breed: 'Siamese' }
        });
        patientToDeleteId = patient.id;
    });

    it('should fail to delete patient with non-admin token (e.g. vet)', async () => {
        const response = await request(server)
            .delete(`/api/patients/${patientToDeleteId}`)
            .set('Authorization', `Bearer ${vetToken}`);
        expect(response.status).toBe(403); // Forbidden due to role
    });

    it('should delete a patient with admin token', async () => {
        const response = await request(server)
            .delete(`/api/patients/${patientToDeleteId}`)
            .set('Authorization', `Bearer ${adminToken}`);
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Patient deleted successfully');

        // Verify patient is actually deleted
        const findResponse = await request(server)
            .get(`/api/patients/${patientToDeleteId}`)
            .set('Authorization', `Bearer ${adminToken}`);
        expect(findResponse.status).toBe(404);
    });

    it('should return 404 when trying to delete non-existent patient', async () => {
        const response = await request(server)
            .delete('/api/patients/nonexistent-id-for-delete')
            .set('Authorization', `Bearer ${adminToken}`);
        expect(response.status).toBe(404);
    });
  });
});
