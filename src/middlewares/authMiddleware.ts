import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwtUtils';
import { UserRole } from '../models/userRoles';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({ message: 'Authentication token required.' });
    return;
  }

  const decodedUser = verifyToken(token);
  if (!decodedUser) {
    res.status(403).json({ message: 'Invalid or expired token.' });
    return;
  }

  req.user = decodedUser;
  next();
};

export const authorizeRoles = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !req.user.role) {
      res.status(403).json({ message: 'User role not found.' });
      return;
    }

    const hasRole = allowedRoles.includes(req.user.role);
    if (!hasRole) {
      res.status(403).json({
        message: `Access denied. User role '${req.user.role}' is not authorized.`
      });
      return;
    }
    next();
  };
};
