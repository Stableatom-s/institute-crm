import { Schema, model, Document } from 'mongoose';

export interface IActivity {
  activity: string;
  timeSpent: string;
  details?: string;
}

export interface IAttendance extends Document {
  userId?: string;
  userName?: string;
  userRole?: string;
  date: string;
  inTime: string;
  outTime: string;
  workingHours: string;
  activities: IActivity[];
}

const activitySchema = new Schema<IActivity>(
  {
    activity: { type: String, required: true },
    timeSpent: { type: String, required: true },
    details: { type: String, default: '' },
  },
  { _id: true }
);

const attendanceSchema = new Schema<IAttendance>(
  {
    userId: { type: String },
    userName: { type: String, default: 'User' },
    userRole: { type: String, default: 'Sales' },
    date: { type: String, required: true },
    inTime: { type: String, required: true },
    outTime: { type: String, default: 'Yet to checkout' },
    workingHours: { type: String, default: '00:00' },
    activities: [activitySchema],
  },
  { timestamps: true }
);

export const Attendance = model<IAttendance>('Attendance', attendanceSchema);