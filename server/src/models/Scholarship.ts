import mongoose, { Document, Schema } from 'mongoose';

export interface IScholarship extends Document {
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
  genderEligibility?: string; // 'All' | 'Female' | 'Transgender' | etc.
  deadline: string;
  deadlineDate?: Date;
  officialUrl: string;
  isVerified: boolean;
  isDemo: boolean;
  documentRequirements: string[];
  tags: string[];
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ScholarshipSchema = new Schema<IScholarship>(
  {
    title: {
      type: String,
      required: [true, 'Scholarship title is required'],
      trim: true,
      index: true,
    },
    provider: {
      type: String,
      required: [true, 'Provider name is required'],
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    awardAmount: {
      type: String,
      required: [true, 'Award amount is required'],
      trim: true,
    },
    amountValue: {
      type: Number,
      default: 0,
      index: true,
    },
    educationLevels: {
      type: [String],
      default: [],
      index: true,
    },
    academicRequirements: {
      type: String,
      default: '',
    },
    minPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
      index: true,
    },
    maxAnnualIncome: {
      type: Number,
      default: undefined,
      index: true,
    },
    applicableStates: {
      type: [String],
      default: ['All India'],
      index: true,
    },
    categories: {
      type: [String],
      default: ['Merit-based'],
      index: true,
    },
    genderEligibility: {
      type: String,
      default: 'All',
    },
    deadline: {
      type: String,
      default: 'Check Official Portal',
    },
    deadlineDate: {
      type: Date,
      default: undefined,
    },
    officialUrl: {
      type: String,
      default: '',
      trim: true,
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
    isDemo: {
      type: Boolean,
      default: false,
    },
    documentRequirements: {
      type: [String],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
    },
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Full text search index
ScholarshipSchema.index({
  title: 'text',
  provider: 'text',
  description: 'text',
  tags: 'text',
});

export const Scholarship = mongoose.model<IScholarship>('Scholarship', ScholarshipSchema);
