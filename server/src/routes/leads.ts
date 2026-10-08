import { Router, Request, Response } from 'express';
import { Lead } from '../models/Lead';

const router = Router();

// GET all leads (supports ?assignedTo=Name)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { assignedTo } = req.query;
    const filter: any = {};
    if (assignedTo && typeof assignedTo === 'string' && assignedTo.trim() !== '') {
      filter.assignedTo = { $regex: new RegExp(`^${assignedTo.trim()}$`, 'i') };
    }
    const leads = await Lead.find(filter).sort({ createdAt: -1 });
    res.json(leads);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving leads', error });
  }
});

// POST create lead
router.post('/', async (req: Request, res: Response) => {
  try {
    const count = await Lead.countDocuments();
    const newLead = new Lead({
      ...req.body,
      srNo: String(count + 1).padStart(2, '0'),
    });
    const saved = await newLead.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create lead', error });
  }
});

// PATCH lead status and timeline
router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const { status, remark, timelineEntry } = req.body;
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    if (status) lead.status = status;
    if (remark) lead.remark = remark;
    if (timelineEntry) lead.timeline.unshift(timelineEntry);

    const updated = await lead.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update lead', error });
  }
});

export const leadRoutes = router;
export default router;