import { Request, Response, NextFunction } from 'express';
import * as appointmentService from '../services/appointmentService'; // To be created
import { AppointmentStatus } from '@prisma/client'; // For validating status

// POST /appointments - Create a new appointment
export const createAppointment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { patientId, userId, appointmentDate, type, reason, notes, status } = req.body;
    // Basic validation (more comprehensive in service)
    if (!patientId || !userId || !appointmentDate) {
      res.status(400).json({ message: 'Missing required fields: patientId, userId, appointmentDate' });
      return;
    }
    if (status && !Object.values(AppointmentStatus).includes(status as AppointmentStatus)) {
        res.status(400).json({ message: 'Invalid appointment status.' });
        return;
    }

    const appointmentData = { patientId, userId, appointmentDate, type, reason, notes, status: status || AppointmentStatus.SCHEDULED };
    const newAppointment = await appointmentService.createAppointment(appointmentData);
    res.status(201).json(newAppointment);
  } catch (error: any) {
    console.error(`Error in createAppointment: ${error.message}`, error.stack);
    res.status(error.statusCode || 500).json({ message: error.message || 'An unexpected error occurred creating appointment.' });
  }
};

// GET /appointments - Get a list of all appointments
export const getAllAppointments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    // Filtering
    const patientId = req.query.patientId as string | undefined;
    const veterinarianId = req.query.veterinarianId as string | undefined; // userId for vet/staff
    const status = req.query.status as AppointmentStatus | undefined;
    const dateFrom = req.query.dateFrom as string | undefined;
    const dateTo = req.query.dateTo as string | undefined;

    // Sorting
    const sortBy = req.query.sortBy as 'appointmentDate' | 'patientName' | 'vetName' | undefined;
    const sortOrder = req.query.sortOrder as 'asc' | 'desc' | undefined;

    if (status && !Object.values(AppointmentStatus).includes(status)) {
        res.status(400).json({ message: 'Invalid appointment status for filtering.' });
        return;
    }
    if (sortOrder && !['asc', 'desc'].includes(sortOrder)) {
      res.status(400).json({ message: 'Invalid sortOrder parameter. Must be "asc" or "desc".' });
      return;
    }
    if (sortBy && !['appointmentDate', 'patientName', 'vetName'].includes(sortBy)) {
      res.status(400).json({ message: 'Invalid sortBy parameter. Allowed values: appointmentDate, patientName, vetName.' });
      return;
    }

    const { appointments, total } = await appointmentService.getAllAppointments({
        page,
        limit,
        patientId,
        userId: veterinarianId,
        status,
        dateFrom,
        dateTo,
        sortBy,
        sortOrder
    });
    res.status(200).json({
      data: appointments,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error: any) {
    console.error(`Error in getAllAppointments: ${error.message}`, error.stack);
    res.status(error.statusCode || 500).json({ message: error.message || 'An unexpected error occurred fetching appointments.' });
  }
};

// GET /appointments/:id - Get a specific appointment by ID
export const getAppointmentById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const appointmentId = req.params.id;
    // In a real app, service layer might check if user is authorized to view this appointment
    const appointment = await appointmentService.getAppointmentById(appointmentId);
    if (!appointment) {
      res.status(404).json({ message: 'Appointment not found' });
      return;
    }
    res.status(200).json(appointment);
  } catch (error: any) {
    console.error(`Error in getAppointmentById: ${error.message}`, error.stack);
    res.status(error.statusCode || 500).json({ message: error.message || 'An unexpected error occurred fetching appointment.' });
  }
};

// PUT /appointments/:id - Update an appointment
export const updateAppointment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const appointmentId = req.params.id;
    const appointmentData = req.body; // Validate this data

    if (appointmentData.status && !Object.values(AppointmentStatus).includes(appointmentData.status as AppointmentStatus)) {
        res.status(400).json({ message: 'Invalid appointment status.' });
        return;
    }

    const updatedAppointment = await appointmentService.updateAppointment(appointmentId, appointmentData);
    if (!updatedAppointment) {
      res.status(404).json({ message: 'Appointment not found for update' });
      return;
    }
    res.status(200).json(updatedAppointment);
  } catch (error: any) {
    console.error(`Error in updateAppointment: ${error.message}`, error.stack);
    res.status(error.statusCode || 500).json({ message: error.message || 'An unexpected error occurred updating appointment.' });
  }
};

// DELETE /appointments/:id - Cancel/delete an appointment
export const deleteAppointment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const appointmentId = req.params.id;
    // Depending on logic, "delete" might mean "cancel" (status change) or actual record removal
    const deletedAppointment = await appointmentService.deleteAppointment(appointmentId);
    if (!deletedAppointment) {
      res.status(404).json({ message: 'Appointment not found for deletion' });
      return;
    }
    res.status(200).json({ message: 'Appointment deleted successfully', appointment: deletedAppointment });
  } catch (error: any) {
    console.error(`Error in deleteAppointment: ${error.message}`, error.stack);
    res.status(error.statusCode || 500).json({ message: error.message || 'An unexpected error occurred deleting appointment.' });
  }
};
