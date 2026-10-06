import express from 'express';
import {
  createAppointment,
  getMyAppointments,
  updateAppointmentStatus,
  cancelAppointment,
} from '../controllers/appointmentController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

// All appointment actions require an authenticated user
router.use(requireAuth);

router.post('/', createAppointment);
router.get('/mine', getMyAppointments);
router.patch('/:id/status', requireRole('DOCTOR'), updateAppointmentStatus);
router.patch('/:id/cancel', cancelAppointment);

export default router;
