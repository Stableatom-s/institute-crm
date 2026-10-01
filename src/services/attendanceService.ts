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
  getMyAttendance: async (): Promise<AttendanceRecord[]> => {
    try {
      const data = await apiRequest<any[]>('/attendance/my-records');
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

  clockIn: async (inTime: string, date: string): Promise<any> => {
    return await apiRequest('/attendance/clock-in', {
      method: 'POST',
      body: JSON.stringify({ inTime, date }),
    });
  },

  clockOut: async (outTime: string, activities: ActivityItem[], workingHours?: string): Promise<any> => {
    return await apiRequest('/attendance/clock-out', {
      method: 'POST',
      body: JSON.stringify({ outTime, activities, workingHours }),
    });
  },

  getMyLeaves: async (): Promise<LeaveRecord[]> => {
    try {
      const data = await apiRequest<any[]>('/attendance/my-leaves');
      return data.map((l) => ({
        id: l._id || l.id,
        leaveType: l.leaveType,
        leaveDate: l.leaveDate,
        reason: l.reason,
        applicationDate: l.applicationDate,
        status: l.status,
      }));
    } catch {
      return [];
    }
  },

  applyLeave: async (leaveData: Partial<LeaveRecord>): Promise<LeaveRecord> => {
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