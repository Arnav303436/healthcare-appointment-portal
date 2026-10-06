import prisma from '../prisma.js';

export const getDoctors = async (req, res) => {
  try {
    const { search, specialization } = req.query;

    const whereClause = {
      role: 'DOCTOR',
      doctorProfile: {
        isNot: null,
      },
    };

    if (search && search.trim() !== '') {
      whereClause.name = {
        contains: search.trim(),
      };
    }

    if (specialization && specialization.trim() !== '' && specialization !== 'All') {
      whereClause.doctorProfile = {
        ...whereClause.doctorProfile,
        specialization: {
          contains: specialization.trim(),
        },
      };
    }

    const doctors = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        doctorProfile: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return res.json(doctors);
  } catch (error) {
    console.error('getDoctors error:', error);
    return res.status(500).json({ message: 'Failed to fetch doctors list.' });
  }
};

export const getDoctorById = async (req, res) => {
  try {
    const { id } = req.params;
    const doctorId = parseInt(id, 10);

    if (isNaN(doctorId)) {
      return res.status(400).json({ message: 'Invalid doctor ID.' });
    }

    const doctor = await prisma.user.findFirst({
      where: {
        id: doctorId,
        role: 'DOCTOR',
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        doctorProfile: true,
      },
    });

    if (!doctor || !doctor.doctorProfile) {
      return res.status(404).json({ message: 'Doctor not found.' });
    }

    return res.json(doctor);
  } catch (error) {
    console.error('getDoctorById error:', error);
    return res.status(500).json({ message: 'Failed to fetch doctor profile.' });
  }
};

export const getAvailableSlots = async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query; // YYYY-MM-DD
    const doctorId = parseInt(id, 10);

    if (isNaN(doctorId)) {
      return res.status(400).json({ message: 'Invalid doctor ID.' });
    }

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ message: 'Valid date query parameter is required (YYYY-MM-DD).' });
    }

    const doctor = await prisma.user.findFirst({
      where: { id: doctorId, role: 'DOCTOR' },
      include: { doctorProfile: true },
    });

    if (!doctor || !doctor.doctorProfile) {
      return res.status(404).json({ message: 'Doctor not found.' });
    }

    const profile = doctor.doctorProfile;

    // Parse date and day of week
    const [year, month, day] = date.split('-').map(Number);
    const targetDate = new Date(year, month - 1, day);
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const targetDayName = daysOfWeek[targetDate.getDay()];

    const workingDays = (profile.workingDays || 'Monday,Tuesday,Wednesday,Thursday,Friday')
      .split(',')
      .map(d => d.trim().toLowerCase());

    const isWorkingDay = workingDays.includes(targetDayName.toLowerCase());

    if (!isWorkingDay) {
      return res.json({
        date,
        dayName: targetDayName,
        isWorkingDay: false,
        message: `Doctor does not consult on ${targetDayName}s.`,
        slots: [],
      });
    }

    // Generate times based on working hours
    const startHourStr = profile.workingHoursStart || '09:00';
    const endHourStr = profile.workingHoursEnd || '17:00';
    const duration = profile.slotDurationMinutes || 30;

    const [startH, startM] = startHourStr.split(':').map(Number);
    const [endH, endM] = endHourStr.split(':').map(Number);

    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    const generatedSlots = [];
    for (let m = startMinutes; m < endMinutes; m += duration) {
      const h = Math.floor(m / 60);
      const min = m % 60;
      const formattedSlot = `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
      generatedSlots.push(formattedSlot);
    }

    // Fetch existing booked appointments for that doctor on that date
    const bookedAppointments = await prisma.appointment.findMany({
      where: {
        doctorId: doctorId,
        appointmentDate: date,
        status: {
          notIn: ['CANCELLED', 'REJECTED'],
        },
      },
      select: {
        timeSlot: true,
      },
    });

    const bookedSlotSet = new Set(bookedAppointments.map(a => a.timeSlot));

    // Check if date is in the past
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const isPastDate = date < todayStr;
    const isToday = date === todayStr;
    const currentMinutesNow = now.getHours() * 60 + now.getMinutes();

    const slots = generatedSlots.map(timeStr => {
      const [slotH, slotM] = timeStr.split(':').map(Number);
      const slotMinutes = slotH * 60 + slotM;

      let isAvailable = true;
      let reasonUnavailable = null;

      if (isPastDate) {
        isAvailable = false;
        reasonUnavailable = 'Past date';
      } else if (isToday && slotMinutes <= currentMinutesNow) {
        isAvailable = false;
        reasonUnavailable = 'Time has passed';
      } else if (bookedSlotSet.has(timeStr)) {
        isAvailable = false;
        reasonUnavailable = 'Already booked';
      }

      return {
        time: timeStr,
        isAvailable,
        reason: reasonUnavailable,
      };
    });

    return res.json({
      date,
      dayName: targetDayName,
      isWorkingDay: true,
      doctor: {
        id: doctor.id,
        name: doctor.name,
        specialization: profile.specialization,
        consultationFee: profile.consultationFee,
      },
      slots,
    });
  } catch (error) {
    console.error('getAvailableSlots error:', error);
    return res.status(500).json({ message: 'Failed to generate available slots.' });
  }
};
