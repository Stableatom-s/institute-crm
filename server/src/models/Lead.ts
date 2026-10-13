import { Schema, model, Document } from 'mongoose';

export interface ITimelineEntry {
  id?: string;
  timestamp: string;
  status: string;
  title: string;
  description: string;
}

export interface ILead extends Document {
  srNo: string;
  firstName: string;
  lastName: string;
  contactNo: string;
  email: string;
  enquiryDate: string;
  course: string;
  status: 'Interested' | 'Not Interested' | 'Demo Scheduled' | 'Enrolled' | 'Contacted';
  followUp: string;
  remark: string;
  occupation: string;
  leadSource: string;
  address: string;
  assignedTo: string;
  offeredFees: string;
  finalFees: string;
  referral: 'Yes' | 'No';
  referralMobile?: string;
  referralName?: string;
  enquiringFor: 'Self' | 'Family' | 'Friend' | 'Other';
  studentName?: string;
  studentMobile?: string;
  timeline: ITimelineEntry[];
}

const timelineSchema = new Schema<ITimelineEntry>(
  {
    id: { type: String, default: () => `t-${Date.now()}-${Math.random().toString(36).substr(2, 4)}` },
    timestamp: { type: String, required: true },
    status: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
  },
  { _id: false }
);

const leadSchema = new Schema<ILead>(
  {
    srNo: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, default: '' },
    contactNo: { type: String, required: true },
    email: { type: String, default: '' },
    enquiryDate: { type: String, required: true },
    course: { type: String, required: true },
    status: {
      type: String,
      enum: ['Interested', 'Not Interested', 'Demo Scheduled', 'Enrolled', 'Contacted'],
      default: 'Interested',
    },
    followUp: { type: String, default: '' },
    remark: { type: String, default: '' },
    occupation: { type: String, default: '' },
    leadSource: { type: String, default: '' },
    address: { type: String, default: '' },
    assignedTo: { type: String, default: '' },
    offeredFees: { type: String, default: '' },
    finalFees: { type: String, default: '' },
    referral: { type: String, enum: ['Yes', 'No'], default: 'No' },
    referralMobile: { type: String, default: '' },
    referralName: { type: String, default: '' },
    enquiringFor: { 
      type: String, 
      enum: ['Self', 'Family', 'Friend', 'Other'], 
      default: 'Self' 
    },
    studentName: { type: String, default: '' },
    studentMobile: { type: String, default: '' },
    timeline: [timelineSchema],
  },
  { timestamps: true }
);

export const Lead = model<ILead>('Lead', leadSchema);