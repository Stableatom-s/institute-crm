import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  Plus,
  MoreVertical,
  FileText
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  attendanceService,
  ActivityItem,
  AttendanceRecord,
  LeaveRecord,
} from '../../services/attendanceService';

// Helper function to calculate exact hours & minutes between In Time and Out Time
function calculateWorkingHours(inTimeStr: string, outTimeStr: string): string {
  try {
    const parseTime = (str: string) => {
      const parts = str.trim().split(' ');
      if (parts.length < 2) return 0;
      const [time, modifier] = parts;
      let [h, m] = time.split(':').map(Number);
      if (modifier.toUpperCase() === 'PM' && h < 12) h += 12;
      if (modifier.toUpperCase() === 'AM' && h === 12) h = 0;
      return h * 60 + m;
    };

    const diffMins = parseTime(outTimeStr) - parseTime(inTimeStr);
    if (diffMins <= 0) return '00:00';

    const hours = Math.floor(diffMins / 60);
    const minutes = diffMins % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  } catch {
    return '00:00';
  }
}

export const FacultyAttendancePage: React.FC = () => {
  const auth = useAuth() as any;
  const currentUserName = auth?.user?.name || 'Poorva Pande';
  const currentUserRole = auth?.user?.role || 'Faculty';

  // Navigation views
  const [view, setView] = useState<'attendance' | 'clockOut' | 'viewWork' | 'leaveRecords' | 'applyLeave'>('attendance');

  // Three-dots dropdown state
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Attendance state
  const [inTime, setInTime] = useState('09:30 AM');
  const [isClockedOut, setIsClockedOut] = useState(false);
  const [outTimeText, setOutTimeText] = useState('Yet to clock out');
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([]);
  const [selectedActivity, setSelectedActivity] = useState('');
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [activityDetails, setActivityDetails] = useState('');
  const [selectedWorkDate, setSelectedWorkDate] = useState('');
  const [selectedWorkActivities, setSelectedWorkActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Leave State
  const [leaveTab, setLeaveTab] = useState<'approved' | 'cancelled'>('approved');
  const [leaveHistory, setLeaveHistory] = useState<LeaveRecord[]>([]);
  const [showReapplyModal, setShowReapplyModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [reapplyReason, setReapplyReason] = useState('');

  // Apply Leave Form
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [leaveType, setLeaveType] = useState<'Casual' | 'Sick' | 'Vacation'>('Casual');
  const [leaveReason, setLeaveReason] = useState('');

  // Calculate day difference dynamically
  const calculateDays = () => {
    if (!fromDate || !toDate) return '01';
    const start = new Date(fromDate);
    const end = new Date(toDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return isNaN(diffDays) ? '01' : String(diffDays).padStart(2, '0');
  };

  // Fetch live logs on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [attLogs, leaveLogs] = await Promise.all([
          attendanceService.getMyAttendance(),
          attendanceService.getMyLeaves(),
        ]);
        setAttendanceHistory(attLogs);
        setLeaveHistory(leaveLogs);
      } catch (err) {
        console.error('Failed to load faculty attendance:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Check today's punch status
    const todayStr = new Date()
      .toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
      .replace(/\//g, '-');

    const savedInTime = localStorage.getItem('radiquolab_punch_in');
    if (savedInTime) {
      setInTime(savedInTime);
    } else {
      const now = new Date();
      const formatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
      localStorage.setItem('radiquolab_punch_in', formatted);
      setInTime(formatted);
      attendanceService.clockIn(formatted, todayStr).catch(() => { });
    }

    const savedOutTime = localStorage.getItem(`radiquolab_clock_out_${todayStr}`);
    if (savedOutTime) {
      setIsClockedOut(true);
      setOutTimeText(savedOutTime);
    }

    const savedActivities = localStorage.getItem(`radiquolab_faculty_activities_${todayStr}`);
    if (savedActivities) {
      try {
        setActivities(JSON.parse(savedActivities));
      } catch {
        setActivities([]);
      }
    }
  }, []);

  const handleAddActivity = () => {
    if (!selectedActivity || (!hours && !minutes)) return;
    const timeSpentString = `${hours || '00'}:${minutes || '00'} Hrs`;
    const newAct: ActivityItem = {
      id: Date.now().toString(),
      activity: selectedActivity,
      timeSpent: timeSpentString,
      details: activityDetails,
    };
    const updated = [newAct, ...activities];
    setActivities(updated);

    const todayStr = new Date()
      .toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
      .replace(/\//g, '-');
    localStorage.setItem(`radiquolab_faculty_activities_${todayStr}`, JSON.stringify(updated));

    setSelectedActivity('');
    setHours('');
    setMinutes('');
    setActivityDetails('');
  };

  const handleConfirmClockOut = async () => {
    const now = new Date();
    const formattedOut = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    const todayStr = now
      .toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
      .replace(/\//g, '-');

    // Dynamically calculate exact elapsed working hours
    const computedWorkingHours = calculateWorkingHours(inTime, formattedOut);

    setIsClockedOut(true);
    setOutTimeText(formattedOut);
    localStorage.setItem(`radiquolab_clock_out_${todayStr}`, formattedOut);

    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}`,
      date: todayStr,
      inTime,
      outTime: formattedOut,
      workingHours: computedWorkingHours,
      activities,
    };

    try {
      await attendanceService.clockOut(formattedOut, activities, computedWorkingHours, {
        userName: currentUserName,
        date: todayStr
      });
    } catch {
      // Offline fallback
    }

    setAttendanceHistory([newRecord, ...attendanceHistory]);
    setView('attendance');
  };

  const handleSubmitLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    const todayStr = new Date()
      .toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
      .replace(/\//g, '-');

    const payload: Partial<LeaveRecord> = {
      leaveType,
      leaveDate: fromDate,
      reason: leaveReason || 'Personal Leave',
      applicationDate: todayStr,
      status: 'Pending',
    };

    try {
      const saved = await attendanceService.applyLeave(payload);
      setLeaveHistory([saved, ...leaveHistory]);
    } catch {
      const fallbackLeave: LeaveRecord = {
        id: `leave-${Date.now()}`,
        leaveType,
        leaveDate: fromDate,
        reason: leaveReason || 'Personal Leave',
        applicationDate: todayStr,
        status: 'Pending',
      };
      setLeaveHistory([fallbackLeave, ...leaveHistory]);
    }

    setFromDate('');
    setToDate('');
    setLeaveReason('');
    setShowSuccessModal(true);
  };

  const sickLeavesUsed = leaveHistory.filter((l) => l.leaveType === 'Sick' && l.status === 'Approved').length;
  const casualLeavesUsed = leaveHistory.filter((l) => l.leaveType === 'Casual' && l.status === 'Approved').length;

  return (
    <div className="font-['Onest'] space-y-6 pb-16 max-w-7xl mx-auto">

      {/* ─────────────────────────────────────────────────────────────
          SCREEN 1: MY ATTENDANCE MAIN VIEW
      ───────────────────────────────────────────────────────────── */}
      {view === 'attendance' && (
        <div className="space-y-6">
          {/* Header with 3 Dots Dropdown */}
          <div className="flex justify-between items-center relative">
            <h1 className="text-2xl font-bold text-[#050720] font-['Sora']">My attendance</h1>

            {/* Three Dots Menu Container */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1.5 rounded-lg text-[#050720]/60 hover:text-[#050720] hover:bg-[#050720]/5 transition-colors cursor-pointer"
                title="Options"
              >
                <MoreVertical className="w-5 h-5" />
              </button>

              {/* Dropdown Menu */}
              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-[#050720]/10 rounded-xl shadow-lg py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100">
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      setView('leaveRecords');
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs font-semibold text-[#050720] hover:bg-[#FFB908]/10 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-[#050720]/60" />
                    Leave Records
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Today Clock-in Status Banner */}
          <div className="bg-white border border-[#050720]/10 rounded-2xl p-6 shadow-xs flex justify-between items-center">
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-[#050720] font-['Sora']">Today</h2>
              <div className="flex gap-16 text-xs">
                <div>
                  <span className="text-[10px] text-[#050720]/50 block mb-0.5">In time</span>
                  <p className="font-semibold text-[#050720] text-sm">{inTime || '—'}</p>
                </div>
                <div>
                  <span className="text-[10px] text-[#050720]/50 block mb-0.5">Out time</span>
                  <p className="font-semibold text-[#050720]/70 text-sm">
                    {outTimeText}
                  </p>
                </div>
              </div>
            </div>
            <div>
              {!isClockedOut ? (
                <button
                  onClick={() => setView('clockOut')}
                  className="bg-[#FFB908] hover:bg-[#E5A707] text-[#050720] font-bold text-xs px-6 py-2.5 rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  Clock Out
                </button>
              ) : (
                <span className="px-4 py-2 bg-slate-100 text-[#050720]/60 rounded-lg text-xs font-semibold">
                  Completed for today
                </span>
              )}
            </div>
          </div>

          {/* Time Spent Form */}
          <div className="bg-white border border-[#050720]/10 rounded-2xl p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-[#050720] font-['Sora']">Time Spent</h2>
            <div className="flex flex-wrap sm:flex-nowrap gap-3">
              <div className="flex-1 min-w-[200px]">
                <select
                  value={selectedActivity}
                  onChange={(e) => setSelectedActivity(e.target.value)}
                  className="w-full border border-[#050720]/15 rounded-lg px-3 py-2 text-xs text-[#050720] bg-white focus:outline-none"
                >
                  <option value="">Select Activity</option>
                  <option value="Lecture MWF-JAN-2026">Lecture MWF-JAN-2026</option>
                  <option value="Lecture TTS-JAN-2026">Lecture TTS-JAN-2026</option>
                  <option value="Assignment Review">Assignment Review</option>
                  <option value="Project Work">Project Work</option>
                  <option value="Curriculum Planning">Curriculum Planning</option>
                </select>
              </div>
              <div className="w-28">
                <select
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  className="w-full border border-[#050720]/15 rounded-lg px-3 py-2 text-xs text-[#050720] bg-white focus:outline-none"
                >
                  <option value="">Hours</option>
                  {Array.from({ length: 9 }, (_, i) => String(i + 1).padStart(2, '0')).map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>
              <div className="w-28">
                <select
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                  className="w-full border border-[#050720]/15 rounded-lg px-3 py-2 text-xs text-[#050720] bg-white focus:outline-none"
                >
                  <option value="">Minutes</option>
                  <option value="00">00</option>
                  <option value="15">15</option>
                  <option value="30">30</option>
                  <option value="45">45</option>
                </select>
              </div>
              <button
                type="button"
                onClick={handleAddActivity}
                className="border border-[#050720]/20 hover:bg-slate-50 text-[#050720] font-semibold text-xs px-5 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Activity
              </button>
            </div>
            <textarea
              rows={3}
              placeholder="Enter activity details"
              value={activityDetails}
              onChange={(e) => setActivityDetails(e.target.value)}
              className="w-full border border-[#050720]/15 rounded-lg p-3 text-xs text-[#050720] focus:outline-none resize-none"
            />
          </div>

          {/* Today's Activities List */}
          <div className="bg-white border border-[#050720]/10 rounded-2xl p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-[#050720] font-['Sora']">Today's Activities</h2>
            {activities.length === 0 ? (
              <p className="text-xs text-[#050720]/40 italic py-2">No activities logged yet today.</p>
            ) : (
              <div className="divide-y divide-[#050720]/5 text-xs">
                {activities.map((act) => (
                  <div key={act.id} className="py-2.5 flex justify-between items-center">
                    <div>
                      <span className="text-[10px] text-[#050720]/40 block">Activity</span>
                      <p className="font-semibold text-[#050720]">{act.activity}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-[#050720]/40 block">Time spent</span>
                      <p className="font-semibold text-[#050720]">{act.timeSpent}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Month Attendance Table */}
          <div className="bg-white border border-[#050720]/10 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="w-36">
              <select className="border border-[#050720]/15 rounded-md px-3 py-1 text-xs text-[#050720] bg-white focus:outline-none">
                <option>All Months</option>
                <option>January</option>
                <option>February</option>
                <option>March</option>
                <option>April</option>
                <option>May</option>
                <option>June</option>
                <option>July</option>
                <option>August</option>
                <option>September</option>
                <option>October</option>
                <option>November</option>
                <option>December</option>
              </select>
            </div>

            {isLoading ? (
              <div className="py-8 text-center text-xs text-[#050720]/50">
                Loading attendance history from database...
              </div>
            ) : attendanceHistory.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#050720]/50">
                No attendance logs found for this user.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#050720]/10 text-[#050720]/60 pb-3 font-semibold">
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium">In time</th>
                    <th className="pb-3 font-medium">Out time</th>
                    <th className="pb-3 font-medium">Working Hours</th>
                    <th className="pb-3 text-right font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#050720]/5 text-[#050720]">
                  {attendanceHistory.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5">{row.date}</td>
                      <td className="py-3.5">{row.inTime}</td>
                      <td className="py-3.5">{row.outTime}</td>
                      <td className="py-3.5 font-semibold text-[#050720]">{row.workingHours}</td>
                      <td className="py-3.5 text-right">
                        <button
                          onClick={() => {
                            setSelectedWorkDate(row.date);
                            setSelectedWorkActivities(row.activities || activities);
                            setView('viewWork');
                          }}
                          className="px-3.5 py-1 border border-[#050720]/30 rounded text-[11px] font-semibold text-[#050720] hover:bg-slate-100 cursor-pointer"
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

      {/* ─────────────────────────────────────────────────────────────
          SCREEN 2: CLOCK OUT CONFIRMATION
      ───────────────────────────────────────────────────────────── */}
      {view === 'clockOut' && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setView('attendance')} className="p-1 rounded hover:bg-slate-100 cursor-pointer">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-[#050720] font-['Sora']">Clock Out</h1>
          </div>

          <div className="bg-white border border-[#050720]/10 rounded-2xl p-7 shadow-xs space-y-6">
            <h2 className="text-sm font-bold text-[#050720] font-['Sora']">Personal Details</h2>
            <div className="grid grid-cols-2 gap-y-5 gap-x-12 text-xs">
              <div>
                <span className="text-[11px] text-[#050720]/50 block mb-0.5">Name</span>
                <p className="font-semibold text-sm text-[#050720]">{currentUserName}</p>
              </div>
              <div>
                <span className="text-[11px] text-[#050720]/50 block mb-0.5">Role</span>
                <p className="font-semibold text-sm text-[#050720]">{currentUserRole}</p>
              </div>
              <div>
                <span className="text-[11px] text-[#050720]/50 block mb-0.5">In time</span>
                <p className="font-semibold text-sm text-[#050720]">{inTime}</p>
              </div>
              <div>
                <span className="text-[11px] text-[#050720]/50 block mb-0.5">Out time</span>
                <p className="font-semibold text-sm text-[#050720]">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                </p>
              </div>
              <div>
                <span className="text-[11px] text-[#050720]/50 block mb-0.5">Working Hours</span>
                <p className="font-semibold text-sm text-[#050720]">
                  {calculateWorkingHours(
                    inTime,
                    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
                  )} Hrs
                </p>
              </div>
              <div>
                <span className="text-[11px] text-[#050720]/50 block mb-0.5">Location</span>
                <p className="font-semibold text-sm text-[#050720]">
                  Radiquolab Design Institute • Pune
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#050720]/10 rounded-2xl p-7 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-[#050720] font-['Sora']">Today's Activities</h2>
            {activities.length === 0 ? (
              <p className="text-xs text-[#050720]/40 italic py-2">No activities added for today.</p>
            ) : (
              <div className="divide-y divide-[#050720]/5 text-xs">
                {activities.map((act) => (
                  <div key={act.id} className="py-2.5 flex justify-between items-center">
                    <div>
                      <span className="text-[10px] text-[#050720]/40 block">Activity</span>
                      <p className="font-semibold text-[#050720]">{act.activity}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-[#050720]/40 block">Time spent</span>
                      <p className="font-semibold text-[#050720]">{act.timeSpent}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setView('attendance')}
              className="flex-1 py-3 rounded-xl border border-[#050720]/20 text-xs font-semibold text-[#050720] hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmClockOut}
              className="flex-1 py-3 rounded-xl bg-[#FFB908] hover:bg-[#E5A707] text-xs font-bold text-[#050720] shadow-xs transition-colors cursor-pointer"
            >
              Clock Out
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          SCREEN 3: VIEW WORK DETAILS
      ───────────────────────────────────────────────────────────── */}
      {view === 'viewWork' && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setView('attendance')} className="p-1 rounded hover:bg-slate-100 cursor-pointer">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-[#050720] font-['Sora']">My activities</h1>
          </div>

          <div className="bg-white border border-[#050720]/10 rounded-2xl p-7 shadow-xs space-y-5">
            <div>
              <h2 className="text-sm font-bold text-[#050720] font-['Sora']">Activity Details</h2>
              <span className="text-[11px] text-[#050720]/50 block mt-0.5">{selectedWorkDate || 'Today'}</span>
            </div>

            {selectedWorkActivities.length === 0 ? (
              <p className="text-xs text-[#050720]/40 italic py-4">No detailed activities logged for this day.</p>
            ) : (
              <div className="divide-y divide-[#050720]/5 text-xs">
                {selectedWorkActivities.map((act) => (
                  <div key={act.id} className="py-3 flex justify-between items-center">
                    <div>
                      <span className="text-[10px] text-[#050720]/40 block">Activity</span>
                      <p className="font-semibold text-[#050720]">{act.activity}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-[#050720]/40 block">Time spent</span>
                      <p className="font-semibold text-[#050720]">{act.timeSpent}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          SCREEN 4: LEAVE RECORDS
      ───────────────────────────────────────────────────────────── */}
      {view === 'leaveRecords' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <button onClick={() => setView('attendance')} className="p-1 rounded hover:bg-slate-100 cursor-pointer">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-2xl font-bold text-[#050720] font-['Sora']">Leave Records</h1>
            </div>
            <button
              onClick={() => {
                setFromDate('');
                setToDate('');
                setLeaveReason('');
                setView('applyLeave');
              }}
              className="bg-[#FFB908] hover:bg-[#E5A707] text-[#050720] font-bold text-xs px-5 py-2.5 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              Apply for leave
            </button>
          </div>

          {/* Leave Quota Cards */}
          <div className="grid grid-cols-2 gap-5">
            <div className="bg-white border border-[#050720]/10 rounded-2xl p-6 text-center shadow-xs">
              <span className="text-xs font-semibold text-[#050720]/70">Sick Leaves</span>
              <p className="text-3xl font-bold text-[#050720] font-['Sora'] mt-2">{sickLeavesUsed}/10</p>
            </div>
            <div className="bg-white border border-[#050720]/10 rounded-2xl p-6 text-center shadow-xs">
              <span className="text-xs font-semibold text-[#050720]/70">Casual Leaves</span>
              <p className="text-3xl font-bold text-[#050720] font-['Sora'] mt-2">{casualLeavesUsed}/14</p>
            </div>
          </div>

          {/* Approved / Cancelled Tab Card */}
          <div className="bg-white border border-[#050720]/10 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex gap-6 border-b border-[#050720]/10 pb-3 text-xs font-bold font-['Sora']">
              <button
                onClick={() => setLeaveTab('approved')}
                className={`pb-1 cursor-pointer ${leaveTab === 'approved' ? 'text-[#050720] border-b-2 border-[#FFB908]' : 'text-[#050720]/40'}`}
              >
                Approved
              </button>
              <button
                onClick={() => setLeaveTab('cancelled')}
                className={`pb-1 cursor-pointer ${leaveTab === 'cancelled' ? 'text-[#050720] border-b-2 border-[#FFB908]' : 'text-[#050720]/40'}`}
              >
                Cancelled / Rejected
              </button>
            </div>

            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#050720]/10 text-[#050720]/60 pb-3 font-semibold">
                  <th className="pb-3">Leave Type</th>
                  <th className="pb-3">Leave Date</th>
                  <th className="pb-3">Reason</th>
                  <th className="pb-3">Application Date</th>
                  <th className="pb-3">Status</th>
                  {leaveTab === 'cancelled' && <th className="pb-3 text-right">Action</th>}
                </tr>
              </thead>
              <tbody className="text-[#050720]">
                {leaveHistory
                  .filter((l) => (leaveTab === 'approved' ? l.status === 'Approved' : l.status === 'Rejected'))
                  .map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 font-medium">{item.leaveType}</td>
                      <td className="py-3.5">{item.leaveDate}</td>
                      <td className="py-3.5">{item.reason}</td>
                      <td className="py-3.5">{item.applicationDate}</td>
                      <td className="py-3.5">
                        <span className={item.status === 'Approved' ? 'text-emerald-600 font-semibold' : 'text-rose-500 font-semibold'}>
                          {item.status}
                        </span>
                      </td>
                      {leaveTab === 'cancelled' && (
                        <td className="py-3.5 text-right">
                          <button
                            onClick={() => setShowReapplyModal(true)}
                            className="px-3.5 py-1 border border-[#050720]/30 rounded text-[11px] font-semibold text-[#050720] hover:bg-slate-100 cursor-pointer"
                          >
                            Reapply
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                {leaveHistory.filter((l) => (leaveTab === 'approved' ? l.status === 'Approved' : l.status === 'Rejected')).length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-[#050720]/40">
                      No records found for this section.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Leave Record History Table */}
          <div className="bg-white border border-[#050720]/10 rounded-2xl p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-[#050720] font-['Sora']">Leave Record History</h2>
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#050720]/10 text-[#050720]/60 pb-3 font-semibold">
                  <th className="pb-3">Leave Type</th>
                  <th className="pb-3">Leave Date</th>
                  <th className="pb-3">Reason</th>
                  <th className="pb-3">Application Date</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#050720]/5 text-[#050720]">
                {leaveHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 font-medium">{item.leaveType}</td>
                    <td className="py-3.5">{item.leaveDate}</td>
                    <td className="py-3.5">{item.reason}</td>
                    <td className="py-3.5">{item.applicationDate}</td>
                    <td className="py-3.5">
                      <span className={item.status === 'Approved' ? 'text-emerald-600 font-semibold' : item.status === 'Rejected' ? 'text-rose-500 font-semibold' : 'text-amber-500 font-semibold'}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          SCREEN 5: APPLY FOR LEAVE
      ───────────────────────────────────────────────────────────── */}
      {view === 'applyLeave' && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setView('leaveRecords')} className="p-1 rounded hover:bg-slate-100 cursor-pointer">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-[#050720] font-['Sora']">Apply for leave</h1>
          </div>

          <form onSubmit={handleSubmitLeave} className="bg-white border border-[#050720]/10 rounded-2xl p-7 shadow-xs space-y-6">
            <h2 className="text-sm font-bold text-[#050720] font-['Sora']">Leave Details</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-[#050720]/60 mb-1.5">From date*</label>
                <input
                  type="date"
                  required
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full border border-[#050720]/15 rounded-lg px-3 py-2 text-xs text-[#050720] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#050720]/60 mb-1.5">To date*</label>
                <input
                  type="date"
                  required
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full border border-[#050720]/15 rounded-lg px-3 py-2 text-xs text-[#050720] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-[#050720]/60 mb-1.5">Leave type</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value as 'Casual' | 'Sick' | 'Vacation')}
                  className="w-full border border-[#050720]/15 rounded-lg px-3 py-2 text-xs text-[#050720] bg-white focus:outline-none"
                >
                  <option value="Casual">Casual</option>
                  <option value="Sick">Sick</option>
                  <option value="Vacation">Vacation</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#050720]/60 mb-1.5">Number of days</label>
                <input
                  type="text"
                  readOnly
                  value={calculateDays()}
                  className="w-full border border-[#050720]/15 rounded-lg px-3 py-2 text-xs text-[#050720] bg-slate-50 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#050720]/60 mb-1.5">Reason for Leave*</label>
              <textarea
                rows={4}
                required
                placeholder="Reason for Leave*"
                value={leaveReason}
                onChange={(e) => setLeaveReason(e.target.value)}
                className="w-full border border-[#050720]/15 rounded-lg p-3 text-xs text-[#050720] focus:outline-none resize-none"
              />
            </div>

            <div className="flex gap-4 pt-2">
              <button
                type="button"
                onClick={() => setView('leaveRecords')}
                className="flex-1 py-3 rounded-xl border border-[#050720]/20 text-xs font-semibold text-[#050720] hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 rounded-xl bg-[#FFB908] hover:bg-[#E5A707] text-xs font-bold text-[#050720] shadow-xs transition-colors cursor-pointer"
              >
                Submit leave request
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          SCREEN 6: REAPPLY FOR LEAVE MODAL
      ───────────────────────────────────────────────────────────── */}
      {showReapplyModal && (
        <div className="fixed inset-0 bg-[#050720]/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-7 shadow-xl border border-[#050720]/10 space-y-6">
            <div className="text-center">
              <h3 className="text-base font-bold text-[#050720] font-['Sora']">Reapply for leave</h3>
              <p className="text-[11px] text-[#050720]/60 mt-1">Please review the information before continuing.</p>
            </div>

            <div className="border border-[#050720]/10 rounded-xl p-5 space-y-4 text-xs">
              <h4 className="font-bold text-[#050720]">Application Overview</h4>
              <div className="grid grid-cols-2 gap-y-4">
                <div>
                  <span className="text-[10px] text-[#050720]/40 block">Leave from</span>
                  <p className="font-semibold text-[#050720]">01-02-2026</p>
                </div>
                <div>
                  <span className="text-[10px] text-[#050720]/40 block">Leave to</span>
                  <p className="font-semibold text-[#050720]">05-02-2026</p>
                </div>
                <div>
                  <span className="text-[10px] text-[#050720]/40 block">Total days</span>
                  <p className="font-semibold text-[#050720]">05</p>
                </div>
                <div>
                  <span className="text-[10px] text-[#050720]/40 block">Status</span>
                  <p className="font-semibold text-rose-500">Rejected</p>
                </div>
              </div>

              <input
                type="text"
                placeholder="Enter reason for reapplication..."
                value={reapplyReason}
                onChange={(e) => setReapplyReason(e.target.value)}
                className="w-full border border-[#050720]/15 rounded-lg px-3 py-2 text-xs text-[#050720] focus:outline-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowReapplyModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-[#050720]/20 text-xs font-semibold text-[#050720] hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowReapplyModal(false);
                  setShowSuccessModal(true);
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#FFB908] hover:bg-[#E5A707] text-xs font-bold text-[#050720] shadow-xs cursor-pointer"
              >
                Reapply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          SCREEN 7: LEAVE APPLICATION CONFIRMATION MODAL
      ───────────────────────────────────────────────────────────── */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-[#050720]/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl border border-[#050720]/10 text-center space-y-6">
            <div className="space-y-2">
              <h3 className="text-base font-bold text-[#050720] font-['Sora']">
                Your leave request has been sent to the admin
              </h3>
              <p className="text-xs text-[#050720]/60">
                The admin will review it and get back to you soon.
              </p>
            </div>
            <button
              onClick={() => {
                setShowSuccessModal(false);
                setView('leaveRecords');
              }}
              className="w-full py-3 rounded-xl bg-[#FFB908] hover:bg-[#E5A707] text-xs font-bold text-[#050720] shadow-xs transition-colors cursor-pointer"
            >
              Go Back
            </button>
          </div>
        </div>
      )}

    </div>
  );
};