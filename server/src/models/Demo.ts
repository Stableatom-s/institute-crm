import { Schema, model, Document } from 'mongoose';

export interface IDemo extends Document {
  srNo: string;
  name: string;
  lastName?: string;
  contactNo: string;
  address?: string;
  timeSlot: string;
  demoDate: string;
  course: string;
  mode: 'Online' | 'Offline';
  faculty: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  demoStatusText?: string;
  remark?: string;
  cancellationReason?: string;
  feedback?: string;
  screenshotUrl?: string;
}

const demoSchema = new Schema<IDemo>(
  {
    srNo: { type: String, required: true },
    name: { type: String, required: true },
    lastName: { type: String, default: '' },
    contactNo: { type: String, required: true },
    address: { type: String, default: '' },
    timeSlot: { type: String, required: true },
    demoDate: { type: String, required: true },
    course: { type: String, required: true },
    mode: { type: String, enum: ['Online', 'Offline'], required: true },
    faculty: { type: String, required: true },
    status: { type: String, enum: ['Scheduled', 'Completed', 'Cancelled'], default: 'Scheduled' },
    demoStatusText: { type: String, default: '' },
    remark: { type: String, default: '' },
    cancellationReason: { type: String, default: '' },
    feedback: { type: String, default: '' },
    screenshotUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

export const Demo = model<IDemo>('Demo', demoSchema);