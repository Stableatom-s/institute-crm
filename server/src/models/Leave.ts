import { Schema, model, Document } from 'mongoose';

export interface ILeave extends Document {
  userId?: string;
  userName?: string;
  leaveType: 'Sick' | 'Casual' | 'Vacation';
  leaveDate: string;
  reason: string;
  applicationDate: string;
  status: 'Approved' | 'Pending' | 'Rejected';
}

const leaveSchema = new Schema<ILeave>(
  {
    userId: { type: String },
    userName: { type: String, default: 'User' },
    leaveType: {
      type: String,
      enum: ['Sick', 'Casual', 'Vacation'],
      default: 'Casual',
    },
    leaveDate: { type: String, required: true },
    reason: { type: String, required: true },
    applicationDate: { type: String, required: true },
    status: {
      type: String,
      enum: ['Approved', 'Pending', 'Rejected'],
      default: 'Pending',
    },
  },
  { timestamps: true }
);

export const Leave = model<ILeave>('Leave', leaveSchema);