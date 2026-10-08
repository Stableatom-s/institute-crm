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
  assignedTo: string; // <-- 1. ADD THIS TO INTERFACE
  offeredFees: string;
  finalFees: string;
  referral: 'Yes' | 'No';
  enquiringFor: 'Self' | 'Other';
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
    occupation: { type: String, default: 'College Student' },
    leadSource: { type: String, default: 'Instagram' },
    address: { type: String, default: 'Pune' },
    assignedTo: { type: String, default: 'Unassigned' }, // <-- 2. ADD THIS TO SCHEMA
    offeredFees: { type: String, default: '₹35,000' },
    finalFees: { type: String, default: '₹35,000' },
    referral: { type: String, enum: ['Yes', 'No'], default: 'No' },
    enquiringFor: { type: String, enum: ['Self', 'Other'], default: 'Self' },
    timeline: [timelineSchema],
  },
  { timestamps: true }
);

export const Lead = model<ILead>('Lead', leadSchema);