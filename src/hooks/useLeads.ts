import { useState, useEffect, useCallback, useMemo } from 'react';
import { Lead } from '../types';
import { leadService } from '../services/leadService';

const MOCK_LEADS: Lead[] = [
  {
    id: 'lead-1',
    srNo: '01',
    name: 'Aanya Shah',
    contactNo: '9078675645',
    email: 'aanya@gmail.com',
    enquiryDate: '21-12-2025',
    course: 'UI/UX Design',
    status: 'Interested',
    followUpDate: '01-01-2026',
    remark: 'Needs Time',
    history: [
      { date: '15-11-2025', remark: 'Lead created via inquiry form', by: 'System' },
      { date: '16-11-2025', remark: 'Student requested a demo session', by: 'Sales' },
    ],
  },
  {
    id: 'lead-2',
    srNo: '02',
    name: 'Rohan Mehta',
    contactNo: '9123456565',
    email: 'rohan.m@gmail.com',
    enquiryDate: '21-12-2025',
    course: 'No Code',
    status: 'Interested',
    followUpDate: '01-01-2026',
    remark: 'Needs Time',
  },
  {
    id: 'lead-3',
    srNo: '03',
    name: 'Neha Patel',
    contactNo: '9767564995',
    email: 'neha.patel@gmail.com',
    enquiryDate: '21-12-2025',
    course: 'UI/UX Design',
    status: 'Interested',
    followUpDate: '01-01-2026',
    remark: 'Joining Soon',
  },
  {
    id: 'lead-4',
    srNo: '04',
    name: 'Aman Verma',
    contactNo: '9876694837',
    email: 'aman.v@gmail.com',
    enquiryDate: '21-12-2025',
    course: 'Portfolio',
    status: 'Not Interested',
    followUpDate: '01-01-2026',
    remark: 'Call Back',
  },
  {
    id: 'lead-5',
    srNo: '05',
    name: 'Siddhi Shah',
    contactNo: '9456578342',
    email: 'siddhi.s@gmail.com',
    enquiryDate: '21-12-2025',
    course: 'Full-Stack',
    status: 'Interested',
    followUpDate: '01-01-2026',
    remark: 'Joining Soon',
  },
];

export const useLeads = () => {
  const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [courseFilter, setCourseFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Fetch leads from backend API, fallback to mock data on error/offline
  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await leadService.getAll();
      if (data && data.length > 0) {
        setLeads(data);
      }
    } catch (err: any) {
      // Keep mock data if server is offline during development
      setError(err?.response?.data?.message || err?.message || 'Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Filtered Leads derived state
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesStatus =
        statusFilter === 'All' ||
        lead.status.toLowerCase() === statusFilter.toLowerCase();

      const matchesCourse =
        courseFilter === 'All' ||
        lead.course.toLowerCase() === courseFilter.toLowerCase();

      const matchesSearch =
        searchQuery.trim() === '' ||
        lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.contactNo.includes(searchQuery) ||
        (lead.email && lead.email.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesStatus && matchesCourse && matchesSearch;
    });
  }, [leads, statusFilter, courseFilter, searchQuery]);

  // Create lead mutation
  const createLead = async (
    leadData: Omit<Lead, 'id' | 'srNo'>
  ): Promise<Lead> => {
    setLoading(true);
    setError(null);
    try {
      const created = await leadService.create(leadData);
      setLeads((prev) => [created, ...prev]);
      return created;
    } catch (err: any) {
      // Local fallback creation
      const localCreated: Lead = {
        ...leadData,
        id: `lead-${Date.now()}`,
        srNo: String(leads.length + 1).padStart(2, '0'),
      };
      setLeads((prev) => [localCreated, ...prev]);
      return localCreated;
    } finally {
      setLoading(false);
    }
  };

  // Update lead status mutation
  const updateLeadStatus = async (
    id: string,
    status: Lead['status'],
    remark?: string
  ) => {
    try {
      await leadService.updateStatus(id, status, remark);
    } catch {
      // Local state fallback if backend endpoint isn't ready
    } finally {
      setLeads((prev) =>
        prev.map((lead) =>
          lead.id === id
            ? {
                ...lead,
                status,
                remark: remark || lead.remark,
                history: remark
                  ? [
                      ...(lead.history || []),
                      {
                        date: new Date().toLocaleDateString('en-GB'),
                        remark: `Status changed to ${status}: ${remark}`,
                        by: 'User',
                      },
                    ]
                  : lead.history,
              }
            : lead
        )
      );
    }
  };

  return {
    leads: filteredLeads,
    allLeads: leads,
    loading,
    error,
    statusFilter,
    courseFilter,
    searchQuery,
    setStatusFilter,
    setCourseFilter,
    setSearchQuery,
    refetch: fetchLeads,
    createLead,
    updateLeadStatus,
  };
};