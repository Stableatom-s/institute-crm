import { Router, Request, Response } from 'express';
import { Leave } from '../models/Leave';

const router = Router();

// GET all user leaves
router.get('/my', async (_req: Request, res: Response) => {
  try {
    const leaves = await Leave.find().sort({ createdAt: -1 });
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving leave records', error });
  }
});

// POST submit leave request
router.post('/', async (req: Request, res: Response) => {
  try {
    const newLeave = new Leave({
      leaveType: req.body.leaveType || 'Casual',
      leaveDate: req.body.leaveDate,
      reason: req.body.reason,
      applicationDate: req.body.applicationDate || new Date().toISOString().split('T')[0],
      status: 'Pending',
    });
    const saved = await newLeave.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: 'Failed to apply for leave', error });
  }
});

export const leaveRoutes = router;