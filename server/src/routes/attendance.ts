import { Router, Request, Response } from 'express';
import { Attendance } from '../models/Attendance';
import { Leave } from '../models/Leave';

const router = Router();

// GET all attendance records (for Admin Attendance Management)
router.get('/', async (_req: Request, res: Response) => {
  try {
    const records = await Attendance.find().sort({ createdAt: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving all attendance records', error });
  }
});

// GET my attendance records (for Faculty & Sales user history)
router.get('/my-records', async (req: Request, res: Response) => {
  try {
    const userName = (req.query.userName as string) || '';
    const filter = userName ? { userName: { $regex: new RegExp(`^${userName.trim()}$`, 'i') } } : {};
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

    let record = await Attendance.findOne({
      date: today,
      ...(userName ? { userName: { $regex: new RegExp(`^${userName.trim()}$`, 'i') } } : {})
    });

    if (record) {
      if (!record.inTime || record.inTime === '-') {
        record.inTime = inTime;
        await record.save();
      }
      return res.json(record);
    }

    record = new Attendance({
      userId: userId || 'user-1',
      userName: userName || 'User',
      userRole: userRole || 'Faculty',
      date: today,
      inTime,
      outTime: 'Yet to checkout',
      workingHours: '00:00',
      activities: []
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

    const filter: any = { date: today };
    if (userName) {
      filter.userName = { $regex: new RegExp(`^${userName.trim()}$`, 'i') };
    }

    let record = await Attendance.findOne(filter).sort({ createdAt: -1 });

    if (!record) {
      record = new Attendance({
        date: today,
        inTime: '09:30 AM',
        outTime: outTime || 'Yet to checkout',
        workingHours: workingHours || '00:00',
        activities: activities || []
      });
    } else {
      record.outTime = outTime;
      if (activities && activities.length > 0) {
        record.activities = activities;
      }
      if (workingHours) {
        record.workingHours = workingHours;
      }
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
    const filter = userName ? { userName: { $regex: new RegExp(`^${userName.trim()}$`, 'i') } } : {};
    const leaves = await Leave.find(filter).sort({ createdAt: -1 });
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving user leaves', error });
  }
});

// POST apply leave (compat with attendanceService)
router.post('/apply-leave', async (req: Request, res: Response) => {
  try {
    const newLeave = new Leave({
      userId: req.body.userId || 'user-1',
      userName: req.body.userName || 'User',
      userRole: req.body.userRole || 'Faculty',
      leaveType: req.body.leaveType || 'Casual',
      leaveDate: req.body.leaveDate || req.body.startDate,
      startDate: req.body.startDate || req.body.leaveDate,
      endDate: req.body.endDate || req.body.leaveDate,
      daysCount: req.body.daysCount || 1,
      reason: req.body.reason || 'Personal Leave',
      applicationDate: req.body.applicationDate || new Date().toISOString().split('T')[0],
      status: 'Pending'
    });
    const saved = await newLeave.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: 'Failed to apply leave', error });
  }
});

export const attendanceRoutes = router;
export default router;