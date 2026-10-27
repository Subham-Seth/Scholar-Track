import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AIService } from '../services/aiService.js';
import { EligibilityInput } from '../types/index.js';

const eligibilityCheckSchema = z.object({
  educationLevel: z.string().optional(),
  academicPercentage: z.number().min(0).max(100, 'Percentage must be between 0 and 100').optional(),
  annualIncome: z.number().min(0, 'Income cannot be negative').optional(),
  state: z.string().optional(),
  category: z.string().optional(),
  gender: z.string().optional(),
});

export const checkEligibility = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const input: EligibilityInput = eligibilityCheckSchema.parse(req.body);

    const assessments = await AIService.getRecommendations(input);

    const eligible = assessments.filter((a) => a.status === 'ELIGIBLE');
    const partiallyEligible = assessments.filter((a) => a.status === 'PARTIALLY_ELIGIBLE');
    const ineligible = assessments.filter((a) => a.status === 'INELIGIBLE');

    res.status(200).json({
      success: true,
      summary: {
        totalEvaluated: assessments.length,
        eligibleCount: eligible.length,
        partiallyEligibleCount: partiallyEligible.length,
        ineligibleCount: ineligible.length,
      },
      results: {
        eligible,
        partiallyEligible,
        ineligible,
      },
      disclaimer:
        'Preliminary automated assessment based on general published criteria. Final eligibility, quotas, and verifications are solely determined by the respective scholarship granting authorities.',
    });
  } catch (err) {
    next(err);
  }
};
