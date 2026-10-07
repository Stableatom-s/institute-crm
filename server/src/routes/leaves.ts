import { Schema, model, Document } from 'mongoose';
import { Router, Request, Response } from 'express';
import { Leave } from '../models/Leave';

const router = Router();  

export interface ILeave extends Document {
  userId?: string;
  userName?: string;
  userRole?: string;
  leaveType: string;
  leaveDate: string;
  startDate?: string;
  endDate?: string;
  daysCount?: number;
  reason: string;
  applicationDate?: string;
  status: 'Approved' | 'Rejected' | 'Pending';
  reviewedBy?: string;
  reviewedAt?: string;
  adminRemarks?: string;
}

const leaveSchema = new Schema<ILeave>(
  {
    userId: { type: String, default: 'user-1' },
    userName: { type: String, default: 'User' },
    userRole: { type: String, default: 'Faculty' },
    leaveType: { type: String, default: 'Casual' },
    leaveDate: { type: String, required: true },
    startDate: { type: String },
    endDate: { type: String },
    daysCount: { type: Number, default: 1 },
    reason: { type: String, required: true },
    applicationDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
    status: {
      type: String,
      enum: ['Approved', 'Rejected', 'Pending'],
      default: 'Pending',
    },
    reviewedBy: { type: String, default: '' },
    reviewedAt: { type: String, default: '' },
    adminRemarks: { type: String, default: '' },
  },
  { timestamps: true }
);

export const leaveRoutes = router;
export default router;