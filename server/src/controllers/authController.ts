import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { User } from '../models/User.js';
import { AuthenticatedRequest, AuthUserPayload } from '../types/index.js';

const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters long').max(100),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    confirmPassword: z.string(),
    educationLevel: z.string().optional(),
    academicPercentage: z.number().min(0).max(100).optional(),
    annualIncome: z.number().min(0).optional(),
    state: z.string().optional(),
    category: z.string().optional(),
    gender: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

const generateToken = (payload: AuthUserPayload): string => {
  const secret = process.env.JWT_SECRET || 'dev_fallback_secret_scholar_track_2026';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign(payload, secret, { expiresIn: expiresIn as any });
};

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const validatedData = registerSchema.parse(req.body);

    const existingUser = await User.findOne({ email: validatedData.email.toLowerCase() });
    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'An account with this email address already exists. Please log in.',
      });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(validatedData.password, salt);

    const user = await User.create({
      name: validatedData.name.trim(),
      email: validatedData.email.toLowerCase().trim(),
      passwordHash,
      educationLevel: validatedData.educationLevel || '',
      academicPercentage: validatedData.academicPercentage,
      annualIncome: validatedData.annualIncome,
      state: validatedData.state || '',
      category: validatedData.category || '',
      gender: validatedData.gender || '',
    });

    const tokenPayload: AuthUserPayload = {
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
    };

    const token = generateToken(tokenPayload);

    // Set HTTP-only secure cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to Scholar-Track.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        educationLevel: user.educationLevel,
        academicPercentage: user.academicPercentage,
        annualIncome: user.annualIncome,
        state: user.state,
        category: user.category,
        gender: user.gender,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const validatedData = loginSchema.parse(req.body);

    const user = await User.findOne({ email: validatedData.email.toLowerCase().trim() });
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
      return;
    }

    const isMatch = await bcrypt.compare(validatedData.password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
      return;
    }

    const tokenPayload: AuthUserPayload = {
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
    };

    const token = generateToken(tokenPayload);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        educationLevel: user.educationLevel,
        academicPercentage: user.academicPercentage,
        annualIncome: user.annualIncome,
        state: user.state,
        category: user.category,
        gender: user.gender,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const logout = async (
  req: Request,
  res: Response
): Promise<void> => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });
  res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
};

export const getMe = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const user = await User.findById(req.user.userId).select('-passwordHash');
    if (!user) {
      res.status(404).json({ success: false, message: 'User account not found.' });
      return;
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        educationLevel: user.educationLevel,
        academicPercentage: user.academicPercentage,
        annualIncome: user.annualIncome,
        state: user.state,
        category: user.category,
        gender: user.gender,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};
