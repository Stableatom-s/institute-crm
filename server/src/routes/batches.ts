import { Router, Request, Response } from 'express';
import { Batch } from '../models/Batch';

const router = Router();

// 1. GET all batches
router.get('/', async (_req: Request, res: Response) => {
  try {
    const batches = await Batch.find().sort({ createdAt: -1 });
    res.json(batches);
  } catch (error: any) {
    res.status(500).json({ message: 'Error retrieving batches', error: error.message || error });
  }
});

// 2. GET single batch by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const batch = await Batch.findById(req.params.id);
    if (!batch) return res.status(404).json({ message: 'Batch not found' });
    res.json(batch);
  } catch (error: any) {
    res.status(500).json({ message: 'Error retrieving batch', error: error.message || error });
  }
});

// 3. POST create a new batch (With auto-fallback for srNo and batchCode)
router.post('/', async (req: Request, res: Response) => {
  try {
    const count = await Batch.countDocuments();
    const srNo = req.body.srNo || String(count + 1).padStart(2, '0');
    
    // Ensure unique batchCode even if plain string "1" or raw name is passed
    let batchCode = req.body.batchCode;
    if (!batchCode) {
      batchCode = `B-${String(count + 1).padStart(2, '0')}`;
    }

    // Check for duplicate batchCode to prevent MongoDB E11000 errors
    const duplicate = await Batch.findOne({ batchCode });
    if (duplicate) {
      batchCode = `${batchCode}-${Date.now().toString().slice(-4)}`;
    }

    const newBatch = new Batch({
      ...req.body,
      srNo,
      batchCode,
      studentCount: req.body.studentCount || (req.body.students ? req.body.students.length : 0),
      students: req.body.students || [],
      lectures: req.body.lectures || [],
    });

    const saved = await newBatch.save();
    res.status(201).json(saved);
  } catch (error: any) {
    console.error('Error creating batch:', error);
    res.status(400).json({ message: 'Failed to create batch', error: error.message || error });
  }
});

// 4. POST add students to batch
router.post('/:id/students', async (req: Request, res: Response) => {
  try {
    const { students } = req.body;
    const batch = await Batch.findById(req.params.id);
    if (!batch) return res.status(404).json({ message: 'Batch not found' });

    if (Array.isArray(students)) {
      students.forEach((st: any) => {
        const exists = batch.students.some((s: any) => s.contact === st.contact || s.name === st.name);
        if (!exists) {
          batch.students.push(st);
        }
      });
    }

    batch.studentCount = batch.students.length;
    const saved = await batch.save();
    res.json(saved);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to add students to batch', error: error.message || error });
  }
});

// 5. POST add lecture to batch
router.post('/:id/lectures', async (req: Request, res: Response) => {
  try {
    const batch = await Batch.findById(req.params.id);
    if (!batch) return res.status(404).json({ message: 'Batch not found' });

    const lecture = {
      ...req.body,
      srNo: String((batch.lectures?.length || 0) + 1).padStart(2, '0'),
    };

    batch.lectures.push(lecture as any);
    batch.completedLectures = batch.lectures.length;

    const saved = await batch.save();
    res.json(saved);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to add lecture', error: error.message || error });
  }
});

// PATCH /api/batches/:id/students/:studentName/attendance
router.patch('/:id/students/:studentName/attendance', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const rawStudentName = String(req.params.studentName || '');
    const { isPresent, date, remark } = req.body;

    const batch = await Batch.findById(id);
    if (!batch) return res.status(404).json({ message: 'Batch not found' });

    const targetName = decodeURIComponent(rawStudentName).trim().toLowerCase();

    const student: any = batch.students.find(
      (s: any) =>
        (s.name || `${s.firstName || ''} ${s.lastName || ''}`)
          .trim()
          .toLowerCase() === targetName
    );

    if (!student) return res.status(404).json({ message: 'Student not found in batch' });

    // 1. Update/Add to student's record
    const markDate = date || new Date().toISOString().split('T')[0];

    // Ensure lectures have this student's updated flag
    let attendedCount = 0;
    let totalCount = 0;

    batch.lectures.forEach((lec: any) => {
      const match = lec.studentsList?.find((sl: any) => 
        sl.name.trim().toLowerCase() === targetName
      );
      if (match) {
        if (lec.date === markDate && typeof isPresent === 'boolean') {
          match.isPresent = isPresent;
          match.present = isPresent;
        }
        totalCount++;
        if (match.isPresent) attendedCount++;
      }
    });

    // If no lecture records exist yet, treat current mark as session 1
    if (totalCount === 0) {
      totalCount = 1;
      attendedCount = isPresent ? 1 : 0;
    }

    student.attendedLectures = attendedCount;
    student.totalLectures = totalCount;
    const pct = Math.round((attendedCount / totalCount) * 100);
    student.attendanceRatio = `${String(attendedCount).padStart(2, '0')}/${String(totalCount).padStart(2, '0')}`;
    student.attendance = `${pct}%`;

    if (remark) student.remark = remark;

    const saved = await batch.save();
    res.json(saved);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to update attendance', error: error.message || error });
  }
});

export const batchRoutes = router;
export default router;