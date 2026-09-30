import { Router, Request, Response } from 'express';
import { Attendance } from '../models/Attendance';

const router = Router();

// GET all attendance logs for the logged-in user
router.get('/my', async (req: Request, res: Response) => {
  try {
    const logs = await Attendance.find().sort({ createdAt: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving attendance history', error });
  }
});

// POST clock-in
router.post('/clock-in', async (req: Request, res: Response) => {
  try {
    const { inTime, date } = req.body;
    
    // Check if an entry for today already exists
    let record = await Attendance.findOne({ date });
    if (!record) {
      record = new Attendance({
        date,
        inTime,
        outTime: 'Yet to checkout',
        workingHours: '00:00',
        activities: [],
      });
      await record.save();
    }
    res.status(200).json(record);
  } catch (error) {
    res.status(500).json({ message: 'Failed to record clock in', error });
  }
});

// POST clock-out
router.post('/clock-out', async (req: Request, res: Response) => {
  try {
    const { outTime, activities } = req.body;
    const today = new Date()
      .toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
      .replace(/\//g, '-');

    let record = await Attendance.findOne({ date: today });
    if (record) {
      record.outTime = outTime;
      record.activities = activities || record.activities;
      record.workingHours = '09:00';
      await record.save();
    } else {
      record = new Attendance({
        date: today,
        inTime: '09:30 AM',
        outTime,
        workingHours: '09:00',
        activities: activities || [],
      });
      await record.save();
    }
    res.status(200).json(record);
  } catch (error) {
    res.status(500).json({ message: 'Failed to record clock out', error });
  }
});

export const attendanceRoutes = router;