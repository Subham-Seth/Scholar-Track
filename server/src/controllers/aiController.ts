import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AIService } from '../services/aiService.js';
import { AuthenticatedRequest } from '../types/index.js';
import { User } from '../models/User.js';

const chatSchema = z.object({
  message: z.string().min(1, 'Message is required').max(2000),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant', 'system']),
        content: z.string(),
      })
    )
    .optional(),
  profile: z
    .object({
      educationLevel: z.string().optional(),
      academicPercentage: z.number().optional(),
      annualIncome: z.number().optional(),
      state: z.string().optional(),
      category: z.string().optional(),
      gender: z.string().optional(),
    })
    .optional(),
});

const guidanceSchema = z.object({
  type: z.enum(['sop', 'checklist', 'email', 'mistakes']),
  scholarshipTitle: z.string().optional(),
  studentDetails: z
    .object({
      name: z.string().optional(),
      course: z.string().optional(),
      college: z.string().optional(),
      goals: z.string().optional(),
      financialContext: z.string().optional(),
    })
    .optional(),
});

export const chatWithScholarBot = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const validated = chatSchema.parse(req.body);

    // If user is authenticated and didn't pass explicit profile, populate from DB
    let userProfile = validated.profile;
    if (!userProfile && req.user) {
      const user = await User.findById(req.user.userId);
      if (user) {
        userProfile = {
          educationLevel: user.educationLevel,
          academicPercentage: user.academicPercentage,
          annualIncome: user.annualIncome,
          state: user.state,
          category: user.category,
          gender: user.gender,
        };
      }
    }

    const result = await AIService.chat(
      validated.message,
      validated.history || [],
      userProfile
    );

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (err) {
    next(err);
  }
};

export const getAIRecommendations = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let profile = req.body;

    // Fallback to logged-in user profile if empty
    if ((!profile || Object.keys(profile).length === 0) && req.user) {
      const user = await User.findById(req.user.userId);
      if (user) {
        profile = {
          educationLevel: user.educationLevel,
          academicPercentage: user.academicPercentage,
          annualIncome: user.annualIncome,
          state: user.state,
          category: user.category,
          gender: user.gender,
        };
      }
    }

    const recommendations = await AIService.getRecommendations(profile || {});

    res.status(200).json({
      success: true,
      data: recommendations,
      count: recommendations.length,
      disclaimer:
        'Recommendations are determined through rule-based matching with scholarship criteria. Always consult official scholarship notices before applying.',
    });
  } catch (err) {
    next(err);
  }
};

export const getApplicationGuidance = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const validated = guidanceSchema.parse(req.body);

    const guidance = await AIService.generateApplicationGuidance(validated);

    res.status(200).json({
      success: true,
      ...guidance,
    });
  } catch (err) {
    next(err);
  }
};
