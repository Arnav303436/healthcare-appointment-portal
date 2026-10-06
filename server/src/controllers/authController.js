import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../prisma.js';

const JWT_SECRET = process.env.JWT_SECRET || 'college_project_super_secret_jwt_key_2026';

const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '7d' });
};

export const register = async (req, res) => {
  try {
    const { name, email, password, role = 'PATIENT', phone, specialization, bio, experienceYears, consultationFee, clinicAddress } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'A user with this email already exists.' });
    }

    const validRoles = ['PATIENT', 'DOCTOR'];
    const assignedRole = validRoles.includes(role.toUpperCase()) ? role.toUpperCase() : 'PATIENT';

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role: assignedRole,
        phone: phone ? phone.trim() : null,
        ...(assignedRole === 'DOCTOR' && {
          doctorProfile: {
            create: {
              specialization: specialization || 'General Medicine',
              bio: bio || 'Dedicated healthcare practitioner focused on patient well-being.',
              experienceYears: experienceYears ? parseInt(experienceYears, 10) : 5,
              consultationFee: consultationFee ? parseFloat(consultationFee) : 50.0,
              clinicAddress: clinicAddress || 'City Health Medical Center, Suite 101',
              workingHoursStart: '09:00',
              workingHoursEnd: '17:00',
              workingDays: 'Monday,Tuesday,Wednesday,Thursday,Friday',
              slotDurationMinutes: 30,
            },
          },
        }),
      },
      include: { doctorProfile: true },
    });

    const token = generateToken(newUser.id, newUser.role);

    const { password: _, ...userWithoutPassword } = newUser;

    return res.status(201).json({
      message: 'User registered successfully',
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ message: 'Internal server error during registration.' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: { doctorProfile: true },
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = generateToken(user.id, user.role);
    const { password: _, ...userWithoutPassword } = user;

    return res.json({
      message: 'Login successful',
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error during login.' });
  }
};

export const getMe = async (req, res) => {
  try {
    const { password: _, ...userWithoutPassword } = req.user;
    return res.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('GetMe error:', error);
    return res.status(500).json({ message: 'Error retrieving user profile.' });
  }
};
