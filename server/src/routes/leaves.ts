import { Router, Request, Response } from 'express';
import { Leave } from '../models/Leave';

const router = Router();

// GET all leaves (for Admin Leave Management)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, userName } = req.query;
    const filter: any = {};
    if (status) {
      if (status === 'Active' || status === 'Approved') {
        filter.status = { $in: ['Active', 'Approved'] };
      } else {
        filter.status = status;
      }
    }
    if (userName) filter.userName = { $regex: new RegExp(`^${String(userName).trim()}$`, 'i') };

    const leaves = await Leave.find(filter).sort({ createdAt: -1 });
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving leave records', error });
  }
});

// GET user's personal leaves (for Faculty & Sales)
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

// POST apply for leave (No default dummy values)
router.post('/', async (req: Request, res: Response) => {
  try {
    const fullName = req.body.userName || req.body.name || 'Staff Member';
    const parts = fullName.trim().split(' ');
    const firstName = req.body.firstName || parts[0] || '';
    const lastName = req.body.lastName || parts.slice(1).join(' ') || '';
    const todayStr = new Date()
      .toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
      .replace(/\//g, '-');

    const newLeave = new Leave({
      userId: req.body.userId || 'user-1',
      userName: fullName,
      firstName,
      lastName,
      userRole: req.body.userRole || req.body.role || 'Faculty',
      role: req.body.role || req.body.userRole || 'Faculty',
      mobile: req.body.mobile || '',
      email: req.body.email || '',
      leaveType: req.body.leaveType || 'Casual',
      leaveDate: req.body.leaveDate || req.body.fromDate || todayStr,
      fromDate: req.body.fromDate || req.body.leaveDate || todayStr,
      toDate: req.body.toDate || req.body.fromDate || todayStr,
      noOfDays: String(req.body.noOfDays || req.body.daysCount || '01').padStart(2, '0'),
      reason: req.body.reason || '',
      applicationDate: req.body.applicationDate || todayStr,
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

    // Mark status as Active / Approved so Admin and Faculty tabs stay synced
    leave.status = 'Approved';
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
    leave.rejectionReason = req.body.rejectionReason || req.body.remarks || 'Rejected by administrator';
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