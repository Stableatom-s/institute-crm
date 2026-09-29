import { useState, useEffect, useCallback, useMemo } from 'react';
import { Batch } from '../types';
import { batchService } from '../services/batchService';

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
      const data = await batchService.getAll();
      if (data && data.length > 0) {
        setBatches(data);
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

  // Create batch mutation
  const createBatch = async (batchData: Omit<Batch, 'id' | 'srNo'>): Promise<Batch> => {
    setLoading(true);
    try {
      const newBatch = await batchService.create(batchData);
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

  // Adjust student enrollment count
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