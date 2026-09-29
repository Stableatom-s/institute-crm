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

// POST create new batch
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
    batch.students.push(...incomingStudents);
    batch.studentCount = batch.students.length;

    const saved = await batch.save();
    res.json(saved);
  } catch (error) {
    res.status(500).json({ message: 'Failed to add students to batch', error });
  }
});

export const batchRoutes = router;