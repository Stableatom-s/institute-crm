import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Save,
  Check,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { leadService } from "../../services/leadService";

// --- TYPES ---
export type LeadStatus =
  | "Interested"
  | "Not Interested"
  | "Demo Scheduled"
  | "Enrolled"
  | "Contacted";

export interface TimelineEntry {
  id: string;
  timestamp: string;
  status: string;
  title: string;
  description: string;
}

export interface DetailedLead {
  id: string;
  srNo: string;
  firstName: string;
  lastName: string;
  contactNo: string;
  email: string;
  enquiryDate: string;
  course: string;
  status: LeadStatus;
  followUp: string;
  remark: string;
  occupation: string;
  leadSource: string;
  address: string;
  assignedTo?: string;
  offeredFees?: string;
  finalFees?: string;
  referral?: "Yes" | "No";
  enquiringFor?: "Self" | "Other";
  timeline: TimelineEntry[];
}

const COURSES = [
  "All",
  "UI/UX Design",
  "No Code",
  "Portfolio",
  "Full-Stack",
  "React Native",
];

const STATUSES = [
  "All",
  "Interested",
  "Not Interested",
  "Demo Scheduled",
  "Enrolled",
];

export const SalesLeadsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const auth = useAuth() as any;

  // Safe resolver for salesperson profile that survives browser reloads
  const getActiveUser = () => {
    if (auth?.user?.name) return auth.user;
    try {
      const stored = localStorage.getItem("crm_user") || localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  };

  const activeUser = getActiveUser();
  const currentSalesName = (activeUser?.name || "").trim().toLowerCase();
  const userRole = (activeUser?.role || "").trim().toLowerCase();

  const [view, setView] = useState<"list" | "details" | "add">("list");
  const [leads, setLeads] = useState<DetailedLead[]>([]);
  const [selectedLead, setSelectedLead] = useState<DetailedLead | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState("All");
  const [courseFilter, setCourseFilter] = useState("All");
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isCourseDropdownOpen, setIsCourseDropdownOpen] = useState(false);

  // Edit Lead Details states
  const [currentLeadStatus, setCurrentLeadStatus] =
    useState<LeadStatus>("Interested");
  const [remarkTitle, setRemarkTitle] = useState("Demo");
  const [remarkDescription, setRemarkDescription] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);

  // Add Lead Form State
  const [formFirstName, setFormFirstName] = useState("");
  const [formLastName, setFormLastName] = useState("");
  const [formMobile, setFormMobile] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formOccupation, setFormOccupation] = useState("College Student");
  const [formLeadSource, setFormLeadSource] = useState("");
  const [formEnquiryDate, setFormEnquiryDate] = useState("");
  const [formAddress, setFormAddress] = useState("");
  const [formCourses, setFormCourses] = useState<string[]>([]);
  const [formReferral, setFormReferral] = useState<"Yes" | "No">("No");
  const [formOfferedFees, setFormOfferedFees] = useState("");
  const [formFinalFees, setFormFinalFees] = useState("");
  const [formEnquiringFor, setFormEnquiringFor] = useState<"Self" | "Other">(
    "Self"
  );
  const [formStudentName, setFormStudentName] = useState("");
  const [formStudentMobile, setFormStudentMobile] = useState("");
  const [formError, setFormError] = useState(false);

  // Load leads scoped strictly to this salesperson
  const fetchLeads = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await leadService.getAllLeads();

      const userLeads = data.filter((lead: any) => {
        if (userRole === "admin" || userRole === "super admin") return true;

        const assigned = (lead.assignedTo || "").trim().toLowerCase();
        if (!currentSalesName) return true;

        return (
          assigned === currentSalesName ||
          (currentSalesName.length > 0 && assigned.includes(currentSalesName)) ||
          (assigned.length > 0 && currentSalesName.includes(assigned))
        );
      });

      setLeads(userLeads);
      if (userLeads.length > 0) {
        setSelectedLead(userLeads[0]);
        setCurrentLeadStatus(userLeads[0].status);
      } else {
        setSelectedLead(null);
      }
    } catch (error) {
      console.error("Failed to fetch leads from server:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentSalesName, userRole]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Deep linking listener: Opens lead directly if URL has `?leadId=...`
  useEffect(() => {
    const targetId = searchParams.get("leadId");
    if (targetId && leads.length > 0) {
      const match = leads.find((l) => l.id === targetId);
      if (match) {
        setSelectedLead(match);
        setCurrentLeadStatus(match.status);
        setView("details");
      }
    }
  }, [searchParams, leads]);

  // Filtered Leads
  const filteredLeads = leads.filter((l) => {
    const matchStatus =
      statusFilter === "All" ||
      l.status.toLowerCase() === statusFilter.toLowerCase();
    const matchCourse =
      courseFilter === "All" ||
      l.course.toLowerCase() === courseFilter.toLowerCase();
    return matchStatus && matchCourse;
  });

  const handleOpenLead = (lead: DetailedLead) => {
    setSelectedLead(lead);
    setCurrentLeadStatus(lead.status);
    setRemarkTitle("Demo");
    setRemarkDescription("");
    setIsDirty(false);
    setView("details");
  };

  const handleBackFromDetails = () => {
    if (isDirty) {
      setShowUnsavedModal(true);
    } else {
      setSearchParams({});
      setView("list");
    }
  };

  const handleSaveLeadChanges = async () => {
    if (!selectedLead) return;

    let updatedTimeline = [...selectedLead.timeline];
    let newEntry: TimelineEntry | undefined = undefined;

    if (remarkDescription.trim()) {
      const now = new Date();
      const dateStr = `${String(now.getDate()).padStart(2, "0")}-${String(
        now.getMonth() + 1
      ).padStart(2, "0")}-${now.getFullYear()}, ${now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;

      newEntry = {
        id: `t-${Date.now()}`,
        timestamp: dateStr,
        status: currentLeadStatus,
        title: `Lead Remark - ${remarkTitle}`,
        description: remarkDescription.trim(),
      };
      updatedTimeline.unshift(newEntry);
    }

    try {
      const updated = await leadService.updateStatus(
        selectedLead.id,
        currentLeadStatus,
        remarkDescription.trim() || undefined,
        newEntry
      );

      const finalLeadData: DetailedLead = {
        ...updated,
        status: currentLeadStatus,
        timeline: updatedTimeline,
      };

      setLeads((prev) =>
        prev.map((l) => (l.id === selectedLead.id ? finalLeadData : l))
      );
      setSelectedLead(finalLeadData);
      setRemarkDescription("");
      setIsDirty(false);
      alert("Lead details saved successfully!");
    } catch (error) {
      console.error("Error updating lead on database:", error);
      alert("Failed to save lead updates to server.");
    }
  };

  const toggleCourseCheckbox = (c: string) => {
    setFormCourses((prev) =>
      prev.includes(c) ? prev.filter((item) => item !== c) : [...prev, c]
    );
  };

  const handleCreateLead = async () => {
    if (!formFirstName.trim()) {
      setFormError(true);
      return;
    }
    setFormError(false);

    // Guaranteed assignedTo attribute for persistence
    const activeRepName =
      activeUser?.name || auth?.user?.name || "Gaurav Thorat";

    const payload: Partial<DetailedLead> = {
      firstName: formFirstName,
      lastName: formLastName,
      contactNo: formMobile,
      email: formEmail,
      enquiryDate: formEnquiryDate || new Date().toISOString().split("T")[0],
      course: formCourses[0] || "UI/UX Design",
      status: "Interested",
      followUp: "01-01-2026",
      remark: "Newly Added",
      occupation: formOccupation,
      leadSource: formLeadSource || "Walk-in",
      address: formAddress || "Pune",
      assignedTo: activeRepName,
      offeredFees: formOfferedFees || "₹35,000",
      finalFees: formFinalFees || "₹35,000",
      referral: formReferral,
      enquiringFor: formEnquiringFor,
      timeline: [
        {
          id: `t-${Date.now()}`,
          timestamp: `${formEnquiryDate || new Date().toISOString().split("T")[0]}, 10:00 AM`,
          status: "Interested",
          title: "Lead Remark",
          description: `Lead created and assigned to ${activeRepName}`,
        },
      ],
    };

    try {
      const savedLead = await leadService.createLead(payload);
      setLeads((prev) => [savedLead, ...prev]);
      setSelectedLead(savedLead);
      setView("list");
    } catch (error) {
      console.error("Error creating lead on database:", error);
      alert("Failed to create new lead on server.");
    }
  };

  return (
    <div className="font-['Onest'] text-[#050720] pb-16">
      {/* 1. LEADS DIRECTORY LISTING */}
      {view === "list" && (
        <div className="space-y-6">
          <h1 className="text-2xl font-bold font-['Sora']">Leads</h1>

          {/* KPI Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-[#050720]/10 text-center shadow-xs">
              <span className="text-xs font-bold block">Total Leads</span>
              <span className="text-3xl font-extrabold font-['Sora'] mt-1 block">
                {String(leads.length).padStart(2, "0")}
              </span>
              <span className="text-[11px] text-[#050720]/50 font-medium">
                Assigned to you
              </span>
            </div>
            <div className="bg-white p-5 rounded-xl border border-[#050720]/10 text-center shadow-xs">
              <span className="text-xs font-bold block">
                Leads created today
              </span>
              <span className="text-3xl font-extrabold font-['Sora'] mt-1 block">
                {String(
                  leads.filter((l) => l.remark === "Newly Added").length
                ).padStart(2, "0")}
              </span>
              <span className="text-[11px] text-[#050720]/50 font-medium">
                Recent entries
              </span>
            </div>
            <div className="bg-white p-5 rounded-xl border border-[#050720]/10 text-center shadow-xs">
              <span className="text-xs font-bold block">Enrolled</span>
              <span className="text-3xl font-extrabold font-['Sora'] mt-1 block">
                {String(
                  leads.filter((l) => l.status === "Enrolled").length
                ).padStart(2, "0")}
              </span>
              <span className="text-[11px] text-[#050720]/50 font-medium">
                Converted to students
              </span>
            </div>
            <div className="bg-white p-5 rounded-xl border border-[#050720]/10 text-center shadow-xs">
              <span className="text-xs font-bold block">
                Follow-ups Due Today
              </span>
              <span className="text-3xl font-extrabold font-['Sora'] mt-1 block">
                {String(
                  leads.filter((l) => l.status === "Interested").length
                ).padStart(2, "0")}
              </span>
              <span className="text-[11px] text-[#050720]/50 font-medium">
                Action required
              </span>
            </div>
          </div>

          {/* Action Header */}
          <div className="flex justify-between items-center relative z-10 pt-2">
            <div className="flex items-center gap-3">
              <span className="text-xs text-[#050720]/70 font-medium">
                Sort by:
              </span>

              {/* Status Filter */}
              <div className="relative">
                <button
                  onClick={() => {
                    setIsStatusDropdownOpen(!isStatusDropdownOpen);
                    setIsCourseDropdownOpen(false);
                  }}
                  className="flex items-center justify-between gap-3 px-3 py-1.5 bg-white border border-[#050720]/20 rounded-lg text-xs font-medium min-w-[100px] cursor-pointer"
                >
                  <span>
                    {statusFilter === "All" ? "Status" : statusFilter}
                  </span>
                  {isStatusDropdownOpen ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
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
                        className="w-full text-left px-3 py-1.5 text-xs hover:bg-[#FFB908]/15 text-[#050720] cursor-pointer"
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
                  className="flex items-center justify-between gap-3 px-3 py-1.5 bg-white border border-[#050720]/20 rounded-lg text-xs font-medium min-w-[100px] cursor-pointer"
                >
                  <span>
                    {courseFilter === "All" ? "Course" : courseFilter}
                  </span>
                  {isCourseDropdownOpen ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
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
                        className="w-full text-left px-3 py-1.5 text-xs hover:bg-[#FFB908]/15 text-[#050720] cursor-pointer"
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => {
                setFormFirstName("");
                setFormLastName("");
                setFormMobile("");
                setFormEmail("");
                setFormOccupation("College Student");
                setFormLeadSource("");
                setFormEnquiryDate("");
                setFormAddress("");
                setFormCourses([]);
                setFormReferral("No");
                setFormOfferedFees("");
                setFormFinalFees("");
                setFormEnquiringFor("Self");
                setFormStudentName("");
                setFormStudentMobile("");
                setFormError(false);
                setView("add");
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#FFB908] hover:bg-[#E5A607] rounded-lg text-xs font-bold text-[#050720] transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add new lead</span>
            </button>
          </div>

          {/* Leads Table */}
          <div className="bg-white border border-[#050720]/10 rounded-xl p-6 shadow-xs">
            {isLoading ? (
              <div className="py-12 text-center text-xs text-[#050720]/50">
                Loading your leads from database...
              </div>
            ) : filteredLeads.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#050720]/50">
                No leads found for your profile. Click "Add new lead" to create one.
              </div>
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
                  {filteredLeads.map((lead, index) => (
                    <tr
                      key={lead.id}
                      className="hover:bg-[#FFB908]/5 transition-colors"
                    >
                      <td className="py-3.5 text-[#050720]/70">
                        {String(index + 1).padStart(2, "0")}
                      </td>
                      <td className="py-3.5 font-medium">
                        {lead.firstName} {lead.lastName}
                      </td>
                      <td className="py-3.5 text-[#050720]/70">
                        {lead.contactNo}
                      </td>
                      <td className="py-3.5 text-[#050720]/70">
                        {lead.enquiryDate}
                      </td>
                      <td className="py-3.5 text-[#050720]/70">{lead.course}</td>
                      <td className="py-3.5">
                        <span
                          className={`font-semibold ${
                            lead.status === "Interested" ||
                            lead.status === "Enrolled"
                              ? "text-[#10B981]"
                              : "text-[#EF4444]"
                          }`}
                        >
                          {lead.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-[#050720]/70">
                        {lead.followUp}
                      </td>
                      <td className="py-3.5 text-[#050720]/70">{lead.remark}</td>
                      <td className="py-3.5 text-right">
                        <button
                          onClick={() => handleOpenLead(lead)}
                          className="px-3 py-1 border border-[#050720]/30 rounded text-[11px] font-semibold text-[#050720] hover:bg-[#050720]/5 transition-colors cursor-pointer"
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
                <button className="p-1 hover:text-[#050720] cursor-pointer">
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="text-[11px] font-semibold text-[#050720]">
                  01 of 10
                </span>
                <button className="p-1 hover:text-[#050720] cursor-pointer">
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. VIEW LEAD DETAILS PAGE */}
      {view === "details" && selectedLead && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <button
              onClick={handleBackFromDetails}
              className="flex items-center gap-2 text-2xl font-bold font-['Sora'] hover:opacity-80 transition-opacity cursor-pointer"
            >
              <ArrowLeft className="w-6 h-6 text-[#050720]" />
              <span>Lead Details</span>
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={() =>
                  navigate(`/sales/demos?scheduleLeadId=${selectedLead.id}`)
                }
                className="flex items-center gap-2 px-4 py-2 border border-[#050720] rounded-lg text-xs font-bold text-[#050720] hover:bg-[#050720]/5 transition-colors bg-white shadow-xs cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>Schedule Demo</span>
              </button>
              <button
                onClick={handleSaveLeadChanges}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#FFB908] hover:bg-[#E5A607] rounded-lg text-xs font-bold text-[#050720] transition-colors shadow-xs cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-4">
                <h3 className="text-sm font-bold font-['Sora']">
                  Student Overview
                </h3>
                <div className="grid grid-cols-2 gap-y-4 text-xs">
                  <div>
                    <span className="text-[10px] text-[#050720]/50 block">
                      First Name
                    </span>
                    <span className="font-semibold text-sm">
                      {selectedLead.firstName}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#050720]/50 block">
                      Last Name
                    </span>
                    <span className="font-semibold text-sm">
                      {selectedLead.lastName || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#050720]/50 block">
                      Mobile
                    </span>
                    <span className="font-semibold text-sm">
                      {selectedLead.contactNo}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#050720]/50 block">
                      Email
                    </span>
                    <span className="font-semibold text-sm">
                      {selectedLead.email || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#050720]/50 block">
                      Occupation
                    </span>
                    <span className="font-semibold text-sm">
                      {selectedLead.occupation || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#050720]/50 block">
                      Lead Source
                    </span>
                    <span className="font-semibold text-sm">
                      {selectedLead.leadSource || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#050720]/50 block">
                      Enquiry Date
                    </span>
                    <span className="font-semibold text-sm">
                      {selectedLead.enquiryDate}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#050720]/50 block">
                      Address
                    </span>
                    <span className="font-semibold text-sm">
                      {selectedLead.address || "—"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-4">
                <h3 className="text-sm font-bold font-['Sora']">Timeline</h3>
                <div className="space-y-3">
                  {selectedLead.timeline && selectedLead.timeline.length > 0 ? (
                    selectedLead.timeline.map((entry) => (
                      <div
                        key={entry.id}
                        className="border border-[#050720]/10 rounded-xl p-4"
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-bold text-[#050720]">
                            {entry.timestamp}
                          </span>
                          <span
                            className={`text-[11px] font-semibold ${
                              entry.status === "Interested" ||
                              entry.status === "Enrolled"
                                ? "text-[#10B981]"
                                : "text-[#0066FF]"
                            }`}
                          >
                            {entry.status}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#050720]/50 block font-medium">
                          {entry.title}
                        </span>
                        <p className="text-xs text-[#050720]/80 mt-0.5">
                          {entry.description}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-[#050720]/40 italic">
                      No timeline entries logged yet.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-3">
                <h3 className="text-sm font-bold font-['Sora']">
                  Current Status
                </h3>
                <div>
                  <span className="text-[10px] text-[#050720]/50 block mb-1">
                    Status
                  </span>
                  <div className="relative">
                    <select
                      value={currentLeadStatus}
                      onChange={(e) => {
                        setCurrentLeadStatus(e.target.value as LeadStatus);
                        setIsDirty(true);
                      }}
                      className="w-full bg-[#F8FAFC] text-xs font-semibold text-[#10B981] px-3.5 py-2.5 rounded-lg border border-[#050720]/15 appearance-none focus:outline-none cursor-pointer"
                    >
                      <option value="Interested" className="text-[#10B981]">
                        Interested
                      </option>
                      <option value="Not Interested" className="text-[#EF4444]">
                        Not Interested
                      </option>
                      <option value="Demo Scheduled" className="text-[#0066FF]">
                        Demo Scheduled
                      </option>
                      <option value="Enrolled" className="text-[#10B981]">
                        Enrolled
                      </option>
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
                      className="w-full bg-[#F8FAFC] text-xs px-3.5 py-2.5 rounded-lg border border-[#050720]/15 appearance-none focus:outline-none cursor-pointer"
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
                  <span className="text-[10px] text-[#050720]/50 block mb-1">
                    Remark Description
                  </span>
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

      {/* 3. UNSAVED CHANGES MODAL */}
      {showUnsavedModal && (
        <div className="fixed inset-0 z-50 bg-[#050720]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center space-y-5 shadow-2xl">
            <div>
              <h2 className="text-lg font-bold font-['Sora'] text-[#050720]">
                Leave Without Saving?
              </h2>
              <p className="text-xs text-[#050720]/60 mt-2">
                If you leave now, your changes will be lost.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setShowUnsavedModal(false);
                  setIsDirty(false);
                  setSearchParams({});
                  setView("list");
                }}
                className="flex-1 py-2.5 border border-[#050720]/20 rounded-lg text-xs font-bold hover:bg-[#050720]/5 transition-colors cursor-pointer"
              >
                Discard Changes
              </button>
              <button
                onClick={() => {
                  setShowUnsavedModal(false);
                  handleSaveLeadChanges();
                  setSearchParams({});
                  setView("list");
                }}
                className="flex-1 py-2.5 bg-[#FFB908] hover:bg-[#E5A607] rounded-lg text-xs font-bold text-[#050720] transition-colors shadow-xs cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. ADD NEW LEADS VIEW */}
      {view === "add" && (
        <div className="space-y-6 max-w-4xl">
          <button
            onClick={() => setView("list")}
            className="flex items-center gap-2 text-2xl font-bold font-['Sora'] hover:opacity-80 transition-opacity cursor-pointer"
          >
            <ArrowLeft className="w-6 h-6 text-[#050720]" />
            <span>Add Leads</span>
          </button>

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
                    formError
                      ? "border-rose-500 ring-1 ring-rose-500"
                      : "border-[#050720]/15"
                  } focus:outline-none`}
                />
                {formError && (
                  <span className="text-[10px] font-semibold text-rose-500 mt-1 block">
                    This field is required*
                  </span>
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
                  className="w-full bg-[#F8FAFC] text-xs px-3.5 py-2.5 rounded-lg border border-[#050720]/15 appearance-none focus:outline-none cursor-pointer"
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
                  type="date"
                  value={formEnquiryDate}
                  onChange={(e) => setFormEnquiryDate(e.target.value)}
                  className="w-full bg-[#F8FAFC] text-xs px-3.5 py-2 rounded-lg border border-[#050720]/15 focus:outline-none"
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

          <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-3">
            <h3 className="text-sm font-bold font-['Sora']">Course</h3>
            <div className="flex flex-wrap items-center gap-6 text-xs">
              {[
                "UI/UX Design",
                "No code Development",
                "Full-stack Development",
                "Portfolio Building",
                "React Native",
              ].map((c) => (
                <label
                  key={c}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <div
                    onClick={() => toggleCourseCheckbox(c)}
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-colors cursor-pointer ${
                      formCourses.includes(c)
                        ? "bg-[#050720] border-[#050720] text-white"
                        : "border-[#050720]/30"
                    }`}
                  >
                    {formCourses.includes(c) && (
                      <Check className="w-3 h-3 stroke-[3]" />
                    )}
                  </div>
                  <span className="font-medium text-[#050720]">{c}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-3">
            <h3 className="text-sm font-bold font-['Sora']">Referral</h3>
            <div className="flex items-center gap-8 text-xs">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="radio"
                  name="refOption"
                  checked={formReferral === "Yes"}
                  onChange={() => setFormReferral("Yes")}
                  className="w-4 h-4 accent-[#050720]"
                />
                <span className="font-medium">Yes</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="radio"
                  name="refOption"
                  checked={formReferral === "No"}
                  onChange={() => setFormReferral("No")}
                  className="w-4 h-4 accent-[#050720]"
                />
                <span className="font-medium">No</span>
              </label>
            </div>
          </div>

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

          <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold font-['Sora']">Enquiring for</h3>
            <div className="space-y-4">
              <div className="relative">
                <span className="text-[10px] text-[#050720]/50 block mb-1">
                  Enquiring for
                </span>
                <select
                  value={formEnquiringFor}
                  onChange={(e) =>
                    setFormEnquiringFor(e.target.value as "Self" | "Other")
                  }
                  className="w-full bg-[#F8FAFC] text-xs px-3.5 py-2.5 rounded-lg border border-[#050720]/15 appearance-none focus:outline-none cursor-pointer"
                >
                  <option value="Self">Self</option>
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

          <div className="flex gap-4">
            <button
              onClick={() => setView("list")}
              className="flex-1 py-2.5 bg-white border border-[#050720]/20 rounded-lg text-xs font-bold hover:bg-[#050720]/5 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateLead}
              className="flex-1 py-2.5 bg-[#FFB908] hover:bg-[#E5A607] rounded-lg text-xs font-bold text-[#050720] transition-colors shadow-xs cursor-pointer"
            >
              Create Lead
            </button>
          </div>
        </div>
      )}
    </div>
  );
};