import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import { Application } from '../models/Application.js';
import { Scholarship } from '../models/Scholarship.js';
import { AuthenticatedRequest } from '../types/index.js';

const createApplicationSchema = z.object({
  scholarshipId: z.string().min(1, 'Scholarship ID is required'),
  status: z
    .enum(['Interested', 'Planning to Apply', 'Applied', 'Documents Pending', 'Completed'])
    .default('Interested'),
  notes: z.string().max(1000).optional(),
  targetDeadline: z.string().optional(),
});

const updateApplicationSchema = z.object({
  status: z
    .enum(['Interested', 'Planning to Apply', 'Applied', 'Documents Pending', 'Completed'])
    .optional(),
  notes: z.string().max(1000).optional(),
  targetDeadline: z.string().optional(),
  appliedDate: z.string().optional(),
  documentsSubmitted: z.array(z.string()).optional(),
});

export const getApplications = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const applications = await Application.find({ userId: req.user.userId })
      .populate('scholarshipId')
      .sort({ updatedAt: -1 })
      .exec();

    const validApplications = applications.filter((app) => app.scholarshipId != null);

    // Compute status distribution for dashboard charts
    const statusCounts: Record<string, number> = {
      Interested: 0,
      'Planning to Apply': 0,
      Applied: 0,
      'Documents Pending': 0,
      Completed: 0,
    };

    let totalPotentialValue = 0;

    validApplications.forEach((app: any) => {
      if (statusCounts[app.status] !== undefined) {
        statusCounts[app.status]++;
      }
      if (app.scholarshipId && app.scholarshipId.amountValue) {
        totalPotentialValue += app.scholarshipId.amountValue;
      }
    });

    res.status(200).json({
      success: true,
      data: validApplications,
      summary: {
        total: validApplications.length,
        statusCounts,
        totalPotentialValue,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const createApplication = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const validatedData = createApplicationSchema.parse(req.body);

    const scholarship = await Scholarship.findById(validatedData.scholarshipId);
    if (!scholarship) {
      res.status(404).json({ success: false, message: 'Scholarship not found.' });
      return;
    }

    // Check if application already exists for this scholarship
    const existing = await Application.findOne({
      userId: req.user.userId,
      scholarshipId: validatedData.scholarshipId,
    });

    if (existing) {
      res.status(409).json({
        success: false,
        message: 'This scholarship is already in your application tracker.',
        data: existing,
      });
      return;
    }

    const application = await Application.create({
      userId: req.user.userId,
      scholarshipId: validatedData.scholarshipId,
      status: validatedData.status,
      notes: validatedData.notes || '',
      targetDeadline: validatedData.targetDeadline ? new Date(validatedData.targetDeadline) : undefined,
    });

    const populated = await Application.findById(application._id).populate('scholarshipId');

    res.status(201).json({
      success: true,
      message: 'Scholarship successfully added to your application tracker!',
      data: populated,
    });
  } catch (err) {
    next(err);
  }
};

export const updateApplication = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'Invalid application ID.' });
      return;
    }

    const validatedData = updateApplicationSchema.parse(req.body);

    const updateObj: any = {};
    if (validatedData.status) {
      updateObj.status = validatedData.status;
      if (validatedData.status === 'Applied' && !validatedData.appliedDate) {
        updateObj.appliedDate = new Date();
      }
    }
    if (validatedData.notes !== undefined) updateObj.notes = validatedData.notes;
    if (validatedData.targetDeadline !== undefined) {
      updateObj.targetDeadline = validatedData.targetDeadline ? new Date(validatedData.targetDeadline) : null;
    }
    if (validatedData.appliedDate !== undefined) {
      updateObj.appliedDate = validatedData.appliedDate ? new Date(validatedData.appliedDate) : null;
    }
    if (validatedData.documentsSubmitted) {
      updateObj.documentsSubmitted = validatedData.documentsSubmitted;
    }

    const updated = await Application.findOneAndUpdate(
      { _id: id, userId: req.user.userId },
      { $set: updateObj },
      { new: true }
    ).populate('scholarshipId');

    if (!updated) {
      res.status(404).json({
        success: false,
        message: 'Application not found or unauthorized to update.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Application tracker updated.',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteApplication = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'Invalid application ID.' });
      return;
    }

    const deleted = await Application.findOneAndDelete({
      _id: id,
      userId: req.user.userId,
    });

    if (!deleted) {
      res.status(404).json({
        success: false,
        message: 'Application not found or unauthorized to delete.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Application removed from tracker.',
    });
  } catch (err) {
    next(err);
  }
};
