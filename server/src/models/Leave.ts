import { Schema, model, Document } from 'mongoose';

export interface ILeave extends Document {
  userId?: string;
  userName?: string;
  firstName?: string;
  lastName?: string;
  userRole?: string;
  role?: string;
  mobile?: string;
  email?: string;
  leaveType: string;
  leaveDate?: string;
  fromDate: string;
  toDate: string;
  noOfDays: string;
  reason: string;
  applicationDate: string;
  status: 'Active' | 'Pending' | 'Rejected' | 'Approved';
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

const leaveSchema = new Schema<ILeave>(
  {
    userId: { type: String, default: 'user-1' },
    userName: { type: String, default: 'User' },
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    userRole: { type: String, default: 'Faculty' },
    role: { type: String, default: 'Faculty' },
    mobile: { type: String, default: '9876543210' },
    email: { type: String, default: 'staff@radiquolab.com' },
    leaveType: {
      type: String,
      default: 'Casual',
    },
    leaveDate: { type: String },
    fromDate: { type: String, required: true },
    toDate: { type: String, required: true },
    noOfDays: { type: String, default: '01' },
    reason: { type: String, required: true },
    applicationDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
    status: {
      type: String,
      enum: ['Active', 'Pending', 'Rejected', 'Approved'],
      default: 'Pending',
    },
    rejectionReason: { type: String, default: '' },
    reviewedBy: { type: String, default: '' },
    reviewedAt: { type: String, default: '' },
  },
  { timestamps: true }
);

export const Leave = model<ILeave>('Leave', leaveSchema);
export default Leave;