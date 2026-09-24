import React, { useState } from 'react';
import { ArrowLeft, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';

interface EmployeeAttendance {
  id: string;
  srNo: string;
  employeeName: string;
  role: 'Faculty' | 'Salesperson' | 'Sales Manager';
  clockIn: string;
  clockOut: string;
  status: 'Present' | 'On Leave' | 'Absent';
  remarkStatus: string;
  remarkCourse: string;
  location?: string;
  clockOutLocation?: string;
  workingHours?: string;
  todayActivities?: { activity: string; timeSpent: string }[];
  leaveHistory: {
    id: string;
    leaveType: string;
    leaveDate: string;
    reason: string;
    applicationDate: string;
    status: 'Approved' | 'Rejected' | 'Pending';
  }[];
}

const INITIAL_EMPLOYEES: EmployeeAttendance[] = [
  {
    id: 'emp-1',
    srNo: '01',
    employeeName: 'Poorva Pande',
    role: 'Faculty',
    clockIn: '9:30 AM',
    clockOut: '-',
    status: 'Present',
    remarkStatus: '-',
    remarkCourse: 'No Code',
    location: 'Radiquolab Design Institute - 18.5075, 73.8216',
    clockOutLocation: '-',
    workingHours: '04:30 Hrs',
    todayActivities: [
      { activity: 'Conducted No-Code Demo', timeSpent: '02:00 Hrs' },
      { activity: 'Batch Lecture: UI Prototyping', timeSpent: '02:30 Hrs' }
    ],
    leaveHistory: [
      { id: 'l1', leaveType: 'Sick', leaveDate: '21-12-2025', reason: 'Flu Recovery', applicationDate: '20-12-2025', status: 'Approved' }
    ]
  },
  {
    id: 'emp-2',
    srNo: '02',
    employeeName: 'Neeraj Joshi',
    role: 'Faculty',
    clockIn: '9:30 AM',
    clockOut: '-',
    status: 'Present',
    remarkStatus: '-',
    remarkCourse: 'No Code',
    location: 'Radiquolab Design Institute - 18.5075, 73.8216',
    clockOutLocation: '-',
    workingHours: '04:30 Hrs',
    todayActivities: [
      { activity: 'Full-Stack Batch Class', timeSpent: '03:00 Hrs' }
    ],
    leaveHistory: [
      { id: 'l2', leaveType: 'Casual', leaveDate: '10-11-2025', reason: 'Personal', applicationDate: '08-11-2025', status: 'Approved' }
    ]
  },
  {
    id: 'emp-3',
    srNo: '03',
    employeeName: 'Sejal Singh',
    role: 'Salesperson',
    clockIn: '09:30 AM',
    clockOut: 'Yet to check-out',
    status: 'On Leave',
    remarkStatus: 'Sick Leave',
    remarkCourse: 'No Code',
    location: 'Radiquolab Design Institute - 18.5075, 73.8216',
    clockOutLocation: '-',
    workingHours: '-',
    todayActivities: [],
    leaveHistory: [
      { id: 'l3-1', leaveType: 'Sick', leaveDate: '21-12-2025', reason: 'Flu Recovery', applicationDate: '20-12-2025', status: 'Approved' },
      { id: 'l3-2', leaveType: 'Casual', leaveDate: '05-11-2025', reason: 'Personal', applicationDate: '01-11-2025', status: 'Rejected' },
      { id: 'l3-3', leaveType: 'Sick', leaveDate: '21-09-2025', reason: 'Flu Recovery', applicationDate: '20-09-2025', status: 'Approved' },
      { id: 'l3-4', leaveType: 'Vacation', leaveDate: '25-02-2025', reason: 'Personal', applicationDate: '20-02-2025', status: 'Approved' }
    ]
  }
];

// Exact courses from screenshot 1
const COURSES = [
  'Course',
  'UI/UX Design',
  'No Code',
  'Full Stack',
  'Portfolio',
  'React Native'
];

// All 12 calendar months for leave history filter
const ALL_MONTHS = [
  'Month',
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

export const AdminAttendancePage: React.FC = () => {
  const [view, setView] = useState<'roster' | 'details'>('roster');
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeAttendance>(INITIAL_EMPLOYEES[2]);
  
  // Sort / Filter state
  const [selectedCourse, setSelectedCourse] = useState('Course');
  const [isCourseDropdownOpen, setIsCourseDropdownOpen] = useState(false);
  const [historyMonth, setHistoryMonth] = useState('Month');

  const filteredEmployees = INITIAL_EMPLOYEES.filter((emp) => {
    if (selectedCourse === 'Course') return true;
    return emp.remarkCourse.toLowerCase().replace(/\s+/g, '') === selectedCourse.toLowerCase().replace(/\s+/g, '');
  });

  return (
    <div className="font-['Onest'] text-[#050720] pb-16">

      {/* ========================================================= */}
      {/* 1. ATTENDANCE MANAGEMENT ROSTER                           */}
      {/* ========================================================= */}
      {view === 'roster' && (
        <div className="space-y-6">
          <h1 className="text-2xl font-bold font-['Sora']">Attendance Management</h1>

          <div className="bg-white border border-[#050720]/10 rounded-xl p-6 shadow-xs space-y-4">
            
            {/* Sort by Course Dropdown (Screenshot 1) */}
            <div className="flex items-center gap-3 relative z-20">
              <span className="text-xs text-[#050720]/70 font-medium">Sort by:</span>
              
              <div className="relative">
                {!isCourseDropdownOpen ? (
                  <button
                    onClick={() => setIsCourseDropdownOpen(true)}
                    className="flex items-center justify-between gap-3 px-3 py-1.5 bg-white border border-[#050720]/20 rounded-lg text-xs font-medium min-w-[110px]"
                  >
                    <span>{selectedCourse}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-[#050720]/60" />
                  </button>
                ) : (
                  <div className="absolute left-0 top-0 w-36 bg-white border border-[#050720]/20 rounded-lg shadow-md py-1.5 z-30">
                    <div 
                      onClick={() => setIsCourseDropdownOpen(false)}
                      className="flex items-center justify-between px-3 py-1 text-xs font-medium cursor-pointer text-[#050720]"
                    >
                      <span>Course</span>
                      <ChevronUp className="w-3.5 h-3.5 text-[#050720]" />
                    </div>
                    <div className="mt-1 space-y-0.5">
                      {COURSES.filter((c) => c !== 'Course').map((course) => (
                        <button
                          key={course}
                          onClick={() => {
                            setSelectedCourse(course);
                            setIsCourseDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-1.5 text-xs transition-colors ${
                            selectedCourse === course 
                              ? 'font-bold text-[#050720] bg-slate-100' 
                              : 'text-[#050720]/80 hover:bg-slate-50'
                          }`}
                        >
                          {course}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Attendance Table */}
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#050720]/10 text-[#050720] font-bold">
                  <th className="pb-3.5 font-semibold">Sr. No.</th>
                  <th className="pb-3.5 font-semibold">Employee Name</th>
                  <th className="pb-3.5 font-semibold">Role</th>
                  <th className="pb-3.5 font-semibold">Clock In</th>
                  <th className="pb-3.5 font-semibold">Clock - out</th>
                  <th className="pb-3.5 font-semibold">Status</th>
                  <th className="pb-3.5 font-semibold">Remark</th>
                  <th className="pb-3.5 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#050720]/5 text-[#050720]">
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-[#FFB908]/5 transition-colors">
                    <td className="py-3.5 text-[#050720]/70">{emp.srNo}</td>
                    <td className="py-3.5 font-medium">{emp.employeeName}</td>
                    <td className="py-3.5 text-[#050720]/70">{emp.role}</td>
                    <td className="py-3.5 text-[#050720]/70">{emp.clockIn}</td>
                    <td className="py-3.5 text-[#050720]/70">{emp.clockOut}</td>
                    <td className="py-3.5">
                      <span className={`font-semibold ${
                        emp.status === 'Present' 
                          ? 'text-[#10B981]' 
                          : emp.status === 'On Leave' 
                          ? 'text-[#EF4444]' 
                          : 'text-[#050720]/60'
                      }`}>
                        {emp.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-[#050720]/70">
                      {emp.remarkStatus !== '-' ? (
                        <span>{emp.remarkStatus}</span>
                      ) : (
                        <span>{emp.remarkCourse}</span>
                      )}
                    </td>
                    <td className="py-3.5 text-right">
                      <button
                        onClick={() => {
                          setSelectedEmployee(emp);
                          setView('details');
                        }}
                        className="px-3 py-1 border border-[#050720]/30 rounded text-[11px] font-semibold text-[#050720] hover:bg-[#050720]/5 transition-colors"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
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

      {/* ========================================================= */}
      {/* 2. EMPLOYEE ATTENDANCE VIEW (SCREENSHOT 2)                */}
      {/* ========================================================= */}
      {view === 'details' && selectedEmployee && (
        <div className="space-y-6">
          <button
            onClick={() => setView('roster')}
            className="flex items-center gap-2 text-2xl font-bold font-['Sora'] hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="w-6 h-6 text-[#050720]" />
            <span>Attendance</span>
          </button>

          {/* Personal Details Card */}
          <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold font-['Sora']">Personal Details</h3>
            <div className="grid grid-cols-2 gap-y-4 text-xs">
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Name</span>
                <span className="font-semibold text-sm">{selectedEmployee.employeeName}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Role</span>
                <span className="font-semibold text-sm">{selectedEmployee.role}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">In time</span>
                <span className="font-semibold text-sm">{selectedEmployee.clockIn}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Out time</span>
                <span className="font-semibold text-sm">{selectedEmployee.clockOut}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Working Hours</span>
                <span className="font-semibold text-sm">{selectedEmployee.workingHours || '-'}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Clock - in Location</span>
                <span className="font-semibold text-xs text-[#050720]/80">
                  {selectedEmployee.location || '-'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Clock - out Location</span>
                <span className="font-semibold text-xs text-[#050720]/80">
                  {selectedEmployee.clockOutLocation || '-'}
                </span>
              </div>
            </div>
          </div>

          {/* Today's Activities Card */}
          <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-2">
            <h3 className="text-sm font-bold font-['Sora']">Today's Activities</h3>
            {selectedEmployee.todayActivities && selectedEmployee.todayActivities.length > 0 ? (
              <div className="space-y-3 pt-2">
                {selectedEmployee.todayActivities.map((act, index) => (
                  <div key={index} className="flex justify-between items-center py-1">
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
            ) : (
              <div className="pt-2">
                <p className="text-xs font-semibold text-[#050720]">No activities added yet.</p>
                <span className="text-[11px] text-[#0066FF] block mt-0.5">
                  Note: Activities will appear once the member adds them.
                </span>
              </div>
            )}
          </div>

          {/* Leave History Card (Screenshot 2) */}
          <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold font-['Sora'] text-[#050720]">Leave History</h3>
            
            {/* Month Dropdown aligned on the left under heading */}
            <div className="w-28 relative">
              <select
                value={historyMonth}
                onChange={(e) => setHistoryMonth(e.target.value)}
                className="w-full bg-[#F8FAFC] text-xs px-2.5 py-1.5 rounded-lg border border-[#050720]/15 appearance-none focus:outline-none"
              >
                {ALL_MONTHS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#050720]/50 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
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
                {selectedEmployee.leaveHistory.map((l) => (
                  <tr key={l.id} className="hover:bg-[#FFB908]/5 transition-colors">
                    <td className="py-3.5 font-medium">{l.leaveType}</td>
                    <td className="py-3.5 text-[#050720]/80">{l.leaveDate}</td>
                    <td className="py-3.5 text-[#050720]/80">{l.reason}</td>
                    <td className="py-3.5 text-[#050720]/80">{l.applicationDate}</td>
                    <td className="py-3.5 text-right">
                      <span className={`font-semibold ${
                        l.status === 'Approved' 
                          ? 'text-[#10B981]' 
                          : l.status === 'Rejected' 
                          ? 'text-[#EF4444]' 
                          : 'text-[#FFB908]'
                      }`}>
                        {l.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Centered Pagination matching Screenshot 2 */}
            <div className="flex items-center justify-center gap-3 pt-6 text-xs text-[#050720]/70">
              <button className="p-1 hover:text-[#050720]"><ChevronLeft className="w-3.5 h-3.5" /></button>
              <span className="text-[11px] font-semibold text-[#050720]">01 &nbsp;of&nbsp; 10</span>
              <button className="p-1 hover:text-[#050720]"><ChevronRight className="w-3.5 h-3.5" /></button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};