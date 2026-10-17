import { Router, Request, Response } from 'express';
import { Demo } from '../models/Demo';

const router = Router();

// GET all demos sorted by latest first
router.get('/', async (_req: Request, res: Response) => {
  try {
    const demos = await Demo.find().sort({ createdAt: -1 });
    res.json(demos);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving demos', error });
  }
});

// POST schedule a new demo
router.post('/', async (req: Request, res: Response) => {
  try {
    const count = await Demo.countDocuments();
    const newDemo = new Demo({
      ...req.body,
      srNo: String(count + 1).padStart(2, '0'),
      status: req.body.status || 'Scheduled',
    });
    const saved = await newDemo.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: 'Failed to schedule demo', error });
  }
});

// PATCH update demo status, feedback, attendance screenshot, and schedule details
router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const {
      status,
      feedback,
      screenshotUrl,
      cancellationReason,
      course,
      faculty,
      demoDate,
      timeSlot,
      mode,
      demoStatusText,
      remark,
    } = req.body;

    const updateFields: Record<string, any> = {};

    if (status !== undefined) updateFields.status = status;
    if (feedback !== undefined) updateFields.feedback = feedback;
    if (screenshotUrl !== undefined) updateFields.screenshotUrl = screenshotUrl;
    if (cancellationReason !== undefined) updateFields.cancellationReason = cancellationReason;
    if (course !== undefined) updateFields.course = course;
    if (faculty !== undefined) updateFields.faculty = faculty;
    if (demoDate !== undefined) updateFields.demoDate = demoDate;
    if (timeSlot !== undefined) updateFields.timeSlot = timeSlot;
    if (mode !== undefined) updateFields.mode = mode;
    if (demoStatusText !== undefined) updateFields.demoStatusText = demoStatusText;
    if (remark !== undefined) updateFields.remark = remark;

    const updated = await Demo.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Demo not found' });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update demo status', error });
  }
});

export const demoRoutes = router;
export default router;