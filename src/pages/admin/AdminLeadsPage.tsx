import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  ChevronDown, 
  ChevronUp, 
  ChevronLeft, 
  ChevronRight, 
  Check 
} from 'lucide-react';
import { DetailedLead, LeadStatus, TimelineEntry } from '../sales/SalesLeadsPage';
import { leadService } from '../../services/leadService';

const COURSES = ['Course', 'UI/UX Design', 'No Code', 'Portfolio', 'Full-Stack', 'React Native'];
const STATUSES = ['Status', 'Interested', 'Not Interested', 'Demo Scheduled', 'Enrolled'];
const SALESPERSONS = ['Salesperson 1', 'Salesperson 2', 'Sejal Singh', 'Rahul Deshmukh'];

export const AdminLeadsPage: React.FC = () => {
  // Navigation states: 'list' | 'details' | 'add'
  const [view, setView] = useState<'list' | 'details' | 'add'>('list');
  const [leads, setLeads] = useState<DetailedLead[]>([]);
  const [selectedLead, setSelectedLead] = useState<DetailedLead | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Directory Filters
  const [statusFilter, setStatusFilter] = useState('Status');
  const [courseFilter, setCourseFilter] = useState('Course');
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isCourseDropdownOpen, setIsCourseDropdownOpen] = useState(false);

  // Edit Lead Details states
  const [currentLeadStatus, setCurrentLeadStatus] = useState<LeadStatus>('Interested');
  const [remarkTitle, setRemarkTitle] = useState('Demo');
  const [remarkDescription, setRemarkDescription] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);

  // Add Lead Form State
  const [formFirstName, setFormFirstName] = useState('');
  const [formLastName, setFormLastName] = useState('');
  const [formMobile, setFormMobile] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formOccupation, setFormOccupation] = useState('College Student');
  const [formLeadSource, setFormLeadSource] = useState('');
  const [formEnquiryDate, setFormEnquiryDate] = useState('15-11-2025');
  const [formAddress, setFormAddress] = useState('');
  const [formCourses, setFormCourses] = useState<string[]>([]);
  const [formReferral, setFormReferral] = useState<'Yes' | 'No'>('No');
  const [formOfferedFees, setFormOfferedFees] = useState('');
  const [formFinalFees, setFormFinalFees] = useState('');
  const [formEnquiringFor, setFormEnquiringFor] = useState('Self');
  const [formStudentName, setFormStudentName] = useState('');
  const [formStudentMobile, setFormStudentMobile] = useState('');
  const [formAssignTo, setFormAssignTo] = useState('Salesperson 1');
  const [formError, setFormError] = useState(false);

  // Confirmation Modals
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showAssignedAlert, setShowAssignedAlert] = useState(false);

  // Fetch leads on mount
  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const data = await leadService.getAllLeads();
      setLeads(data);
    } catch (err) {
      console.error('Failed to fetch leads:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filtered Leads
  const filteredLeads = leads.filter((l) => {
    const matchStatus = statusFilter === 'Status' || l.status.toLowerCase() === statusFilter.toLowerCase();
    const matchCourse = courseFilter === 'Course' || l.course.toLowerCase() === courseFilter.toLowerCase();
    return matchStatus && matchCourse;
  });

  // Open lead details
  const handleOpenLead = (lead: DetailedLead) => {
    setSelectedLead(lead);
    setCurrentLeadStatus(lead.status);
    setRemarkTitle('Demo');
    setRemarkDescription('');
    setIsDirty(false);
    setView('details');
  };

  // Back from details check
  const handleBackFromDetails = () => {
    if (isDirty) {
      setShowUnsavedModal(true);
    } else {
      setView('list');
    }
  };

  // Save changes on Lead Details
  const handleSaveLeadChanges = async () => {
    if (!selectedLead) return;

    let updatedTimeline = [...(selectedLead.timeline || [])];
    let newTimelineEntry: TimelineEntry | undefined = undefined;

    if (remarkDescription.trim()) {
      const now = new Date();
      const dateStr = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      newTimelineEntry = {
        id: `t-${Date.now()}`,
        timestamp: dateStr,
        status: currentLeadStatus,
        title: `Lead Remark - ${remarkTitle}`,
        description: remarkDescription,
      };
      updatedTimeline.push(newTimelineEntry);
    }

    try {
      const updated = await leadService.updateStatus(
        selectedLead.id,
        currentLeadStatus,
        remarkDescription || selectedLead.remark,
        newTimelineEntry
      );

      setLeads(leads.map((l) => (l.id === updated.id ? updated : l)));
      setSelectedLead(updated);
      setRemarkDescription('');
      setIsDirty(false);
      alert('Lead details saved successfully!');
    } catch (err) {
      console.error('Failed to update lead:', err);
      alert('Error updating lead details.');
    }
  };

  // Toggle course checkbox in Add Form
  const toggleCourseCheckbox = (c: string) => {
    setFormCourses((prev) =>
      prev.includes(c) ? prev.filter((item) => item !== c) : [...prev, c]
    );
  };

  // Validate and prompt Assign Lead confirmation
  const handlePreAssign = () => {
    if (!formFirstName.trim()) {
      setFormError(true);
      return;
    }
    setFormError(false);
    setShowAssignModal(true);
  };

  // Confirm Assign Lead
  const handleConfirmAssign = async () => {
    const newLeadPayload: Omit<DetailedLead, 'id'> = {
      srNo: String(leads.length + 1).padStart(2, '0'),
      firstName: formFirstName,
      lastName: formLastName || 'Doe',
      contactNo: formMobile || '9876543210',
      email: formEmail || 'lead@example.com',
      enquiryDate: formEnquiryDate,
      course: formCourses[0] || 'UI/UX Design',
      status: 'Interested',
      followUp: '01-01-2026',
      remark: 'Newly Added',
      occupation: formOccupation,
      leadSource: formLeadSource || 'Walk-in',
      address: formAddress || 'Pune',
      assignedTo: formAssignTo,
      offeredFees: formOfferedFees,
      finalFees: formFinalFees,
      referral: formReferral,
      enquiringFor: formEnquiringFor,
      timeline: [
        {
          id: `t-${Date.now()}`,
          timestamp: `${formEnquiryDate}, 10:00 AM`,
          status: 'Interested',
          title: 'Lead Remark',
          description: `Lead created by Admin and assigned to ${formAssignTo}`,
        },
      ],
    };

    try {
      const createdLead = await leadService.createLead(newLeadPayload);
      setLeads([createdLead, ...leads]);
      setShowAssignModal(false);
      setShowAssignedAlert(true);
      setTimeout(() => {
        setShowAssignedAlert(false);
        setView('list');
      }, 1500);
    } catch (err) {
      console.error('Failed to create lead:', err);
      alert('Error creating lead.');
    }
  };

  return (
    <div className="font-['Onest'] text-[#050720] pb-16">

      {/* 1. LEADS DIRECTORY LISTING */}
      {view === 'list' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold font-['Sora']">Leads</h1>
            <button
              onClick={() => {
                setFormFirstName('');
                setFormLastName('');
                setFormMobile('');
                setFormEmail('');
                setFormOccupation('College Student');
                setFormLeadSource('');
                setFormEnquiryDate('15-11-2025');
                setFormAddress('');
                setFormCourses([]);
                setFormReferral('No');
                setFormOfferedFees('');
                setFormFinalFees('');
                setFormEnquiringFor('Self');
                setFormStudentName('');
                setFormStudentMobile('');
                setFormAssignTo('Salesperson 1');
                setFormError(false);
                setView('add');
              }}
              className="px-4 py-2 bg-[#FFB908] hover:bg-[#E5A607] rounded-lg text-xs font-bold text-[#050720] transition-colors shadow-xs"
            >
              Add new lead
            </button>
          </div>

          {/* KPI Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-[#050720]/10 text-center shadow-xs">
              <span className="text-xs font-bold block">Total Leads</span>
              <span className="text-3xl font-extrabold font-['Sora'] mt-1 block">{leads.length}</span>
              <span className="text-[11px] text-[#050720]/50 font-medium">All time</span>
            </div>
            <div className="bg-white p-5 rounded-xl border border-[#050720]/10 text-center shadow-xs">
              <span className="text-xs font-bold block">Leads created today</span>
              <span className="text-3xl font-extrabold font-['Sora'] mt-1 block">20</span>
              <span className="text-[11px] text-[#050720]/50 font-medium">+8 Since Yesterday</span>
            </div>
            <div className="bg-white p-5 rounded-xl border border-[#050720]/10 text-center shadow-xs">
              <span className="text-xs font-bold block">Enrolled</span>
              <span className="text-3xl font-extrabold font-['Sora'] mt-1 block">
                {leads.filter((l) => l.status === 'Enrolled').length}
              </span>
              <span className="text-[11px] text-[#050720]/50 font-medium">Leads converted to students</span>
            </div>
            <div className="bg-white p-5 rounded-xl border border-[#050720]/10 text-center shadow-xs">
              <span className="text-xs font-bold block">Follow-ups Due Today</span>
              <span className="text-3xl font-extrabold font-['Sora'] mt-1 block">05</span>
              <span className="text-[11px] text-[#050720]/50 font-medium">Action required</span>
            </div>
          </div>

          {/* Filter Bar & Table Container */}
          <div className="bg-white border border-[#050720]/10 rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-3 relative z-10">
              <span className="text-xs text-[#050720]/70 font-medium">Sort by:</span>

              {/* Status Filter */}
              <div className="relative">
                <button
                  onClick={() => {
                    setIsStatusDropdownOpen(!isStatusDropdownOpen);
                    setIsCourseDropdownOpen(false);
                  }}
                  className="flex items-center justify-between gap-3 px-3 py-1.5 bg-white border border-[#050720]/20 rounded-lg text-xs font-medium min-w-[100px]"
                >
                  <span>{statusFilter}</span>
                  {isStatusDropdownOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
                {isStatusDropdownOpen && (
                  <div className="absolute left-0 top-9 w-36 bg-white border border-[#050720]/15 rounded-lg shadow-lg py-1 z-20">
                    {STATUSES.map((st) => (
                      <button
                        key={st}
                        onClick={() => {
                          setStatusFilter(st);
                          setIsStatusDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs hover:bg-[#FFB908]/15 text-[#050720]"
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Course Filter */}
              <div className="relative">
                <button
                  onClick={() => {
                    setIsCourseDropdownOpen(!isCourseDropdownOpen);
                    setIsStatusDropdownOpen(false);
                  }}
                  className="flex items-center justify-between gap-3 px-3 py-1.5 bg-white border border-[#050720]/20 rounded-lg text-xs font-medium min-w-[100px]"
                >
                  <span>{courseFilter}</span>
                  {isCourseDropdownOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
                {isCourseDropdownOpen && (
                  <div className="absolute left-0 top-9 w-40 bg-white border border-[#050720]/15 rounded-lg shadow-lg py-1 z-20">
                    {COURSES.map((c) => (
                      <button
                        key={c}
                        onClick={() => {
                          setCourseFilter(c);
                          setIsCourseDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs hover:bg-[#FFB908]/15 text-[#050720]"
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Table */}
            {loading ? (
              <div className="text-center py-8 text-xs text-[#050720]/50 font-medium">Loading leads...</div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#050720]/10 text-[#050720] font-bold">
                    <th className="pb-3.5 font-semibold">Sr. No.</th>
                    <th className="pb-3.5 font-semibold">Name</th>
                    <th className="pb-3.5 font-semibold">Contact No.</th>
                    <th className="pb-3.5 font-semibold">Enquiry Date</th>
                    <th className="pb-3.5 font-semibold">Course</th>
                    <th className="pb-3.5 font-semibold">Status</th>
                    <th className="pb-3.5 font-semibold">Follow-up</th>
                    <th className="pb-3.5 font-semibold">Remark</th>
                    <th className="pb-3.5 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#050720]/5 text-[#050720]">
                  {filteredLeads.map((lead, idx) => (
                    <tr key={lead.id} className="hover:bg-[#FFB908]/5 transition-colors">
                      <td className="py-3.5 text-[#050720]/70">{lead.srNo || String(idx + 1).padStart(2, '0')}</td>
                      <td className="py-3.5 font-medium">{lead.firstName} {lead.lastName}</td>
                      <td className="py-3.5 text-[#050720]/70">{lead.contactNo}</td>
                      <td className="py-3.5 text-[#050720]/70">{lead.enquiryDate}</td>
                      <td className="py-3.5 text-[#050720]/70">{lead.course}</td>
                      <td className="py-3.5">
                        <span className={`font-semibold ${lead.status === 'Interested' || lead.status === 'Enrolled' ? 'text-[#10B981]' : lead.status === 'Not Interested' ? 'text-[#EF4444]' : 'text-[#0066FF]'}`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-[#050720]/70">{lead.followUp}</td>
                      <td className="py-3.5 text-[#050720]/70">{lead.remark}</td>
                      <td className="py-3.5 text-right">
                        <button
                          onClick={() => handleOpenLead(lead)}
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

            {/* Pagination Footer */}
            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-[#050720]/5 text-xs text-[#050720]/70">
              <span className="text-[11px]">Jump to</span>
              <input
                type="text"
                defaultValue="01"
                className="w-8 h-7 text-center border border-[#050720]/20 rounded text-xs text-[#050720] font-semibold"
              />
              <div className="flex items-center gap-1.5 ml-2">
                <button className="p-1 hover:text-[#050720]"><ChevronLeft className="w-3.5 h-3.5" /></button>
                <span className="text-[11px] font-semibold text-[#050720]">01 of 10</span>
                <button className="p-1 hover:text-[#050720]"><ChevronRight className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. VIEW LEAD DETAILS */}
      {view === 'details' && selectedLead && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <button
              onClick={handleBackFromDetails}
              className="flex items-center gap-2 text-2xl font-bold font-['Sora'] hover:opacity-80 transition-opacity"
            >
              <ArrowLeft className="w-6 h-6 text-[#050720]" />
              <span>Lead Details</span>
            </button>
            <button
              onClick={handleSaveLeadChanges}
              className="px-4 py-2 bg-[#FFB908] hover:bg-[#E5A607] rounded-lg text-xs font-bold text-[#050720] transition-colors shadow-xs"
            >
              Save Changes
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Student Overview Card */}
              <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-4">
                <h3 className="text-sm font-bold font-['Sora']">Student Overview</h3>
                <div className="grid grid-cols-2 gap-y-4 text-xs">
                  <div>
                    <span className="text-[10px] text-[#050720]/50 block">First Name</span>
                    <span className="font-semibold text-sm">{selectedLead.firstName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#050720]/50 block">Last Name</span>
                    <span className="font-semibold text-sm">{selectedLead.lastName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#050720]/50 block">Mobile</span>
                    <span className="font-semibold text-sm">{selectedLead.contactNo}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#050720]/50 block">Email</span>
                    <span className="font-semibold text-sm">{selectedLead.email}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#050720]/50 block">Occupation</span>
                    <span className="font-semibold text-sm">{selectedLead.occupation}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#050720]/50 block">Lead Source</span>
                    <span className="font-semibold text-sm">{selectedLead.leadSource}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#050720]/50 block">Enquiry Date</span>
                    <span className="font-semibold text-sm">{selectedLead.enquiryDate}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#050720]/50 block">Address</span>
                    <span className="font-semibold text-sm">{selectedLead.address}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#050720]/50 block">Assigned to</span>
                    <span className="font-semibold text-sm">{selectedLead.assignedTo || 'Unassigned'}</span>
                  </div>
                </div>
              </div>

              {/* Timeline Card */}
              <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-4">
                <h3 className="text-sm font-bold font-['Sora']">Timeline</h3>
                <div className="space-y-3">
                  {(selectedLead.timeline || []).map((entry) => (
                    <div key={entry.id} className="border border-[#050720]/10 rounded-xl p-4">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-[#050720]">{entry.timestamp}</span>
                        <span className={`text-[11px] font-semibold ${entry.status === 'Interested' ? 'text-[#10B981]' : 'text-[#0066FF]'}`}>
                          {entry.status}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#050720]/50 block font-medium">{entry.title}</span>
                      <p className="text-xs text-[#050720]/80 mt-0.5">{entry.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Status & Remark Editors */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-3">
                <h3 className="text-sm font-bold font-['Sora']">Current Status</h3>
                <div>
                  <span className="text-[10px] text-[#050720]/50 block mb-1">Status</span>
                  <div className="relative">
                    <select
                      value={currentLeadStatus}
                      onChange={(e) => {
                        setCurrentLeadStatus(e.target.value as LeadStatus);
                        setIsDirty(true);
                      }}
                      className="w-full bg-[#F8FAFC] text-xs font-semibold text-[#10B981] px-3.5 py-2.5 rounded-lg border border-[#050720]/15 appearance-none focus:outline-none"
                    >
                      <option value="Interested" className="text-[#10B981]">Interested</option>
                      <option value="Not Interested" className="text-[#EF4444]">Not Interested</option>
                      <option value="Demo Scheduled" className="text-[#0066FF]">Demo Scheduled</option>
                      <option value="Enrolled" className="text-[#10B981]">Enrolled</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-[#050720]/40 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-4">
                <h3 className="text-sm font-bold font-['Sora']">Add Remark</h3>
                <div>
                  <div className="relative">
                    <select
                      value={remarkTitle}
                      onChange={(e) => {
                        setRemarkTitle(e.target.value);
                        setIsDirty(true);
                      }}
                      className="w-full bg-[#F8FAFC] text-xs px-3.5 py-2.5 rounded-lg border border-[#050720]/15 appearance-none focus:outline-none"
                    >
                      <option value="Demo">Demo</option>
                      <option value="Follow-up Call">Follow-up Call</option>
                      <option value="Fee Discussion">Fee Discussion</option>
                      <option value="Batch Preference">Batch Preference</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-[#050720]/40 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-[#050720]/50 block mb-1">Remark Description</span>
                  <textarea
                    rows={6}
                    placeholder="Enter remark here.."
                    value={remarkDescription}
                    onChange={(e) => {
                      setRemarkDescription(e.target.value);
                      setIsDirty(true);
                    }}
                    className="w-full bg-[#F8FAFC] text-xs p-3 rounded-lg border border-[#050720]/15 focus:outline-none focus:border-[#050720] resize-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. LEAVE WITHOUT SAVING MODAL */}
      {showUnsavedModal && (
        <div className="fixed inset-0 z-50 bg-[#050720]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center space-y-5 shadow-2xl">
            <div>
              <h2 className="text-lg font-bold font-['Sora'] text-[#050720]">Leave Without Saving?</h2>
              <p className="text-xs text-[#050720]/60 mt-2">If you leave now, your changes will be lost.</p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setShowUnsavedModal(false);
                  setIsDirty(false);
                  setView('list');
                }}
                className="flex-1 py-2.5 border border-[#050720]/20 rounded-lg text-xs font-bold hover:bg-[#050720]/5 transition-colors"
              >
                Discard Changes
              </button>
              <button
                onClick={() => {
                  setShowUnsavedModal(false);
                  handleSaveLeadChanges();
                  setView('list');
                }}
                className="flex-1 py-2.5 bg-[#FFB908] hover:bg-[#E5A607] rounded-lg text-xs font-bold text-[#050720] transition-colors shadow-xs"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. ADD NEW LEADS VIEW */}
      {view === 'add' && (
        <div className="space-y-6 max-w-4xl">
          <button
            onClick={() => setView('list')}
            className="flex items-center gap-2 text-2xl font-bold font-['Sora'] hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="w-6 h-6 text-[#050720]" />
            <span>Add Leads</span>
          </button>

          {/* Section 1: Student Details */}
          <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold font-['Sora']">Student Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <input
                  type="text"
                  placeholder="First Name*"
                  value={formFirstName}
                  onChange={(e) => {
                    setFormFirstName(e.target.value);
                    if (e.target.value) setFormError(false);
                  }}
                  className={`w-full bg-[#F8FAFC] text-xs px-3.5 py-2.5 rounded-lg border ${
                    formError ? 'border-rose-500 ring-1 ring-rose-500' : 'border-[#050720]/15'
                  } focus:outline-none`}
                />
                {formError && (
                  <span className="text-[10px] font-semibold text-rose-500 mt-1 block">This field is required*</span>
                )}
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Last Name*"
                  value={formLastName}
                  onChange={(e) => setFormLastName(e.target.value)}
                  className="w-full bg-[#F8FAFC] text-xs px-3.5 py-2.5 rounded-lg border border-[#050720]/15 focus:outline-none"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Mobile*"
                  value={formMobile}
                  onChange={(e) => setFormMobile(e.target.value)}
                  className="w-full bg-[#F8FAFC] text-xs px-3.5 py-2.5 rounded-lg border border-[#050720]/15 focus:outline-none"
                />
              </div>
              <div>
                <input
                  type="email"
                  placeholder="Email*"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full bg-[#F8FAFC] text-xs px-3.5 py-2.5 rounded-lg border border-[#050720]/15 focus:outline-none"
                />
              </div>
              <div className="relative">
                <select
                  value={formOccupation}
                  onChange={(e) => setFormOccupation(e.target.value)}
                  className="w-full bg-[#F8FAFC] text-xs px-3.5 py-2.5 rounded-lg border border-[#050720]/15 appearance-none focus:outline-none"
                >
                  <option value="College Student">College Student</option>
                  <option value="Working">Working</option>
                  <option value="Self Employed">Self Employed</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#050720]/40 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Lead Source*"
                  value={formLeadSource}
                  onChange={(e) => setFormLeadSource(e.target.value)}
                  className="w-full bg-[#F8FAFC] text-xs px-3.5 py-2.5 rounded-lg border border-[#050720]/15 focus:outline-none"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Enquiry Date"
                  value={formEnquiryDate}
                  onChange={(e) => setFormEnquiryDate(e.target.value)}
                  className="w-full bg-[#F8FAFC] text-xs px-3.5 py-2.5 rounded-lg border border-[#050720]/15 focus:outline-none"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Address*"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  className="w-full bg-[#F8FAFC] text-xs px-3.5 py-2.5 rounded-lg border border-[#050720]/15 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Course Selection */}
          <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-3">
            <h3 className="text-sm font-bold font-['Sora']">Course</h3>
            <div className="flex flex-wrap items-center gap-6 text-xs">
              {['UI/UX Design', 'No code Development', 'Full-stack Development', 'Portfolio Building', 'React Native'].map((c) => (
                <label key={c} className="flex items-center gap-2 cursor-pointer">
                  <div
                    onClick={() => toggleCourseCheckbox(c)}
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                      formCourses.includes(c) ? 'bg-[#050720] border-[#050720] text-white' : 'border-[#050720]/30'
                    }`}
                  >
                    {formCourses.includes(c) && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span className="font-medium text-[#050720]">{c}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Section 3: Referral */}
          <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-3">
            <h3 className="text-sm font-bold font-['Sora']">Referral</h3>
            <div className="flex items-center gap-8 text-xs">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="radio"
                  name="refOption"
                  checked={formReferral === 'Yes'}
                  onChange={() => setFormReferral('Yes')}
                  className="w-4 h-4 accent-[#050720]"
                />
                <span className="font-medium">Yes</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="radio"
                  name="refOption"
                  checked={formReferral === 'No'}
                  onChange={() => setFormReferral('No')}
                  className="w-4 h-4 accent-[#050720]"
                />
                <span className="font-medium">No</span>
              </label>
            </div>
          </div>

          {/* Section 4: Fees */}
          <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold font-['Sora']">Fees</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <input
                  type="text"
                  placeholder="Offered Fees*"
                  value={formOfferedFees}
                  onChange={(e) => setFormOfferedFees(e.target.value)}
                  className="w-full bg-[#F8FAFC] text-xs px-3.5 py-2.5 rounded-lg border border-[#050720]/15 focus:outline-none"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Final Fees*"
                  value={formFinalFees}
                  onChange={(e) => setFormFinalFees(e.target.value)}
                  className="w-full bg-[#F8FAFC] text-xs px-3.5 py-2.5 rounded-lg border border-[#050720]/15 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Enquiring For */}
          <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold font-['Sora']">Enquiring for</h3>
            <div className="space-y-4">
              <div className="relative">
                <span className="text-[10px] text-[#050720]/50 block mb-1">Enquiring for</span>
                <select
                  value={formEnquiringFor}
                  onChange={(e) => setFormEnquiringFor(e.target.value)}
                  className="w-full bg-[#F8FAFC] text-xs px-3.5 py-2.5 rounded-lg border border-[#050720]/15 appearance-none focus:outline-none"
                >
                  <option value="Self">Self</option>
                  <option value="Family">Family</option>
                  <option value="Other">Other</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#050720]/40 absolute right-3.5 bottom-3 pointer-events-none" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    placeholder="Student *"
                    value={formStudentName}
                    onChange={(e) => setFormStudentName(e.target.value)}
                    className="w-full bg-[#F8FAFC] text-xs px-3.5 py-2.5 rounded-lg border border-[#050720]/15 focus:outline-none"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Mobile*"
                    value={formStudentMobile}
                    onChange={(e) => setFormStudentMobile(e.target.value)}
                    className="w-full bg-[#F8FAFC] text-xs px-3.5 py-2.5 rounded-lg border border-[#050720]/15 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 6: Assign To */}
          <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-3">
            <h3 className="text-sm font-bold font-['Sora']">Assign to</h3>
            <div className="relative">
              <span className="text-[10px] text-[#050720]/50 block mb-1">Assign to</span>
              <select
                value={formAssignTo}
                onChange={(e) => setFormAssignTo(e.target.value)}
                className="w-full bg-[#F8FAFC] text-xs px-3.5 py-2.5 rounded-lg border border-[#050720]/15 appearance-none focus:outline-none"
              >
                {SALESPERSONS.map((sp) => (
                  <option key={sp} value={sp}>{sp}</option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#050720]/40 absolute right-3.5 bottom-3 pointer-events-none" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={() => setView('list')}
              className="flex-1 py-2.5 bg-white border border-[#050720]/20 rounded-lg text-xs font-bold hover:bg-[#050720]/5 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handlePreAssign}
              className="flex-1 py-2.5 bg-[#FFB908] hover:bg-[#E5A607] rounded-lg text-xs font-bold text-[#050720] transition-colors shadow-xs"
            >
              Assign Lead
            </button>
          </div>
        </div>
      )}

      {/* 5. ASSIGN LEAD CONFIRMATION MODAL */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 bg-[#050720]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-7 max-w-sm w-full text-center space-y-4 shadow-2xl">
            <div>
              <h2 className="text-base font-bold font-['Sora'] text-[#050720]">Assign Lead?</h2>
              <p className="text-xs text-[#050720]/60 mt-1.5">Lead will be assigned to the salesperson.</p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowAssignModal(false)}
                className="flex-1 py-2 border border-[#050720]/20 rounded-lg text-xs font-bold hover:bg-[#050720]/5 transition-colors"
              >
                Discard Changes
              </button>
              <button
                onClick={handleConfirmAssign}
                className="flex-1 py-2 bg-[#FFB908] hover:bg-[#E5A607] rounded-lg text-xs font-bold text-[#050720] transition-colors shadow-xs"
              >
                Assign Lead
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. LEAD ASSIGNED NOTIFICATION */}
      {showAssignedAlert && (
        <div className="fixed inset-0 z-50 bg-[#050720]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-7 max-w-sm w-full text-center space-y-1.5 shadow-2xl">
            <h3 className="text-base font-bold font-['Sora'] text-[#050720]">Lead assigned!</h3>
            <p className="text-xs text-[#050720]/60">Lead has been assigned to the salesperson.</p>
          </div>
        </div>
      )}

    </div>
  );
};