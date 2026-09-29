import { useState, useEffect, useCallback, useMemo } from 'react';
import { DemoSession } from '../types';
import { demoService } from '../services/demoService';

const MOCK_DEMOS: DemoSession[] = [
  {
    id: 'demo-1',
    srNo: '01',
    name: 'Aanya Shah',
    timeSlot: '11:00 - 12:00',
    demoDate: '21-12-2025',
    course: 'UI/UX Design',
    mode: 'Online',
    faculty: 'Tanmay Kalbhor',
    status: 'Scheduled',
  },
  {
    id: 'demo-2',
    srNo: '02',
    name: 'Rohan Mehta',
    timeSlot: '01:00 - 02:00',
    demoDate: '21-12-2025',
    course: 'No Code',
    mode: 'Online',
    faculty: 'Poorva Pande',
    status: 'Scheduled',
  },
  {
    id: 'demo-3',
    srNo: '03',
    name: 'Neha Patel',
    timeSlot: '03:00 - 04:00',
    demoDate: '21-12-2025',
    course: 'UI/UX Design',
    mode: 'Offline',
    faculty: 'Tanmay Kalbhor',
    status: 'Scheduled',
  },
  {
    id: 'demo-4',
    srNo: '04',
    name: 'Anish Verma',
    timeSlot: '03:00 - 04:00',
    demoDate: '21-12-2025',
    course: 'Portfolio',
    mode: 'Offline',
    faculty: 'Poorva Pande',
    status: 'Completed',
  },
  {
    id: 'demo-5',
    srNo: '05',
    name: 'Siddhi Shah',
    timeSlot: '01:00 - 02:00',
    demoDate: '21-12-2025',
    course: 'Full-Stack',
    mode: 'Online',
    faculty: 'Neeraj Joshi',
    status: 'Scheduled',
  },
];

export const useDemos = () => {
  const [demos, setDemos] = useState<DemoSession[]>(MOCK_DEMOS);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [modeFilter, setModeFilter] = useState<string>('All');

  const fetchDemos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await demoService.getAll();
      if (data && data.length > 0) {
        setDemos(data);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to fetch demos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDemos();
  }, [fetchDemos]);

  const filteredDemos = useMemo(() => {
    return demos.filter((demo) => {
      const matchesStatus =
        statusFilter === 'All' ||
        demo.status.toLowerCase() === statusFilter.toLowerCase();
      const matchesMode =
        modeFilter === 'All' ||
        demo.mode.toLowerCase() === modeFilter.toLowerCase();
      return matchesStatus && matchesMode;
    });
  }, [demos, statusFilter, modeFilter]);

  // Schedule / Book Demo Mutation
  const scheduleDemo = async (
    demoData: Omit<DemoSession, 'id' | 'srNo'>
  ): Promise<DemoSession> => {
    setLoading(true);
    try {
      const created = await demoService.create(demoData);
      setDemos((prev) => [created, ...prev]);
      return created;
    } catch {
      const fallbackDemo: DemoSession = {
        ...demoData,
        id: `demo-${Date.now()}`,
        srNo: String(demos.length + 1).padStart(2, '0'),
      };
      setDemos((prev) => [fallbackDemo, ...prev]);
      return fallbackDemo;
    } finally {
      setLoading(false);
    }
  };

  // Status Update Mutation (e.g., Scheduled -> Completed)
  const updateDemoStatus = async (id: string, status: DemoSession['status']) => {
    try {
      await demoService.updateStatus(id, status);
    } catch {
      // Fallback local update
    } finally {
      setDemos((prev) =>
        prev.map((d) => (d.id === id ? { ...d, status } : d))
      );
    }
  };

  return {
    demos: filteredDemos,
    allDemos: demos,
    loading,
    error,
    statusFilter,
    modeFilter,
    setStatusFilter,
    setModeFilter,
    refetch: fetchDemos,
    scheduleDemo,
    updateDemoStatus,
  };
};