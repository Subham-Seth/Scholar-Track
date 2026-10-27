import { Request, Response, NextFunction } from 'express';
import { Scholarship } from '../models/Scholarship.js';

export const getScholarships = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      search,
      educationLevel,
      category,
      state,
      minPercentage,
      maxAnnualIncome,
      sortBy = 'newest',
      page = '1',
      limit = '12',
      featured,
    } = req.query;

    const query: any = {};

    // Search filter
    if (search && typeof search === 'string' && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { provider: searchRegex },
        { description: searchRegex },
        { tags: searchRegex },
      ];
    }

    // Education Level filter
    if (educationLevel && typeof educationLevel === 'string' && educationLevel !== 'All') {
      query.educationLevels = { $in: [educationLevel] };
    }

    // Category filter
    if (category && typeof category === 'string' && category !== 'All') {
      query.categories = { $in: [category] };
    }

    // State filter
    if (state && typeof state === 'string' && state !== 'All') {
      query.applicableStates = { $in: [state, 'All India'] };
    }

    // Percentage threshold
    if (minPercentage && !isNaN(Number(minPercentage))) {
      query.minPercentage = { $lte: Number(minPercentage) };
    }

    // Income threshold
    if (maxAnnualIncome && !isNaN(Number(maxAnnualIncome))) {
      query.$or = [
        { maxAnnualIncome: { $gte: Number(maxAnnualIncome) } },
        { maxAnnualIncome: { $exists: false } },
        { maxAnnualIncome: null },
      ];
    }

    // Featured only
    if (featured === 'true') {
      query.featured = true;
    }

    // Sorting
    let sortOptions: any = { createdAt: -1 };
    if (sortBy === 'amount_high') {
      sortOptions = { amountValue: -1 };
    } else if (sortBy === 'amount_low') {
      sortOptions = { amountValue: 1 };
    } else if (sortBy === 'percentage') {
      sortOptions = { minPercentage: 1 };
    } else if (sortBy === 'title') {
      sortOptions = { title: 1 };
    }

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.max(1, Math.min(50, parseInt(limit as string, 10) || 12));
    const skip = (pageNum - 1) * limitNum;

    const [scholarships, total] = await Promise.all([
      Scholarship.find(query).sort(sortOptions).skip(skip).limit(limitNum).exec(),
      Scholarship.countDocuments(query).exec(),
    ]);

    res.status(200).json({
      success: true,
      data: scholarships,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getScholarshipById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const scholarship = await Scholarship.findById(id);
    if (!scholarship) {
      res.status(404).json({
        success: false,
        message: 'Scholarship not found with the requested ID.',
      });
      return;
    }

    // Find related scholarships in the same category
    const related = await Scholarship.find({
      _id: { $ne: scholarship._id },
      categories: { $in: scholarship.categories },
    })
      .limit(3)
      .exec();

    res.status(200).json({
      success: true,
      data: scholarship,
      related,
    });
  } catch (err) {
    next(err);
  }
};

export const getFilterMeta = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const [categories, educationLevels, states] = await Promise.all([
      Scholarship.distinct('categories'),
      Scholarship.distinct('educationLevels'),
      Scholarship.distinct('applicableStates'),
    ]);

    res.status(200).json({
      success: true,
      filters: {
        categories: categories.filter(Boolean),
        educationLevels: educationLevels.filter(Boolean),
        states: states.filter(Boolean),
      },
    });
  } catch (err) {
    next(err);
  }
};
