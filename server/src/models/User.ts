import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  educationLevel?: string;
  academicPercentage?: number;
  annualIncome?: number;
  state?: string;
  category?: string;
  gender?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
    },
    educationLevel: {
      type: String,
      trim: true,
      default: '',
    },
    academicPercentage: {
      type: Number,
      min: [0, 'Percentage cannot be less than 0'],
      max: [100, 'Percentage cannot exceed 100'],
      default: undefined,
    },
    annualIncome: {
      type: Number,
      min: [0, 'Annual income cannot be negative'],
      default: undefined,
    },
    state: {
      type: String,
      trim: true,
      default: '',
    },
    category: {
      type: String,
      trim: true,
      default: '',
    },
    gender: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Note: Email index is automatically unique
export const User = mongoose.model<IUser>('User', UserSchema);
