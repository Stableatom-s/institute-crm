// src/services/teamService.ts
import { apiRequest } from '../lib/api';
import { TeamMember, MemberTab } from '../pages/admin/TeamPage';

export const teamService = {
  // Fetch members filtered by status (Active / Inactive)
  getMembers: async (status?: MemberTab): Promise<TeamMember[]> => {
    const endpoint = status ? `/team?status=${status}` : '/team';
    return apiRequest<TeamMember[]>(endpoint);
  },

  // Create a new team member
  createMember: async (
    memberData: Partial<TeamMember> & { password?: string }
  ): Promise<TeamMember> => {
    return apiRequest<TeamMember>('/team', {
      method: 'POST',
      body: JSON.stringify(memberData),
    });
  },

  // Update existing member details
  updateMember: async (
    id: string,
    memberData: Partial<TeamMember>
  ): Promise<TeamMember> => {
    return apiRequest<TeamMember>(`/team/${id}`, {
      method: 'PUT',
      body: JSON.stringify(memberData),
    });
  },

  // Soft delete / deactivate user
  removeUser: async (id: string, reason: string): Promise<TeamMember> => {
    return apiRequest<TeamMember>(`/team/${id}/remove`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    });
  },

  // Restore inactive user access
  restoreAccess: async (id: string): Promise<TeamMember> => {
    return apiRequest<TeamMember>(`/team/${id}/restore`, {
      method: 'PATCH',
    });
  },
};