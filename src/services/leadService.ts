import { apiRequest } from "../lib/api";
import { DetailedLead, TimelineEntry } from "../pages/sales/SalesLeadsPage";

export const leadService = {
  getAllLeads: async (): Promise<DetailedLead[]> => {
    return apiRequest<DetailedLead[]>("/leads");
  },

  createLead: async (leadData: Partial<DetailedLead>): Promise<DetailedLead> => {
    return apiRequest<DetailedLead>("/leads", {
      method: "POST",
      body: JSON.stringify(leadData),
    });
  },

  updateLead: async (id: string, leadData: Partial<DetailedLead>): Promise<DetailedLead> => {
    return apiRequest<DetailedLead>(`/leads/${id}`, {
      method: "PUT",
      body: JSON.stringify(leadData),
    });
  },

  updateStatus: async (
    id: string,
    status: string,
    remark?: string,
    newTimelineEntry?: TimelineEntry
  ): Promise<DetailedLead> => {
    return apiRequest<DetailedLead>(`/leads/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({
        status,
        remark,
        newTimelineEntry,
      }),
    });
  },
};