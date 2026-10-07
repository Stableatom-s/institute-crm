import { useState, useEffect, useCallback, useMemo } from 'react';
import { batchService } from '../services/batchService';

export interface Batch {
  id: string;
  srNo: string;
  batchCode: string;
  startDate: string;
  course: string;
  faculty: string;
  studentCount: number;
  phase?: string;
  students?: any[];
  lectures?: any[];
}

const MOCK_BATCHES: Batch[] = [
  {
    id: 'batch-1',
    srNo: '01',
    batchCode: 'MWF-JAN-2026',
    startDate: '01-01-2026',
    course: 'UI/UX Design',
    faculty: 'Poorva Pande',
    studentCount: 5,
    phase: 'Module 1: Design Systems',
  },
  {
    id: 'batch-2',
    srNo: '02',
    batchCode: 'TTS-JAN-2026',
    startDate: '03-01-2026',
    course: 'No Code',
    faculty: 'Tanmay Kalbhor',
    studentCount: 6,
    phase: 'Module 2: Automation',
  },
  {
    id: 'batch-3',
    srNo: '03',
    batchCode: 'WEEKEND-JAN-2026',
    startDate: '07-01-2026',
    course: 'UI/UX Design',
    faculty: 'Tanmay Kalbhor',
    studentCount: 4,
    phase: 'Module 1: Wireframing',
  },
  {
    id: 'batch-4',
    srNo: '04',
    batchCode: 'MWF-FEB-2026',
    startDate: '07-02-2026',
    course: 'UI/UX Design',
    faculty: 'Tanmay Kalbhor',
    studentCount: 4,
    phase: 'Upcoming',
  },
  {
    id: 'batch-5',
    srNo: '05',
    batchCode: 'TTS-FEB-2026',
    startDate: '08-01-2026',
    course: 'UI/UX Design',
    faculty: 'Tanmay Kalbhor',
    studentCount: 4,
    phase: 'Upcoming',
  },
];

export const useBatches = () => {
  const [batches, setBatches] = useState<Batch[]>(MOCK_BATCHES);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [courseFilter, setCourseFilter] = useState<string>('All');

  const fetchBatches = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await batchService.getAllBatches();
      if (data && data.length > 0) {
        setBatches(
          data.map((b: any, idx: number) => ({
            id: b.id || b._id,
            srNo: String(idx + 1).padStart(2, '0'),
            batchCode: b.batchCode || b.batch,
            startDate: b.startDate,
            course: b.course,
            faculty: b.faculty,
            studentCount: b.students?.length || Number(b.studentCount) || 0,
            phase: b.phase || 'Module 1',
            students: b.students || [],
            lectures: b.lectures || [],
          }))
        );
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to fetch batches');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBatches();
  }, [fetchBatches]);

  const filteredBatches = useMemo(() => {
    if (courseFilter === 'All') return batches;
    return batches.filter(
      (b) => b.course.toLowerCase() === courseFilter.toLowerCase()
    );
  }, [batches, courseFilter]);

  const createBatch = async (batchData: Omit<Batch, 'id' | 'srNo'>): Promise<Batch> => {
    setLoading(true);
    try {
      const created: any = await batchService.createBatch(batchData as any);
      const newBatch: Batch = {
        ...created,
        id: created.id || created._id,
        srNo: String(batches.length + 1).padStart(2, '0'),
        studentCount: created.students?.length || 0,
      };
      setBatches((prev) => [newBatch, ...prev]);
      return newBatch;
    } catch {
      const fallbackBatch: Batch = {
        ...batchData,
        id: `batch-${Date.now()}`,
        srNo: String(batches.length + 1).padStart(2, '0'),
      };
      setBatches((prev) => [fallbackBatch, ...prev]);
      return fallbackBatch;
    } finally {
      setLoading(false);
    }
  };

  const incrementStudentCount = (batchId: string) => {
    setBatches((prev) =>
      prev.map((b) =>
        b.id === batchId ? { ...b, studentCount: b.studentCount + 1 } : b
      )
    );
  };

  return {
    batches: filteredBatches,
    allBatches: batches,
    loading,
    error,
    courseFilter,
    setCourseFilter,
    refetch: fetchBatches,
    createBatch,
    incrementStudentCount,
  };
};