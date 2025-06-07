import { Router } from 'express';
import authRoutes from './authRoutes';
import patientRoutes from './patientRoutes';
import appointmentRoutes from './appointmentRoutes';

const router = Router();

// Mount auth routes
router.use('/auth', authRoutes);

// Mount patient routes
router.use('/patients', patientRoutes);

// Mount appointment routes
router.use('/appointments', appointmentRoutes);

// Add other main routes here (e.g. /clients, /users if they have their own route files)

export default router;
