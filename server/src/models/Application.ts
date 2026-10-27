import mongoose, { Document, Schema } from 'mongoose';
import { ApplicationStatus } from '../types/index.js';

export interface IApplication extends Document {
  userId: mongoose.Types.ObjectId;
  scholarshipId: mongoose.Types.ObjectId;
  status: ApplicationStatus;
  notes: string;
  appliedDate?: Date;
  targetDeadline?: Date;
  documentsSubmitted: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ApplicationSchema = new Schema<IApplication>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    scholarshipId: {
      type: Schema.Types.ObjectId,
      ref: 'Scholarship',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: [
        'Interested',
        'Planning to Apply',
        'Applied',
        'Documents Pending',
        'Completed',
      ],
      default: 'Interested',
      index: true,
    },
    notes: {
      type: String,
      default: '',
      maxlength: 1000,
    },
    appliedDate: {
      type: Date,
      default: undefined,
    },
    targetDeadline: {
      type: Date,
      default: undefined,
    },
    documentsSubmitted: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Unique application per user and scholarship
ApplicationSchema.index({ userId: 1, scholarshipId: 1 }, { unique: true });

export const Application = mongoose.model<IApplication>(
  'Application',
  ApplicationSchema
);
