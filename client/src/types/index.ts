export interface User {
  id: string;
  name: string;
  email: string;
  educationLevel?: string;
  academicPercentage?: number;
  annualIncome?: number;
  state?: string;
  category?: string;
  gender?: string;
  createdAt?: string;
}

export interface Scholarship {
  _id: string;
  title: string;
  provider: string;
  description: string;
  awardAmount: string;
  amountValue: number;
  educationLevels: string[];
  academicRequirements: string;
  minPercentage: number;
  maxAnnualIncome?: number;
  applicableStates: string[];
  categories: string[];
  genderEligibility?: string;
  deadline: string;
  deadlineDate?: string;
  officialUrl: string;
  isVerified: boolean;
  isDemo: boolean;
  documentRequirements: string[];
  tags: string[];
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ApplicationStatus =
  | 'Interested'
  | 'Planning to Apply'
  | 'Applied'
  | 'Documents Pending'
  | 'Completed';

export interface ApplicationItem {
  _id: string;
  userId: string;
  scholarshipId: Scholarship;
  status: ApplicationStatus;
  notes: string;
  appliedDate?: string;
  targetDeadline?: string;
  documentsSubmitted?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SavedScholarshipItem {
  _id: string;
  userId: string;
  scholarshipId: Scholarship;
  savedAt: string;
}

export interface CriteriaCheckResult {
  criterion: string;
  satisfied: boolean;
  userValue: any;
  requiredValue: any;
  message: string;
}

export interface EligibilityAssessment {
  scholarshipId: string;
  title: string;
  provider: string;
  awardAmount: string;
  status: 'ELIGIBLE' | 'PARTIALLY_ELIGIBLE' | 'INELIGIBLE';
  matchScore: number;
  satisfiedCount: number;
  totalCriteriaCount: number;
  breakdown: CriteriaCheckResult[];
  missingCriteria: string[];
  recommendationReason: string;
  officialUrl?: string;
  isVerified: boolean;
}

export interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
  suggestedQuestions?: string[];
  groundedScholarships?: {
    id: string;
    title: string;
    awardAmount: string;
    officialUrl: string;
    provider: string;
  }[];
}
