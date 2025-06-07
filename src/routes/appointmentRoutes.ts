import { Router } from 'express';
import {
    createAppointment,
    getAllAppointments,
    getAppointmentById,
    updateAppointment,
    deleteAppointment
} from '../controllers/appointmentController'; // To be created
import { authenticateToken, authorizeRoles } from '../middlewares/authMiddleware';
import { UserRole } from '../models/userRoles'; // Assuming UserRole enum is defined

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Appointments
 *   description: Appointment scheduling and management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     AppointmentStatus:
 *       type: string
 *       enum: [SCHEDULED, CONFIRMED, CANCELLED, COMPLETED, NO_SHOW]
 *     AppointmentInput:
 *       type: object
 *       required:
 *         - patientId
 *         - userId
 *         - appointmentDate
 *         - status
 *       properties:
 *         patientId:
 *           type: string
 *           format: uuid
 *           description: ID of the patient
 *         userId:
 *           type: string
 *           format: uuid
 *           description: ID of the veterinarian or staff member
 *         appointmentDate:
 *           type: string
 *           format: date-time
 *         type:
 *           type: string
 *           description: Type of appointment (e.g., CHECKUP, VACCINATION)
 *           nullable: true
 *         reason:
 *           type: string
 *           description: Reason for the appointment
 *           nullable: true
 *         notes:
 *           type: string
 *           description: Notes for the appointment
 *           nullable: true
 *         status:
 *           $ref: '#/components/schemas/AppointmentStatus'
 *     Appointment:
 *       allOf:
 *         - $ref: '#/components/schemas/AppointmentInput'
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

// POST /appointments - Create a new appointment
router.post(
  '/',
  authenticateToken,
  // All authenticated users can create appointments for themselves or their pets initially,
  // or receptionists/techs/vets for any client. More specific logic in service/controller.
  authorizeRoles(UserRole.RECEPTIONIST, UserRole.TECHNICIAN, UserRole.VETERINARIAN, UserRole.ADMIN),
  createAppointment
);

// GET /appointments - Get a list of all appointments
/**
 * @swagger
 * /appointments:
 *   get:
 *     summary: Retrieve a list of appointments
 *     tags: [Appointments]
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
 *         name: patientId
 *         schema:
 *           type: string
 *         description: Filter by patient ID
 *       - in: query
 *         name: veterinarianId
 *         schema:
 *           type: string
 *         description: Filter by veterinarian (user) ID
 *       - in: query
 *         name: status
 *         schema:
 *           $ref: '#/components/schemas/AppointmentStatus'
 *         description: Filter by appointment status
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by start date (YYYY-MM-DD)
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by end date (YYYY-MM-DD)
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [appointmentDate, patientName, vetName]
 *           default: appointmentDate
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: A list of appointments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Appointment'
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
  // Vets/Admins can see all. Receptionists/Techs might have limitations (e.g., by date range).
  // This can be handled in the service layer based on user role.
  authorizeRoles(UserRole.RECEPTIONIST, UserRole.TECHNICIAN, UserRole.VETERINARIAN, UserRole.ADMIN),
  getAllAppointments
);

// GET /appointments/:id - Get a specific appointment by ID
router.get(
  '/:id',
  authenticateToken,
  // Users should only be able to see their own appointments unless they are staff/admin
  getAppointmentById
);

// PUT /appointments/:id - Update an appointment
router.put(
  '/:id',
  authenticateToken,
  authorizeRoles(UserRole.RECEPTIONIST, UserRole.TECHNICIAN, UserRole.VETERINARIAN, UserRole.ADMIN),
  updateAppointment
);

// DELETE /appointments/:id - Cancel/delete an appointment
router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles(UserRole.RECEPTIONIST, UserRole.TECHNICIAN, UserRole.VETERINARIAN, UserRole.ADMIN), // Or more restrictive e.g. Admin only for hard delete
  deleteAppointment
);

export default router;
