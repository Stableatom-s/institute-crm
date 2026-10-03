// src/models/TeamMember.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface ILeaveHistory {
  leaveType: string;
  leaveDate: string;
  reason: string;
  applicationDate: string;
  status: 'Approved' | 'Rejected' | 'Pending';
}

export interface ITeamMember extends Document {
  srNo?: string;
  firstName: string;
  lastName: string;
  name: string;
  role: 'Faculty' | 'Sales' | 'Sales Manager';
  mobile: string;
  altMobile?: string;
  email: string;
  address: string;
  education: string;
  course: string;
  assignedBatches: string[];
  activeTill?: string;
  status: 'Active' | 'Inactive';
  removalReason?: string;
  photoUrl?: string;
  workHistory: {
    companyName: string;
    jobTitle: string;
    experienceYears: string;
  };
  leaveHistory: ILeaveHistory[];
}

const LeaveHistorySchema = new Schema<ILeaveHistory>({
  leaveType: { type: String, required: true },
  leaveDate: { type: String, required: true },
  reason: { type: String, required: true },
  applicationDate: { type: String, required: true },
  status: { type: String, enum: ['Approved', 'Rejected', 'Pending'], default: 'Pending' },
});

const TeamMemberSchema = new Schema<ITeamMember>(
  {
    srNo: { type: String },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, enum: ['Faculty', 'Sales', 'Sales Manager'], required: true },
    mobile: { type: String, required: true },
    altMobile: { type: String },
    email: { type: String, required: true, unique: true },
    address: { type: String, required: true },
    education: { type: String, required: true },
    course: { type: String, required: true },
    assignedBatches: { type: [String], default: [] },
    activeTill: { type: String },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
    removalReason: { type: String },
    photoUrl: { type: String, default: '' },
    workHistory: {
      companyName: { type: String, default: '' },
      jobTitle: { type: String, default: '' },
      experienceYears: { type: String, default: '' },
    },
    leaveHistory: { type: [LeaveHistorySchema], default: [] },
  },
  { timestamps: true }
);

export const TeamMember = mongoose.model<ITeamMember>('TeamMember', TeamMemberSchema);