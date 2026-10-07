import { Router, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { Lead } from '../models/Lead';
import { Demo } from '../models/Demo';
import { Leave } from '../models/Leave';
import { Batch } from '../models/Batch';

const router = Router();

router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    const role = (user.role || '').toLowerCase();
    const notifications: Array<{
      id: string;
      title: string;
      createdAt: string;
      category: string;
      linkPath: string;
      unread: boolean;
    }> = [];

    const now = new Date();

    // 1. Pending Leaves (Admin gets all; Faculty/Sales get their own)
    if (role === 'admin') {
      const pendingLeaves = await Leave.find({ status: 'Pending' })
        .sort({ createdAt: -1 })
        .limit(5);
      pendingLeaves.forEach((l: any) => {
        notifications.push({
          id: `leave-${l._id}`,
          title: `Leave application submitted by ${l.staffName || 'Staff Member'} (${l.leaveType || 'General'}).`,
          createdAt: l.createdAt || l.applicationDate || now.toISOString(),
          category: 'Leave Management',
          linkPath: '/admin/leave',
          unread: true,
        });
      });
    }

    // 2. Upcoming / Scheduled Demos
    const demoFilter: any = { status: 'Scheduled' };
    if (role === 'faculty') {
      demoFilter.faculty = new RegExp(user.name, 'i');
    }
    const upcomingDemos = await Demo.find(demoFilter).sort({ createdAt: -1 }).limit(5);
    upcomingDemos.forEach((d: any) => {
      notifications.push({
        id: `demo-${d._id}`,
        title: `Demo session scheduled: ${d.course} for ${d.name} (${d.timeSlot || 'Upcoming'}).`,
        createdAt: d.createdAt || now.toISOString(),
        category: 'Demo Management',
        linkPath: role === 'admin' ? '/admin/demos' : role === 'faculty' ? '/faculty/demos' : '/sales/demos',
        unread: false,
      });
    });

    // 3. New Leads (Admin & Sales)
    if (role === 'admin' || role === 'sales') {
      const recentLeads = await Lead.find({ status: 'New' }).sort({ createdAt: -1 }).limit(5);
      recentLeads.forEach((ld: any) => {
        notifications.push({
          id: `lead-${ld._id}`,
          title: `New lead registered: ${ld.firstName} ${ld.lastName || ''} for ${ld.course || 'UI/UX'}.`,
          createdAt: ld.createdAt || now.toISOString(),
          category: 'Lead Notifications',
          linkPath: role === 'admin' ? '/admin/leads' : '/sales/leads',
          unread: true,
        });
      });
    }

    // 4. Batches (All roles)
    const batchFilter: any = {};
    if (role === 'faculty') {
      batchFilter.faculty = new RegExp(user.name, 'i');
    }
    const recentBatches = await Batch.find(batchFilter).sort({ createdAt: -1 }).limit(3);
    recentBatches.forEach((b: any) => {
      notifications.push({
        id: `batch-${b._id}`,
        title: `Active batch: ${b.batchCode || 'Batch'} with ${b.students?.length || 0} student(s) enrolled.`,
        createdAt: b.createdAt || now.toISOString(),
        category: 'Batch Notifications',
        linkPath: role === 'admin' ? '/admin/batches' : role === 'faculty' ? '/faculty/batches' : '/sales/batches',
        unread: false,
      });
    });

    // Sort newest first
    notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json(notifications);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch live notifications', error: error.message });
  }
});

export default router;