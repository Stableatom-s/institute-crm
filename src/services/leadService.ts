import { apiRequest } from '../lib/api';
import { DetailedLead, LeadStatus } from '../pages/sales/SalesLeadsPage';

export const leadService = {
  // Fetch all leads from MongoDB
  getAllLeads: async (): Promise<DetailedLead[]> => {
    const data = await apiRequest<any[]>('/leads');
    return data.map((item) => ({
      ...item,
      id: item._id || item.id, // Normalize MongoDB _id to id
    }));
  },

  // Create new lead in MongoDB
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

  // Update lead status and append timeline note in MongoDB
  updateStatus: async (
    id: string,
    status: LeadStatus,
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