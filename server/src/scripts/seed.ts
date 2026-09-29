import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Lead } from '../models/Lead';
import { Demo } from '../models/Demo';
import { Batch } from '../models/Batch';
import { Invoice } from '../models/Invoice';

dotenv.config();

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/institute_crm');
  console.log(' Connected for seeding...');

  await Lead.deleteMany({});
  await Demo.deleteMany({});
  await Batch.deleteMany({});
  await Invoice.deleteMany({});

  await Lead.create([
    {
      srNo: '01',
      firstName: 'Aanya',
      lastName: 'Shah',
      contactNo: '9078675645',
      email: 'aanya@gmail.com',
      enquiryDate: '21-12-2025',
      course: 'UI/UX Design',
      status: 'Interested',
      followUp: '01-01-2026',
      remark: 'Needs Time',
      occupation: 'Working',
      leadSource: 'Instagram',
      address: 'Pune',
      offeredFees: '₹35,000',
      finalFees: '₹35,000',
      referral: 'No',
      enquiringFor: 'Self',
      timeline: [
        {
          timestamp: '15-11-2025, 10:05 AM',
          status: 'Interested',
          title: 'Lead Remark',
          description: 'Lead created via inquiry form',
        },
      ],
    },
    {
      srNo: '02',
      firstName: 'Rohan',
      lastName: 'Mehta',
      contactNo: '9123456565',
      email: 'rohan.m@gmail.com',
      enquiryDate: '21-12-2025',
      course: 'No Code',
      status: 'Interested',
      followUp: '01-01-2026',
      remark: 'Needs Time',
      occupation: 'College Student',
      leadSource: 'Google Search',
      address: 'Mumbai',
      offeredFees: '₹30,000',
      finalFees: '₹28,000',
      referral: 'No',
      enquiringFor: 'Self',
      timeline: [],
    },
    {
      srNo: '03',
      firstName: 'Neha',
      lastName: 'Patel',
      contactNo: '9767564995',
      email: 'neha.patel@gmail.com',
      enquiryDate: '21-12-2025',
      course: 'UI/UX Design',
      status: 'Enrolled',
      followUp: '01-01-2026',
      remark: 'Joining Soon',
      occupation: 'Working',
      leadSource: 'LinkedIn',
      address: 'Pune',
      offeredFees: '₹35,000',
      finalFees: '₹35,000',
      referral: 'No',
      enquiringFor: 'Self',
      timeline: [],
    },
  ]);

  await Demo.create([
    {
      srNo: '01',
      name: 'Aanya Shah',
      timeSlot: '11:00 - 12:00',
      demoDate: '21-12-2025',
      course: 'UI/UX Design',
      mode: 'Online',
      faculty: 'Tanmay Kalbhor',
      status: 'Scheduled',
    },
    {
      srNo: '02',
      name: 'Rohan Mehta',
      timeSlot: '01:00 - 02:00',
      demoDate: '21-12-2025',
      course: 'No Code',
      mode: 'Online',
      faculty: 'Poorva Pande',
      status: 'Scheduled',
    },
  ]);

  await Batch.create([
    {
      srNo: '01',
      batchCode: 'MWF-JAN-2026',
      startDate: '21-12-2025',
      endDate: '21-05-2026',
      course: 'UI/UX Design',
      faculty: 'Poorva Pande',
      studentCount: 5,
      completedLectures: 2,
      hoursSpent: 2,
      phase: 'Module 1: Wireframing',
      students: [],
      lectures: [],
    },
  ]);

  await Invoice.create([
    {
      srNo: '01',
      studentName: 'Aanya Shah',
      course: 'UI/UX Design',
      invoiceCode: 'GST/001',
      totalFees: 35000,
      paidFees: 35000,
      remainingFees: 0,
      dueDate: '21-12-2025',
      status: 'Paid',
    },
  ]);

  console.log(' Database seeded successfully!');
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});