import { PrismaClient, Patient } from '@prisma/client';
import { Prisma } from '@prisma/client'; // For explicit types

const prisma = new PrismaClient();

export interface PatientCreationData {
  name: string;
  species: string;
  age: number;
  ownerId: string;
  breed?: string;
  weight?: number;
  medical_history_summary?: string;
}

export interface PatientUpdateData {
  name?: string;
  species?: string;
  age?: number;
  breed?: string;
  weight?: number;
  medical_history_summary?: string;
  // ownerId typically should not be changed, or handled with specific logic
}

export interface PatientQueryOptions {
  page: number;
  limit: number;
  clientId?: string;
  species?: string;
  sortBy?: 'name' | 'createdAt' | 'age' | 'species'; // Allowed sort fields
  sortOrder?: 'asc' | 'desc';
}

// Create a new patient
export const createPatient = async (data: PatientCreationData): Promise<Patient> => {
  // TODO: Add comprehensive validation here (e.g., using Zod or Joi)
  // Example: Ensure ownerId (Client) exists
  const clientExists = await prisma.client.findUnique({ where: { id: data.ownerId } });
  if (!clientExists) {
    throw new Error(`Client with ID ${data.ownerId} not found.`); // Or a custom error type
  }

  try {
    const newPatient = await prisma.patient.create({
      data: {
        name: data.name,
        species: data.species,
        age: data.age,
        owner: { connect: { id: data.ownerId } },
        breed: data.breed,
        weight: data.weight,
        medical_history_summary: data.medical_history_summary,
      },
    });
    return newPatient;
  } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        // Check if the target is the specific unique constraint [name, ownerId]
        // Prisma's error.meta.target is typically an array of strings for compound unique constraints
        const target = error.meta?.target as string[];
        if (target && target.includes('name') && target.includes('ownerId')) {
        throw new Error(`Patient with name "${data.name}" already exists for this owner.`);
      }
    }
      console.error("Error creating patient:", error); // Log other errors
      throw new Error("Could not create patient."); // General error for other cases
  }
};

// Get all patients with pagination and filtering
export const getAllPatients = async (options: PatientQueryOptions): Promise<{ patients: Patient[], total: number }> => {
  const { page, limit, clientId, species, sortBy, sortOrder } = options;
  const skip = (page - 1) * limit;

  const whereClause: Prisma.PatientWhereInput = {};
  if (clientId) {
    whereClause.ownerId = clientId;
  }
  if (species) {
    whereClause.species = { contains: species, mode: 'insensitive' }; // Case-insensitive partial match
  }

  const orderByClause: Prisma.PatientOrderByWithRelationInput = {};
  if (sortBy && sortOrder) {
    orderByClause[sortBy] = sortOrder;
  } else {
    orderByClause.createdAt = 'desc'; // Default sort
  }

  const patients = await prisma.patient.findMany({
    where: whereClause,
    skip: skip,
    take: limit,
    orderBy: orderByClause,
    include: { owner: true } // Optionally include owner details
  });

  const total = await prisma.patient.count({ where: whereClause });

  return { patients, total };
};

// Get a specific patient by ID
export const getPatientById = async (id: string): Promise<Patient | null> => {
  const patient = await prisma.patient.findUnique({
    where: { id },
    include: { owner: true } // Optionally include owner details
  });
  return patient;
};

// Update a patient's details
export const updatePatient = async (id: string, data: PatientUpdateData): Promise<Patient | null> => {
  // TODO: Add comprehensive validation here
  // Example: Ensure fields are not empty if provided, age/weight are positive, etc.

  try {
    const updatedPatient = await prisma.patient.update({
      where: { id },
      data: {
        name: data.name,
        species: data.species,
        age: data.age,
        breed: data.breed,
        weight: data.weight,
        medical_history_summary: data.medical_history_summary,
        // Note: ownerId is not updated here. If needed, it requires careful consideration.
      },
    });
    return updatedPatient;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') { // Record to update not found
        return null;
      }
      if (error.code === 'P2002') { // Unique constraint violation
        const target = error.meta?.target as string[];
        if (target && target.includes('name') && target.includes('ownerId') && data.name) {
          throw new Error(`Patient with name "${data.name}" already exists for this owner.`);
        }
      }
    }
    console.error(`Error updating patient ${id}:`, error);
    throw new Error(`Could not update patient ${id}.`);
  }
};

// Delete a patient
export const deletePatient = async (id: string): Promise<Patient | null> => {
  try {
    // Check for related appointments before deleting (optional, depends on desired behavior)
    // const appointments = await prisma.appointment.count({ where: { patientId: id } });
    // if (appointments > 0) {
    //   throw new Error("Cannot delete patient with existing appointments. Please remove appointments first.");
    // }
    const deletedPatient = await prisma.patient.delete({
      where: { id },
    });
    return deletedPatient;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      // Record to delete not found
      return null;
    }
    console.error(`Error deleting patient ${id}:`, error);
    throw new Error(`Could not delete patient ${id}.`);
  }
};
