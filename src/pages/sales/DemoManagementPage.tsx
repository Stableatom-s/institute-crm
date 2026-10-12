import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Clock,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { demoService, DemoItem, DemoTab } from "../../services/demoService";
import { leadService } from "../../services/leadService";
import { API_BASE_URL } from "../../lib/api";

const COURSES = [
  "All",
  "UI/UX Design",
  "No Code",
  "Portfolio",
  "Full-Stack",
  "React Native",
];
const TIME_SLOTS = [
  "11:00 - 12:00",
  "01:00 - 02:00",
  "03:00 - 04:00",
  "05:00 - 06:00",
];

export const DemoManagementPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const auth = useAuth() as any;

  // Safe resolver for salesperson profile that survives browser reloads
  const getActiveUser = () => {
    if (auth?.user?.name) return auth.user;
    try {
      const stored =
        localStorage.getItem("crm_user") || localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  };

  const activeUser = getActiveUser();
  const currentSalesName = (activeUser?.name || "").trim().toLowerCase();
  const userRole = (activeUser?.role || "").trim().toLowerCase();

  // Navigation views: 'table' | 'schedule-form' | 'reschedule-form' | 'details'
  const [view, setView] = useState<
    "table" | "schedule-form" | "reschedule-form" | "details"
  >("table");
  const [activeTab, setActiveTab] = useState<DemoTab>("Scheduled");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Master lists
  const [allDemos, setAllDemos] = useState<DemoItem[]>([]);
  const [dynamicFaculties, setDynamicFaculties] = useState<string[]>([]);
  const [cachedLeads, setCachedLeads] = useState<any[]>([]);

  // Active item in detail / reschedule view
  const [selectedDemo, setSelectedDemo] = useState<DemoItem | null>(null);

  // Dropdown Sort Filters
  const [filterMode, setFilterMode] = useState<string>("All");
  const [filterCourse, setFilterCourse] = useState<string>("All");
  const [isModeDropdownOpen, setIsModeDropdownOpen] = useState(false);
  const [isCourseDropdownOpen, setIsCourseDropdownOpen] = useState(false);

  // Form State (Schedule & Reschedule)
  const [leadSearchQuery, setLeadSearchQuery] = useState("");
  const [matchingLeads, setMatchingLeads] = useState<any[]>([]);
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const [selectedLeadData, setSelectedLeadData] = useState<{
    id?: string;
    firstName: string;
    lastName: string;
    mobile: string;
    address: string;
  } | null>(null);

  const [formCourse, setFormCourse] = useState("");
  const [formFaculty, setFormFaculty] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formTimeSlot, setFormTimeSlot] = useState("");
  const [formMode, setFormMode] = useState<"Online" | "Offline" | "">("");

  // Validation Error States
  const [leadError, setLeadError] = useState(false);
  const [courseError, setCourseError] = useState(false);
  const [facultyError, setFacultyError] = useState(false);
  const [dateError, setDateError] = useState(false);
  const [slotError, setSlotError] = useState(false);
  const [modeError, setModeError] = useState(false);

  // Modals
  const [showScheduleSuccessModal, setShowScheduleSuccessModal] =
    useState(false);
  const [showRescheduleSuccessModal, setShowRescheduleSuccessModal] =
    useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellationReasonInput, setCancellationReasonInput] = useState("");

  // Fetch dynamic faculties from Team collection
  const loadFaculties = async () => {
    try {
      const token = localStorage.getItem("crm_token");
      const res = await fetch(`${API_BASE_URL}/team`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (res.ok) {
        const teamData = await res.json();
        const faculties = teamData
          .filter((m: any) => {
            const role = (m.role || m.department || "").toLowerCase();
            return role === "faculty" || role === "instructor";
          })
          .map(
            (m: any) =>
              m.name || `${m.firstName || ""} ${m.lastName || ""}`.trim(),
          )
          .filter((name: string) => Boolean(name));

        if (faculties.length > 0) {
          setDynamicFaculties(Array.from(new Set(faculties)));
        } else {
          setDynamicFaculties(["Poorva Pande", "Tanmay Kalbhor"]);
        }
      }
    } catch (err) {
      console.error("Failed to load faculties:", err);
      setDynamicFaculties(["Poorva Pande", "Tanmay Kalbhor"]);
    }
  };

  const handleOpenScheduleForm = () => {
    setLeadSearchQuery("");
    setMatchingLeads(cachedLeads.slice(0, 8));
    setIsSearchDropdownOpen(false);
    setSelectedLeadData(null);
    setFormCourse("");
    setFormFaculty("");
    setFormDate("");
    setFormTimeSlot("");
    setFormMode("");
    setLeadError(false);
    setCourseError(false);
    setFacultyError(false);
    setDateError(false);
    setSlotError(false);
    setModeError(false);
    setView("schedule-form");
  };

  // Load demos scoped strictly to this salesperson's assigned leads
  const loadDemos = useCallback(async () => {
    try {
      setIsLoading(true);
      const [demosData, userLeads] = await Promise.all([
        demoService.getAllDemos(),
        leadService.getAllLeads(),
      ]);

      const myLeads = userLeads.filter((l: any) => {
        if (userRole === "admin" || userRole === "super admin") return true;
        const assigned = (l.assignedTo || "").trim().toLowerCase();
        if (!currentSalesName) return false;
        return (
          assigned === currentSalesName ||
          (currentSalesName.length > 0 &&
            assigned.includes(currentSalesName)) ||
          (assigned.length > 0 && currentSalesName.includes(assigned))
        );
      });

      setCachedLeads(myLeads);

      const assignedLeadNames = new Set(
        myLeads.map((l: any) =>
          `${l.firstName || ""} ${l.lastName || ""}`.trim().toLowerCase(),
        ),
      );

      const scopedDemos = demosData.filter((d: any) => {
        if (userRole === "admin" || userRole === "super admin") return true;
        const studentFullName = `${d.name || ""} ${d.lastName || ""}`
          .trim()
          .toLowerCase();
        return assignedLeadNames.has(studentFullName);
      });

      setAllDemos(scopedDemos);
      if (scopedDemos.length > 0 && !selectedDemo) {
        setSelectedDemo(scopedDemos[0]);
      } else if (scopedDemos.length === 0) {
        setSelectedDemo(null);
      }
    } catch (err) {
      console.error("Failed to load demos from server:", err);
    } finally {
      setIsLoading(false);
    }
  }, [currentSalesName, userRole, selectedDemo]);

  useEffect(() => {
    loadDemos();
    loadFaculties();
  }, [loadDemos]);

  // Deep linking: if opened with ?scheduleLeadId=xyz
  useEffect(() => {
    const leadIdParam = searchParams.get("scheduleLeadId");
    if (leadIdParam) {
      leadService.getAllLeads().then((leads) => {
        const matched = leads.find((l) => l.id === leadIdParam);
        if (matched) {
          setSelectedLeadData({
            id: matched.id,
            firstName: matched.firstName,
            lastName: matched.lastName || "",
            mobile: matched.contactNo,
            address: matched.address || "Pune",
          });
          setLeadSearchQuery(
            `${matched.firstName} ${matched.lastName || ""} (${matched.contactNo})`,
          );
          setFormCourse(matched.course || "");
          setView("schedule-form");
        }
      });
    }
  }, [searchParams]);

  const scheduledList = allDemos.filter((d) => d.status === "Scheduled");
  const completedList = allDemos.filter((d) => d.status === "Completed");
  const cancelledList = allDemos.filter((d) => d.status === "Cancelled");

  const currentList =
    activeTab === "Scheduled"
      ? scheduledList
      : activeTab === "Completed"
        ? completedList
        : cancelledList;

  const filteredList = currentList.filter((item) => {
    const matchMode =
      filterMode === "All" ||
      item.mode.toLowerCase() === filterMode.toLowerCase();
    const matchCourse =
      filterCourse === "All" ||
      item.course.toLowerCase() === filterCourse.toLowerCase();
    return matchMode && matchCourse;
  });

  const handleLeadSearchChange = (val: string) => {
    setLeadSearchQuery(val);
    setSelectedLeadData(null);

    const query = val.toLowerCase().trim();
    if (!query) {
      setMatchingLeads(cachedLeads.slice(0, 8));
      setIsSearchDropdownOpen(cachedLeads.length > 0);
      return;
    }

    const matches = cachedLeads.filter((l) => {
      const fullName = `${l.firstName || ""} ${l.lastName || ""}`.toLowerCase();
      const phone = (l.contactNo || "").toLowerCase();
      return fullName.includes(query) || phone.includes(query);
    });

    setMatchingLeads(matches);
    setIsSearchDropdownOpen(true);
  };

  const handleSelectLead = (lead: any) => {
    setSelectedLeadData({
      id: lead.id,
      firstName: lead.firstName,
      lastName: lead.lastName || "",
      mobile: lead.contactNo,
      address: lead.address || "Pune",
    });
    setLeadSearchQuery(
      `${lead.firstName} ${lead.lastName || ""} (${lead.contactNo})`,
    );
    if (lead.course) {
      setFormCourse(lead.course);
      setCourseError(false);
    }
    setLeadError(false);
    setIsSearchDropdownOpen(false);
  };

  const handleStartReschedule = (demo: DemoItem) => {
    setSelectedDemo(demo);
    setLeadSearchQuery(
      `${demo.name} ${demo.lastName || ""} (${demo.contactNo})`,
    );
    setSelectedLeadData({
      firstName: demo.name,
      lastName: demo.lastName || "",
      mobile: demo.contactNo,
      address: demo.address || "Pune",
    });
    setFormCourse(demo.course);
    setFormFaculty(demo.faculty);
    setFormDate(demo.demoDate);
    setFormTimeSlot(demo.timeSlot);
    setFormMode(demo.mode);
    setCourseError(false);
    setView("reschedule-form");
  };

  const handleSubmitSchedule = async () => {
    let hasError = false;

    if (!selectedLeadData) {
      setLeadError(true);
      hasError = true;
    } else {
      setLeadError(false);
    }

    if (!formCourse) {
      setCourseError(true);
      hasError = true;
    } else {
      setCourseError(false);
    }

    if (!formFaculty) {
      setFacultyError(true);
      hasError = true;
    } else {
      setFacultyError(false);
    }

    if (!formDate) {
      setDateError(true);
      hasError = true;
    } else {
      setDateError(false);
    }

    if (!formTimeSlot) {
      setSlotError(true);
      hasError = true;
    } else {
      setSlotError(false);
    }

    if (!formMode) {
      setModeError(true);
      hasError = true;
    } else {
      setModeError(false);
    }

    if (hasError || !selectedLeadData) return;

    const payload: Partial<DemoItem> = {
      name: selectedLeadData.firstName,
      lastName: selectedLeadData.lastName,
      contactNo: selectedLeadData.mobile,
      address: selectedLeadData.address,
      timeSlot: formTimeSlot,
      demoDate: formDate,
      course: formCourse,
      mode: formMode as "Online" | "Offline",
      faculty: formFaculty,
      status: "Scheduled",
    };

    try {
      const saved = await demoService.scheduleDemo(payload);

      if (selectedLeadData.id) {
        await leadService.updateStatus(
          selectedLeadData.id,
          "Demo Scheduled",
          `Demo booked with ${formFaculty} on ${formDate} (${formTimeSlot})`,
          {
            timestamp: `${formDate}, ${formTimeSlot}`,
            status: "Demo Scheduled",
            title: `Demo Scheduled (${formMode})`,
            description: `Assigned faculty: ${formFaculty}. Course: ${formCourse}.`,
          },
        );
      }

      setAllDemos([saved, ...allDemos]);
      setSelectedDemo(saved);
      setShowScheduleSuccessModal(true);
    } catch (err) {
      console.error("Failed to schedule demo:", err);
      alert("Error saving demo to server.");
    }
  };

  const handleSubmitReschedule = async () => {
    if (!selectedDemo) return;

    if (
      !formCourse ||
      !formFaculty ||
      !formDate ||
      !formTimeSlot ||
      !formMode
    ) {
      alert("Please fill out all fields before rescheduling.");
      return;
    }

    try {
      const updated = await demoService.updateDemoStatus(
        selectedDemo.id,
        "Scheduled",
        {
          course: formCourse,
          faculty: formFaculty,
          demoDate: formDate,
          timeSlot: formTimeSlot,
          mode: formMode as "Online" | "Offline",
        },
      );

      const patchedDemo: DemoItem = {
        ...updated,
        course: formCourse,
        faculty: formFaculty,
        demoDate: formDate,
        timeSlot: formTimeSlot,
        mode: formMode as "Online" | "Offline",
        status: "Scheduled",
      };

      setAllDemos(
        allDemos.map((d) => (d.id === selectedDemo.id ? patchedDemo : d)),
      );
      setSelectedDemo(patchedDemo);
      setShowRescheduleSuccessModal(true);
    } catch (err) {
      console.error("Error rescheduling demo:", err);
      alert("Failed to reschedule demo on database.");
    }
  };

  const handleConfirmCancel = async () => {
    if (!selectedDemo) return;

    try {
      await demoService.updateDemoStatus(selectedDemo.id, "Cancelled");
      const cancelledDemo: DemoItem = {
        ...selectedDemo,
        status: "Cancelled",
        cancellationReason:
          cancellationReasonInput || "No Response from Student",
      };

      setAllDemos(
        allDemos.map((d) => (d.id === selectedDemo.id ? cancelledDemo : d)),
      );
      setSelectedDemo(cancelledDemo);
      setShowCancelModal(false);
      setCancellationReasonInput("");
    } catch (err) {
      console.error("Error cancelling demo:", err);
      alert("Failed to cancel demo on server.");
    }
  };

  return (
    <div className="font-['Onest'] text-[#050720] pb-16">
      {/* 1. TABLE VIEW */}
      {view === "table" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold font-['Sora']">
              Demo Management
            </h1>
            <button
              onClick={handleOpenScheduleForm}
              className="flex items-center gap-2 px-4 py-2 bg-[#FFB908] hover:bg-[#E5A607] rounded-lg text-xs font-bold text-[#050720] transition-colors shadow-xs cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>Schedule Demo</span>
            </button>
          </div>

          <div className="bg-white border border-[#050720]/10 rounded-xl p-6 shadow-xs">
            {/* Tabs */}
            <div className="flex items-center gap-8 border-b border-[#050720]/10 pb-3">
              {(["Scheduled", "Completed", "Cancelled"] as DemoTab[]).map(
                (tab) => (
                  <button
                    key={tab}
                    onClick={() => {
                      setActiveTab(tab);
                      setFilterMode("All");
                      setFilterCourse("All");
                    }}
                    className={`text-sm font-semibold transition-all relative pb-2 cursor-pointer ${
                      activeTab === tab
                        ? "text-[#050720] font-bold"
                        : "text-[#050720]/50 hover:text-[#050720]"
                    }`}
                  >
                    <span>{tab}</span>
                    {activeTab === tab && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FFB908] rounded-full" />
                    )}
                  </button>
                ),
              )}
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 mt-5 mb-4 relative z-10">
              <span className="text-xs text-[#050720]/70 font-medium">
                Sort by:
              </span>

              <div className="relative">
                <button
                  onClick={() => {
                    setIsModeDropdownOpen(!isModeDropdownOpen);
                    setIsCourseDropdownOpen(false);
                  }}
                  className="flex items-center justify-between gap-3 px-3 py-1.5 bg-[#F8FAFC] border border-[#050720]/15 rounded-lg text-xs font-medium min-w-[90px] cursor-pointer"
                >
                  <span>{filterMode === "All" ? "Mode" : filterMode}</span>
                  {isModeDropdownOpen ? (
                    <ChevronUp className="w-3.5 h-3.5 text-[#050720]/50" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-[#050720]/50" />
                  )}
                </button>
                {isModeDropdownOpen && (
                  <div className="absolute left-0 top-9 w-32 bg-white border border-[#050720]/15 rounded-lg shadow-lg py-1 z-20">
                    {["All", "Online", "Offline"].map((m) => (
                      <button
                        key={m}
                        onClick={() => {
                          setFilterMode(m);
                          setIsModeDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs hover:bg-[#FFB908]/15 text-[#050720] cursor-pointer"
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  onClick={() => {
                    setIsCourseDropdownOpen(!isCourseDropdownOpen);
                    setIsModeDropdownOpen(false);
                  }}
                  className="flex items-center justify-between gap-3 px-3 py-1.5 bg-[#F8FAFC] border border-[#050720]/15 rounded-lg text-xs font-medium min-w-[100px] cursor-pointer"
                >
                  <span>
                    {filterCourse === "All" ? "Course" : filterCourse}
                  </span>
                  {isCourseDropdownOpen ? (
                    <ChevronUp className="w-3.5 h-3.5 text-[#050720]/50" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-[#050720]/50" />
                  )}
                </button>
                {isCourseDropdownOpen && (
                  <div className="absolute left-0 top-9 w-40 bg-white border border-[#050720]/15 rounded-lg shadow-lg py-1 z-20">
                    {COURSES.map((c) => (
                      <button
                        key={c}
                        onClick={() => {
                          setFilterCourse(c);
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

            {/* Table */}
            {isLoading ? (
              <div className="py-12 text-center text-xs text-[#050720]/50">
                Loading demo sessions from database...
              </div>
            ) : filteredList.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#050720]/50">
                No {activeTab.toLowerCase()} demos found for your leads.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#050720]/10 text-[#050720] font-bold">
                    <th className="pb-3.5 font-semibold">Sr. No.</th>
                    <th className="pb-3.5 font-semibold">Name</th>
                    <th className="pb-3.5 font-semibold">Time Slot</th>
                    <th className="pb-3.5 font-semibold">Demo Date</th>
                    <th className="pb-3.5 font-semibold">Course</th>
                    <th className="pb-3.5 font-semibold">Mode</th>
                    <th className="pb-3.5 font-semibold">Faculty</th>
                    {activeTab === "Completed" && (
                      <>
                        <th className="pb-3.5 font-semibold">Demo Status</th>
                        <th className="pb-3.5 font-semibold">Remark</th>
                      </>
                    )}
                    <th className="pb-3.5 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#050720]/5 text-[#050720]">
                  {filteredList.map((demo, index) => (
                    <tr
                      key={demo.id}
                      className="hover:bg-[#FFB908]/5 transition-colors"
                    >
                      <td className="py-3.5 text-[#050720]/70">
                        {String(index + 1).padStart(2, "0")}
                      </td>
                      <td className="py-3.5 font-medium">
                        {demo.name} {demo.lastName}
                      </td>
                      <td className="py-3.5 text-[#050720]/70">
                        {demo.timeSlot}
                      </td>
                      <td className="py-3.5 text-[#050720]/70">
                        {demo.demoDate}
                      </td>
                      <td className="py-3.5 text-[#050720]/70">
                        {demo.course}
                      </td>
                      <td className="py-3.5 text-[#050720]/70">{demo.mode}</td>
                      <td className="py-3.5 text-[#050720]/70">
                        {demo.faculty}
                      </td>
                      {activeTab === "Completed" && (
                        <>
                          <td className="py-3.5 font-semibold text-[#050720]">
                            {demo.demoStatusText || "Attended"}
                          </td>
                          <td className="py-3.5 text-[#050720]/70">
                            {demo.remark || "Joining soon"}
                          </td>
                        </>
                      )}
                      <td className="py-3.5 text-right">
                        <button
                          onClick={() => {
                            setSelectedDemo(demo);
                            setView("details");
                          }}
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

            {/* Pagination */}
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

      {/* 2. SCHEDULE DEMO VIEW */}
      {view === "schedule-form" && (
        <div className="space-y-6 max-w-4xl">
          <button
            onClick={() => setView("table")}
            className="flex items-center gap-2 text-2xl font-bold font-['Sora'] hover:opacity-80 transition-opacity cursor-pointer"
          >
            <ArrowLeft className="w-6 h-6 text-[#050720]" />
            <span>Schedule Demo</span>
          </button>

          {/* Select Lead */}
          <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold font-['Sora']">Select Lead</h3>

            <div className="relative">
              <input
                type="text"
                value={leadSearchQuery}
                onFocus={() => {
                  if (cachedLeads.length > 0) {
                    setMatchingLeads(cachedLeads.slice(0, 8));
                    setIsSearchDropdownOpen(true);
                  }
                }}
                placeholder="Search leads by name or contact..."
                onChange={(e) => handleLeadSearchChange(e.target.value)}
                className={`w-full bg-[#F8FAFC] text-xs px-3.5 py-2.5 pr-10 rounded-lg border ${
                  leadError
                    ? "border-rose-500 ring-1 ring-rose-500"
                    : "border-[#050720]/15"
                } focus:outline-none focus:border-[#050720]`}
              />
              <Search className="w-4 h-4 text-[#050720]/40 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />

              {isSearchDropdownOpen && matchingLeads.length > 0 && (
                <div className="absolute left-0 right-0 top-11 bg-white border border-[#050720]/15 rounded-lg shadow-xl py-1 z-30 max-h-52 overflow-y-auto">
                  {matchingLeads.map((lead) => (
                    <button
                      key={lead.id}
                      type="button"
                      onClick={() => handleSelectLead(lead)}
                      className="w-full text-left px-4 py-2 text-xs hover:bg-[#FFB908]/15 text-[#050720] flex justify-between items-center border-b border-[#050720]/5 last:border-b-0 cursor-pointer"
                    >
                      <div>
                        <span className="font-bold">
                          {lead.firstName} {lead.lastName || ""}
                        </span>
                        <span className="text-[11px] text-[#050720]/60 block">
                          {lead.course} • {lead.contactNo}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#050720]/40">
                        {lead.address || "Pune"}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {leadError && (
              <span className="text-[10px] font-semibold text-rose-500 block">
                Please search and select a lead before scheduling*
              </span>
            )}

            {selectedLeadData && (
              <div className="pt-3 border-t border-[#050720]/10 space-y-3">
                <h4 className="text-xs font-bold font-['Sora']">
                  Student Overview
                </h4>
                <div className="grid grid-cols-2 gap-y-3 text-xs">
                  <div>
                    <span className="text-[10px] text-[#050720]/50 block">
                      First Name
                    </span>
                    <span className="font-semibold text-sm">
                      {selectedLeadData.firstName}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#050720]/50 block">
                      Last Name
                    </span>
                    <span className="font-semibold text-sm">
                      {selectedLeadData.lastName || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#050720]/50 block">
                      Mobile
                    </span>
                    <span className="font-semibold text-sm">
                      {selectedLeadData.mobile}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#050720]/50 block">
                      Address
                    </span>
                    <span className="font-semibold text-sm">
                      {selectedLeadData.address || "—"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Demo Details */}
          <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold font-['Sora']">Demo Details</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="relative">
                  <select
                    value={formCourse}
                    onChange={(e) => {
                      setFormCourse(e.target.value);
                      if (e.target.value) setCourseError(false);
                    }}
                    className={`w-full bg-[#F8FAFC] text-xs px-3.5 py-2.5 rounded-lg border appearance-none ${
                      courseError
                        ? "border-rose-500 ring-1 ring-rose-500"
                        : "border-[#050720]/15"
                    } focus:outline-none cursor-pointer`}
                  >
                    <option value="">Select Course*</option>
                    {COURSES.filter((c) => c !== "All").map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-[#050720]/40 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                {courseError && (
                  <span className="text-[10px] font-semibold text-rose-500 mt-1 block">
                    Course is required*
                  </span>
                )}
              </div>

              <div>
                <div className="relative">
                  <select
                    value={formFaculty}
                    onChange={(e) => {
                      setFormFaculty(e.target.value);
                      if (e.target.value) setFacultyError(false);
                    }}
                    className={`w-full bg-[#F8FAFC] text-xs px-3.5 py-2.5 rounded-lg border appearance-none ${
                      facultyError
                        ? "border-rose-500 ring-1 ring-rose-500"
                        : "border-[#050720]/15"
                    } focus:outline-none cursor-pointer`}
                  >
                    <option value="">Select Faculty*</option>
                    {dynamicFaculties.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-[#050720]/40 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                {facultyError && (
                  <span className="text-[10px] font-semibold text-rose-500 mt-1 block">
                    Faculty assignment is required*
                  </span>
                )}
              </div>

              <div>
                <div className="relative">
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => {
                      setFormDate(e.target.value);
                      if (e.target.value) setDateError(false);
                    }}
                    className={`w-full bg-[#F8FAFC] text-xs px-3.5 py-2 rounded-lg border ${
                      dateError
                        ? "border-rose-500 ring-1 ring-rose-500"
                        : "border-[#050720]/15"
                    } focus:outline-none`}
                  />
                </div>
                {dateError && (
                  <span className="text-[10px] font-semibold text-rose-500 mt-1 block">
                    Demo date is required*
                  </span>
                )}
              </div>

              <div>
                <div className="relative">
                  <select
                    value={formTimeSlot}
                    onChange={(e) => {
                      setFormTimeSlot(e.target.value);
                      if (e.target.value) setSlotError(false);
                    }}
                    className={`w-full bg-[#F8FAFC] text-xs px-3.5 py-2.5 rounded-lg border appearance-none ${
                      slotError
                        ? "border-rose-500 ring-1 ring-rose-500"
                        : "border-[#050720]/15"
                    } focus:outline-none cursor-pointer`}
                  >
                    <option value="">Select Time Slot*</option>
                    {TIME_SLOTS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <Clock className="w-3.5 h-3.5 text-[#050720]/40 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                {slotError && (
                  <span className="text-[10px] font-semibold text-rose-500 mt-1 block">
                    Time slot is required*
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Mode */}
          <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-3">
            <h3 className="text-sm font-bold font-['Sora']">Demo Mode*</h3>
            <div className="flex items-center gap-8 text-xs">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="radio"
                  name="demoMode"
                  checked={formMode === "Online"}
                  onChange={() => {
                    setFormMode("Online");
                    setModeError(false);
                  }}
                  className="w-4 h-4 accent-[#FFB908]"
                />
                <span className="font-medium">Online</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="radio"
                  name="demoMode"
                  checked={formMode === "Offline"}
                  onChange={() => {
                    setFormMode("Offline");
                    setModeError(false);
                  }}
                  className="w-4 h-4 accent-[#FFB908]"
                />
                <span className="font-medium">Offline</span>
              </label>
            </div>
            {modeError && (
              <span className="text-[10px] font-semibold text-rose-500 block">
                Please select Online or Offline*
              </span>
            )}
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setView("table")}
              className="flex-1 py-2.5 bg-white border border-[#050720]/20 rounded-lg text-xs font-bold hover:bg-[#050720]/5 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitSchedule}
              className="flex-1 py-2.5 bg-[#FFB908] hover:bg-[#E5A607] rounded-lg text-xs font-bold text-[#050720] transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>Schedule Demo</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. RESCHEDULE DEMO VIEW */}
      {view === "reschedule-form" && selectedDemo && (
        <div className="space-y-6 max-w-4xl">
          <button
            onClick={() => setView("details")}
            className="flex items-center gap-2 text-2xl font-bold font-['Sora'] hover:opacity-80 transition-opacity cursor-pointer"
          >
            <ArrowLeft className="w-6 h-6 text-[#050720]" />
            <span>Reschedule Demo</span>
          </button>

          <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold font-['Sora']">Select Lead</h3>
            <div className="relative">
              <input
                type="text"
                disabled
                value={`${selectedDemo.name} ${selectedDemo.lastName || ""} (${selectedDemo.contactNo})`}
                className="w-full bg-[#F8FAFC] text-xs px-3.5 py-2.5 pr-10 rounded-lg border border-[#050720]/15 opacity-70 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold font-['Sora']">Demo Details</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative">
                <select
                  value={formCourse}
                  onChange={(e) => setFormCourse(e.target.value)}
                  className="w-full bg-[#F8FAFC] text-xs px-3.5 py-2.5 rounded-lg border border-[#050720]/15 appearance-none focus:outline-none cursor-pointer"
                >
                  <option value="">Course*</option>
                  {COURSES.filter((c) => c !== "All").map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#050720]/40 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  value={formFaculty}
                  onChange={(e) => setFormFaculty(e.target.value)}
                  className="w-full bg-[#F8FAFC] text-xs px-3.5 py-2.5 rounded-lg border border-[#050720]/15 appearance-none focus:outline-none cursor-pointer"
                >
                  <option value="">Faculty*</option>
                  {dynamicFaculties.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#050720]/40 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <div className="relative">
                <input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full bg-[#F8FAFC] text-xs px-3.5 py-2 rounded-lg border border-[#050720]/15 focus:outline-none"
                />
              </div>

              <div className="relative">
                <select
                  value={formTimeSlot}
                  onChange={(e) => setFormTimeSlot(e.target.value)}
                  className="w-full bg-[#F8FAFC] text-xs px-3.5 py-2.5 rounded-lg border border-[#050720]/15 appearance-none focus:outline-none cursor-pointer"
                >
                  <option value="">Time Slot*</option>
                  {TIME_SLOTS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <Clock className="w-3.5 h-3.5 text-[#050720]/40 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-3">
            <h3 className="text-sm font-bold font-['Sora']">Demo Mode*</h3>
            <div className="flex items-center gap-8 text-xs">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="radio"
                  name="rescheduleMode"
                  checked={formMode === "Online"}
                  onChange={() => setFormMode("Online")}
                  className="w-4 h-4 accent-[#FFB908]"
                />
                <span className="font-medium">Online</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="radio"
                  name="rescheduleMode"
                  checked={formMode === "Offline"}
                  onChange={() => setFormMode("Offline")}
                  className="w-4 h-4 accent-[#FFB908]"
                />
                <span className="font-medium">Offline</span>
              </label>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setView("details")}
              className="flex-1 py-2.5 bg-white border border-[#050720]/20 rounded-lg text-xs font-bold hover:bg-[#050720]/5 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitReschedule}
              className="flex-1 py-2.5 bg-[#FFB908] hover:bg-[#E5A607] rounded-lg text-xs font-bold text-[#050720] transition-colors shadow-xs cursor-pointer"
            >
              Reschedule Demo
            </button>
          </div>
        </div>
      )}

      {/* 4. MODALS */}
      {showRescheduleSuccessModal && selectedDemo && (
        <div className="fixed inset-0 z-50 bg-[#050720]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full text-center space-y-5 shadow-2xl">
            <div>
              <h2 className="text-lg font-bold font-['Sora'] text-[#050720]">
                Demo Scheduled
              </h2>
              <p className="text-xs text-[#050720]/60 mt-1">
                Please review the information.
              </p>
            </div>
            <button
              onClick={() => {
                setShowRescheduleSuccessModal(false);
                setView("details");
              }}
              className="w-full py-2.5 bg-[#FFB908] hover:bg-[#E5A607] rounded-lg text-xs font-bold text-[#050720] transition-colors shadow-xs cursor-pointer"
            >
              Go back
            </button>
          </div>
        </div>
      )}

      {showScheduleSuccessModal && selectedDemo && (
        <div className="fixed inset-0 z-50 bg-[#050720]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center space-y-5 shadow-2xl">
            <div>
              <h2 className="text-lg font-bold font-['Sora'] text-[#050720]">
                Demo has been scheduled
              </h2>
              <div className="text-xs text-[#050720]/70 mt-3 space-y-0.5">
                <p>Date: {selectedDemo.demoDate}</p>
                <p>Time: {selectedDemo.timeSlot}</p>
              </div>
            </div>
            <button
              onClick={() => {
                setShowScheduleSuccessModal(false);
                setView("details");
              }}
              className="w-full py-2.5 bg-[#FFB908] hover:bg-[#E5A607] rounded-lg text-xs font-bold text-[#050720] transition-colors shadow-xs cursor-pointer"
            >
              View demo details
            </button>
          </div>
        </div>
      )}

      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-[#050720]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center space-y-4 shadow-2xl">
            <h2 className="text-base font-bold font-['Sora'] text-[#050720]">
              Cancel demo?
            </h2>
            <input
              type="text"
              placeholder="Enter reason for cancellation"
              value={cancellationReasonInput}
              onChange={(e) => setCancellationReasonInput(e.target.value)}
              className="w-full bg-[#F8FAFC] text-xs px-3.5 py-2.5 rounded-lg border border-[#050720]/15 focus:outline-none focus:border-[#050720]"
            />
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-2 border border-[#050720]/20 rounded-lg text-xs font-bold hover:bg-[#050720]/5 transition-colors cursor-pointer"
              >
                Keep Demo
              </button>
              <button
                onClick={handleConfirmCancel}
                className="flex-1 py-2 bg-[#FFB908] hover:bg-[#E5A607] rounded-lg text-xs font-bold text-[#050720] transition-colors shadow-xs cursor-pointer"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. DETAILS VIEW */}
      {view === "details" && selectedDemo && (
        <div className="space-y-6 max-w-4xl">
          <button
            onClick={() => setView("table")}
            className="flex items-center gap-2 text-2xl font-bold font-['Sora'] hover:opacity-80 transition-opacity cursor-pointer"
          >
            <ArrowLeft className="w-6 h-6 text-[#050720]" />
            <span>
              {selectedDemo.status === "Completed"
                ? "Completed demo details"
                : selectedDemo.status === "Cancelled"
                  ? "Cancelled demo details"
                  : "Scheduled demo details"}
            </span>
          </button>

          <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-6">
            <h3 className="text-sm font-bold font-['Sora']">Demo Overview</h3>

            <div className="grid grid-cols-2 gap-y-4 text-xs">
              <div>
                <span className="text-[10px] text-[#050720]/50 block">
                  Lead Name
                </span>
                <span className="font-semibold text-sm">
                  {selectedDemo.name} {selectedDemo.lastName || ""}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">
                  Faculty Name
                </span>
                <span className="font-semibold text-sm">
                  {selectedDemo.faculty}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">
                  Demo Date
                </span>
                <span className="font-semibold text-sm">
                  {selectedDemo.demoDate}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">
                  Demo Time
                </span>
                <span className="font-semibold text-sm">
                  {selectedDemo.timeSlot}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">
                  Course
                </span>
                <span className="font-semibold text-sm">
                  {selectedDemo.course}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">
                  Mode
                </span>
                <span className="font-semibold text-sm">
                  {selectedDemo.mode}
                </span>
              </div>
            </div>

            {selectedDemo.status === "Cancelled" && (
              <div className="pt-2">
                <span className="text-[10px] text-[#050720]/50 block">
                  Reason for cancellation
                </span>
                <span className="font-semibold text-xs text-[#050720] mt-0.5 block">
                  {selectedDemo.cancellationReason ||
                    "No Response from Student"}
                </span>
              </div>
            )}

            {selectedDemo.status === "Completed" && (
              <div className="space-y-4 pt-2">
                <div>
                  <span className="text-[10px] text-[#050720]/50 block">
                    Demo feedback
                  </span>
                  <p className="text-xs text-[#050720]/80 mt-1 leading-relaxed">
                    {selectedDemo.feedback ||
                      "Student showed strong interest in the course structure and tools."}
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-4 pt-4 border-t border-[#050720]/10">
              {selectedDemo.status === "Scheduled" && (
                <>
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="flex-1 py-2.5 border border-[#050720]/20 rounded-lg text-xs font-bold hover:bg-[#050720]/5 transition-colors cursor-pointer"
                  >
                    Cancel Demo
                  </button>
                  <button
                    onClick={() => handleStartReschedule(selectedDemo)}
                    className="flex-1 py-2.5 bg-[#FFB908] hover:bg-[#E5A607] rounded-lg text-xs font-bold text-[#050720] transition-colors shadow-xs cursor-pointer"
                  >
                    Reschedule Demo
                  </button>
                </>
              )}

              {selectedDemo.status === "Completed" && (
                <button
                  onClick={() => setView("table")}
                  className="flex-1 py-2.5 border border-[#050720]/20 rounded-lg text-xs font-bold hover:bg-[#050720]/5 transition-colors cursor-pointer"
                >
                  Go Back
                </button>
              )}

              {selectedDemo.status === "Cancelled" && (
                <>
                  <button
                    onClick={() => setView("table")}
                    className="flex-1 py-2.5 border border-[#050720]/20 rounded-lg text-xs font-bold hover:bg-[#050720]/5 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleStartReschedule(selectedDemo)}
                    className="flex-1 py-2.5 bg-[#FFB908] hover:bg-[#E5A607] rounded-lg text-xs font-bold text-[#050720] transition-colors shadow-xs cursor-pointer"
                  >
                    Reschedule Demo
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
