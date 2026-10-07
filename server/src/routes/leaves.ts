import { Router, Request, Response } from 'express';
import { Leave } from '../models/Leave';

const router = Router();

// GET all leaves (or filter by status/userName)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, userName } = req.query;
    const filter: any = {};
    if (status) filter.status = status;
    if (userName) filter.userName = { $regex: new RegExp(`^${String(userName).trim()}$`, 'i') };

    const leaves = await Leave.find(filter).sort({ createdAt: -1 });
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving leave records', error });
  }
});

// GET user's personal leaves
router.get('/my', async (req: Request, res: Response) => {
  try {
    const userName = (req.query.userName as string) || '';
    const userId = (req.query.userId as string) || '';

    const filter: any = {};
    if (userName && userName !== 'User') {
      filter.userName = { $regex: new RegExp(`^${userName.trim()}$`, 'i') };
    } else if (userId) {
      filter.userId = userId;
    }

    const leaves = await Leave.find(filter).sort({ createdAt: -1 });
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving user leave records', error });
  }
});
// POST apply for leave
router.post('/', async (req: Request, res: Response) => {
  try {
    const fullName = req.body.userName || req.body.name || 'Staff Member';
    const parts = fullName.split(' ');
    const firstName = req.body.firstName || parts[0] || 'Staff';
    const lastName = req.body.lastName || parts.slice(1).join(' ') || '';

    const newLeave = new Leave({
      userId: req.body.userId || 'user-1',
      userName: fullName,
      firstName,
      lastName,
      userRole: req.body.userRole || req.body.role || 'Faculty',
      role: req.body.role || req.body.userRole || 'Faculty',
      mobile: req.body.mobile || '9784569874',
      email: req.body.email || `${firstName.toLowerCase()}@radiquolab.com`,
      leaveType: req.body.leaveType || 'Casual',
      leaveDate: req.body.leaveDate || req.body.fromDate,
      fromDate: req.body.fromDate || req.body.leaveDate,
      toDate: req.body.toDate || req.body.leaveDate,
      noOfDays: String(req.body.noOfDays || req.body.daysCount || '01').padStart(2, '0'),
      reason: req.body.reason || 'Personal Leave',
      applicationDate: req.body.applicationDate || new Date().toISOString().split('T')[0],
      status: 'Pending',
    });

    const saved = await newLeave.save();
    res.status(201).json(saved);
  } catch (error: any) {
    res.status(400).json({ message: 'Failed to submit leave application', error: error.message });
  }
});

// PATCH Approve leave
router.patch('/:id/approve', async (req: Request, res: Response) => {
  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) return res.status(404).json({ message: 'Leave not found' });

    leave.status = 'Active';
    leave.reviewedBy = req.body.adminName || 'Admin';
    leave.reviewedAt = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
    const saved = await leave.save();
    res.json(saved);
  } catch (error) {
    res.status(500).json({ message: 'Failed to approve leave', error });
  }
});

// PATCH Reject leave
router.patch('/:id/reject', async (req: Request, res: Response) => {
  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) return res.status(404).json({ message: 'Leave not found' });

    leave.status = 'Rejected';
    leave.rejectionReason = req.body.rejectionReason || req.body.remarks || 'Critical work scheduled on requested date';
    leave.reviewedBy = req.body.adminName || 'Admin';
    leave.reviewedAt = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
    const saved = await leave.save();
    res.json(saved);
  } catch (error) {
    res.status(500).json({ message: 'Failed to reject leave', error });
  }
});

export const leaveRoutes = router;
export default router;