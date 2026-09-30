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
  leaveType: 'Sick' | 'Casual' | 'Vacation';
  leaveDate: string;
  reason: string;
  applicationDate: string;
  status: 'Approved' | 'Pending' | 'Rejected';
}

export const attendanceService = {
  getMyAttendance: async (): Promise<AttendanceRecord[]> => {
    try {
      const data = await apiRequest<any[]>('/attendance/my');
      return data.map((item) => ({
        ...item,
        id: item._id || item.id,
      }));
    } catch {
      return [];
    }
  },

  clockIn: async (inTime: string, date: string): Promise<any> => {
    return apiRequest('/attendance/clock-in', {
      method: 'POST',
      body: JSON.stringify({ inTime, date }),
    });
  },

  clockOut: async (outTime: string, activities: ActivityItem[]): Promise<any> => {
    return apiRequest('/attendance/clock-out', {
      method: 'POST',
      body: JSON.stringify({ outTime, activities }),
    });
  },

  getMyLeaves: async (): Promise<LeaveRecord[]> => {
    try {
      const data = await apiRequest<any[]>('/leaves/my');
      return data.map((item) => ({
        ...item,
        id: item._id || item.id,
      }));
    } catch {
      return [];
    }
  },

  applyLeave: async (leaveData: Partial<LeaveRecord>): Promise<LeaveRecord> => {
    const data = await apiRequest<any>('/leaves', {
      method: 'POST',
      body: JSON.stringify(leaveData),
    });
    return {
      ...data,
      id: data._id || data.id,
    };
  },
};