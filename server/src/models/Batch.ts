import { Schema, model } from 'mongoose';

const batchStudentSchema = new Schema(
  {
    srNo: String,
    name: String,
    firstName: String,
    lastName: String,
    startDate: String,
    contact: String,
    attendanceRatio: { type: String, default: '100%' },
    attendedLectures: { type: Number, default: 0 },
    totalLectures: { type: Number, default: 0 },
    remark: { type: String, default: 'Regular Attendance' },
    fees: { type: String, default: '₹35,000 Paid' },
    address: { type: String, default: 'Pune' },
  },
  { _id: true }
);

const batchLectureSchema = new Schema(
  {
    srNo: String,
    lectureTopic: { type: String },
    title: { type: String },
    date: { type: String, required: true },
    timeSlot: { type: String, default: '11:00 - 12:00' },
    course: String,
    hoursSpent: { type: String, default: '01' },
    attendanceRatio: String,
    totalStudents: { type: Number, default: 0 },
    presentStudents: { type: Number, default: 0 },
    topicsCovered: [String],
    topics: [String],
    assignmentGiven: { type: String, default: 'None' },
    assignment: { type: String, default: 'None' },
    studentsList: [
      {
        srNo: String,
        name: String,
        startDate: String,
        contact: String,
        remark: String,
        isPresent: { type: Boolean, default: true },
        present: { type: Boolean, default: true },
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
    endDate: { type: String, default: '2026-06-30' },
    course: { type: String, required: true },
    faculty: { type: String, required: true },
    studentCount: { type: Number, default: 0 },
    completedLectures: { type: Number, default: 0 },
    hoursSpent: { type: Number, default: 0 },
    phase: { type: String, default: 'Active' },
    timeSlot: { type: String, default: '11:00 - 12:00' },
    students: [batchStudentSchema],
    lectures: [batchLectureSchema],
  },
  { timestamps: true }
);

export const Batch = model('Batch', batchSchema);