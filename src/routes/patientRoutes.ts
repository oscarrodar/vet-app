import { Router } from 'express';
import { createPatient, getAllPatients, getPatientById, updatePatient, deletePatient } from '../controllers/patientController'; // To be created
import { authenticateToken, authorizeRoles } from '../middlewares/authMiddleware';
import { UserRole } from '../models/userRoles';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Patients
 *   description: Patient management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     PatientInput:
 *       type: object
 *       required:
 *         - name
 *         - species
 *         - age
 *         - ownerId
 *       properties:
 *         name:
 *           type: string
 *         species:
 *           type: string
 *         breed:
 *           type: string
 *         age:
 *           type: integer
 *           format: int32
 *         weight:
 *           type: number
 *           format: float
 *         ownerId:
 *           type: string
 *           description: ID of the client who owns the pet
 *         medical_history_summary:
 *           type: string
 *           nullable: true
 *     Patient:
 *       allOf:
 *         - $ref: '#/components/schemas/PatientInput'
 *         - type: object
 *           properties:
 *             id:
 *               type: string
 *               format: uuid
 *             createdAt:
 *               type: string
 *               format: date-time
 *             updatedAt:
 *               type: string
 *               format: date-time
 */

// POST /patients - Create a new patient
router.post(
  '/',
  authenticateToken,
  authorizeRoles(UserRole.RECEPTIONIST, UserRole.TECHNICIAN, UserRole.VETERINARIAN, UserRole.ADMIN),
  createPatient
);

// GET /patients - Get a list of all patients
/**
 * @swagger
 * /patients:
 *   get:
 *     summary: Retrieve a list of patients
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: clientId
 *         schema:
 *           type: string
 *         description: Filter by client ID
 *       - in: query
 *         name: species
 *         schema:
 *           type: string
 *         description: Filter by species (case-insensitive, partial match)
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, createdAt, age, species]
 *           default: createdAt
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order (ascending or descending)
 *     responses:
 *       200:
 *         description: A list of patients
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Patient'
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 total:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/',
  authenticateToken,
  getAllPatients
);

// GET /patients/:id - Get a specific patient by ID
router.get(
  '/:id',
  authenticateToken,
  getPatientById
);

// PUT /patients/:id - Update a patient's details
router.put(
  '/:id',
  authenticateToken,
  authorizeRoles(UserRole.RECEPTIONIST, UserRole.TECHNICIAN, UserRole.VETERINARIAN, UserRole.ADMIN),
  updatePatient
);

// DELETE /patients/:id - Delete a patient
router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles(UserRole.ADMIN), // Only Admin can delete
  deletePatient
);

export default router;
