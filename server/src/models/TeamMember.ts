import { Schema, model, Document } from 'mongoose';

export interface ILeaveHistoryItem {
  leaveType: string;
  leaveDate: string;
  reason: string;
  applicationDate: string;
  status: 'Approved' | 'Rejected' | 'Pending';
}

export interface ITeamMember extends Document {
  srNo: string;
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
  photoUrl: string;
  workHistory: {
    companyName: string;
    jobTitle: string;
    experienceYears: string;
  };
  leaveHistory: ILeaveHistoryItem[];
}

const teamMemberSchema = new Schema<ITeamMember>(
  {
    srNo: { type: String, default: '01' },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, enum: ['Faculty', 'Sales', 'Sales Manager'], default: 'Faculty' },
    mobile: { type: String, required: true },
    altMobile: { type: String, default: '9875898412' },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    address: { type: String, default: 'Pune' },
    education: { type: String, default: 'B.arch' },
    course: { type: String, default: 'UI/UX Design' },
    assignedBatches: { type: [String], default: [] },
    activeTill: { type: String },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
    photoUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    },
    workHistory: {
      companyName: { type: String, default: 'Abc Pvt ltd' },
      jobTitle: { type: String, default: 'Jr. Architect' },
      experienceYears: { type: String, default: '01 years' },
    },
    leaveHistory: [
      {
        leaveType: String,
        leaveDate: String,
        reason: String,
        applicationDate: String,
        status: { type: String, enum: ['Approved', 'Rejected', 'Pending'], default: 'Approved' },
      },
    ],
  },
  { timestamps: true }
);

export const TeamMember = model<ITeamMember>('TeamMember', teamMemberSchema);
export default TeamMember;