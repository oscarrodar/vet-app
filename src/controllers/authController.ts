import { Request, Response, NextFunction } from 'express';
import { PrismaClient, UserRole as PrismaUserRole } from '@prisma/client'; // Renamed to avoid conflict
import { hashPassword, comparePassword } from '../utils/passwordUtils';
import { generateToken, JwtPayload } from '../utils/jwtUtils';
import { UserRole as AppUserRole } from '../models/userRoles'; // App-defined enum

const prisma = new PrismaClient();

export const registerUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password, name, role } = req.body;

    if (!email || !password || !name || !role) {
      res.status(400).json({ message: 'All fields (email, password, name, role) are required.' });
      return;
    }

    // Validate role against AppUserRole enum
    if (!Object.values(AppUserRole).includes(role as AppUserRole)) {
      res.status(400).json({ message: 'Invalid user role provided.' });
      return;
    }

    // Cast AppUserRole to PrismaUserRole
    const prismaRole: PrismaUserRole = role as PrismaUserRole;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ message: 'User with this email already exists.' });
      return;
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: prismaRole,
      },
    });

    // Don't send password back
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json({ message: 'User registered successfully', user: userWithoutPassword });
    // No explicit return needed here as it's the end of the try block
  } catch (error) {
    console.error('Registration error:', error);
    next(error); // Pass error to Express error handling middleware
  }
};

export const loginUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required.' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ message: 'Invalid email or password.' });
      return;
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: 'Invalid email or password.' });
      return;
    }

    const tokenPayload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role as AppUserRole, // Cast Prisma role to AppUserRole for JWT
    };
    const token = generateToken(tokenPayload);

    res.status(200).json({ message: 'Login successful', token });
    // No explicit return needed here
  } catch (error) {
    console.error('Login error:', error);
    next(error); // Pass error to Express error handling middleware
  }
};
