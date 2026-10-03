import { apiRequest } from '../lib/api';
import { LeaveRequest, LeaveTab } from '../pages/admin/LeavePage';

export const leaveService = {
  // Fetch leave requests filtered by status tab
  getLeavesByStatus: async (status: LeaveTab): Promise<LeaveRequest[]> => {
    return apiRequest<LeaveRequest[]>(`/leaves?status=${status}`);
  },

  // Get a single leave request detail
  getLeaveById: async (id: string): Promise<LeaveRequest> => {
    return apiRequest<LeaveRequest>(`/leaves/${id}`);
  },

  // Approve a leave request (changes status to 'Active')
  approveLeave: async (id: string): Promise<LeaveRequest> => {
    return apiRequest<LeaveRequest>(`/leaves/${id}/approve`, {
      method: 'PATCH',
    });
  },

  // Reject a leave request with a rejection reason
  rejectLeave: async (id: string, rejectionReason: string): Promise<LeaveRequest> => {
    return apiRequest<LeaveRequest>(`/leaves/${id}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ rejectionReason }),
    });
  },
};