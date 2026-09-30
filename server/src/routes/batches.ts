import { Router, Request, Response } from 'express';
import { Batch } from '../models/Batch';

const router = Router();

// GET all batches
router.get('/', async (_req: Request, res: Response) => {
  try {
    const batches = await Batch.find().sort({ createdAt: -1 });
    res.json(batches);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving batches', error });
  }
});

// GET single batch by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const batch = await Batch.findById(req.params.id);
    if (!batch) return res.status(404).json({ message: 'Batch not found' });
    res.json(batch);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving batch', error });
  }
});

// POST create batch
router.post('/', async (req: Request, res: Response) => {
  try {
    const count = await Batch.countDocuments();
    const newBatch = new Batch({
      ...req.body,
      srNo: String(count + 1).padStart(2, '0'),
      students: req.body.students || [],
      lectures: req.body.lectures || [],
    });
    const saved = await newBatch.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create batch', error });
  }
});

// POST add students to batch
router.post('/:id/students', async (req: Request, res: Response) => {
  try {
    const batch = await Batch.findById(req.params.id);
    if (!batch) return res.status(404).json({ message: 'Batch not found' });

    const incomingStudents = req.body.students || [];
    if (!batch.students) batch.students = [] as any;

    batch.students.push(...incomingStudents);
    const saved = await batch.save();
    res.status(200).json(saved);
  } catch (error) {
    res.status(500).json({ message: 'Failed to add students to batch', error });
  }
});

// POST add lecture to batch
router.post('/:id/lectures', async (req: Request, res: Response) => {
  try {
    const batch = await Batch.findById(req.params.id);
    if (!batch) return res.status(404).json({ message: 'Batch not found' });

    const newLecture = {
      srNo: String((batch.lectures?.length || 0) + 1).padStart(2, '0'),
      title: req.body.title,
      date: req.body.date,
      timeSlot: req.body.timeSlot,
      course: req.body.course || batch.course,
      topics: req.body.topicsCovered || [],
      assignment: req.body.assignmentGiven || 'None',
      totalStudents: req.body.totalStudents || batch.students?.length || 0,
      presentStudents: req.body.presentStudents || 0,
      studentsList: req.body.studentsList || [],
    };

    if (!batch.lectures) batch.lectures = [] as any;
    batch.lectures.unshift(newLecture as any);

    const saved = await batch.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: 'Failed to record lecture', error });
  }
});

export const batchRoutes = router;