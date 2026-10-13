import { apiRequest } from '../lib/api';

export interface DetailedLead {
  id: string;
  srNo: string;
  firstName: string;
  lastName: string;
  contactNo: string;
  email: string;
  enquiryDate: string;
  course: string;
  status: any;
  followUp: string;
  remark: string;
  occupation: string;
  leadSource: string;
  address: string;
  assignedTo?: string;
  offeredFees?: string;
  finalFees?: string;
  referral?: 'Yes' | 'No';
  referralMobile?: string;
  referralName?: string;
  enquiringFor?: 'Self' | 'Family' | 'Friend' | 'Other' | string;
  studentName?: string;
  studentMobile?: string;
  timeline: any[];
}

export const leadService = {
  getAllLeads: async (): Promise<DetailedLead[]> => {
    const data = await apiRequest<any[]>('/leads');
    return data.map((item) => ({
      ...item,
      id: item._id || item.id,
    }));
  },

  createLead: async (leadData: Partial<DetailedLead>): Promise<DetailedLead> => {
    const item = await apiRequest<any>('/leads', {
      method: 'POST',
      body: JSON.stringify(leadData),
    });
    return {
      ...item,
      id: item._id || item.id,
    };
  },

  updateStatus: async (
    id: string,
    status: any,
    remark?: string,
    timelineEntry?: any
  ): Promise<DetailedLead> => {
    const item = await apiRequest<any>(`/leads/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, remark, timelineEntry }),
    });
    return {
      ...item,
      id: item._id || item.id,
    };
  },
};