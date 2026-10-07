import { apiRequest } from '../lib/api';
import { TeamMember } from '../pages/admin/TeamPage';

export const teamService = {
  getAllMembers: async (): Promise<TeamMember[]> => {
    try {
      const data = await apiRequest<any[]>('/team');
      return data.map((d, idx) => ({
        id: d._id || d.id,
        srNo: d.srNo || String(idx + 1).padStart(2, '0'),
        firstName: d.firstName,
        lastName: d.lastName,
        name: d.name || `${d.firstName || ''} ${d.lastName || ''}`.trim(),
        role: d.role || 'Faculty',
        mobile: d.mobile,
        altMobile: d.altMobile,
        email: d.email,
        address: d.address || 'Pune',
        education: d.education || 'B.arch',
        course: d.course || 'UI/UX Design',
        assignedBatches: d.assignedBatches || [],
        activeTill: d.activeTill,
        status: d.status || 'Active',
        photoUrl: d.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        workHistory: d.workHistory || {
          companyName: 'Abc Pvt ltd',
          jobTitle: 'Jr. Architect',
          experienceYears: '01 years',
        },
        leaveHistory: d.leaveHistory || [],
      }));
    } catch {
      return [];
    }
  },

  createMember: async (member: Partial<TeamMember> & { password?: string }): Promise<TeamMember> => {
    return await apiRequest<TeamMember>('/team', {
      method: 'POST',
      body: JSON.stringify(member),
    });
  },

  updateMember: async (id: string, updates: Partial<TeamMember>): Promise<TeamMember> => {
    return await apiRequest<TeamMember>(`/team/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  updateStatus: async (id: string, status: 'Active' | 'Inactive', activeTill?: string): Promise<TeamMember> => {
    return await apiRequest<TeamMember>(`/team/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, activeTill }),
    });
  },
};