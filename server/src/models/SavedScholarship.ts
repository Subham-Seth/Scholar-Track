import mongoose, { Document, Schema } from 'mongoose';

export interface ISavedScholarship extends Document {
  userId: mongoose.Types.ObjectId;
  scholarshipId: mongoose.Types.ObjectId;
  savedAt: Date;
}

const SavedScholarshipSchema = new Schema<ISavedScholarship>(
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
    savedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate bookmarks by the same user
SavedScholarshipSchema.index({ userId: 1, scholarshipId: 1 }, { unique: true });

export const SavedScholarship = mongoose.model<ISavedScholarship>(
  'SavedScholarship',
  SavedScholarshipSchema
);
