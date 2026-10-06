import express from 'express';
import { getDoctors, getDoctorById, getAvailableSlots } from '../controllers/doctorController.js';

const router = express.Router();

router.get('/', getDoctors);
router.get('/:id', getDoctorById);
router.get('/:id/slots', getAvailableSlots);

export default router;
