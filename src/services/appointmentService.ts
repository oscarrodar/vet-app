import { PrismaClient, Appointment, AppointmentStatus, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export interface AppointmentCreationData {
  patientId: string;
  userId: string; // Veterinarian or staff
  appointmentDate: string | Date; // ISO string or Date object
  type?: string;
  reason?: string;
  notes?: string;
  status?: AppointmentStatus;
}

export interface AppointmentUpdateData {
  appointmentDate?: string | Date;
  type?: string;
  reason?: string;
  notes?: string;
  status?: AppointmentStatus;
  patientId?: string; // Usually not changed, but possible
  userId?: string;    // Usually not changed, but possible
}

export interface AppointmentQueryOptions {
  page: number;
  limit: number;
  dateFrom?: string; // Filter by date range start
  dateTo?: string;   // Filter by date range end
  patientId?: string;
  userId?: string; // Veterinarian or staff
  status?: AppointmentStatus;
  sortBy?: 'appointmentDate' | 'patientName' | 'vetName'; // Allowed sort fields
  sortOrder?: 'asc' | 'desc';
}

// Create a new appointment
export const createAppointment = async (data: AppointmentCreationData): Promise<Appointment> => {
  // TODO: Add comprehensive validation (Zod/Joi)
  // 1. Validate patientId exists
  const patient = await prisma.patient.findUnique({ where: { id: data.patientId } });
  if (!patient) throw new Error(`Patient with ID ${data.patientId} not found.`);

  // 2. Validate userId (veterinarian/staff) exists
  const user = await prisma.user.findUnique({ where: { id: data.userId } });
  if (!user) throw new Error(`User (staff/vet) with ID ${data.userId} not found.`);

  // 3. Validate appointmentDate is valid and not in the past (optional)
  const appointmentDateObj = new Date(data.appointmentDate);
  if (isNaN(appointmentDateObj.getTime())) {
    throw new Error("Invalid appointment date format.");
  }
  // if (appointmentDateObj < new Date()) {
  //   throw new Error("Appointment date cannot be in the past.");
  // }

  // 4. Check for scheduling conflicts (basic example: vet not double-booked)
  // More complex logic might involve appointment duration, vet working hours etc.
  // Query for appointments starting in the same minute for that user.
  const startDate = new Date(appointmentDateObj);
  startDate.setSeconds(0, 0); // Start of the minute

  const endDate = new Date(startDate);
  endDate.setMinutes(startDate.getMinutes() + 1); // Start of the next minute

  const existingAppointments = await prisma.appointment.findFirst({
    where: {
      userId: data.userId,
      appointmentDate: {
        gte: startDate,
        lt: endDate,
      },
      status: { notIn: [AppointmentStatus.CANCELLED, AppointmentStatus.COMPLETED] }
    }
  });
  if (existingAppointments) {
    throw new Error(`User ${data.userId} already has an appointment scheduled around this time (within the same minute).`);
  }

  try {
    const newAppointment = await prisma.appointment.create({
      data: {
        patient: { connect: { id: data.patientId } },
        user: { connect: { id: data.userId } },
        appointmentDate: appointmentDateObj,
        type: data.type,
        reason: data.reason,
        notes: data.notes,
        status: data.status || AppointmentStatus.SCHEDULED,
      },
    });
    return newAppointment;
  } catch (error) {
    console.error("Error creating appointment:", error);
    // Handle specific Prisma errors if needed, e.g. foreign key constraint
    throw new Error("Could not create appointment.");
  }
};

// Get all appointments with pagination and filtering
export const getAllAppointments = async (options: AppointmentQueryOptions): Promise<{ appointments: Appointment[], total: number }> => {
  const { page, limit, dateFrom, dateTo, patientId, userId, status, sortBy, sortOrder } = options;
  const skip = (page - 1) * limit;

  const whereClause: Prisma.AppointmentWhereInput = {};
  if (patientId) whereClause.patientId = patientId;
  if (userId) whereClause.userId = userId;
  if (status) whereClause.status = status;
  if (dateFrom || dateTo) {
    whereClause.appointmentDate = {};
    if (dateFrom) {
      const startDate = new Date(dateFrom);
      startDate.setHours(0, 0, 0, 0);
      whereClause.appointmentDate.gte = startDate;
    }
    if (dateTo) {
      const endDate = new Date(dateTo);
      endDate.setHours(23, 59, 59, 999);
      whereClause.appointmentDate.lte = endDate;
    }
  }

  const orderByClause: Prisma.AppointmentOrderByWithRelationInput[] = [];
  if (sortBy && sortOrder) {
    if (sortBy === 'patientName') {
      orderByClause.push({ patient: { name: sortOrder } });
    } else if (sortBy === 'vetName') {
      orderByClause.push({ user: { name: sortOrder } });
    } else { // appointmentDate
      orderByClause.push({ [sortBy]: sortOrder });
    }
  } else {
    orderByClause.push({ appointmentDate: 'asc' }); // Default sort
  }

  const appointments = await prisma.appointment.findMany({
    where: whereClause,
    skip: skip,
    take: limit,
    orderBy: orderByClause,
    include: {
      patient: true,
      user: { select: { id: true, name: true, email: true, role: true }}
    }
  });

  const total = await prisma.appointment.count({ where: whereClause });
  return { appointments, total };
};

// Get a specific appointment by ID
export const getAppointmentById = async (id: string): Promise<Appointment | null> => {
  return prisma.appointment.findUnique({
    where: { id },
    include: { patient: true, user: { select: { id: true, name: true, email: true, role: true }} }
  });
};

// Update an appointment's details
export const updateAppointment = async (id: string, data: AppointmentUpdateData): Promise<Appointment | null> => {
  // TODO: Add comprehensive validation (Zod/Joi)
  // Validate patientId, userId if changed
  // Validate appointmentDate (not in past, conflicts if changed)

  let appointmentDateObj: Date | undefined = undefined;
  if (data.appointmentDate) {
    appointmentDateObj = new Date(data.appointmentDate);
    if (isNaN(appointmentDateObj.getTime())) {
      throw new Error("Invalid appointment date format for update.");
    }
  }

  // Add conflict check if date or vet is changing
  // ... (similar to createAppointment conflict check)

  try {
    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: {
        appointmentDate: appointmentDateObj, // Use validated Date object
        type: data.type,
        reason: data.reason,
        notes: data.notes,
        status: data.status,
        patientId: data.patientId, // If allowing patient change
        userId: data.userId,       // If allowing user (vet) change
      },
    });
    return updatedAppointment;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return null; // Record to update not found
    }
    console.error(`Error updating appointment ${id}:`, error);
    throw new Error(`Could not update appointment ${id}.`);
  }
};

// Delete an appointment (can mean cancel or actual deletion)
export const deleteAppointment = async (id: string): Promise<Appointment | null> => {
  // Option 1: Change status to CANCELLED
  // return updateAppointment(id, { status: AppointmentStatus.CANCELLED });

  // Option 2: Actual deletion (as implied by "delete")
  try {
    const deletedAppointment = await prisma.appointment.delete({ where: { id } });
    return deletedAppointment;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return null; // Record to delete not found
    }
    console.error(`Error deleting appointment ${id}:`, error);
    throw new Error(`Could not delete appointment ${id}.`);
  }
};
