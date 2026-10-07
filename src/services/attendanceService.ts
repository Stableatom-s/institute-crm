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
  leaveType: string;
  leaveDate: string;
  reason: string;
  applicationDate: string;
  status: 'Approved' | 'Rejected' | 'Pending';
}

export const attendanceService = {
  // Admin roster fetch
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

  getMyLeaves: async (userName?: string): Promise<LeaveRecord[]> => {
    try {
      const query = userName ? `?userName=${encodeURIComponent(userName)}` : '';
      const data = await apiRequest<any[]>(`/attendance/my-leaves${query}`);
      return data.map((l) => ({
        id: l._id || l.id,
        leaveType: l.leaveType,
        leaveDate: l.leaveDate || l.startDate,
        reason: l.reason,
        applicationDate: l.applicationDate,
        status: l.status,
      }));
    } catch {
      return [];
    }
  },

  applyLeave: async (leaveData: Partial<LeaveRecord> & { userName?: string; userRole?: string; userId?: string }): Promise<LeaveRecord> => {
    const data = await apiRequest<any>('/attendance/apply-leave', {
      method: 'POST',
      body: JSON.stringify(leaveData),
    });
    return {
      id: data._id || data.id,
      leaveType: data.leaveType,
      leaveDate: data.leaveDate,
      reason: data.reason,
      applicationDate: data.applicationDate,
      status: data.status || 'Pending',
    };
  },
};