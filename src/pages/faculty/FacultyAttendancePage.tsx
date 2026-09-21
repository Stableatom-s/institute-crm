import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  Plus,
  MoreVertical,
  FileText
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────
   TYPES & MOCK DATA
───────────────────────────────────────────────────────────── */
interface ActivityItem {
  id: string;
  activity: string;
  timeSpent: string;
}

interface AttendanceRow {
  id: string;
  date: string;
  inTime: string;
  outTime: string;
  workingHours: string;
}

interface LeaveHistoryItem {
  id: string;
  leaveType: string;
  leaveDate: string;
  reason: string;
  applicationDate: string;
  status: 'Approved' | 'Rejected';
  rejectedReason?: string;
  totalDays?: number;
  leaveToDate?: string;
}

const INITIAL_ACTIVITIES: ActivityItem[] = [
  { id: '1', activity: 'Lecture MWF-JAN-2026', timeSpent: '01:00 Hrs' },
  { id: '2', activity: 'Assignment Review', timeSpent: '03:00 Hrs' },
  { id: '3', activity: 'Lecture MWF-DEC-2025', timeSpent: '01:00 Hrs' },
  { id: '4', activity: 'Assignment Review', timeSpent: '02:00 Hrs' },
  { id: '5', activity: 'Project Work', timeSpent: '02:00 Hrs' },
];

const ATTENDANCE_HISTORY: AttendanceRow[] = [
  { id: '1', date: '01-12-2025', inTime: '09:30 AM', outTime: '07:30 PM', workingHours: '09:00' },
  { id: '2', date: '02-12-2025', inTime: '08:30 AM', outTime: '07:30 PM', workingHours: '08:00' },
  { id: '3', date: '03-12-2025', inTime: '09:40 AM', outTime: '07:40 PM', workingHours: '09:00' },
  { id: '4', date: '04-12-2025', inTime: '09:40 AM', outTime: '07:40 PM', workingHours: '09:00' },
  { id: '5', date: '05-12-2025', inTime: '09:38 AM', outTime: '07:39 PM', workingHours: '08:00' },
];

const INITIAL_LEAVE_HISTORY: LeaveHistoryItem[] = [
  { id: '1', leaveType: 'Sick', leaveDate: '21-12-2025', reason: 'Flu Recovery', applicationDate: '20-12-2025', status: 'Approved' },
  { id: '2', leaveType: 'Casual', leaveDate: '05-11-2025', reason: 'Personal', applicationDate: '01-11-2025', status: 'Approved' },
  { id: '3', leaveType: 'Sick', leaveDate: '21-09-2025', reason: 'Flu Recovery', applicationDate: '20-09-2025', status: 'Approved' },
  { id: '4', leaveType: 'Vacation', leaveDate: '25-02-2025', reason: 'Personal', applicationDate: '20-02-2025', status: 'Approved' },
];

export const FacultyAttendancePage: React.FC = () => {
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
  const [inTime] = useState('09:30 AM');
  const [isClockedOut, setIsClockedOut] = useState(false);
  const [activities, setActivities] = useState<ActivityItem[]>(INITIAL_ACTIVITIES);
  const [selectedActivity, setSelectedActivity] = useState('');
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [activityDetails, setActivityDetails] = useState('');
  const [selectedWorkDate, setSelectedWorkDate] = useState('01-12-2025');

  // Leave State
  const [leaveTab, setLeaveTab] = useState<'approved' | 'cancelled'>('cancelled');
  const [leaveHistory] = useState<LeaveHistoryItem[]>(INITIAL_LEAVE_HISTORY);
  const [showReapplyModal, setShowReapplyModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [reapplyReason, setReapplyReason] = useState('');

  // Apply Leave Form
  const [fromDate, setFromDate] = useState('2026-02-01');
  const [toDate, setToDate] = useState('2026-02-05');
  const [leaveType, setLeaveType] = useState('Casual');
  const [leaveReason, setLeaveReason] = useState('');

  const handleAddActivity = () => {
    if (!selectedActivity || (!hours && !minutes)) return;
    const timeSpentString = `${hours || '00'}:${minutes || '00'} Hrs`;
    setActivities([
      { id: Date.now().toString(), activity: selectedActivity, timeSpent: timeSpentString },
      ...activities
    ]);
    setSelectedActivity('');
    setHours('');
    setMinutes('');
    setActivityDetails('');
  };

  const handleSubmitLeave = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuccessModal(true);
  };

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
                  <p className="font-semibold text-[#050720] text-sm">{inTime}</p>
                </div>
                <div>
                  <span className="text-[10px] text-[#050720]/50 block mb-0.5">Out time</span>
                  <p className="font-semibold text-[#050720]/70 text-sm">
                    {isClockedOut ? '07:30 PM' : 'Yet to clock out'}
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
            <div className="flex gap-3">
              <div className="flex-1">
                <select 
                  value={selectedActivity}
                  onChange={(e) => setSelectedActivity(e.target.value)}
                  className="w-full border border-[#050720]/15 rounded-lg px-3 py-2 text-xs text-[#050720] bg-white focus:outline-none"
                >
                  <option value="">Select Activity</option>
                  <option value="Lecture MWF-JAN-2026">Lecture MWF-JAN-2026</option>
                  <option value="Assignment Review">Assignment Review</option>
                  <option value="Project Work">Project Work</option>
                </select>
              </div>
              <div className="w-28">
                <select 
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  className="w-full border border-[#050720]/15 rounded-lg px-3 py-2 text-xs text-[#050720] bg-white focus:outline-none"
                >
                  <option value="">Hours</option>
                  <option value="01">01</option>
                  <option value="02">02</option>
                  <option value="03">03</option>
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
                  <option value="30">30</option>
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
              className="w-full border border-[#050720]/15 rounded-lg p-3 text-xs text-[#050720] focus:outline-none"
            />
          </div>

          {/* Today's Activities List */}
          <div className="bg-white border border-[#050720]/10 rounded-2xl p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-[#050720] font-['Sora']">Today's Activities</h2>
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
          </div>

          {/* Month Attendance Table */}
          <div className="bg-white border border-[#050720]/10 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="w-32">
              <select className="border border-[#050720]/15 rounded-md px-3 py-1 text-xs text-[#050720] bg-white focus:outline-none">
                <option>Month</option>
                <option>December 2025</option>
              </select>
            </div>
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
                {ATTENDANCE_HISTORY.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50">
                    <td className="py-3.5">{row.date}</td>
                    <td className="py-3.5">{row.inTime}</td>
                    <td className="py-3.5">{row.outTime}</td>
                    <td className="py-3.5">{row.workingHours}</td>
                    <td className="py-3.5 text-right">
                      <button 
                        onClick={() => {
                          setSelectedWorkDate(row.date);
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
                <p className="font-semibold text-sm text-[#050720]">Poorva</p>
              </div>
              <div>
                <span className="text-[11px] text-[#050720]/50 block mb-0.5">Role</span>
                <p className="font-semibold text-sm text-[#050720]">Faculty</p>
              </div>
              <div>
                <span className="text-[11px] text-[#050720]/50 block mb-0.5">In time</span>
                <p className="font-semibold text-sm text-[#050720]">09:30 AM</p>
              </div>
              <div>
                <span className="text-[11px] text-[#050720]/50 block mb-0.5">Out time</span>
                <p className="font-semibold text-sm text-[#050720]">07:30 PM</p>
              </div>
              <div>
                <span className="text-[11px] text-[#050720]/50 block mb-0.5">Working Hours</span>
                <p className="font-semibold text-sm text-[#050720]">09:00 Hrs</p>
              </div>
              <div>
                <span className="text-[11px] text-[#050720]/50 block mb-0.5">Location</span>
                <p className="font-semibold text-sm text-[#050720]">
                  Radiquolab Design Institute • 18.5075, 73.8216
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#050720]/10 rounded-2xl p-7 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-[#050720] font-['Sora']">Today's Activities</h2>
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
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setView('attendance')}
              className="flex-1 py-3 rounded-xl border border-[#050720]/20 text-xs font-semibold text-[#050720] hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setIsClockedOut(true);
                setView('attendance');
              }}
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
              <span className="text-[11px] text-[#050720]/50 block mt-0.5">{selectedWorkDate}</span>
            </div>

            <div className="divide-y divide-[#050720]/5 text-xs">
              {activities.map((act) => (
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
              onClick={() => setView('applyLeave')}
              className="bg-[#FFB908] hover:bg-[#E5A707] text-[#050720] font-bold text-xs px-5 py-2.5 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              Apply for leave
            </button>
          </div>

          {/* Leave Quota Cards */}
          <div className="grid grid-cols-2 gap-5">
            <div className="bg-white border border-[#050720]/10 rounded-2xl p-6 text-center shadow-xs">
              <span className="text-xs font-semibold text-[#050720]/70">Sick Leaves</span>
              <p className="text-3xl font-bold text-[#050720] font-['Sora'] mt-2">5/10</p>
            </div>
            <div className="bg-white border border-[#050720]/10 rounded-2xl p-6 text-center shadow-xs">
              <span className="text-xs font-semibold text-[#050720]/70">Casual Leaves</span>
              <p className="text-3xl font-bold text-[#050720] font-['Sora'] mt-2">6/14</p>
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
                Cancelled
              </button>
            </div>

            <div className="w-32">
              <select className="border border-[#050720]/15 rounded-md px-3 py-1 text-xs text-[#050720] bg-white focus:outline-none">
                <option>Leave Type</option>
                <option>Casual</option>
                <option>Sick</option>
              </select>
            </div>

            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#050720]/10 text-[#050720]/60 pb-3 font-semibold">
                  <th className="pb-3">Leave Type</th>
                  <th className="pb-3">Leave Date</th>
                  <th className="pb-3">Reason</th>
                  <th className="pb-3">Application Date</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="text-[#050720]">
                {leaveTab === 'cancelled' ? (
                  <tr className="hover:bg-slate-50">
                    <td className="py-3.5 font-medium">Casual</td>
                    <td className="py-3.5">01-02-2026</td>
                    <td className="py-3.5">Personal</td>
                    <td className="py-3.5">05-02-2025</td>
                    <td className="py-3.5 text-rose-500 font-semibold">Rejected</td>
                    <td className="py-3.5 text-right">
                      <button 
                        onClick={() => setShowReapplyModal(true)}
                        className="px-3.5 py-1 border border-[#050720]/30 rounded text-[11px] font-semibold text-[#050720] hover:bg-slate-100 cursor-pointer"
                      >
                        Reapply
                      </button>
                    </td>
                  </tr>
                ) : (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-[#050720]/40">
                      No active leaves currently approved.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Leave Record History Table */}
          <div className="bg-white border border-[#050720]/10 rounded-2xl p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-[#050720] font-['Sora']">Leave Record History</h2>
            <div className="w-32">
              <select className="border border-[#050720]/15 rounded-md px-3 py-1 text-xs text-[#050720] bg-white focus:outline-none">
                <option>Leave Type</option>
                <option>Sick</option>
                <option>Casual</option>
              </select>
            </div>

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
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="py-3.5 font-medium">{item.leaveType}</td>
                    <td className="py-3.5">{item.leaveDate}</td>
                    <td className="py-3.5">{item.reason}</td>
                    <td className="py-3.5">{item.applicationDate}</td>
                    <td className="py-3.5 text-emerald-600 font-semibold">{item.status}</td>
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
                  onChange={(e) => setLeaveType(e.target.value)}
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
                  value="05"
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
                className="w-full border border-[#050720]/15 rounded-lg p-3 text-xs text-[#050720] focus:outline-none"
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
                  <p className="font-semibold text-[#050720]">05-02-2025</p>
                </div>
                <div>
                  <span className="text-[10px] text-[#050720]/40 block">Total days</span>
                  <p className="font-semibold text-[#050720]">05</p>
                </div>
                <div>
                  <span className="text-[10px] text-[#050720]/40 block">Rejected by admin</span>
                  <p className="font-semibold text-rose-500">Insufficient team coverage</p>
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