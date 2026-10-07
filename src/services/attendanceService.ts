import { apiRequest } from '../lib/api';

export interface ActivityItem {
  id: string;
  activity: string;
  timeSpent: string;
  details?: string;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  inTime: string;
  outTime: string;
  workingHours: string;
  activities?: ActivityItem[];
}

export interface LeaveRecord {
  id: string;
  srNo?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  mobile?: string;
  email?: string;
  leaveType: string;
  leaveDate: string;
  fromDate?: string;
  toDate?: string;
  noOfDays?: string;
  reason: string;
  applicationDate: string;
  status: 'Approved' | 'Rejected' | 'Pending' | 'Active';
  rejectionReason?: string;
}

export const attendanceService = {
  // Admin staff attendance roster
  getAllEmployeeAttendance: async (): Promise<any[]> => {
    try {
      const data = await apiRequest<any[]>('/attendance');
      return data;
    } catch {
      return [];
    }
  },

  getMyAttendance: async (userName?: string): Promise<AttendanceRecord[]> => {
    try {
      const query = userName ? `?userName=${encodeURIComponent(userName)}` : '';
      const data = await apiRequest<any[]>(`/attendance/my-records${query}`);
      return data.map((d) => ({
        id: d._id || d.id,
        date: d.date,
        inTime: d.inTime,
        outTime: d.outTime,
        workingHours: d.workingHours || '00:00',
        activities: d.activities || [],
      }));
    } catch {
      return [];
    }
  },

  clockIn: async (inTime: string, date: string, meta?: { userName?: string; userRole?: string; userId?: string }): Promise<any> => {
    return await apiRequest('/attendance/clock-in', {
      method: 'POST',
      body: JSON.stringify({ inTime, date, ...(meta || {}) }),
    });
  },

  clockOut: async (outTime: string, activities: ActivityItem[], workingHours?: string, meta?: { userName?: string; date?: string }): Promise<any> => {
    return await apiRequest('/attendance/clock-out', {
      method: 'POST',
      body: JSON.stringify({ outTime, activities, workingHours, ...(meta || {}) }),
    });
  },

  // Leave operations
  getAllLeaves: async (): Promise<LeaveRecord[]> => {
    try {
      const data = await apiRequest<any[]>('/leaves');
      return data.map((l, idx) => ({
        id: l._id || l.id,
        srNo: String(idx + 1).padStart(2, '0'),
        name: l.userName || `${l.firstName || ''} ${l.lastName || ''}`.trim() || 'Staff Member',
        firstName: l.firstName || (l.userName || '').split(' ')[0] || 'Staff',
        lastName: l.lastName || (l.userName || '').split(' ').slice(1).join(' ') || '',
        role: l.role || l.userRole || 'Faculty',
        mobile: l.mobile || '9784569874',
        email: l.email || 'staff@radiquolab.com',
        leaveType: l.leaveType || 'Casual',
        leaveDate: l.leaveDate || l.fromDate || '12-02-2026',
        fromDate: l.fromDate || l.leaveDate || '12-02-2026',
        toDate: l.toDate || l.leaveDate || '12-02-2026',
        noOfDays: l.noOfDays || '01',
        reason: l.reason || 'Personal Reason',
        applicationDate: l.applicationDate || '11-02-2026',
        status: l.status === 'Approved' ? 'Active' : (l.status as any),
        rejectionReason: l.rejectionReason,
      }));
    } catch {
      return [];
    }
  },

  getMyLeaves: async (userName?: string): Promise<LeaveRecord[]> => {
    try {
      const query = userName ? `?userName=${encodeURIComponent(userName)}` : '';
      const data = await apiRequest<any[]>(`/leaves/my${query}`);
      return data.map((l) => ({
        id: l._id || l.id,
        leaveType: l.leaveType,
        leaveDate: l.leaveDate || l.fromDate,
        fromDate: l.fromDate,
        toDate: l.toDate,
        reason: l.reason,
        applicationDate: l.applicationDate,
        status: l.status === 'Active' ? 'Approved' : l.status,
        rejectionReason: l.rejectionReason,
      }));
    } catch {
      return [];
    }
  },

  applyLeave: async (leaveData: any): Promise<LeaveRecord> => {
    const data = await apiRequest<any>('/leaves', {
      method: 'POST',
      body: JSON.stringify(leaveData),
    });
    return {
      id: data._id || data.id,
      leaveType: data.leaveType,
      leaveDate: data.leaveDate || data.fromDate,
      fromDate: data.fromDate,
      toDate: data.toDate,
      reason: data.reason,
      applicationDate: data.applicationDate,
      status: data.status || 'Pending',
    };
  },

  approveLeave: async (id: string, adminName: string = 'Admin'): Promise<any> => {
    return await apiRequest(`/leaves/${id}/approve`, {
      method: 'PATCH',
      body: JSON.stringify({ adminName }),
    });
  },

  rejectLeave: async (id: string, rejectionReason: string, adminName: string = 'Admin'): Promise<any> => {
    return await apiRequest(`/leaves/${id}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ rejectionReason, adminName }),
    });
  },
};