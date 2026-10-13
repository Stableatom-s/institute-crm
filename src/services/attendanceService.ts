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
        date: d.date || '',
        inTime: d.inTime || '-',
        outTime: d.outTime || '-',
        workingHours: d.workingHours || '-',
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

  getAllLeaves: async (): Promise<LeaveRecord[]> => {
    try {
      const data = await apiRequest<any[]>('/leaves');
      return data.map((l, idx) => ({
        id: l._id || l.id,
        srNo: String(idx + 1).padStart(2, '0'),
        name: l.userName || `${l.firstName || ''} ${l.lastName || ''}`.trim() || '',
        firstName: l.firstName || (l.userName || '').split(' ')[0] || '',
        lastName: l.lastName || (l.userName || '').split(' ').slice(1).join(' ') || '',
        role: l.role || l.userRole || '',
        mobile: l.mobile || '',
        email: l.email || '',
        leaveType: l.leaveType || '',
        leaveDate: l.leaveDate || l.fromDate || '',
        fromDate: l.fromDate || l.leaveDate || '',
        toDate: l.toDate || l.leaveDate || '',
        noOfDays: l.noOfDays || '',
        reason: l.reason || '',
        applicationDate: l.applicationDate || '',
        status: l.status || 'Pending',
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
        leaveType: l.leaveType || '',
        leaveDate: l.leaveDate || l.fromDate || '',
        fromDate: l.fromDate || '',
        toDate: l.toDate || '',
        reason: l.reason || '',
        applicationDate: l.applicationDate || '',
        status: l.status || 'Pending',
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
      leaveType: data.leaveType || '',
      leaveDate: data.leaveDate || data.fromDate || '',
      fromDate: data.fromDate || '',
      toDate: data.toDate || '',
      reason: data.reason || '',
      applicationDate: data.applicationDate || '',
      status: data.status || 'Pending',
    };
  },

  approveLeave: async (id: string, adminName?: string): Promise<any> => {
    return await apiRequest(`/leaves/${id}/approve`, {
      method: 'PATCH',
      body: JSON.stringify({ adminName: adminName || '' }),
    });
  },

  rejectLeave: async (id: string, rejectionReason: string, adminName?: string): Promise<any> => {
    return await apiRequest(`/leaves/${id}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ rejectionReason, adminName: adminName || '' }),
    });
  },
};