import { useState, useEffect, useCallback, useMemo } from 'react';
import { leadService } from '../services/leadService';

export type LeadStatus =
  | 'New'
  | 'Contacted'
  | 'Interested'
  | 'Demo Scheduled'
  | 'Not Interested'
  | 'Enrolled';

export interface Lead {
  id: string;
  srNo: string;
  name: string;
  contactNo: string;
  email?: string;
  enquiryDate: string;
  course: string;
  status: LeadStatus;
  followUpDate?: string;
  remark?: string;
  history?: Array<{ date: string; remark: string; by: string }>;
}

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

  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [courseFilter, setCourseFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await leadService.getAllLeads();
      if (data && data.length > 0) {
        setLeads(
          data.map((l: any, idx: number) => ({
            id: l.id || l._id,
            srNo: String(idx + 1).padStart(2, '0'),
            name: `${l.firstName || ''} ${l.lastName || ''}`.trim() || l.name || 'Lead',
            contactNo: l.contactNo || l.mobile || '',
            email: l.email,
            enquiryDate: l.enquiryDate || l.date || 'Today',
            course: l.course || 'UI/UX Design',
            status: (l.status || 'New') as LeadStatus,
            followUpDate: l.followUpDate || l.followUp,
            remark: l.remark || '',
            history: l.history || [],
          }))
        );
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

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

  const createLead = async (
    leadData: Omit<Lead, 'id' | 'srNo'>
  ): Promise<Lead> => {
    setLoading(true);
    setError(null);
    try {
      const names = leadData.name.split(' ');
      const payload = {
        ...leadData,
        firstName: names[0] || 'Lead',
        lastName: names.slice(1).join(' ') || '',
      };
      const created: any = await leadService.createLead(payload as any);
      const newLead: Lead = {
        ...leadData,
        id: created.id || created._id,
        srNo: String(leads.length + 1).padStart(2, '0'),
      };
      setLeads((prev) => [newLead, ...prev]);
      return newLead;
    } catch (err: any) {
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

  const updateLeadStatus = async (
    id: string,
    status: LeadStatus,
    remark?: string
  ) => {
    try {
      if (typeof (leadService as any).updateLeadStatus === 'function') {
        await (leadService as any).updateLeadStatus(id, status, remark);
      } else if (typeof (leadService as any).updateLead === 'function') {
        await (leadService as any).updateLead(id, { status, remark });
      }
    } catch {
      // local fallback
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