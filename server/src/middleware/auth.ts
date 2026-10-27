import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest, AuthUserPayload } from '../types/index.js';

export const requireAuth = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    let token: string | undefined;

    // 1. Check Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    // 2. Or fallback to cookies if parsed
    if (!token && (req as any).cookies?.token) {
      token = (req as any).cookies.token;
    }

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in to continue.',
      });
      return;
    }

    const secret = process.env.JWT_SECRET || 'dev_fallback_secret_scholar_track_2026';
    const decoded = jwt.verify(token, secret) as AuthUserPayload;

    req.user = decoded;
    next();
  } catch (err: any) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication session. Please log in again.',
    });
  }
};

export const optionalAuth = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    let token: string | undefined;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token && (req as any).cookies?.token) {
      token = (req as any).cookies.token;
    }

    if (token) {
      const secret = process.env.JWT_SECRET || 'dev_fallback_secret_scholar_track_2026';
      const decoded = jwt.verify(token, secret) as AuthUserPayload;
      req.user = decoded;
    }
  } catch (err) {
    // Ignore error for optional auth
  }
  next();
};
