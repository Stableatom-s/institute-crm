import { useState, useCallback } from 'react';

export interface AttendanceItem {
  id: string;
  date: string;
  inTime: string;
  outTime: string;
  workingHours: string;
  status?: 'Present' | 'On Leave' | 'Absent';
  location?: string;
}

export interface DailyActivity {
  id: string;
  activity: string;
  timeSpent: string;
}

const MOCK_ATTENDANCE_HISTORY: AttendanceItem[] = [
  {
    id: 'att-1',
    date: '21-12-2025',
    inTime: '09:30 AM',
    outTime: '06:30 PM',
    workingHours: '09:00 Hrs',
    status: 'Present',
    location: 'Radiquolab Design Institute - 18.5075, 73.8216',
  },
  {
    id: 'att-2',
    date: '20-12-2025',
    inTime: '09:35 AM',
    outTime: '06:30 PM',
    workingHours: '08:55 Hrs',
    status: 'Present',
    location: 'Radiquolab Design Institute - 18.5075, 73.8216',
  },
  {
    id: 'att-3',
    date: '19-12-2025',
    inTime: '09:28 AM',
    outTime: '06:35 PM',
    workingHours: '09:07 Hrs',
    status: 'Present',
    location: 'Radiquolab Design Institute - 18.5075, 73.8216',
  },
];

export const useAttendance = () => {
  // Clock state
  const [isClockedIn, setIsClockedIn] = useState<boolean>(() => {
    return localStorage.getItem('crm_clocked_in') === 'true';
  });
  const [clockInTime, setClockInTime] = useState<string>(() => {
    return localStorage.getItem('crm_clock_in_time') || '09:30 AM';
  });
  const [clockOutTime, setClockOutTime] = useState<string | null>(null);

  // Activities logged for current shift
  const [activities, setActivities] = useState<DailyActivity[]>([
    { id: 'act-1', activity: 'Conducted Student Demos', timeSpent: '02:00 Hrs' },
    { id: 'act-2', activity: 'Batch Lecture: UI Prototyping', timeSpent: '02:30 Hrs' },
  ]);

  // Historical attendance records
  const [history, setHistory] = useState<AttendanceItem[]>(MOCK_ATTENDANCE_HISTORY);

  // Clock In Action
  const clockIn = useCallback(() => {
    const now = new Date();
    const formatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setIsClockedIn(true);
    setClockInTime(formatted);
    setClockOutTime(null);
    localStorage.setItem('crm_clocked_in', 'true');
    localStorage.setItem('crm_clock_in_time', formatted);
  }, []);

  // Clock Out Action
  const clockOut = useCallback(() => {
    const now = new Date();
    const formatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setIsClockedIn(false);
    setClockOutTime(formatted);
    localStorage.setItem('crm_clocked_in', 'false');

    const newRecord: AttendanceItem = {
      id: `att-${Date.now()}`,
      date: new Date().toLocaleDateString('en-GB'),
      inTime: clockInTime,
      outTime: formatted,
      workingHours: '08:00 Hrs',
      status: 'Present',
      location: 'Radiquolab Design Institute - 18.5075, 73.8216',
    };
    setHistory((prev) => [newRecord, ...prev]);
  }, [clockInTime]);

  // Log new shift activity
  const addActivity = useCallback((activity: string, timeSpent: string) => {
    const newAct: DailyActivity = {
      id: `act-${Date.now()}`,
      activity,
      timeSpent,
    };
    setActivities((prev) => [...prev, newAct]);
  }, []);

  return {
    isClockedIn,
    clockInTime,
    clockOutTime,
    activities,
    history,
    clockIn,
    clockOut,
    addActivity,
  };
};