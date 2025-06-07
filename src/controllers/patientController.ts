import { Request, Response, NextFunction } from 'express';
import * as patientService from '../services/patientService'; // To be created
// import { matchedData, validationResult } from 'express-validator'; // For potential future use with validation middleware - REMOVED FOR NOW

// POST /patients - Create a new patient
export const createPatient = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Basic validation example (can be expanded with express-validator or Zod in service)
    const { name, species, age, ownerId, breed, weight, medical_history_summary } = req.body;
    if (!name || !species || !age || !ownerId) {
      res.status(400).json({ message: 'Missing required fields: name, species, age, ownerId' });
      return;
    }

    const patientData = { name, species, age, ownerId, breed, weight, medical_history_summary };
    const newPatient = await patientService.createPatient(patientData);
    res.status(201).json(newPatient);
  } catch (error: any) {
    console.error(`Error in createPatient: ${error.message}`, error.stack);
    res.status(error.statusCode || 500).json({ message: error.message || 'An unexpected error occurred creating patient.' });
  }
};

// GET /patients - Get a list of all patients
export const getAllPatients = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    // Filtering
    const clientId = req.query.clientId as string | undefined;
    const species = req.query.species as string | undefined;

    // Sorting
    const sortBy = req.query.sortBy as 'name' | 'createdAt' | 'age' | 'species' | undefined;
    const sortOrder = req.query.sortOrder as 'asc' | 'desc' | undefined;

    if (sortOrder && !['asc', 'desc'].includes(sortOrder)) {
      res.status(400).json({ message: 'Invalid sortOrder parameter. Must be "asc" or "desc".' });
      return;
    }
    if (sortBy && !['name', 'createdAt', 'age', 'species'].includes(sortBy)) {
      res.status(400).json({ message: 'Invalid sortBy parameter. Allowed values: name, createdAt, age, species.' });
      return;
    }

    const { patients, total } = await patientService.getAllPatients({
      page,
      limit,
      clientId,
      species,
      sortBy,
      sortOrder
    });
    res.status(200).json({
      data: patients,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error: any) {
    console.error(`Error in getAllPatients: ${error.message}`, error.stack);
    res.status(error.statusCode || 500).json({ message: error.message || 'An unexpected error occurred fetching patients.' });
  }
};

// GET /patients/:id - Get a specific patient by ID
export const getPatientById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const patientId = req.params.id;
    const patient = await patientService.getPatientById(patientId);
    if (!patient) {
      res.status(404).json({ message: 'Patient not found' });
      return;
    }
    res.status(200).json(patient);
  } catch (error: any) {
    console.error(`Error in getPatientById: ${error.message}`, error.stack);
    res.status(error.statusCode || 500).json({ message: error.message || 'An unexpected error occurred fetching patient.' });
  }
};

// PUT /patients/:id - Update a patient's details
export const updatePatient = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const patientId = req.params.id;
    const patientData = req.body; // In a real app, validate this data

    const updatedPatient = await patientService.updatePatient(patientId, patientData);
    if (!updatedPatient) {
      res.status(404).json({ message: 'Patient not found for update' });
      return;
    }
    res.status(200).json(updatedPatient);
  } catch (error: any) {
    console.error(`Error in updatePatient: ${error.message}`, error.stack);
    res.status(error.statusCode || 500).json({ message: error.message || 'An unexpected error occurred updating patient.' });
  }
};

// DELETE /patients/:id - Delete a patient
export const deletePatient = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const patientId = req.params.id;
    const deletedPatient = await patientService.deletePatient(patientId);
     if (!deletedPatient) {
      res.status(404).json({ message: 'Patient not found for deletion' });
      return;
    }
    res.status(200).json({ message: 'Patient deleted successfully', patient: deletedPatient });
  } catch (error: any) {
    console.error(`Error in deletePatient: ${error.message}`, error.stack);
    res.status(error.statusCode || 500).json({ message: error.message || 'An unexpected error occurred deleting patient.' });
  }
};
