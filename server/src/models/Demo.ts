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
  cancellationReason?: string;
  feedback?: string;
}

const demoSchema = new Schema<IDemo>(
  {
    srNo: { type: String, required: true },
    name: { type: String, required: true },
    lastName: { type: String, default: '' },
    contactNo: { type: String, required: true, default: '9078675645' },
    address: { type: String, default: 'Pune' },
    timeSlot: { type: String, required: true },
    demoDate: { type: String, required: true },
    course: { type: String, required: true },
    mode: { type: String, enum: ['Online', 'Offline'], default: 'Online' },
    faculty: { type: String, required: true },
    status: { type: String, enum: ['Scheduled', 'Completed', 'Cancelled'], default: 'Scheduled' },
    cancellationReason: { type: String },
    feedback: { type: String },
  },
  { timestamps: true }
);

export const Demo = model<IDemo>('Demo', demoSchema);