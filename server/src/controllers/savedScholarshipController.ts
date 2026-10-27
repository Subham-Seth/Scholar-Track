import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { SavedScholarship } from '../models/SavedScholarship.js';
import { Scholarship } from '../models/Scholarship.js';
import { AuthenticatedRequest } from '../types/index.js';

export const getSavedScholarships = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const saved = await SavedScholarship.find({ userId: req.user.userId })
      .populate('scholarshipId')
      .sort({ savedAt: -1 })
      .exec();

    // Filter out if any scholarship was deleted
    const validSaved = saved.filter((item) => item.scholarshipId != null);

    res.status(200).json({
      success: true,
      data: validSaved,
    });
  } catch (err) {
    next(err);
  }
};

export const saveScholarship = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const { scholarshipId } = req.body;
    if (!scholarshipId || !mongoose.Types.ObjectId.isValid(scholarshipId)) {
      res.status(400).json({ success: false, message: 'Valid scholarship ID is required.' });
      return;
    }

    const scholarship = await Scholarship.findById(scholarshipId);
    if (!scholarship) {
      res.status(404).json({ success: false, message: 'Scholarship not found.' });
      return;
    }

    // Check if already saved
    const existing = await SavedScholarship.findOne({
      userId: req.user.userId,
      scholarshipId,
    });

    if (existing) {
      res.status(200).json({
        success: true,
        message: 'Scholarship is already saved in your list.',
        data: existing,
      });
      return;
    }

    const newSaved = await SavedScholarship.create({
      userId: req.user.userId,
      scholarshipId,
    });

    res.status(201).json({
      success: true,
      message: 'Scholarship saved to your bookmarks.',
      data: newSaved,
    });
  } catch (err) {
    next(err);
  }
};

export const removeSavedScholarship = async (
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
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'Valid ID is required.' });
      return;
    }

    // `id` can either be the SavedScholarship _id or the scholarshipId itself
    const deleted = await SavedScholarship.findOneAndDelete({
      userId: req.user.userId,
      $or: [{ _id: id }, { scholarshipId: id }],
    });

    if (!deleted) {
      res.status(404).json({
        success: false,
        message: 'Saved scholarship not found or already removed.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Scholarship removed from your saved list.',
    });
  } catch (err) {
    next(err);
  }
};
