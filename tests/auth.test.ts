import request from 'supertest';
import app from '../src/app'; // Assuming your Express app is exported from app.ts
import { PrismaClient } from '@prisma/client';
import { UserRole } from '../src/models/userRoles';

const prisma = new PrismaClient();

describe('Auth Endpoints', () => {
  let server: any; // To hold the server instance

  beforeAll(async () => {
    // It's good practice to run tests on a separate test database
    // For now, ensure the dev database is clean before tests
    await prisma.user.deleteMany({}); // Clear users before tests
    // Start server on a different port for tests, make sure .env is loaded for this.
    // For simplicity here, we assume PORT is not set in .env or is overridden for tests.
    server = app.listen(process.env.TEST_PORT || 3001);
  });

  afterAll(async () => {
    await prisma.user.deleteMany({}); // Clean up users after tests
    await prisma.$disconnect();
    if (server) {
      server.close(); // Close the server
    }
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const newUser = {
        email: 'testuser@example.com',
        password: 'password123',
        name: 'Test User',
        role: UserRole.VETERINARIAN,
      };
      const response = await request(server) // Use server directly
        .post('/api/auth/register')
        .send(newUser);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'User registered successfully');
      expect(response.body.user).toHaveProperty('email', newUser.email);
      expect(response.body.user).not.toHaveProperty('password'); // Ensure password is not returned
    });

    it('should fail to register a user with an existing email', async () => {
      // This test depends on the previous test successfully registering 'testuser@example.com'
      const existingUser = {
        email: 'testuser@example.com',
        password: 'password123',
        name: 'Another User',
        role: UserRole.TECHNICIAN,
      };
      const response = await request(server)
        .post('/api/auth/register')
        .send(existingUser);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'User with this email already exists.');
    });

    it('should fail if required fields are missing', async () => {
        const response = await request(server)
          .post('/api/auth/register')
          .send({ email: 'incomplete@example.com' });
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('message', 'All fields (email, password, name, role) are required.');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login an existing user and return a JWT token', async () => {
      // Assumes the user from the first registration test exists
      const credentials = {
        email: 'testuser@example.com',
        password: 'password123',
      };
      const response = await request(server)
        .post('/api/auth/login')
        .send(credentials);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Login successful');
      expect(response.body).toHaveProperty('token');
      expect(typeof response.body.token).toBe('string');
    });

    it('should fail to login with incorrect password', async () => {
      const credentials = {
        email: 'testuser@example.com',
        password: 'wrongpassword',
      };
      const response = await request(server)
        .post('/api/auth/login')
        .send(credentials);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Invalid email or password.');
    });

    it('should fail to login with a non-existent email', async () => {
      const credentials = {
        email: 'nouser@example.com',
        password: 'password123',
      };
      const response = await request(server)
        .post('/api/auth/login')
        .send(credentials);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Invalid email or password.');
    });
  });
});
