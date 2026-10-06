import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const formatDate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

async function main() {
  console.log('--- Cleaning existing database tables ---');
  await prisma.appointment.deleteMany({});
  await prisma.doctorProfile.deleteMany({});
  await prisma.user.deleteMany({});

  const defaultPassword = await bcrypt.hash('password123', 10);

  console.log('--- Seeding Doctors ---');
  const doctorsData = [
    {
      name: 'Dr. Sarah Jenkins',
      email: 'dr.jenkins@healthportal.com',
      phone: '+1 (555) 234-5671',
      specialization: 'Cardiology',
      bio: 'Board-certified cardiologist with over 12 years of experience specializing in cardiovascular health, hypertension management, and preventive heart care.',
      experienceYears: 12,
      consultationFee: 85.0,
      clinicAddress: 'Metropolitan Heart Center, Suite 402, 500 Health Way',
      workingHoursStart: '09:00',
      workingHoursEnd: '17:00',
      workingDays: 'Monday,Tuesday,Wednesday,Thursday,Friday',
      slotDurationMinutes: 30,
    },
    {
      name: 'Dr. Marcus Vance',
      email: 'dr.vance@healthportal.com',
      phone: '+1 (555) 345-6782',
      specialization: 'Dermatology',
      bio: 'Expert dermatologist dedicated to acne treatments, cosmetic dermatology, eczema, skin cancer screening, and modern dermatological laser therapies.',
      experienceYears: 8,
      consultationFee: 70.0,
      clinicAddress: 'ClearSkin Dermatology Clinic, Suite 210, 880 Broadway',
      workingHoursStart: '10:00',
      workingHoursEnd: '18:00',
      workingDays: 'Monday,Tuesday,Wednesday,Thursday,Friday',
      slotDurationMinutes: 30,
    },
    {
      name: 'Dr. Elena Rostova',
      email: 'dr.rostova@healthportal.com',
      phone: '+1 (555) 456-7893',
      specialization: 'Pediatrics',
      bio: 'Compassionate pediatrician focusing on newborn care, child immunization, developmental milestones, and adolescent wellness.',
      experienceYears: 14,
      consultationFee: 75.0,
      clinicAddress: 'Sunshine Childrens Health Wing, 320 Maple Ave',
      workingHoursStart: '08:30',
      workingHoursEnd: '16:30',
      workingDays: 'Monday,Tuesday,Wednesday,Thursday,Friday',
      slotDurationMinutes: 30,
    },
    {
      name: 'Dr. David Chen',
      email: 'dr.chen@healthportal.com',
      phone: '+1 (555) 567-8904',
      specialization: 'Orthopedics',
      bio: 'Orthopedic surgeon and sports medicine specialist with deep expertise in joint reconstruction, arthritis management, and spine rehabilitation.',
      experienceYears: 10,
      consultationFee: 95.0,
      clinicAddress: 'Advanced Ortho & Spine Institute, Suite 105, 1200 Park Blvd',
      workingHoursStart: '09:00',
      workingHoursEnd: '17:00',
      workingDays: 'Monday,Tuesday,Wednesday,Thursday,Friday',
      slotDurationMinutes: 30,
    },
    {
      name: 'Dr. Priya Sharma',
      email: 'dr.sharma@healthportal.com',
      phone: '+1 (555) 678-9015',
      specialization: 'Neurology',
      bio: 'Fellowship-trained neurologist treating neurological disorders, migraines, neuropathies, sleep disorders, and stroke recovery.',
      experienceYears: 15,
      consultationFee: 110.0,
      clinicAddress: 'NeuroCare Institute, 7th Floor, Medical Arts Tower',
      workingHoursStart: '10:00',
      workingHoursEnd: '17:00',
      workingDays: 'Monday,Tuesday,Wednesday,Thursday,Friday',
      slotDurationMinutes: 30,
    },
    {
      name: 'Dr. Robert Miller',
      email: 'dr.miller@healthportal.com',
      phone: '+1 (555) 789-0126',
      specialization: 'General Medicine',
      bio: 'Primary care physician committed to comprehensive family care, routine wellness exams, preventative health screenings, and chronic illness management.',
      experienceYears: 6,
      consultationFee: 50.0,
      clinicAddress: 'Community Family Care Center, Suite 12, 45 Central Ave',
      workingHoursStart: '08:00',
      workingHoursEnd: '16:00',
      workingDays: 'Monday,Tuesday,Wednesday,Thursday,Friday,Saturday',
      slotDurationMinutes: 30,
    },
  ];

  const createdDoctors = [];
  for (const doc of doctorsData) {
    const user = await prisma.user.create({
      data: {
        name: doc.name,
        email: doc.email,
        password: defaultPassword,
        phone: doc.phone,
        role: 'DOCTOR',
        doctorProfile: {
          create: {
            specialization: doc.specialization,
            bio: doc.bio,
            experienceYears: doc.experienceYears,
            consultationFee: doc.consultationFee,
            clinicAddress: doc.clinicAddress,
            workingHoursStart: doc.workingHoursStart,
            workingHoursEnd: doc.workingHoursEnd,
            workingDays: doc.workingDays,
            slotDurationMinutes: doc.slotDurationMinutes,
          },
        },
      },
      include: { doctorProfile: true },
    });
    createdDoctors.push(user);
    console.log(` Created doctor: ${user.name} (${doc.specialization}) - ${user.email}`);
  }

  console.log('--- Seeding Patients ---');
  const patientsData = [
    {
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1 (555) 111-2233',
    },
    {
      name: 'Alice Smith',
      email: 'alice.smith@example.com',
      phone: '+1 (555) 444-5566',
    },
    {
      name: 'Michael Brown',
      email: 'michael.brown@example.com',
      phone: '+1 (555) 777-8899',
    },
  ];

  const createdPatients = [];
  for (const pat of patientsData) {
    const user = await prisma.user.create({
      data: {
        name: pat.name,
        email: pat.email,
        password: defaultPassword,
        phone: pat.phone,
        role: 'PATIENT',
      },
    });
    createdPatients.push(user);
    console.log(` Created patient: ${user.name} - ${user.email}`);
  }

  console.log('--- Seeding Sample Appointments ---');
  const now = new Date();

  // Helper for shifting days
  const addDays = (d, count) => {
    const copy = new Date(d);
    copy.setDate(copy.getDate() + count);
    return copy;
  };

  const pastDate1 = formatDate(addDays(now, -5));
  const pastDate2 = formatDate(addDays(now, -2));
  const futureDate1 = formatDate(addDays(now, 2));
  const futureDate2 = formatDate(addDays(now, 4));

  // Past completed appointment 1 (John Doe with Dr. Sarah Jenkins)
  await prisma.appointment.create({
    data: {
      patientId: createdPatients[0].id,
      doctorId: createdDoctors[0].id,
      appointmentDate: pastDate1,
      timeSlot: '10:00',
      reason: 'Regular annual cardiac screening and BP monitoring.',
      status: 'COMPLETED',
      consultationNotes: 'Blood pressure measured 122/80 mmHg. Resting ECG normal. Advised to continue moderate aerobic exercise 4x weekly.',
    },
  });

  // Past completed appointment 2 (Alice Smith with Dr. Marcus Vance)
  await prisma.appointment.create({
    data: {
      patientId: createdPatients[1].id,
      doctorId: createdDoctors[1].id,
      appointmentDate: pastDate2,
      timeSlot: '11:30',
      reason: 'Persistent skin rash and redness on forearms.',
      status: 'COMPLETED',
      consultationNotes: 'Diagnosed mild contact dermatitis. Prescribed 1% hydrocortisone cream for 7 days. Follow up if symptoms do not resolve.',
    },
  });

  // Upcoming confirmed appointment (John Doe with Dr. David Chen)
  await prisma.appointment.create({
    data: {
      patientId: createdPatients[0].id,
      doctorId: createdDoctors[3].id,
      appointmentDate: futureDate1,
      timeSlot: '14:00',
      reason: 'Follow-up for knee discomfort after running.',
      status: 'CONFIRMED',
    },
  });

  // Upcoming pending appointment (Alice Smith with Dr. Priya Sharma)
  await prisma.appointment.create({
    data: {
      patientId: createdPatients[1].id,
      doctorId: createdDoctors[4].id,
      appointmentDate: futureDate2,
      timeSlot: '10:30',
      reason: 'Frequent tension headaches and sleep disruption.',
      status: 'PENDING',
    },
  });

  // Upcoming pending appointment (Michael Brown with Dr. Robert Miller)
  await prisma.appointment.create({
    data: {
      patientId: createdPatients[2].id,
      doctorId: createdDoctors[5].id,
      appointmentDate: futureDate1,
      timeSlot: '09:00',
      reason: 'General health checkup and lab work review.',
      status: 'PENDING',
    },
  });

  console.log(' Seed finished successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
