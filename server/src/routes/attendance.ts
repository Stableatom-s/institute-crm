import { Router, Request, Response } from 'express';
import { Attendance } from '../models/Attendance';
import { Leave } from '../models/Leave';

const router = Router();

// Helper to compute actual worked duration from 12-hour or ISO time strings
function calculateWorkedHours(inTimeStr?: string, outTimeStr?: string): string {
  if (!inTimeStr || inTimeStr === '-' || !outTimeStr || outTimeStr === '-' || outTimeStr === 'Yet to checkout') {
    return '00:00';
  }

  const parseToMinutes = (timeStr: string): number | null => {
    try {
      const clean = timeStr.trim().toUpperCase();
      const match = clean.match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i);
      if (match) {
        let hours = parseInt(match[1], 10);
        const minutes = parseInt(match[2], 10);
        const meridian = match[3];

        if (meridian === 'PM' && hours < 12) hours += 12;
        if (meridian === 'AM' && hours === 12) hours = 0;

        return hours * 60 + minutes;
      }

      const iso = new Date(timeStr);
      if (!isNaN(iso.getTime())) {
        return iso.getHours() * 60 + iso.getMinutes();
      }
    } catch {
      return null;
    }
    return null;
  };

  const startMins = parseToMinutes(inTimeStr);
  const endMins = parseToMinutes(outTimeStr);

  if (startMins === null || endMins === null) return '00:00';

  let diff = endMins - startMins;
  if (diff < 0) diff += 24 * 60; // Crosses midnight

  const diffHrs = Math.floor(diff / 60);
  const diffRemainderMins = diff % 60;

  return `${String(diffHrs).padStart(2, '0')}:${String(diffRemainderMins).padStart(2, '0')}`;
}

// Helper for dynamic local time string (e.g., "03:45 PM")
function getCurrentTimeString(): string {
  return new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

// GET all attendance records (Admin)
router.get('/', async (_req: Request, res: Response) => {
  try {
    const records = await Attendance.find().sort({ createdAt: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving all attendance records', error });
  }
});

// GET my attendance records (Faculty & Sales)
router.get('/my-records', async (req: Request, res: Response) => {
  try {
    const userName = (req.query.userName as string) || '';
    const filter = userName
      ? { userName: { $regex: new RegExp(`^${userName.trim()}$`, 'i') } }
      : {};
    const records = await Attendance.find(filter).sort({ createdAt: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving personal attendance', error });
  }
});

// POST clock-in
router.post('/clock-in', async (req: Request, res: Response) => {
  try {
    const { inTime, date, userName, userRole, userId } = req.body;
    const today = date || new Date().toISOString().split('T')[0];
    const realInTime = inTime || getCurrentTimeString();

    let normalizedRole = 'Faculty';
    if (userRole) {
      const lower = userRole.toLowerCase();
      if (lower.includes('sales')) normalizedRole = 'Salesperson';
      else if (lower.includes('admin')) normalizedRole = 'Admin';
    }

    const resolvedUserName = userName && userName !== 'User' ? userName.trim() : 'Staff Member';

    // Find if user already clocked in today
    let record = await Attendance.findOne({
      date: today,
      userName: { $regex: new RegExp(`^${resolvedUserName}$`, 'i') },
    });

    if (record) {
      // If inTime was missing or default placeholder, update with actual inTime
      if (!record.inTime || record.inTime === '-' || record.inTime === '09:30 AM') {
        record.inTime = realInTime;
      }
      record.userRole = normalizedRole;
      await record.save();
      return res.json(record);
    }

    // New Clock In Record
    record = new Attendance({
      userId: userId || 'user-1',
      userName: resolvedUserName,
      userRole: normalizedRole,
      date: today,
      inTime: realInTime,
      outTime: 'Yet to checkout',
      workingHours: '00:00',
      activities: [],
    });

    const saved = await record.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: 'Clock-in failed', error });
  }
});

// POST clock-out
router.post('/clock-out', async (req: Request, res: Response) => {
  try {
    const { outTime, activities, workingHours, date, userName } = req.body;
    const today = date || new Date().toISOString().split('T')[0];
    const realOutTime = outTime || getCurrentTimeString();
    const resolvedUserName = userName && userName !== 'User' ? userName.trim() : 'Staff Member';

    let record = await Attendance.findOne({
      date: today,
      userName: { $regex: new RegExp(`^${resolvedUserName}$`, 'i') },
    }).sort({ createdAt: -1 });

    if (!record) {
      // Use client inTime or fallback to realOutTime (never hardcoded 09:30 AM)
      const dynamicInTime = req.body.inTime || realOutTime;
      const dynamicWorkingHours = workingHours || calculateWorkedHours(dynamicInTime, realOutTime);

      record = new Attendance({
        date: today,
        userName: resolvedUserName,
        userRole: 'Faculty',
        inTime: dynamicInTime,
        outTime: realOutTime,
        workingHours: dynamicWorkingHours,
        activities: activities || [],
      });
    } else {
      record.outTime = realOutTime;
      if (activities && activities.length > 0) {
        record.activities = activities;
      }
      record.workingHours = calculateWorkedHours(record.inTime, realOutTime);
    }

    const saved = await record.save();
    res.json(saved);
  } catch (error) {
    res.status(400).json({ message: 'Clock-out failed', error });
  }
});

// GET my leave records
router.get('/my-leaves', async (req: Request, res: Response) => {
  try {
    const userName = req.query.userName as string;
    const filter = userName
      ? { userName: { $regex: new RegExp(`^${userName.trim()}$`, 'i') } }
      : {};
    const leaves = await Leave.find(filter).sort({ createdAt: -1 });
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving user leaves', error });
  }
});

// POST apply leave
router.post('/apply-leave', async (req: Request, res: Response) => {
  try {
    const newLeave = new Leave({
      userId: req.body.userId || 'user-1',
      userName: req.body.userName || 'Staff Member',
      userRole: req.body.userRole || 'Faculty',
      leaveType: req.body.leaveType || 'Casual',
      leaveDate: req.body.leaveDate || req.body.startDate,
      startDate: req.body.startDate || req.body.leaveDate,
      endDate: req.body.endDate || req.body.leaveDate,
      daysCount: req.body.daysCount || 1,
      reason: req.body.reason || 'Personal Leave',
      applicationDate: req.body.applicationDate || new Date().toISOString().split('T')[0],
      status: 'Pending',
    });
    const saved = await newLeave.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: 'Failed to apply leave', error });
  }
});

export const attendanceRoutes = router;
export default router;