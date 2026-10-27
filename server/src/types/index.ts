import { Request } from 'express';

export interface AuthUserPayload {
  userId: string;
  email: string;
  name: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUserPayload;
}

export type ApplicationStatus =
  | 'Interested'
  | 'Planning to Apply'
  | 'Applied'
  | 'Documents Pending'
  | 'Completed';

export interface EligibilityInput {
  educationLevel?: string;
  academicPercentage?: number;
  annualIncome?: number;
  state?: string;
  category?: string;
  gender?: string;
}

export interface CriteriaCheckResult {
  criterion: string;
  satisfied: boolean;
  userValue: any;
  requiredValue: any;
  message: string;
}

export interface ScholarshipEligibilityAssessment {
  scholarshipId: string;
  title: string;
  provider: string;
  awardAmount: string;
  status: 'ELIGIBLE' | 'PARTIALLY_ELIGIBLE' | 'INELIGIBLE';
  matchScore: number; // 0 - 100%
  satisfiedCount: number;
  totalCriteriaCount: number;
  breakdown: CriteriaCheckResult[];
  missingCriteria: string[];
  recommendationReason: string;
  officialUrl?: string;
  isVerified: boolean;
}
