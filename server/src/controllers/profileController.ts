import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { User } from '../models/User.js';
import { AuthenticatedRequest } from '../types/index.js';

const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
  educationLevel: z.string().optional(),
  academicPercentage: z.number().min(0).max(100).optional(),
  annualIncome: z.number().min(0).optional(),
  state: z.string().optional(),
  category: z.string().optional(),
  gender: z.string().optional(),
});

export const getProfile = async (
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
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    res.status(200).json({
      success: true,
      profile: user,
    });
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const validatedData = updateProfileSchema.parse(req.body);

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: validatedData },
      { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      profile: user,
    });
  } catch (err) {
    next(err);
  }
};
