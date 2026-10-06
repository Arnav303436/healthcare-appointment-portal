import prisma from '../prisma.js';

export const createAppointment = async (req, res) => {
  try {
    const patientId = req.user.id;
    const { doctorId, appointmentDate, timeSlot, reason } = req.body;

    if (!doctorId || !appointmentDate || !timeSlot || !reason) {
      return res.status(400).json({ message: 'Doctor ID, appointment date, time slot, and reason are required.' });
    }

    const parsedDoctorId = parseInt(doctorId, 10);
    if (isNaN(parsedDoctorId)) {
      return res.status(400).json({ message: 'Invalid doctor ID.' });
    }

    // 1. Verify doctor exists
    const doctor = await prisma.user.findFirst({
      where: { id: parsedDoctorId, role: 'DOCTOR' },
      include: { doctorProfile: true },
    });

    if (!doctor || !doctor.doctorProfile) {
      return res.status(404).json({ message: 'Selected doctor was not found.' });
    }

    // 2. Validate no booking in the past
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    if (appointmentDate < todayStr) {
      return res.status(400).json({ message: 'Cannot book appointments for past dates.' });
    }

    const [slotHour, slotMin] = timeSlot.split(':').map(Number);
    if (appointmentDate === todayStr) {
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const slotMinutes = slotHour * 60 + (slotMin || 0);
      if (slotMinutes <= currentMinutes) {
        return res.status(400).json({ message: 'Cannot book a time slot that has already passed today.' });
      }
    }

    // 3. Prevent patient from booking an appointment with themselves (if doctor is logged in)
    if (patientId === parsedDoctorId) {
      return res.status(400).json({ message: 'You cannot book an appointment with yourself.' });
    }

    // 4. Check for double booking of the same doctor and slot
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        doctorId: parsedDoctorId,
        appointmentDate,
        timeSlot,
        status: {
          notIn: ['CANCELLED', 'REJECTED'],
        },
      },
    });

    if (existingAppointment) {
      return res.status(409).json({ message: 'This slot is already booked for this doctor. Please choose another slot.' });
    }

    // 5. Create appointment
    const appointment = await prisma.appointment.create({
      data: {
        patientId,
        doctorId: parsedDoctorId,
        appointmentDate,
        timeSlot,
        reason: reason.trim(),
        status: 'PENDING',
      },
      include: {
        doctor: {
          select: {
            id: true,
            name: true,
            email: true,
            doctorProfile: true,
          },
        },
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    return res.status(201).json({
      message: 'Appointment booked successfully. Awaiting doctor confirmation.',
      appointment,
    });
  } catch (error) {
    console.error('createAppointment error:', error);
    return res.status(500).json({ message: 'Failed to create appointment.' });
  }
};

export const getMyAppointments = async (req, res) => {
  try {
    const userId = req.user.id;
    const isDoctor = req.user.role === 'DOCTOR';

    const whereClause = isDoctor ? { doctorId: userId } : { patientId: userId };

    const appointments = await prisma.appointment.findMany({
      where: whereClause,
      include: {
        doctor: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            doctorProfile: true,
          },
        },
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: [
        { appointmentDate: 'desc' },
        { timeSlot: 'desc' },
      ],
    });

    return res.json(appointments);
  } catch (error) {
    console.error('getMyAppointments error:', error);
    return res.status(500).json({ message: 'Failed to retrieve appointments.' });
  }
};

export const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const appointmentId = parseInt(id, 10);
    const { status, consultationNotes } = req.body;
    const doctorId = req.user.id;

    if (isNaN(appointmentId)) {
      return res.status(400).json({ message: 'Invalid appointment ID.' });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found.' });
    }

    // Only the assigned doctor can update status or notes
    if (appointment.doctorId !== doctorId) {
      return res.status(403).json({ message: 'You are not authorized to update this appointment.' });
    }

    const allowedStatuses = ['CONFIRMED', 'REJECTED', 'COMPLETED'];
    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({ message: `Status must be one of: ${allowedStatuses.join(', ')}` });
    }

    // Validate status transition flow:
    // PENDING -> CONFIRMED or REJECTED
    // CONFIRMED -> COMPLETED
    if (status) {
      if (appointment.status === 'CANCELLED') {
        return res.status(400).json({ message: 'Cannot modify a cancelled appointment.' });
      }
      if (appointment.status === 'REJECTED') {
        return res.status(400).json({ message: 'Cannot modify an already rejected appointment.' });
      }
      if (appointment.status === 'COMPLETED') {
        return res.status(400).json({ message: 'Appointment has already been completed.' });
      }

      if (appointment.status === 'PENDING' && status === 'COMPLETED') {
        return res.status(400).json({ message: 'Appointment must be confirmed before it can be completed.' });
      }
    }

    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        ...(status && { status }),
        ...(consultationNotes !== undefined && { consultationNotes: consultationNotes.trim() }),
      },
      include: {
        patient: {
          select: { id: true, name: true, email: true, phone: true },
        },
        doctor: {
          select: { id: true, name: true, doctorProfile: true },
        },
      },
    });

    return res.json({
      message: 'Appointment status updated successfully.',
      appointment: updated,
    });
  } catch (error) {
    console.error('updateAppointmentStatus error:', error);
    return res.status(500).json({ message: 'Failed to update appointment status.' });
  }
};

export const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const appointmentId = parseInt(id, 10);
    const patientId = req.user.id;

    if (isNaN(appointmentId)) {
      return res.status(400).json({ message: 'Invalid appointment ID.' });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found.' });
    }

    // Only the patient who made the booking can cancel
    if (appointment.patientId !== patientId) {
      return res.status(403).json({ message: 'You can only cancel your own appointments.' });
    }

    if (appointment.status === 'CANCELLED') {
      return res.status(400).json({ message: 'Appointment is already cancelled.' });
    }

    if (appointment.status === 'COMPLETED') {
      return res.status(400).json({ message: 'Cannot cancel an appointment that has already been completed.' });
    }

    // Patients can cancel only BEFORE the appointment time
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    if (appointment.appointmentDate < todayStr) {
      return res.status(400).json({ message: 'Cannot cancel an appointment in the past.' });
    }

    if (appointment.appointmentDate === todayStr) {
      const [slotH, slotM] = appointment.timeSlot.split(':').map(Number);
      const slotMinutes = slotH * 60 + (slotM || 0);
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      if (slotMinutes <= currentMinutes) {
        return res.status(400).json({ message: 'Cannot cancel an appointment after or during the appointment time.' });
      }
    }

    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: 'CANCELLED' },
      include: {
        doctor: {
          select: { id: true, name: true, doctorProfile: true },
        },
      },
    });

    return res.json({
      message: 'Appointment cancelled successfully.',
      appointment: updated,
    });
  } catch (error) {
    console.error('cancelAppointment error:', error);
    return res.status(500).json({ message: 'Failed to cancel appointment.' });
  }
};
