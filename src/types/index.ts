export type UserRole = 'ADMIN' | 'SALES' | 'FACULTY';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  inTime?: string;
}

// Sales & Admin - Lead Model
export interface Lead {
  id: string;
  srNo: string;
  name: string;
  contactNo: string;
  email?: string;
  enquiryDate: string;
  course: string;
  status: 'New' | 'Contacted' | 'Interested' | 'Not Interested' | 'Demo Scheduled' | 'Enrolled';
  followUpDate: string;
  remark: string;
  history?: {
    date: string;
    remark: string;
    by: string;
  }[];
}

// Sales, Faculty & Admin - Demo Booking Model
export interface DemoSession {
  id: string;
  srNo: string;
  name: string;
  timeSlot: string;
  demoDate: string;
  course: string;
  mode: 'Online' | 'Offline';
  faculty: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
}

// Faculty & Admin - Batches Model
export interface Batch {
  id: string;
  srNo: string;
  batchCode: string;
  startDate: string;
  course: string;
  faculty: string;
  studentCount: number;
  phase?: string;
}

// Faculty & Admin - Student Management Model
export interface Student {
  id: string;
  srNo: string;
  name: string;
  contact: string;
  course: string;
  startDate: string;
  batchCode: string;
  faculty: string;
  attendedSessions: number;
  totalSessions: number;
  remark: string;
}

// Sales & Admin - Invoice Model
export interface Invoice {
  id: string;
  srNo: string;
  studentName: string;
  course: string;
  invoiceCode: string;
  totalFees: number;
  paidFees: number;
  remainingFees: number;
  dueDate?: string;
  status: 'Paid' | 'Partially Paid' | 'Overdue';
}

// Common - Staff Leave Model
export interface LeaveRequest {
  id: string;
  staffName: string;
  role: UserRole;
  leaveDate: string;
  leaveType: 'Sick' | 'Casual' | 'Paid';
  reason: string;
  status: 'Pending' | 'Active' | 'Rejected';
}