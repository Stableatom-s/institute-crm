import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown, 
  Plus, 
  Check,
  Loader2 
} from 'lucide-react';
import { teamService } from '../../services/teamService';

// --- TYPES ---
export type MemberTab = 'Active' | 'Inactive';

export interface LeaveHistoryItem {
  id: string;
  leaveType: string;
  leaveDate: string;
  reason: string;
  applicationDate: string;
  status: 'Approved' | 'Rejected' | 'Pending';
}

export interface TeamMember {
  id: string;
  srNo: string;
  firstName: string;
  lastName: string;
  name: string;
  role: 'Faculty' | 'Sales' | 'Sales Manager';
  mobile: string;
  altMobile?: string;
  email: string;
  address: string;
  education: string;
  course: string;
  assignedBatches: string[];
  activeTill?: string;
  status: MemberTab;
  photoUrl: string;
  workHistory: {
    companyName: string;
    jobTitle: string;
    experienceYears: string;
  };
  leaveHistory: LeaveHistoryItem[];
}

const AVAILABLE_COURSES = [
  'UI/UX Design',
  'No code',
  'Full-stack Development',
  'Portfolio Building',
  'React',
  'React Native',
];

export const AdminTeamPage: React.FC = () => {
  // Navigation states
  const [view, setView] = useState<
    'roster' | 'view-member' | 'edit-member' | 'add-details' | 'add-credentials' | 'add-preview'
  >('roster');

  const [activeTab, setActiveTab] = useState<MemberTab>('Active');
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  // Async state
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Edit / Add state tracking
  const [isDirty, setIsDirty] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [nextDestinationView, setNextDestinationView] = useState<'roster' | 'view-member'>('roster');

  // Edit Member fields
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editMobile, setEditMobile] = useState('');
  const [editAltMobile, setEditAltMobile] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editEducation, setEditEducation] = useState('');
  const [editRole, setEditRole] = useState<'Faculty' | 'Sales'>('Faculty');
  const [editCompany, setEditCompany] = useState('');
  const [editJobTitle, setEditJobTitle] = useState('');
  const [editExperience, setEditExperience] = useState('');
  const [editCourses, setEditCourses] = useState<string[]>([]);

  // Add Member Multi-Step form state
  const [addFirstName, setAddFirstName] = useState('');
  const [addLastName, setAddLastName] = useState('');
  const [addMobile, setAddMobile] = useState('');
  const [addAltMobile, setAddAltMobile] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addAddress, setAddAddress] = useState('');
  const [addEducation, setAddEducation] = useState('');
  const [addRole, setAddRole] = useState<'Faculty' | 'Sales'>('Faculty');
  const [addCompany, setAddCompany] = useState('');
  const [addJobTitle, setAddJobTitle] = useState('');
  const [addExperience, setAddExperience] = useState('');
  const [addCourses, setAddCourses] = useState<string[]>(['UI/UX Design']);
  const [addPassword, setAddPassword] = useState('password123');

  // Modals & Feedback popups
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showAccessRestoredAlert, setShowAccessRestoredAlert] = useState(false);
  const [showRemoveUserModal, setShowRemoveUserModal] = useState(false);
  const [removeReason, setRemoveReason] = useState('');
  const [showUserRemovedAlert, setShowUserRemovedAlert] = useState(false);
  const [showSendCredentialsModal, setShowSendCredentialsModal] = useState(false);
  const [showCredentialsSentAlert, setShowCredentialsSentAlert] = useState(false);

  // Fetch team members from server
  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await teamService.getMembers();
      setMembers(data);
    } catch (err) {
      console.error('Failed to fetch team members:', err);
      setError('Unable to load team members from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  // Filter calculations
  const activeCount = members.filter((m) => m.status === 'Active').length;
  const inactiveCount = members.filter((m) => m.status === 'Inactive').length;
  const currentList = members.filter((m) => m.status === activeTab);

  // Handlers
  const handleOpenMember = (m: TeamMember) => {
    setSelectedMember(m);
    setView('view-member');
  };

  const handleStartEdit = (m: TeamMember) => {
    setSelectedMember(m);
    setEditFirstName(m.firstName);
    setEditLastName(m.lastName);
    setEditMobile(m.mobile);
    setEditAltMobile(m.altMobile || '');
    setEditEmail(m.email);
    setEditAddress(m.address);
    setEditEducation(m.education);
    setEditRole(m.role === 'Sales' ? 'Sales' : 'Faculty');
    setEditCompany(m.workHistory?.companyName || '');
    setEditJobTitle(m.workHistory?.jobTitle || '');
    setEditExperience(m.workHistory?.experienceYears || '');
    setEditCourses([m.course]);
    setIsDirty(false);
    setView('edit-member');
  };

  const handleSaveEditChanges = async () => {
    if (!selectedMember) return;
    try {
      setActionLoading(true);
      const payload: Partial<TeamMember> = {
        firstName: editFirstName,
        lastName: editLastName,
        name: `${editFirstName} ${editLastName}`,
        mobile: editMobile,
        altMobile: editAltMobile,
        email: editEmail,
        address: editAddress,
        education: editEducation,
        role: editRole,
        course: editCourses[0] || selectedMember.course,
        workHistory: {
          companyName: editCompany,
          jobTitle: editJobTitle,
          experienceYears: editExperience,
        },
      };

      const updated = await teamService.updateMember(selectedMember.id, payload);
      setMembers(members.map((m) => (m.id === updated.id ? updated : m)));
      setSelectedMember(updated);
      setIsDirty(false);
      setView('view-member');
    } catch (err) {
      console.error('Failed to save edit changes:', err);
      alert('Failed to update member. Please check server logs.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmRestore = async () => {
    if (!selectedMember) return;
    try {
      setActionLoading(true);
      const restored = await teamService.restoreAccess(selectedMember.id);
      setMembers(members.map((m) => (m.id === selectedMember.id ? restored : m)));
      setSelectedMember(restored);
      setShowRestoreModal(false);
      setShowAccessRestoredAlert(true);
      setTimeout(() => {
        setShowAccessRestoredAlert(false);
        setActiveTab('Active');
        setView('roster');
      }, 1500);
    } catch (err) {
      console.error('Failed to restore member access:', err);
      alert('Failed to restore access.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmRemoveUser = async () => {
    if (!selectedMember) return;
    try {
      setActionLoading(true);
      const deactivated = await teamService.removeUser(selectedMember.id, removeReason);
      setMembers(members.map((m) => (m.id === selectedMember.id ? deactivated : m)));
      setSelectedMember(deactivated);
      setShowRemoveUserModal(false);
      setRemoveReason('');
      setShowUserRemovedAlert(true);
      setTimeout(() => {
        setShowUserRemovedAlert(false);
        setView('roster');
      }, 1500);
    } catch (err) {
      console.error('Failed to remove user:', err);
      alert('Failed to remove user.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmSendCredentials = async () => {
    try {
      setActionLoading(true);
      const newMember = await teamService.createMember({
        firstName: addFirstName || 'New',
        lastName: addLastName || 'Member',
        name: `${addFirstName || 'New'} ${addLastName || 'Member'}`,
        role: addRole,
        mobile: addMobile,
        altMobile: addAltMobile,
        email: addEmail,
        address: addAddress,
        education: addEducation,
        course: addCourses[0] || 'UI/UX Design',
        assignedBatches: ['MWF-JAN-2026'],
        status: 'Active',
        password: addPassword,
        workHistory: {
          companyName: addCompany,
          jobTitle: addJobTitle,
          experienceYears: addExperience,
        },
      });

      setMembers([newMember, ...members]);
      setShowSendCredentialsModal(false);
      setShowCredentialsSentAlert(true);
      setTimeout(() => {
        setShowCredentialsSentAlert(false);
        setView('roster');
      }, 1500);
    } catch (err) {
      console.error('Failed to create team member:', err);
      alert('Failed to create team member.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="font-['Onest'] text-[#050720] pb-16">

      {/* ROSTER VIEW */}
      {view === 'roster' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold font-['Sora']">Team Members</h1>
            <button
              onClick={() => {
                setAddFirstName('');
                setAddLastName('');
                setAddMobile('');
                setAddAltMobile('');
                setAddEmail('');
                setAddAddress('');
                setAddEducation('');
                setAddRole('Faculty');
                setAddCompany('');
                setAddJobTitle('');
                setAddExperience('');
                setAddCourses(['UI/UX Design']);
                setIsDirty(false);
                setView('add-details');
              }}
              className="px-4 py-2 bg-[#FFB908] hover:bg-[#E5A607] rounded-lg text-xs font-bold text-[#050720] transition-colors shadow-xs"
            >
              Add new member
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-xl border border-[#050720]/10 text-center shadow-xs">
              <span className="text-xs font-bold block">Active Members</span>
              <span className="text-3xl font-extrabold font-['Sora'] mt-1 block">
                {String(activeCount).padStart(2, '0')}
              </span>
            </div>
            <div className="bg-white p-6 rounded-xl border border-[#050720]/10 text-center shadow-xs">
              <span className="text-xs font-bold block">Inactive Members</span>
              <span className="text-3xl font-extrabold font-['Sora'] mt-1 block">
                {String(inactiveCount).padStart(2, '0')}
              </span>
            </div>
          </div>

          <div className="bg-white border border-[#050720]/10 rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-8 border-b border-[#050720]/10 pb-3">
              {(['Active', 'Inactive'] as MemberTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-sm font-semibold transition-all relative pb-2 ${
                    activeTab === tab
                      ? 'text-[#050720] font-bold'
                      : 'text-[#050720]/50 hover:text-[#050720]'
                  }`}
                >
                  <span>{tab}</span>
                  {activeTab === tab && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FFB908] rounded-full" />
                  )}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2 text-[#050720]/50">
                <Loader2 className="w-6 h-6 animate-spin text-[#FFB908]" />
                <span className="text-xs">Loading team members...</span>
              </div>
            ) : error ? (
              <div className="py-8 text-center text-xs text-rose-500">{error}</div>
            ) : currentList.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#050720]/50">
                No {activeTab.toLowerCase()} team members found.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#050720]/10 text-[#050720] font-bold">
                    <th className="pb-3.5 font-semibold">Sr. No.</th>
                    <th className="pb-3.5 font-semibold">Name</th>
                    <th className="pb-3.5 font-semibold">Role</th>
                    <th className="pb-3.5 font-semibold">Mobile</th>
                    <th className="pb-3.5 font-semibold">Email</th>
                    <th className="pb-3.5 font-semibold">Course</th>
                    <th className="pb-3.5 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#050720]/5 text-[#050720]">
                  {currentList.map((m, idx) => (
                    <tr key={m.id} className="hover:bg-[#FFB908]/5 transition-colors">
                      <td className="py-3.5 text-[#050720]/70">
                        {m.srNo || String(idx + 1).padStart(2, '0')}
                      </td>
                      <td className="py-3.5 font-medium">{m.name}</td>
                      <td className="py-3.5 text-[#050720]/70">{m.role}</td>
                      <td className="py-3.5 text-[#050720]/70">{m.mobile}</td>
                      <td className="py-3.5 text-[#050720]/70">{m.email}</td>
                      <td className="py-3.5 text-[#050720]/70">{m.course}</td>
                      <td className="py-3.5 text-right">
                        <button
                          onClick={() => handleOpenMember(m)}
                          className="px-3 py-1 border border-[#050720]/30 rounded text-[11px] font-semibold text-[#050720] hover:bg-[#050720]/5 transition-colors"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-[#050720]/5 text-xs text-[#050720]/70">
              <span className="text-[11px]">Jump to</span>
              <input
                type="text"
                defaultValue="01"
                className="w-8 h-7 text-center border border-[#050720]/20 rounded text-xs text-[#050720] font-semibold"
              />
              <div className="flex items-center gap-1.5 ml-2">
                <button className="p-1 hover:text-[#050720]"><ChevronLeft className="w-3.5 h-3.5" /></button>
                <span className="text-[11px] font-semibold text-[#050720]">01 of 01</span>
                <button className="p-1 hover:text-[#050720]"><ChevronRight className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MEMBER DETAILS */}
      {view === 'view-member' && selectedMember && (
        <div className="space-y-6 max-w-5xl">
          <div className="flex justify-between items-center">
            <button
              onClick={() => setView('roster')}
              className="flex items-center gap-2 text-2xl font-bold font-['Sora'] hover:opacity-80 transition-opacity"
            >
              <ArrowLeft className="w-6 h-6 text-[#050720]" />
              <span>Team Members</span>
            </button>

            {selectedMember.status === 'Active' ? (
              <button
                onClick={() => handleStartEdit(selectedMember)}
                className="px-4 py-2 bg-[#FFB908] hover:bg-[#E5A607] rounded-lg text-xs font-bold text-[#050720] transition-colors shadow-xs"
              >
                Edit member
              </button>
            ) : (
              <button
                onClick={() => setShowRestoreModal(true)}
                className="px-4 py-2 bg-[#FFB908] hover:bg-[#E5A607] rounded-lg text-xs font-bold text-[#050720] transition-colors shadow-xs"
              >
                Restore Access
              </button>
            )}
          </div>

          <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold font-['Sora']">Preview</h3>
              {selectedMember.status === 'Inactive' && (
                <span className="text-xs font-semibold text-rose-500">Member Inactive</span>
              )}
            </div>

            <div className="w-20 h-24 rounded-lg overflow-hidden border border-[#050720]/15 bg-slate-100">
              <img
                src={selectedMember.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
                alt={selectedMember.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-white border border-[#050720]/15 rounded-lg">
                <span className="text-[10px] text-[#050720]/50 block">First Name*</span>
                <span className="font-semibold text-sm">{selectedMember.firstName}</span>
              </div>
              <div className="p-3 bg-white border border-[#050720]/15 rounded-lg">
                <span className="text-[10px] text-[#050720]/50 block">Last Name*</span>
                <span className="font-semibold text-sm">{selectedMember.lastName}</span>
              </div>
              <div className="p-3 bg-white border border-[#050720]/15 rounded-lg">
                <span className="text-[10px] text-[#050720]/50 block">Mobile*</span>
                <span className="font-semibold text-sm">{selectedMember.mobile}</span>
              </div>
              <div className="p-3 bg-white border border-[#050720]/15 rounded-lg">
                <span className="text-[10px] text-[#050720]/50 block">Alternative Mobile*</span>
                <span className="font-semibold text-sm">{selectedMember.altMobile || 'N/A'}</span>
              </div>
              <div className="p-3 bg-white border border-[#050720]/15 rounded-lg">
                <span className="text-[10px] text-[#050720]/50 block">Email*</span>
                <span className="font-semibold text-sm">{selectedMember.email}</span>
              </div>
              <div className="p-3 bg-white border border-[#050720]/15 rounded-lg">
                <span className="text-[10px] text-[#050720]/50 block">Address*</span>
                <span className="font-semibold text-sm">{selectedMember.address}</span>
              </div>
              <div className="p-3 bg-white border border-[#050720]/15 rounded-lg">
                <span className="text-[10px] text-[#050720]/50 block">Education*</span>
                <span className="font-semibold text-sm">{selectedMember.education}</span>
              </div>
              <div className="p-3 bg-white border border-[#050720]/15 rounded-lg">
                <span className="text-[10px] text-[#050720]/50 block">Role</span>
                <span className="font-semibold text-sm">{selectedMember.role}</span>
              </div>

              {selectedMember.status === 'Inactive' && selectedMember.activeTill && (
                <div className="p-3 bg-white border border-[#050720]/15 rounded-lg sm:col-span-2">
                  <span className="text-[10px] text-[#050720]/50 block">Active till</span>
                  <span className="font-semibold text-sm">{selectedMember.activeTill}</span>
                </div>
              )}
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <span className="text-[10px] text-[#050720]/50 block mb-1">Course</span>
                <div className="inline-block px-3 py-1 border border-[#0066FF] rounded text-xs font-semibold text-[#0066FF] bg-blue-50/30">
                  {selectedMember.course}
                </div>
              </div>

              {selectedMember.assignedBatches && selectedMember.assignedBatches.length > 0 && (
                <div>
                  <span className="text-[10px] text-[#050720]/50 block mb-1">Assigned Batches</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedMember.assignedBatches.map((b) => (
                      <span
                        key={b}
                        className="px-3 py-1 border border-[#0066FF] rounded text-xs font-semibold text-[#0066FF] bg-blue-50/30"
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold font-['Sora']">Work History</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Company Name</span>
                <span className="font-semibold text-sm">{selectedMember.workHistory?.companyName || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Job Title</span>
                <span className="font-semibold text-sm">{selectedMember.workHistory?.jobTitle || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Work experience</span>
                <span className="font-semibold text-sm">{selectedMember.workHistory?.experienceYears || 'N/A'}</span>
              </div>
            </div>
          </div>

          {selectedMember.status === 'Active' && selectedMember.leaveHistory && (
            <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold font-['Sora']">Leave Record History</h3>
              </div>

              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#050720]/10 text-[#050720] font-bold">
                    <th className="pb-3.5 font-semibold">Leave Type</th>
                    <th className="pb-3.5 font-semibold">Leave Date</th>
                    <th className="pb-3.5 font-semibold">Reason</th>
                    <th className="pb-3.5 font-semibold">Application Date</th>
                    <th className="pb-3.5 text-right font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#050720]/5 text-[#050720]">
                  {selectedMember.leaveHistory.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-xs text-[#050720]/50">
                        No leave history records.
                      </td>
                    </tr>
                  ) : (
                    selectedMember.leaveHistory.map((l) => (
                      <tr key={l.id} className="hover:bg-[#FFB908]/5 transition-colors">
                        <td className="py-3.5 font-medium">{l.leaveType}</td>
                        <td className="py-3.5 text-[#050720]/80">{l.leaveDate}</td>
                        <td className="py-3.5 text-[#050720]/80">{l.reason}</td>
                        <td className="py-3.5 text-[#050720]/80">{l.applicationDate}</td>
                        <td className="py-3.5 text-right">
                          <span
                            className={`font-semibold ${
                              l.status === 'Approved'
                                ? 'text-[#10B981]'
                                : l.status === 'Rejected'
                                ? 'text-[#EF4444]'
                                : 'text-[#FFB908]'
                            }`}
                          >
                            {l.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* EDIT MEMBER VIEW */}
      {view === 'edit-member' && selectedMember && (
        <div className="space-y-6 max-w-5xl">
          <button
            onClick={() => {
              if (isDirty) {
                setNextDestinationView('view-member');
                setShowUnsavedModal(true);
              } else {
                setView('view-member');
              }
            }}
            className="flex items-center gap-2 text-2xl font-bold font-['Sora'] hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="w-6 h-6 text-[#050720]" />
            <span>Edit Member</span>
          </button>

          <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-6">
            <h3 className="text-sm font-bold font-['Sora']">Personal Details</h3>

            <div className="w-20 h-24 rounded-lg overflow-hidden border border-[#050720]/15 bg-slate-100">
              <img
                src={selectedMember.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
                alt={selectedMember.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <input
                type="text"
                value={editFirstName}
                onChange={(e) => {
                  setEditFirstName(e.target.value);
                  setIsDirty(true);
                }}
                placeholder="First Name*"
                className="w-full bg-[#F8FAFC] text-xs px-3.5 py-2.5 rounded-lg border border-[#050720]/15 focus:outline-none"
              />
              <input
                type="text"
                value={editLastName}
                onChange={(e) => {
                  setEditLastName(e.target.value);
                  setIsDirty(true);
                }}
                placeholder="Last Name*"
                className="w-full bg-[#F8FAFC] text-xs px-3.5 py-2.5 rounded-lg border border-[#050720]/15 focus:outline-none"
              />
              <input
                type="text"
                value={editMobile}
                onChange={(e) => {
                  setEditMobile(e.target.value);
                  setIsDirty(true);
                }}
                placeholder="Mobile*"
                className="w-full bg-[#F8FAFC] text-xs px-3.5 py-2.5 rounded-lg border border-[#050720]/15 focus:outline-none"
              />
              <input
                type="text"
                value={editAltMobile}
                onChange={(e) => {
                  setEditAltMobile(e.target.value);
                  setIsDirty(true);
                }}
                placeholder="Alternative Mobile*"
                className="w-full bg-[#F8FAFC] text-xs px-3.5 py-2.5 rounded-lg border border-[#050720]/15 focus:outline-none"
              />
              <input
                type="email"
                value={editEmail}
                onChange={(e) => {
                  setEditEmail(e.target.value);
                  setIsDirty(true);
                }}
                placeholder="Email*"
                className="w-full bg-[#F8FAFC] text-xs px-3.5 py-2.5 rounded-lg border border-[#050720]/15 focus:outline-none"
              />
              <input
                type="text"
                value={editAddress}
                onChange={(e) => {
                  setEditAddress(e.target.value);
                  setIsDirty(true);
                }}
                placeholder="Address*"
                className="w-full bg-[#F8FAFC] text-xs px-3.5 py-2.5 rounded-lg border border-[#050720]/15 focus:outline-none"
              />
              <input
                type="text"
                value={editEducation}
                onChange={(e) => {
                  setEditEducation(e.target.value);
                  setIsDirty(true);
                }}
                placeholder="Education*"
                className="w-full bg-[#F8FAFC] text-xs px-3.5 py-2.5 rounded-lg border border-[#050720]/15 focus:outline-none"
              />
              <div className="relative">
                <select
                  value={editRole}
                  onChange={(e) => {
                    setEditRole(e.target.value as 'Faculty' | 'Sales');
                    setIsDirty(true);
                  }}
                  className="w-full bg-[#F8FAFC] text-xs px-3.5 py-2.5 rounded-lg border border-[#050720]/15 appearance-none focus:outline-none"
                >
                  <option value="Faculty">Faculty</option>
                  <option value="Sales">Sales</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#050720]/40 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold font-['Sora']">Work History</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <input
                type="text"
                value={editCompany}
                onChange={(e) => {
                  setEditCompany(e.target.value);
                  setIsDirty(true);
                }}
                placeholder="Company Name*"
                className="w-full bg-[#F8FAFC] text-xs px-3.5 py-2.5 rounded-lg border border-[#050720]/15 focus:outline-none"
              />
              <input
                type="text"
                value={editJobTitle}
                onChange={(e) => {
                  setEditJobTitle(e.target.value);
                  setIsDirty(true);
                }}
                placeholder="Job Title*"
                className="w-full bg-[#F8FAFC] text-xs px-3.5 py-2.5 rounded-lg border border-[#050720]/15 focus:outline-none"
              />
              <input
                type="text"
                value={editExperience}
                onChange={(e) => {
                  setEditExperience(e.target.value);
                  setIsDirty(true);
                }}
                placeholder="Work Experience (in years)*"
                className="w-full bg-[#F8FAFC] text-xs px-3.5 py-2.5 rounded-lg border border-[#050720]/15 focus:outline-none"
              />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold font-['Sora']">Course</h3>
            <div className="flex flex-wrap items-center gap-6 text-xs">
              {AVAILABLE_COURSES.map((c) => (
                <label key={c} className="flex items-center gap-2 cursor-pointer">
                  <div
                    onClick={() => {
                      setEditCourses((prev) =>
                        prev.includes(c) ? prev.filter((item) => item !== c) : [...prev, c]
                      );
                      setIsDirty(true);
                    }}
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                      editCourses.includes(c)
                        ? 'bg-[#050720] border-[#050720] text-white'
                        : 'border-[#050720]/30'
                    }`}
                  >
                    {editCourses.includes(c) && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span className="font-medium text-[#050720]">{c}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setShowRemoveUserModal(true)}
              className="flex-1 py-2.5 bg-white border border-[#050720]/20 rounded-lg text-xs font-bold hover:bg-[#050720]/5 transition-colors"
            >
              Remove User
            </button>
            <button
              disabled={actionLoading}
              onClick={handleSaveEditChanges}
              className="flex-1 py-2.5 bg-[#FFB908] hover:bg-[#E5A607] rounded-lg text-xs font-bold text-[#050720] transition-colors shadow-xs flex items-center justify-center gap-2"
            >
              {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      )}

      {/* ADD MEMBER - STEP 1 */}
      {view === 'add-details' && (
        <div className="space-y-6 max-w-5xl">
          <button
            onClick={() => {
              if (isDirty) {
                setNextDestinationView('roster');
                setShowUnsavedModal(true);
              } else {
                setView('roster');
              }
            }}
            className="flex items-center gap-2 text-2xl font-bold font-['Sora'] hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="w-6 h-6 text-[#050720]" />
            <span>Add Member</span>
          </button>

          <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-6">
            <h3 className="text-sm font-bold font-['Sora']">Personal Details</h3>

            <div className="space-y-2">
              <div className="w-20 h-24 rounded-lg border border-[#050720]/15 bg-[#E2E8F0] flex items-center justify-center" />
              <div className="flex items-center gap-3">
                <label className="cursor-pointer flex items-center gap-2 px-4 py-2 border border-[#050720]/20 rounded-lg text-xs font-semibold hover:bg-[#050720]/5 transition-colors">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Photo</span>
                  <input type="file" className="hidden" />
                </label>
                <span className="text-xs text-[#050720]/40 font-mono">name.jpeg/png/jpg</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <input
                type="text"
                value={addFirstName}
                onChange={(e) => {
                  setAddFirstName(e.target.value);
                  setIsDirty(true);
                }}
                placeholder="First Name*"
                className="w-full bg-[#F8FAFC] text-xs px-3.5 py-2.5 rounded-lg border border-[#050720]/15 focus:outline-none"
              />
              <input
                type="text"
                value={addLastName}
                onChange={(e) => {
                  setAddLastName(e.target.value);
                  setIsDirty(true);
                }}
                placeholder="Last Name*"
                className="w-full bg-[#F8FAFC] text-xs px-3.5 py-2.5 rounded-lg border border-[#050720]/15 focus:outline-none"
              />
              <input
                type="text"
                value={addMobile}
                onChange={(e) => {
                  setAddMobile(e.target.value);
                  setIsDirty(true);
                }}
                placeholder="Mobile*"
                className="w-full bg-[#F8FAFC] text-xs px-3.5 py-2.5 rounded-lg border border-[#050720]/15 focus:outline-none"
              />
              <input
                type="text"
                value={addAltMobile}
                onChange={(e) => {
                  setAddAltMobile(e.target.value);
                  setIsDirty(true);
                }}
                placeholder="Alternative Mobile*"
                className="w-full bg-[#F8FAFC] text-xs px-3.5 py-2.5 rounded-lg border border-[#050720]/15 focus:outline-none"
              />
              <input
                type="email"
                value={addEmail}
                onChange={(e) => {
                  setAddEmail(e.target.value);
                  setIsDirty(true);
                }}
                placeholder="Email*"
                className="w-full bg-[#F8FAFC] text-xs px-3.5 py-2.5 rounded-lg border border-[#050720]/15 focus:outline-none"
              />
              <input
                type="text"
                value={addAddress}
                onChange={(e) => {
                  setAddAddress(e.target.value);
                  setIsDirty(true);
                }}
                placeholder="Address*"
                className="w-full bg-[#F8FAFC] text-xs px-3.5 py-2.5 rounded-lg border border-[#050720]/15 focus:outline-none"
              />
              <input
                type="text"
                value={addEducation}
                onChange={(e) => {
                  setAddEducation(e.target.value);
                  setIsDirty(true);
                }}
                placeholder="Education*"
                className="w-full bg-[#F8FAFC] text-xs px-3.5 py-2.5 rounded-lg border border-[#050720]/15 focus:outline-none"
              />
              <div className="relative">
                <select
                  value={addRole}
                  onChange={(e) => {
                    setAddRole(e.target.value as 'Faculty' | 'Sales');
                    setIsDirty(true);
                  }}
                  className="w-full bg-[#F8FAFC] text-xs px-3.5 py-2.5 rounded-lg border border-[#050720]/15 appearance-none focus:outline-none"
                >
                  <option value="Faculty">Faculty</option>
                  <option value="Sales">Sales</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#050720]/40 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold font-['Sora']">Work History</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <input
                type="text"
                value={addCompany}
                onChange={(e) => {
                  setAddCompany(e.target.value);
                  setIsDirty(true);
                }}
                placeholder="Company Name*"
                className="w-full bg-[#F8FAFC] text-xs px-3.5 py-2.5 rounded-lg border border-[#050720]/15 focus:outline-none"
              />
              <input
                type="text"
                value={addJobTitle}
                onChange={(e) => {
                  setAddJobTitle(e.target.value);
                  setIsDirty(true);
                }}
                placeholder="Job Title*"
                className="w-full bg-[#F8FAFC] text-xs px-3.5 py-2.5 rounded-lg border border-[#050720]/15 focus:outline-none"
              />
              <input
                type="text"
                value={addExperience}
                onChange={(e) => {
                  setAddExperience(e.target.value);
                  setIsDirty(true);
                }}
                placeholder="Work Experience (in years)*"
                className="w-full bg-[#F8FAFC] text-xs px-3.5 py-2.5 rounded-lg border border-[#050720]/15 focus:outline-none"
              />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold font-['Sora']">Course</h3>
            <div className="flex flex-wrap items-center gap-6 text-xs">
              {AVAILABLE_COURSES.map((c) => (
                <label key={c} className="flex items-center gap-2 cursor-pointer">
                  <div
                    onClick={() => {
                      setAddCourses((prev) =>
                        prev.includes(c) ? prev.filter((item) => item !== c) : [...prev, c]
                      );
                      setIsDirty(true);
                    }}
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                      addCourses.includes(c)
                        ? 'bg-[#050720] border-[#050720] text-white'
                        : 'border-[#050720]/30'
                    }`}
                  >
                    {addCourses.includes(c) && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span className="font-medium text-[#050720]">{c}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setView('roster')}
              className="flex-1 py-2.5 bg-white border border-[#050720]/20 rounded-lg text-xs font-bold hover:bg-[#050720]/5 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => setView('add-credentials')}
              className="flex-1 py-2.5 bg-[#FFB908] hover:bg-[#E5A607] rounded-lg text-xs font-bold text-[#050720] transition-colors shadow-xs"
            >
              Save & Next
            </button>
          </div>
        </div>
      )}

      {/* ADD MEMBER - STEP 2 */}
      {view === 'add-credentials' && (
        <div className="space-y-6 max-w-4xl">
          <button
            onClick={() => setView('add-details')}
            className="flex items-center gap-2 text-2xl font-bold font-['Sora'] hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="w-6 h-6 text-[#050720]" />
            <span>Add Member</span>
          </button>

          <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold font-['Sora']">Set Credentials</h3>

            <div className="space-y-4">
              <div>
                <span className="text-[10px] text-[#050720]/50 block mb-1">Email</span>
                <input
                  type="email"
                  value={addEmail}
                  onChange={(e) => setAddEmail(e.target.value)}
                  className="w-full bg-white text-xs px-3.5 py-2.5 rounded-lg border border-[#050720]/15 focus:outline-none"
                />
              </div>

              <div>
                <span className="text-[10px] text-[#050720]/50 block mb-1">Password*</span>
                <input
                  type="password"
                  value={addPassword}
                  onChange={(e) => setAddPassword(e.target.value)}
                  className="w-full bg-white text-xs px-3.5 py-2.5 rounded-lg border border-[#050720]/15 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                onClick={() => setView('add-preview')}
                className="flex-1 py-2.5 bg-white border border-[#050720]/20 rounded-lg text-xs font-bold hover:bg-[#050720]/5 transition-colors"
              >
                Preview
              </button>
              <button
                onClick={() => setShowSendCredentialsModal(true)}
                className="flex-1 py-2.5 bg-[#FFB908] hover:bg-[#E5A607] rounded-lg text-xs font-bold text-[#050720] transition-colors shadow-xs"
              >
                Save & Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD MEMBER - STEP 3 PREVIEW */}
      {view === 'add-preview' && (
        <div className="space-y-6 max-w-5xl">
          <button
            onClick={() => setView('add-credentials')}
            className="flex items-center gap-2 text-2xl font-bold font-['Sora'] hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="w-6 h-6 text-[#050720]" />
            <span>Add Member</span>
          </button>

          <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-6">
            <h3 className="text-sm font-bold font-['Sora']">Preview</h3>

            <div className="w-20 h-24 rounded-lg overflow-hidden border border-[#050720]/15 bg-slate-100">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-white border border-[#050720]/15 rounded-lg">
                <span className="text-[10px] text-[#050720]/50 block">First Name*</span>
                <span className="font-semibold text-sm">{addFirstName || 'N/A'}</span>
              </div>
              <div className="p-3 bg-white border border-[#050720]/15 rounded-lg">
                <span className="text-[10px] text-[#050720]/50 block">Last Name*</span>
                <span className="font-semibold text-sm">{addLastName || 'N/A'}</span>
              </div>
              <div className="p-3 bg-white border border-[#050720]/15 rounded-lg">
                <span className="text-[10px] text-[#050720]/50 block">Mobile*</span>
                <span className="font-semibold text-sm">{addMobile || 'N/A'}</span>
              </div>
              <div className="p-3 bg-white border border-[#050720]/15 rounded-lg">
                <span className="text-[10px] text-[#050720]/50 block">Alternative Mobile*</span>
                <span className="font-semibold text-sm">{addAltMobile || 'N/A'}</span>
              </div>
              <div className="p-3 bg-white border border-[#050720]/15 rounded-lg">
                <span className="text-[10px] text-[#050720]/50 block">Email*</span>
                <span className="font-semibold text-sm">{addEmail || 'N/A'}</span>
              </div>
              <div className="p-3 bg-white border border-[#050720]/15 rounded-lg">
                <span className="text-[10px] text-[#050720]/50 block">Address*</span>
                <span className="font-semibold text-sm">{addAddress || 'N/A'}</span>
              </div>
              <div className="p-3 bg-white border border-[#050720]/15 rounded-lg">
                <span className="text-[10px] text-[#050720]/50 block">Education*</span>
                <span className="font-semibold text-sm">{addEducation || 'N/A'}</span>
              </div>
              <div className="p-3 bg-white border border-[#050720]/15 rounded-lg">
                <span className="text-[10px] text-[#050720]/50 block">Role</span>
                <span className="font-semibold text-sm">{addRole}</span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <span className="text-[10px] text-[#050720]/50 block mb-1">Course</span>
                <div className="inline-block px-3 py-1 border border-[#0066FF] rounded text-xs font-semibold text-[#0066FF] bg-blue-50/30">
                  {addCourses[0] || 'UI/UX Design'}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold font-['Sora']">Work History</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Company Name</span>
                <span className="font-semibold text-sm">{addCompany || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Job Title</span>
                <span className="font-semibold text-sm">{addJobTitle || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Work experience</span>
                <span className="font-semibold text-sm">{addExperience || 'N/A'}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowSendCredentialsModal(true)}
            className="w-full py-2.5 bg-[#FFB908] hover:bg-[#E5A607] rounded-lg text-xs font-bold text-[#050720] transition-colors shadow-xs"
          >
            Save & Send
          </button>
        </div>
      )}

      {/* MODALS */}
      {showUnsavedModal && (
        <div className="fixed inset-0 z-50 bg-[#050720]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center space-y-5 shadow-2xl">
            <div>
              <h2 className="text-lg font-bold font-['Sora'] text-[#050720]">Leave Without Saving?</h2>
              <p className="text-xs text-[#050720]/60 mt-1">If you leave now, your changes will be lost.</p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setShowUnsavedModal(false);
                  setIsDirty(false);
                  setView(nextDestinationView);
                }}
                className="flex-1 py-2.5 border border-[#050720]/20 rounded-lg text-xs font-bold hover:bg-[#050720]/5 transition-colors"
              >
                Discard Changes
              </button>
              <button
                onClick={() => {
                  setShowUnsavedModal(false);
                  if (view === 'edit-member') {
                    handleSaveEditChanges();
                  } else {
                    setIsDirty(false);
                    setView('add-credentials');
                  }
                }}
                className="flex-1 py-2.5 bg-[#FFB908] hover:bg-[#E5A607] rounded-lg text-xs font-bold text-[#050720] transition-colors shadow-xs"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {showRestoreModal && (
        <div className="fixed inset-0 z-50 bg-[#050720]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center space-y-5 shadow-2xl">
            <div>
              <h2 className="text-lg font-bold font-['Sora'] text-[#050720]">Restore Access?</h2>
              <p className="text-xs text-[#050720]/60 mt-1">This will restore system access for this team member.</p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowRestoreModal(false)}
                className="flex-1 py-2.5 border border-[#050720]/20 rounded-lg text-xs font-bold hover:bg-[#050720]/5 transition-colors"
              >
                Discard Changes
              </button>
              <button
                disabled={actionLoading}
                onClick={handleConfirmRestore}
                className="flex-1 py-2.5 bg-[#FFB908] hover:bg-[#E5A607] rounded-lg text-xs font-bold text-[#050720] transition-colors shadow-xs flex items-center justify-center gap-2"
              >
                {actionLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                <span>Restore Access</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {showAccessRestoredAlert && (
        <div className="fixed inset-0 z-50 bg-[#050720]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center space-y-1.5 shadow-2xl">
            <h3 className="text-base font-bold font-['Sora'] text-[#050720]">Access Restored</h3>
            <p className="text-xs text-[#050720]/60">System access restored for this team member.</p>
          </div>
        </div>
      )}

      {showRemoveUserModal && (
        <div className="fixed inset-0 z-50 bg-[#050720]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-7 max-w-md w-full space-y-4 shadow-2xl">
            <h2 className="text-base font-bold font-['Sora'] text-[#050720] text-center">Remove User?</h2>
            <div>
              <input
                type="text"
                placeholder="Reason for removing"
                value={removeReason}
                onChange={(e) => setRemoveReason(e.target.value)}
                className="w-full bg-[#F8FAFC] text-xs px-3.5 py-2.5 rounded-lg border border-[#050720]/15 focus:outline-none"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowRemoveUserModal(false)}
                className="flex-1 py-2.5 border border-[#050720]/20 rounded-lg text-xs font-bold hover:bg-[#050720]/5 transition-colors"
              >
                Keep User
              </button>
              <button
                disabled={actionLoading}
                onClick={handleConfirmRemoveUser}
                className="flex-1 py-2.5 bg-[#FFB908] hover:bg-[#E5A607] rounded-lg text-xs font-bold text-[#050720] transition-colors shadow-xs flex items-center justify-center gap-2"
              >
                {actionLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                <span>Remove</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {showUserRemovedAlert && (
        <div className="fixed inset-0 z-50 bg-[#050720]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
            <h3 className="text-base font-bold font-['Sora'] text-[#050720]">User has been removed</h3>
          </div>
        </div>
      )}

      {showSendCredentialsModal && (
        <div className="fixed inset-0 z-50 bg-[#050720]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center space-y-5 shadow-2xl">
            <div>
              <h2 className="text-lg font-bold font-['Sora'] text-[#050720]">Send Credentials?</h2>
              <p className="text-xs text-[#050720]/60 mt-1">Credentials set will be sent to the team member</p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowSendCredentialsModal(false)}
                className="flex-1 py-2.5 border border-[#050720]/20 rounded-lg text-xs font-bold hover:bg-[#050720]/5 transition-colors"
              >
                Discard Changes
              </button>
              <button
                disabled={actionLoading}
                onClick={handleConfirmSendCredentials}
                className="flex-1 py-2.5 bg-[#FFB908] hover:bg-[#E5A607] rounded-lg text-xs font-bold text-[#050720] transition-colors shadow-xs flex items-center justify-center gap-2"
              >
                {actionLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                <span>Save & Send</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {showCredentialsSentAlert && (
        <div className="fixed inset-0 z-50 bg-[#050720]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center space-y-1.5 shadow-2xl">
            <h3 className="text-base font-bold font-['Sora'] text-[#050720]">Credentials Sent</h3>
            <p className="text-xs text-[#050720]/60">Credentials sent to the team member</p>
          </div>
        </div>
      )}

    </div>
  );
};