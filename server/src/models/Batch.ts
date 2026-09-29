import { Schema, model, Document } from 'mongoose';

const batchStudentSchema = new Schema(
  {
    srNo: String,
    name: String,
    firstName: String,
    lastName: String,
    startDate: String,
    contact: String,
    attendanceRatio: { type: String, default: '100%' },
    remark: { type: String, default: 'Active' },
    fees: { type: String, default: '₹35,000 Paid' },
    address: { type: String, default: 'Pune' },
  },
  { _id: true }
);

const batchLectureSchema = new Schema(
  {
    srNo: String,
    lectureTopic: String,
    date: String,
    timeSlot: String,
    hoursSpent: String,
    attendanceRatio: String,
    topicsCovered: [String],
    assignmentGiven: String,
    studentsList: [
      {
        srNo: String,
        name: String,
        startDate: String,
        contact: String,
        remark: String,
        isPresent: Boolean,
      },
    ],
  },
  { _id: true }
);

const batchSchema = new Schema(
  {
    srNo: { type: String, required: true },
    batchCode: { type: String, required: true, unique: true },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    course: { type: String, required: true },
    faculty: { type: String, required: true },
    studentCount: { type: Number, default: 0 },
    completedLectures: { type: Number, default: 0 },
    hoursSpent: { type: Number, default: 0 },
    phase: { type: String, default: 'Upcoming' },
    students: [batchStudentSchema],
    lectures: [batchLectureSchema],
  },
  { timestamps: true }
);

export const Batch = model('Batch', batchSchema);