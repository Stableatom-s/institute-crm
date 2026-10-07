import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  ChevronDown,
  Plus,
  CalendarCheck,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  attendanceService,
  ActivityItem,
  AttendanceRecord,
  LeaveRecord,
} from "../../services/attendanceService";

const ACTIVITY_OPTIONS = [
  "Select Activity",
  "Lead Follow-ups Done",
  "Demo feedback updated",
  "Calling New Inquiries",
  "Meeting with Parents",
  "Administrative Work",
];

export const SalesAttendancePage: React.FC = () => {
  const auth = useAuth() as any;
  const currentUserName = auth?.user?.name || "User";
  const currentUserRole = auth?.user?.role || "Sales";

  // Navigation states: 'main' | 'checkout' | 'leave-records' | 'apply-leave' | 'view-work-details'
  const [view, setView] = useState<
    "main" | "checkout" | "leave-records" | "apply-leave" | "view-work-details"
  >("main");

  // Attendance state
  const [isClockedIn, setIsClockedIn] = useState<boolean>(true);
  const [inTimeText, setInTimeText] = useState<string>("");
  const [outTimeText, setOutTimeText] = useState<string>("Yet to checkout");
  const [selectedMonth, setSelectedMonth] = useState<string>("Month");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Activities & Attendance Log
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([]);
  const [selectedRecordActivities, setSelectedRecordActivities] = useState<ActivityItem[]>([]);
  const [selectedRecordDate, setSelectedRecordDate] = useState<string>("");

  // Time Spent Logger inputs
  const [selectedActivity, setSelectedActivity] = useState<string>("Select Activity");
  const [hoursSpent, setHoursSpent] = useState<string>("Hours");
  const [minutesSpent, setMinutesSpent] = useState<string>("Minutes");
  const [activityDetails, setActivityDetails] = useState<string>("");

  // Leave Records Tab & Lists
  const [leaveTab, setLeaveTab] = useState<"Applied" | "Cancelled">("Applied");
  const [leaves, setLeaves] = useState<LeaveRecord[]>([]);

  // Apply Leave form state (Cleared of hardcoded defaults)
  const [leaveFromDate, setLeaveFromDate] = useState<string>("");
  const [leaveToDate, setLeaveToDate] = useState<string>("");
  const [leaveType, setLeaveType] = useState<"Casual" | "Sick" | "Vacation">("Casual");
  const [leaveDays, setLeaveDays] = useState<string>("");
  const [leaveReason, setLeaveReason] = useState<string>("");
  const [leaveDateError, setLeaveDateError] = useState<boolean>(false);

  // Fetch live attendance history & leave records
useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [attLogs, leaveLogs] = await Promise.all([
          attendanceService.getMyAttendance(currentUserName),
          attendanceService.getMyLeaves(currentUserName),
        ]);
        setAttendanceHistory(attLogs);
        setLeaves(leaveLogs);
      } catch (err) {
        console.error("Failed to load attendance logs:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Check today's clock in/out status from localStorage
    const todayStr = new Date()
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
      .replace(/\//g, "-");

    const savedInTime = localStorage.getItem("radiquolab_punch_in");
    if (savedInTime) {
      setInTimeText(savedInTime);
    } else {
      const now = new Date();
      const formatted = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      localStorage.setItem("radiquolab_punch_in", formatted);
      setInTimeText(formatted);
      attendanceService.clockIn(formatted, todayStr).catch(() => { });
    }

    const savedOutTime = localStorage.getItem(`radiquolab_clock_out_${todayStr}`);
    if (savedOutTime) {
      setIsClockedIn(false);
      setOutTimeText(savedOutTime);
    }

    // Load active activities for the day
    const savedActivities = localStorage.getItem(`radiquolab_activities_${todayStr}`);
    if (savedActivities) {
      try {
        setActivities(JSON.parse(savedActivities));
      } catch {
        setActivities([]);
      }
    }
  }, [currentUserName]);

  // Add new activity
  const handleAddActivity = () => {
    if (selectedActivity === "Select Activity") return;
    const duration = `${hoursSpent !== "Hours" ? hoursSpent : "00"}:${minutesSpent !== "Minutes" ? minutesSpent : "00"
      } Hrs`;

    const newAct: ActivityItem = {
      id: `act-${Date.now()}`,
      activity: selectedActivity,
      timeSpent: duration,
      details: activityDetails,
    };

    const updated = [newAct, ...activities];
    setActivities(updated);

    const todayStr = new Date()
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
      .replace(/\//g, "-");
    localStorage.setItem(`radiquolab_activities_${todayStr}`, JSON.stringify(updated));

    setSelectedActivity("Select Activity");
    setHoursSpent("Hours");
    setMinutesSpent("Minutes");
    setActivityDetails("");
  };

  // Confirm Clock Out
  const handleFinalClockOut = async () => {
    const now = new Date();
    const formattedOut = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    const todayStr = now
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
      .replace(/\//g, "-");

    setIsClockedIn(false);
    setOutTimeText(formattedOut);
    localStorage.setItem(`radiquolab_clock_out_${todayStr}`, formattedOut);

    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}`,
      date: todayStr,
      inTime: inTimeText,
      outTime: formattedOut,
      workingHours: "09:00",
      activities: activities,
    };

    try {
      await attendanceService.clockOut(formattedOut, activities, "09:00", {
        userName: currentUserName,
        date: todayStr
      });
    } catch {
      // Offline fallback
    }

    setAttendanceHistory([newRecord, ...attendanceHistory]);
    setView("main");
  };

  // Submit Leave Request
  const handleSubmitLeave = async () => {
    if (!leaveFromDate) {
      setLeaveDateError(true);
      return;
    }
    setLeaveDateError(false);

    const todayStr = new Date()
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
      .replace(/\//g, "-");

    const payload = {
      userId: auth?.user?.id || 'sales-1',
      userName: currentUserName,
      role: currentUserRole,
      userRole: currentUserRole,
      leaveType,
      fromDate: leaveFromDate,
      toDate: leaveToDate || leaveFromDate,
      noOfDays: leaveDays || '01',
      reason: leaveReason || "Personal Leave",
      applicationDate: todayStr,
      status: "Pending",
    };

    try {
      const saved = await attendanceService.applyLeave(payload);
      setLeaves([saved, ...leaves]);
    } catch {
      // offline fallback
    }

    setLeaveFromDate("");
    setLeaveToDate("");
    setLeaveDays("");
    setLeaveReason("");
    alert("Leave request submitted successfully!");
    setView("leave-records");
  };

  const handleOpenWorkDetails = (record: AttendanceRecord) => {
    setSelectedRecordDate(record.date);
    setSelectedRecordActivities(record.activities || activities);
    setView("view-work-details");
  };

  const sickLeavesUsed = leaves.filter((l) => l.leaveType === "Sick" && l.status === "Approved").length;
  const casualLeavesUsed = leaves.filter((l) => l.leaveType === "Casual" && l.status === "Approved").length;

  return (
    <div className="font-['Onest'] text-[#050720] pb-16">
      {/* ========================================================= */}
      {/* 1. MY ATTENDANCE MAIN PAGE                                */}
      {/* ========================================================= */}
      {view === "main" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold font-['Sora']">My attendance</h1>
            <button
              onClick={() => setView("leave-records")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#050720]/20 text-xs font-bold hover:bg-[#050720]/5 transition-colors"
            >
              <CalendarCheck className="w-3.5 h-3.5" />
              <span>Leave Records</span>
            </button>
          </div>

          {/* Today Clock-in Card */}
          <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs">
            <h3 className="text-xs font-bold font-['Sora'] mb-4">Today</h3>
            <div className="flex justify-between items-center">
              <div className="flex gap-16 text-xs">
                <div>
                  <span className="text-[10px] text-[#050720]/50 block">In time</span>
                  <span className="font-bold text-sm font-['Sora'] mt-0.5 block">
                    {inTimeText || "—"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#050720]/50 block">Out time</span>
                  <span className="font-semibold text-sm mt-0.5 block text-[#050720]/70">
                    {outTimeText}
                  </span>
                </div>
              </div>

              {isClockedIn ? (
                <button
                  onClick={() => setView("checkout")}
                  className="px-6 py-2 bg-[#FFB908] hover:bg-[#E5A607] rounded-lg text-xs font-bold text-[#050720] transition-colors shadow-xs"
                >
                  Clock Out
                </button>
              ) : (
                <span className="px-4 py-1.5 bg-slate-100 rounded-lg text-xs font-bold text-slate-500">
                  Clocked Out
                </span>
              )}
            </div>
          </div>

          {/* Time Spent Logging Panel */}
          <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-bold font-['Sora']">Time Spent</h3>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <select
                  value={selectedActivity}
                  onChange={(e) => setSelectedActivity(e.target.value)}
                  className="w-full bg-[#F8FAFC] text-xs px-3.5 py-2.5 rounded-lg border border-[#050720]/15 appearance-none focus:outline-none"
                >
                  {ACTIVITY_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#050720]/40 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <div className="relative w-28">
                <select
                  value={hoursSpent}
                  onChange={(e) => setHoursSpent(e.target.value)}
                  className="w-full bg-[#F8FAFC] text-xs px-3.5 py-2.5 rounded-lg border border-[#050720]/15 appearance-none focus:outline-none"
                >
                  <option value="Hours">Hours</option>
                  {Array.from({ length: 9 }, (_, i) => String(i + 1).padStart(2, "0")).map(
                    (h) => (
                      <option key={h} value={h}>
                        {h} Hrs
                      </option>
                    )
                  )}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#050720]/40 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <div className="relative w-28">
                <select
                  value={minutesSpent}
                  onChange={(e) => setMinutesSpent(e.target.value)}
                  className="w-full bg-[#F8FAFC] text-xs px-3.5 py-2.5 rounded-lg border border-[#050720]/15 appearance-none focus:outline-none"
                >
                  <option value="Minutes">Minutes</option>
                  {["00", "15", "30", "45"].map((m) => (
                    <option key={m} value={m}>
                      {m} Mins
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#050720]/40 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <button
                onClick={handleAddActivity}
                className="px-5 py-2.5 bg-white border border-[#050720]/30 hover:bg-[#050720]/5 rounded-lg text-xs font-bold text-[#050720] transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Activity</span>
              </button>
            </div>

            <textarea
              rows={3}
              placeholder="Enter activity details"
              value={activityDetails}
              onChange={(e) => setActivityDetails(e.target.value)}
              className="w-full bg-[#F8FAFC] text-xs p-3.5 rounded-lg border border-[#050720]/15 focus:outline-none resize-none"
            />
          </div>

          {/* Today's Activities List */}
          <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-bold font-['Sora']">Today's Activities</h3>
            {activities.length === 0 ? (
              <p className="text-xs text-[#050720]/40 italic">No activities logged yet today.</p>
            ) : (
              <div className="space-y-3">
                {activities.map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-1">
                    <div>
                      <span className="text-[10px] text-[#050720]/50 block">Activity</span>
                      <span className="text-xs font-semibold text-[#050720]">{item.activity}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-[#050720]/50 block">Time spent</span>
                      <span className="text-xs font-semibold text-[#050720]">{item.timeSpent}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Attendance Log Table */}
          <div className="bg-white border border-[#050720]/10 rounded-xl p-6 shadow-xs space-y-4">
            <div className="w-28 relative">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full bg-[#F8FAFC] text-xs px-3 py-1.5 rounded-lg border border-[#050720]/15 appearance-none focus:outline-none"
              >
                <option value="Month">Month</option>
                <option value="January">January</option>
                <option value="February">February</option>
                <option value="March">March</option>
                <option value="April">April</option>
                <option value="May">May</option>
                <option value="June">June</option>
                <option value="July">July</option>
                <option value="August">August</option>
                <option value="September">September</option>
                <option value="October">October</option>
                <option value="November">November</option>
                <option value="December">December</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#050720]/40 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {isLoading ? (
              <div className="py-12 text-center text-xs text-[#050720]/50">
                Loading attendance history from database...
              </div>
            ) : attendanceHistory.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#050720]/50">
                No attendance history recorded yet.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#050720]/10 text-[#050720] font-bold">
                    <th className="pb-3.5 font-semibold">Date</th>
                    <th className="pb-3.5 font-semibold">In time</th>
                    <th className="pb-3.5 font-semibold">Out time</th>
                    <th className="pb-3.5 font-semibold">Working Hours</th>
                    <th className="pb-3.5 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#050720]/5 text-[#050720]">
                  {attendanceHistory.map((row) => (
                    <tr key={row.id} className="hover:bg-[#FFB908]/5 transition-colors">
                      <td className="py-3.5 text-[#050720]/80">{row.date}</td>
                      <td className="py-3.5 font-medium">{row.inTime}</td>
                      <td className="py-3.5 text-[#050720]/80">{row.outTime}</td>
                      <td className="py-3.5 text-[#050720]/80">{row.workingHours}</td>
                      <td className="py-3.5 text-right">
                        <button
                          onClick={() => handleOpenWorkDetails(row)}
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
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. CLOCK OUT / CHECKOUT SUMMARY                           */}
      {/* ========================================================= */}
      {view === "checkout" && (
        <div className="space-y-6 max-w-4xl">
          <button
            onClick={() => setView("main")}
            className="flex items-center gap-2 text-2xl font-bold font-['Sora'] hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="w-6 h-6 text-[#050720]" />
            <span>Clock Out</span>
          </button>

          {/* Personal Details */}
          <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold font-['Sora']">Personal Details</h3>
            <div className="grid grid-cols-2 gap-y-4 text-xs">
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Name</span>
                <span className="font-semibold text-sm">{currentUserName}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Role</span>
                <span className="font-semibold text-sm">{currentUserRole}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">In time</span>
                <span className="font-semibold text-sm">{inTimeText}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Out time</span>
                <span className="font-semibold text-sm">
                  {new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Working Hours</span>
                <span className="font-semibold text-sm">09:00 Hrs</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Location</span>
                <span className="font-semibold text-xs text-[#050720]/80">
                  Radiquolab Design Institute - Pune
                </span>
              </div>
            </div>
          </div>

          {/* Today's Activities */}
          <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold font-['Sora']">Today's Activities</h3>
            {activities.length === 0 ? (
              <p className="text-xs text-[#050720]/40 italic">No activities added for today.</p>
            ) : (
              <div className="space-y-3">
                {activities.map((act) => (
                  <div key={act.id} className="flex justify-between items-center py-1">
                    <div>
                      <span className="text-[10px] text-[#050720]/50 block">Activity</span>
                      <span className="text-xs font-semibold text-[#050720]">{act.activity}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-[#050720]/50 block">Time spent</span>
                      <span className="text-xs font-semibold text-[#050720]">{act.timeSpent}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              onClick={() => setView("main")}
              className="flex-1 py-2.5 bg-white border border-[#050720]/20 rounded-lg text-xs font-bold hover:bg-[#050720]/5 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleFinalClockOut}
              className="flex-1 py-2.5 bg-[#FFB908] hover:bg-[#E5A607] rounded-lg text-xs font-bold text-[#050720] transition-colors shadow-xs"
            >
              Clock Out
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. LEAVE RECORDS HUB                                      */}
      {/* ========================================================= */}
      {view === "leave-records" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <button
              onClick={() => setView("main")}
              className="flex items-center gap-2 text-2xl font-bold font-['Sora'] hover:opacity-80 transition-opacity"
            >
              <ArrowLeft className="w-6 h-6 text-[#050720]" />
              <span>Leave Records</span>
            </button>
            <button
              onClick={() => {
                setLeaveFromDate("");
                setLeaveToDate("");
                setLeaveDays("");
                setLeaveReason("");
                setLeaveDateError(false);
                setView("apply-leave");
              }}
              className="px-4 py-2 bg-[#FFB908] hover:bg-[#E5A607] rounded-lg text-xs font-bold text-[#050720] transition-colors shadow-xs"
            >
              Apply for leave
            </button>
          </div>

          {/* Leave Quota Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-xl border border-[#050720]/10 text-center shadow-xs">
              <span className="text-xs font-bold block">Sick Leaves</span>
              <span className="text-3xl font-extrabold font-['Sora'] mt-1 block">
                {sickLeavesUsed}/10
              </span>
            </div>
            <div className="bg-white p-6 rounded-xl border border-[#050720]/10 text-center shadow-xs">
              <span className="text-xs font-bold block">Casual Leaves</span>
              <span className="text-3xl font-extrabold font-['Sora'] mt-1 block">
                {casualLeavesUsed}/14
              </span>
            </div>
          </div>

          {/* Active Leave Records */}
          <div className="bg-white border border-[#050720]/10 rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-6 border-b border-[#050720]/10 pb-3">
              {(["Applied", "Cancelled"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setLeaveTab(t)}
                  className={`text-sm font-semibold transition-all relative pb-2 ${leaveTab === t
                      ? "text-[#050720] font-bold"
                      : "text-[#050720]/50 hover:text-[#050720]"
                    }`}
                >
                  <span>{t}</span>
                  {leaveTab === t && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FFB908] rounded-full" />
                  )}
                </button>
              ))}
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
                {leaves
                  .filter((l) =>
                    leaveTab === "Applied" ? l.status !== "Rejected" : l.status === "Rejected"
                  )
                  .map((l) => (
                    <tr key={l.id} className="hover:bg-[#FFB908]/5 transition-colors">
                      <td className="py-3.5 font-medium">{l.leaveType}</td>
                      <td className="py-3.5 text-[#050720]/80">{l.leaveDate}</td>
                      <td className="py-3.5 text-[#050720]/80">{l.reason}</td>
                      <td className="py-3.5 text-[#050720]/80">{l.applicationDate}</td>
                      <td className="py-3.5 text-right">
                        <span
                          className={`font-semibold ${l.status === "Approved"
                              ? "text-[#10B981]"
                              : l.status === "Rejected"
                                ? "text-[#EF4444]"
                                : "text-[#FFB908]"
                            }`}
                        >
                          {l.status}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Historical Leave Log */}
          <div className="bg-white border border-[#050720]/10 rounded-xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold font-['Sora']">Leave Record History</h3>
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
                {leaves.map((l) => (
                  <tr key={`hist-${l.id}`} className="hover:bg-[#FFB908]/5 transition-colors">
                    <td className="py-3.5 font-medium">{l.leaveType}</td>
                    <td className="py-3.5 text-[#050720]/80">{l.leaveDate}</td>
                    <td className="py-3.5 text-[#050720]/80">{l.reason}</td>
                    <td className="py-3.5 text-[#050720]/80">{l.applicationDate}</td>
                    <td className="py-3.5 text-right">
                      <span
                        className={`font-semibold ${l.status === "Approved"
                            ? "text-[#10B981]"
                            : l.status === "Rejected"
                              ? "text-[#EF4444]"
                              : "text-[#FFB908]"
                          }`}
                      >
                        {l.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. APPLY FOR LEAVE                                        */}
      {/* ========================================================= */}
      {view === "apply-leave" && (
        <div className="space-y-6 max-w-4xl">
          <button
            onClick={() => setView("leave-records")}
            className="flex items-center gap-2 text-2xl font-bold font-['Sora'] hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="w-6 h-6 text-[#050720]" />
            <span>Apply for leave</span>
          </button>

          <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-6">
            <h3 className="text-sm font-bold font-['Sora']">Leave Details</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <input
                  type="date"
                  placeholder="From date*"
                  value={leaveFromDate}
                  onChange={(e) => {
                    setLeaveFromDate(e.target.value);
                    if (e.target.value) setLeaveDateError(false);
                  }}
                  className={`w-full bg-[#F8FAFC] text-xs px-3.5 py-2.5 rounded-lg border ${leaveDateError
                      ? "border-rose-500 ring-1 ring-rose-500"
                      : "border-[#050720]/15"
                    } focus:outline-none`}
                />
                {leaveDateError && (
                  <span className="text-[10px] font-semibold text-rose-500 mt-1 block">
                    This field is required*
                  </span>
                )}
              </div>

              <div>
                <input
                  type="date"
                  placeholder="To date*"
                  value={leaveToDate}
                  onChange={(e) => setLeaveToDate(e.target.value)}
                  className="w-full bg-[#F8FAFC] text-xs px-3.5 py-2.5 rounded-lg border border-[#050720]/15 focus:outline-none"
                />
              </div>

              <div className="relative">
                <select
                  value={leaveType}
                  onChange={(e) =>
                    setLeaveType(e.target.value as "Casual" | "Sick" | "Vacation")
                  }
                  className="w-full bg-[#F8FAFC] text-xs px-3.5 py-2.5 rounded-lg border border-[#050720]/15 appearance-none focus:outline-none"
                >
                  <option value="Casual">Casual</option>
                  <option value="Sick">Sick</option>
                  <option value="Vacation">Vacation</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#050720]/40 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Number of days*"
                  value={leaveDays}
                  onChange={(e) => setLeaveDays(e.target.value)}
                  className="w-full bg-[#F8FAFC] text-xs px-3.5 py-2.5 rounded-lg border border-[#050720]/15 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <span className="text-[10px] text-[#050720]/50 block mb-1">
                Reason for Leave*
              </span>
              <textarea
                rows={5}
                placeholder="Reason for Leave*"
                value={leaveReason}
                onChange={(e) => setLeaveReason(e.target.value)}
                className="w-full bg-[#F8FAFC] text-xs p-3 rounded-lg border border-[#050720]/15 focus:outline-none resize-none"
              />
            </div>

            <div className="flex gap-4 pt-2">
              <button
                onClick={() => setView("leave-records")}
                className="flex-1 py-2.5 border border-[#050720]/20 rounded-lg text-xs font-bold hover:bg-[#050720]/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitLeave}
                className="flex-1 py-2.5 bg-[#FFB908] hover:bg-[#E5A607] rounded-lg text-xs font-bold text-[#050720] transition-colors shadow-xs"
              >
                Submit leave request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. VIEW WORK DETAILS / MY ACTIVITIES                      */}
      {/* ========================================================= */}
      {view === "view-work-details" && (
        <div className="space-y-6 max-w-4xl">
          <button
            onClick={() => setView("main")}
            className="flex items-center gap-2 text-2xl font-bold font-['Sora'] hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="w-6 h-6 text-[#050720]" />
            <span>My activities</span>
          </button>

          <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold font-['Sora']">Activity Details</h3>
              <span className="text-[11px] text-[#050720]/50">{selectedRecordDate || "Today"}</span>
            </div>

            <div className="space-y-3 pt-2">
              {selectedRecordActivities.length === 0 ? (
                <p className="text-xs text-[#050720]/40 italic">
                  No detailed activities logged for this day.
                </p>
              ) : (
                selectedRecordActivities.map((act) => (
                  <div
                    key={`work-${act.id}`}
                    className="flex justify-between items-center py-2 border-b border-[#050720]/5 last:border-none"
                  >
                    <div>
                      <span className="text-[10px] text-[#050720]/50 block">Activity</span>
                      <span className="text-xs font-semibold text-[#050720]">{act.activity}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-[#050720]/50 block">Time spent</span>
                      <span className="text-xs font-semibold text-[#050720]">{act.timeSpent}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};