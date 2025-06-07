import jwt from 'jsonwebtoken';
import { UserRole } from '../models/userRoles'; // Assuming User model will have id and role

// TODO: Move JWT_SECRET to an environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-and-long-jwt-key';
const JWT_EXPIRES_IN = '1h'; // Token expiration time

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const verifyToken = (token: string): JwtPayload | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return decoded;
  } catch (error) {
    console.error('Invalid token:', error);
    return null;
  }
};
