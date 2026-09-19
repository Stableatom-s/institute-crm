import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  ChevronLeft, 
  ChevronRight, 
  Search,
  Video
} from 'lucide-react';

// --- TYPES ---
export type DemoTab = 'Scheduled' | 'Completed' | 'Cancelled';

export interface DemoItem {
  id: string;
  srNo: string;
  name: string;
  lastName?: string;
  contactNo: string;
  address?: string;
  timeSlot: string;
  demoDate: string;
  course: string;
  mode: 'Online' | 'Offline';
  faculty: string;
  status: DemoTab;
  demoStatusText?: string;
  remark?: string;
  cancellationReason?: string;
  feedback?: string;
}

// --- MOCK SEED DATA ---
const INITIAL_SCHEDULED_DEMOS: DemoItem[] = [
  { id: 'd-1', srNo: '01', name: 'Aanya', lastName: 'Shah', contactNo: '9078675645', address: 'Pune', timeSlot: '11:00 - 12:00', demoDate: '21-12-2025', course: 'UI/UX Design', mode: 'Online', faculty: 'Tanmay Kalbhor', status: 'Scheduled' },
  { id: 'd-2', srNo: '02', name: 'Rohan', lastName: 'Mehta', contactNo: '9123456565', address: 'Mumbai', timeSlot: '01:00 - 02:00', demoDate: '21-12-2025', course: 'No Code', mode: 'Online', faculty: 'Poorva Pande', status: 'Scheduled' },
  { id: 'd-3', srNo: '03', name: 'Neha', lastName: 'Patel', contactNo: '9767564995', address: 'Pune', timeSlot: '03:00 - 04:00', demoDate: '21-12-2025', course: 'UI/UX Design', mode: 'Offline', faculty: 'Tanmay Kalbhor', status: 'Scheduled' },
  { id: 'd-4', srNo: '04', name: 'Anish', lastName: 'Verma', contactNo: '9845123478', address: 'Nashik', timeSlot: '03:00 - 04:00', demoDate: '21-12-2025', course: 'Portfolio', mode: 'Offline', faculty: 'Poorva Pande', status: 'Scheduled' },
  { id: 'd-5', srNo: '05', name: 'Siddhi', lastName: 'Shah', contactNo: '9923847581', address: 'Pune', timeSlot: '01:00 - 02:00', demoDate: '21-12-2025', course: 'Full-Stack', mode: 'Online', faculty: 'Neeraj Joshi', status: 'Scheduled' },
];

const INITIAL_COMPLETED_DEMOS: DemoItem[] = [
  { id: 'cd-1', srNo: '01', name: 'Rohit', lastName: 'Shah', contactNo: '9845612378', address: 'Pune', timeSlot: '11:00 - 12:00', demoDate: '21-12-2025', course: 'UI/UX Design', mode: 'Online', faculty: 'Tanmay Kalbhor', status: 'Completed', demoStatusText: 'Attended', remark: 'Joining soon', feedback: 'Student showed strong interest in the course structure and tools. Asked relevant questions about projects and placement support. Recommended for follow-up within 24 hours.' },
  { id: 'cd-2', srNo: '02', name: 'Ashish', lastName: 'Mehta', contactNo: '9928475812', address: 'Pune', timeSlot: '11:00 - 12:00', demoDate: '21-12-2025', course: 'UI/UX Design', mode: 'Online', faculty: 'Tanmay Kalbhor', status: 'Completed', demoStatusText: 'Attended', remark: 'Joining soon', feedback: 'Good conceptual clarity. Wants portfolio guidance.' },
  { id: 'cd-3', srNo: '03', name: 'Anush', lastName: 'Shah', contactNo: '9784561234', address: 'Nagpur', timeSlot: '11:00 - 12:00', demoDate: '21-12-2025', course: 'UI/UX Design', mode: 'Online', faculty: 'Tanmay Kalbhor', status: 'Completed', demoStatusText: 'Attended', remark: 'Joining soon', feedback: 'Deciding between weekday or weekend batch.' },
];

const INITIAL_CANCELLED_DEMOS: DemoItem[] = [
  { id: 'can-1', srNo: '01', name: 'Aanya', lastName: 'Shah', contactNo: '9078675645', address: 'Pune', timeSlot: '11:00 - 12:00', demoDate: '21-12-2025', course: 'UI/UX Design', mode: 'Online', faculty: 'Tanmay Kalbhor', status: 'Cancelled', cancellationReason: 'No Response from Student' },
  { id: 'can-2', srNo: '02', name: 'Rohan', lastName: 'Mehta', contactNo: '9123456565', address: 'Mumbai', timeSlot: '01:00 - 02:00', demoDate: '21-12-2025', course: 'No Code', mode: 'Online', faculty: 'Poorva Pande', status: 'Cancelled', cancellationReason: 'Student had personal emergency' },
  { id: 'can-3', srNo: '03', name: 'Neha', lastName: 'Patel', contactNo: '9767564995', address: 'Pune', timeSlot: '03:00 - 04:00', demoDate: '21-12-2025', course: 'UI/UX Design', mode: 'Offline', faculty: 'Tanmay Kalbhor', status: 'Cancelled', cancellationReason: 'Timings conflicted with college exams' },
  { id: 'can-4', srNo: '04', name: 'Anish', lastName: 'Verma', contactNo: '9845123478', address: 'Nashik', timeSlot: '03:00 - 04:00', demoDate: '21-12-2025', course: 'Portfolio', mode: 'Offline', faculty: 'Poorva Pande', status: 'Cancelled', cancellationReason: 'Fee discussion pending' },
  { id: 'can-5', srNo: '05', name: 'Siddhi', lastName: 'Shah', contactNo: '9923847581', address: 'Pune', timeSlot: '01:00 - 02:00', demoDate: '21-12-2025', course: 'Full-Stack', mode: 'Online', faculty: 'Neeraj Joshi', status: 'Cancelled', cancellationReason: 'Requested reschedule for next week' },
];

const COURSES = ['All', 'UI/UX Design', 'No Code', 'Portfolio', 'Full-Stack', 'React Native'];
const FACULTIES = ['Tanmay Kalbhor', 'Poorva Pande', 'Neeraj Joshi'];
const TIME_SLOTS = ['11:00 - 12:00', '01:00 - 02:00', '03:00 - 04:00', '05:00 - 06:00'];

export const DemoManagementPage: React.FC = () => {
  // Navigation views: 'table' | 'schedule-form' | 'reschedule-form' | 'details'
  const [view, setView] = useState<'table' | 'schedule-form' | 'reschedule-form' | 'details'>('table');
  const [activeTab, setActiveTab] = useState<DemoTab>('Scheduled');

  // Master lists
  const [scheduledList, setScheduledList] = useState<DemoItem[]>(INITIAL_SCHEDULED_DEMOS);
  const [completedList] = useState<DemoItem[]>(INITIAL_COMPLETED_DEMOS);
  const [cancelledList, setCancelledList] = useState<DemoItem[]>(INITIAL_CANCELLED_DEMOS);

  // Active item in detail / reschedule view
  const [selectedDemo, setSelectedDemo] = useState<DemoItem>(INITIAL_SCHEDULED_DEMOS[0]);

  // Dropdown Sort Filters
  const [filterMode, setFilterMode] = useState<string>('All');
  const [filterCourse, setFilterCourse] = useState<string>('All');
  const [isModeDropdownOpen, setIsModeDropdownOpen] = useState(false);
  const [isCourseDropdownOpen, setIsCourseDropdownOpen] = useState(false);

  // Form State (Schedule & Reschedule)
  const [leadSearchQuery, setLeadSearchQuery] = useState('');
  const [selectedLeadData, setSelectedLeadData] = useState<{
    firstName: string;
    lastName: string;
    mobile: string;
    address: string;
  } | null>(null);

  const [formCourse, setFormCourse] = useState('');
  const [formFaculty, setFormFaculty] = useState('Tanmay Kalbhor');
  const [formDate, setFormDate] = useState('2026-01-12');
  const [formTimeSlot, setFormTimeSlot] = useState('11:00 - 12:00');
  const [formMode, setFormMode] = useState<'Online' | 'Offline'>('Online');
  const [courseError, setCourseError] = useState(false);

  // Modals
  const [showScheduleSuccessModal, setShowScheduleSuccessModal] = useState(false);
  const [showRescheduleSuccessModal, setShowRescheduleSuccessModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellationReasonInput, setCancellationReasonInput] = useState('');

  // Active Tab list
  const currentList = 
    activeTab === 'Scheduled' 
      ? scheduledList 
      : activeTab === 'Completed' 
      ? completedList 
      : cancelledList;

  // Filtered dataset
  const filteredList = currentList.filter((item) => {
    const matchMode = filterMode === 'All' || item.mode.toLowerCase() === filterMode.toLowerCase();
    const matchCourse = filterCourse === 'All' || item.course.toLowerCase() === filterCourse.toLowerCase();
    return matchMode && matchCourse;
  });

  // Handle lead search autofill
  const handleLeadSearchChange = (val: string) => {
    setLeadSearchQuery(val);
    if (val.toLowerCase().includes('aanya') || val.includes('9078675645')) {
      setSelectedLeadData({
        firstName: 'Aanya',
        lastName: 'Shah',
        mobile: '9078675645',
        address: 'Pune',
      });
    } else {
      setSelectedLeadData(null);
    }
  };

  // Prepopulate and launch Reschedule screen
  const handleStartReschedule = (demo: DemoItem) => {
    setSelectedDemo(demo);
    setLeadSearchQuery(`${demo.contactNo} - ${demo.name} ${demo.lastName || 'Shah'}`);
    setSelectedLeadData({
      firstName: demo.name,
      lastName: demo.lastName || 'Shah',
      mobile: demo.contactNo,
      address: demo.address || 'Pune',
    });
    setFormCourse(demo.course);
    setFormFaculty(demo.faculty);
    setFormDate(demo.demoDate);
    setFormTimeSlot(demo.timeSlot);
    setFormMode(demo.mode);
    setCourseError(false);
    setView('reschedule-form');
  };

  // Submit Schedule Form
  const handleSubmitSchedule = () => {
    if (!formCourse) {
      setCourseError(true);
      return;
    }
    setCourseError(false);

    const newDemo: DemoItem = {
      id: `demo-${Date.now()}`,
      srNo: String(scheduledList.length + 1).padStart(2, '0'),
      name: selectedLeadData ? selectedLeadData.firstName : 'Aanya',
      lastName: selectedLeadData ? selectedLeadData.lastName : 'Shah',
      contactNo: selectedLeadData ? selectedLeadData.mobile : '9078675645',
      address: selectedLeadData ? selectedLeadData.address : 'Pune',
      timeSlot: formTimeSlot,
      demoDate: formDate,
      course: formCourse,
      mode: formMode,
      faculty: formFaculty,
      status: 'Scheduled',
    };

    setScheduledList([newDemo, ...scheduledList]);
    setSelectedDemo(newDemo);
    setShowScheduleSuccessModal(true);
  };

  // Submit Reschedule Form
  const handleSubmitReschedule = () => {
    if (!formCourse) {
      setCourseError(true);
      return;
    }
    setCourseError(false);

    const updatedDemo: DemoItem = {
      ...selectedDemo,
      course: formCourse,
      faculty: formFaculty,
      demoDate: formDate || '21-12-2025',
      timeSlot: formTimeSlot || '11:00 - 12:00',
      mode: formMode,
      status: 'Scheduled',
    };

    // If it was cancelled, move back to scheduled
    if (selectedDemo.status === 'Cancelled') {
      setCancelledList(cancelledList.filter((d) => d.id !== selectedDemo.id));
      setScheduledList([updatedDemo, ...scheduledList]);
    } else {
      setScheduledList(scheduledList.map((d) => (d.id === selectedDemo.id ? updatedDemo : d)));
    }

    setSelectedDemo(updatedDemo);
    setShowRescheduleSuccessModal(true);
  };

  // Confirm Cancellation
  const handleConfirmCancel = () => {
    if (!selectedDemo) return;
    const updatedDemo: DemoItem = {
      ...selectedDemo,
      status: 'Cancelled',
      cancellationReason: cancellationReasonInput || 'No Response from Student',
    };

    setScheduledList(scheduledList.filter((d) => d.id !== selectedDemo.id));
    setCancelledList([updatedDemo, ...cancelledList]);
    setSelectedDemo(updatedDemo);
    setShowCancelModal(false);
    setCancellationReasonInput('');
  };

  return (
    <div className="font-['Onest'] text-[#050720] pb-16">

      {/* ========================================================= */}
      {/* 1. TABLE VIEW                                             */}
      {/* ========================================================= */}
      {view === 'table' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold font-['Sora']">Demo Management</h1>
            <button
              onClick={() => {
                setLeadSearchQuery('');
                setSelectedLeadData(null);
                setFormCourse('');
                setCourseError(false);
                setView('schedule-form');
              }}
              className="flex items-center gap-2 px-4 py-2 bg-[#FFB908] hover:bg-[#E5A607] rounded-lg text-xs font-bold text-[#050720] transition-colors shadow-xs"
            >
              <Calendar className="w-4 h-4" />
              <span>Schedule Demo</span>
            </button>
          </div>

          <div className="bg-white border border-[#050720]/10 rounded-xl p-6 shadow-xs">
            {/* Tabs */}
            <div className="flex items-center gap-8 border-b border-[#050720]/10 pb-3">
              {(['Scheduled', 'Completed', 'Cancelled'] as DemoTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setFilterMode('All');
                    setFilterCourse('All');
                  }}
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

            {/* Filters */}
            <div className="flex items-center gap-3 mt-5 mb-4 relative z-10">
              <span className="text-xs text-[#050720]/70 font-medium">Sort by:</span>

              {/* Mode Filter */}
              <div className="relative">
                <button
                  onClick={() => {
                    setIsModeDropdownOpen(!isModeDropdownOpen);
                    setIsCourseDropdownOpen(false);
                  }}
                  className="flex items-center justify-between gap-3 px-3 py-1.5 bg-[#F8FAFC] border border-[#050720]/15 rounded-lg text-xs font-medium min-w-[90px]"
                >
                  <span>{filterMode === 'All' ? 'Mode' : filterMode}</span>
                  {isModeDropdownOpen ? <ChevronUp className="w-3.5 h-3.5 text-[#050720]/50" /> : <ChevronDown className="w-3.5 h-3.5 text-[#050720]/50" />}
                </button>
                {isModeDropdownOpen && (
                  <div className="absolute left-0 top-9 w-32 bg-white border border-[#050720]/15 rounded-lg shadow-lg py-1">
                    {['All', 'Online', 'Offline'].map((m) => (
                      <button
                        key={m}
                        onClick={() => {
                          setFilterMode(m);
                          setIsModeDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs hover:bg-[#FFB908]/15 text-[#050720]"
                      >
                        {m}
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
                    setIsModeDropdownOpen(false);
                  }}
                  className="flex items-center justify-between gap-3 px-3 py-1.5 bg-[#F8FAFC] border border-[#050720]/15 rounded-lg text-xs font-medium min-w-[100px]"
                >
                  <span>{filterCourse === 'All' ? 'Course' : filterCourse}</span>
                  {isCourseDropdownOpen ? <ChevronUp className="w-3.5 h-3.5 text-[#050720]/50" /> : <ChevronDown className="w-3.5 h-3.5 text-[#050720]/50" />}
                </button>
                {isCourseDropdownOpen && (
                  <div className="absolute left-0 top-9 w-40 bg-white border border-[#050720]/15 rounded-lg shadow-lg py-1">
                    {COURSES.map((c) => (
                      <button
                        key={c}
                        onClick={() => {
                          setFilterCourse(c);
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
                  {activeTab === 'Completed' && (
                    <>
                      <th className="pb-3.5 font-semibold">Demo Status</th>
                      <th className="pb-3.5 font-semibold">Remark</th>
                    </>
                  )}
                  <th className="pb-3.5 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#050720]/5 text-[#050720]">
                {filteredList.map((demo) => (
                  <tr key={demo.id} className="hover:bg-[#FFB908]/5 transition-colors">
                    <td className="py-3.5 text-[#050720]/70">{demo.srNo}</td>
                    <td className="py-3.5 font-medium">{demo.name} {demo.lastName}</td>
                    <td className="py-3.5 text-[#050720]/70">{demo.timeSlot}</td>
                    <td className="py-3.5 text-[#050720]/70">{demo.demoDate}</td>
                    <td className="py-3.5 text-[#050720]/70">{demo.course}</td>
                    <td className="py-3.5 text-[#050720]/70">{demo.mode}</td>
                    <td className="py-3.5 text-[#050720]/70">{demo.faculty}</td>
                    {activeTab === 'Completed' && (
                      <>
                        <td className="py-3.5 font-semibold text-[#050720]">{demo.demoStatusText || 'Attended'}</td>
                        <td className="py-3.5 text-[#050720]/70">{demo.remark || 'Joining soon'}</td>
                      </>
                    )}
                    <td className="py-3.5 text-right">
                      <button
                        onClick={() => {
                          setSelectedDemo(demo);
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
      {/* 2. SCHEDULE DEMO VIEW                                     */}
      {/* ========================================================= */}
      {view === 'schedule-form' && (
        <div className="space-y-6 max-w-4xl">
          <button
            onClick={() => setView('table')}
            className="flex items-center gap-2 text-2xl font-bold font-['Sora'] hover:opacity-80 transition-opacity"
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
                placeholder="Search leads by name/contact (type 'Aanya' or '9078675645')"
                onChange={(e) => handleLeadSearchChange(e.target.value)}
                className="w-full bg-[#F8FAFC] text-xs px-3.5 py-2.5 pr-10 rounded-lg border border-[#050720]/15 focus:outline-none focus:border-[#050720]"
              />
              <Search className="w-4 h-4 text-[#050720]/40 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {selectedLeadData && (
              <div className="pt-3 border-t border-[#050720]/10 space-y-3">
                <h4 className="text-xs font-bold font-['Sora']">Student Overview</h4>
                <div className="grid grid-cols-2 gap-y-3 text-xs">
                  <div>
                    <span className="text-[10px] text-[#050720]/50 block">First Name</span>
                    <span className="font-semibold text-sm">{selectedLeadData.firstName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#050720]/50 block">Last Name</span>
                    <span className="font-semibold text-sm">{selectedLeadData.lastName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#050720]/50 block">Mobile</span>
                    <span className="font-semibold text-sm">{selectedLeadData.mobile}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#050720]/50 block">Address</span>
                    <span className="font-semibold text-sm">{selectedLeadData.address}</span>
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
                      courseError ? 'border-rose-500 ring-1 ring-rose-500' : 'border-[#050720]/15'
                    } focus:outline-none`}
                  >
                    <option value="">Course*</option>
                    {COURSES.filter(c => c !== 'All').map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-[#050720]/40 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                {courseError && (
                  <span className="text-[10px] font-semibold text-rose-500 mt-1 block">This field is required*</span>
                )}
              </div>

              <div className="relative">
                <select
                  value={formFaculty}
                  onChange={(e) => setFormFaculty(e.target.value)}
                  className="w-full bg-[#F8FAFC] text-xs px-3.5 py-2.5 rounded-lg border border-[#050720]/15 appearance-none focus:outline-none"
                >
                  {FACULTIES.map((f) => (
                    <option key={f} value={f}>{f}</option>
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
                  className="w-full bg-[#F8FAFC] text-xs px-3.5 py-2.5 rounded-lg border border-[#050720]/15 appearance-none focus:outline-none"
                >
                  {TIME_SLOTS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <Clock className="w-3.5 h-3.5 text-[#050720]/40 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
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
                  checked={formMode === 'Online'}
                  onChange={() => setFormMode('Online')}
                  className="w-4 h-4 accent-[#FFB908]"
                />
                <span className="font-medium">Online</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="radio"
                  name="demoMode"
                  checked={formMode === 'Offline'}
                  onChange={() => setFormMode('Offline')}
                  className="w-4 h-4 accent-[#FFB908]"
                />
                <span className="font-medium">Offline</span>
              </label>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setView('table')}
              className="flex-1 py-2.5 bg-white border border-[#050720]/20 rounded-lg text-xs font-bold hover:bg-[#050720]/5 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitSchedule}
              className="flex-1 py-2.5 bg-[#FFB908] hover:bg-[#E5A607] rounded-lg text-xs font-bold text-[#050720] transition-colors shadow-xs flex items-center justify-center gap-1.5"
            >
              <Calendar className="w-4 h-4" />
              <span>Schedule Demo</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. RESCHEDULE DEMO VIEW (EXACT FIGMA LAYOUT)              */}
      {/* ========================================================= */}
      {view === 'reschedule-form' && (
        <div className="space-y-6 max-w-4xl">
          <button
            onClick={() => setView('details')}
            className="flex items-center gap-2 text-2xl font-bold font-['Sora'] hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="w-6 h-6 text-[#050720]" />
            <span>Reschedule Demo</span>
          </button>

          {/* Select Lead (Pre-filled for Reschedule) */}
          <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold font-['Sora']">Select Lead</h3>
            
            <div className="relative">
              <input
                type="text"
                value={leadSearchQuery}
                onChange={(e) => handleLeadSearchChange(e.target.value)}
                className="w-full bg-[#F8FAFC] text-xs px-3.5 py-2.5 pr-10 rounded-lg border border-[#050720]/15 focus:outline-none focus:border-[#050720]"
              />
              <Search className="w-4 h-4 text-[#050720]/40 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <div className="pt-3 border-t border-[#050720]/10 space-y-3">
              <h4 className="text-xs font-bold font-['Sora']">Student Overview</h4>
              <div className="grid grid-cols-2 gap-y-3 text-xs">
                <div>
                  <span className="text-[10px] text-[#050720]/50 block">First Name</span>
                  <span className="font-semibold text-sm">{selectedLeadData?.firstName || selectedDemo.name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#050720]/50 block">Last Name</span>
                  <span className="font-semibold text-sm">{selectedLeadData?.lastName || selectedDemo.lastName || 'Shah'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#050720]/50 block">Mobile</span>
                  <span className="font-semibold text-sm">{selectedLeadData?.mobile || selectedDemo.contactNo}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#050720]/50 block">Address</span>
                  <span className="font-semibold text-sm">{selectedLeadData?.address || selectedDemo.address || 'Pune'}</span>
                </div>
              </div>
            </div>
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
                      courseError ? 'border-rose-500 ring-1 ring-rose-500' : 'border-[#050720]/15'
                    } focus:outline-none`}
                  >
                    <option value="">Course*</option>
                    {COURSES.filter(c => c !== 'All').map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-[#050720]/40 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                {courseError && (
                  <span className="text-[10px] font-semibold text-rose-500 mt-1 block">This field is required*</span>
                )}
              </div>

              <div className="relative">
                <select
                  value={formFaculty}
                  onChange={(e) => setFormFaculty(e.target.value)}
                  className="w-full bg-[#F8FAFC] text-xs px-3.5 py-2.5 rounded-lg border border-[#050720]/15 appearance-none focus:outline-none"
                >
                  {FACULTIES.map((f) => (
                    <option key={f} value={f}>{f}</option>
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
                  className="w-full bg-[#F8FAFC] text-xs px-3.5 py-2.5 rounded-lg border border-[#050720]/15 appearance-none focus:outline-none"
                >
                  {TIME_SLOTS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <Clock className="w-3.5 h-3.5 text-[#050720]/40 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Mode Selection */}
          <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-3">
            <h3 className="text-sm font-bold font-['Sora']">Demo Mode*</h3>
            <div className="flex items-center gap-8 text-xs">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="radio"
                  name="rescheduleMode"
                  checked={formMode === 'Online'}
                  onChange={() => setFormMode('Online')}
                  className="w-4 h-4 accent-[#FFB908]"
                />
                <span className="font-medium">Online</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="radio"
                  name="rescheduleMode"
                  checked={formMode === 'Offline'}
                  onChange={() => setFormMode('Offline')}
                  className="w-4 h-4 accent-[#FFB908]"
                />
                <span className="font-medium">Offline</span>
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-4">
            <button
              onClick={() => setView('details')}
              className="flex-1 py-2.5 bg-white border border-[#050720]/20 rounded-lg text-xs font-bold hover:bg-[#050720]/5 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitReschedule}
              className="flex-1 py-2.5 bg-[#FFB908] hover:bg-[#E5A607] rounded-lg text-xs font-bold text-[#050720] transition-colors shadow-xs"
            >
              Reschedule Demo
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. RESCHEDULE CONFIRMATION MODAL (FIGMA SCREENSHOT 3)     */}
      {/* ========================================================= */}
      {showRescheduleSuccessModal && (
        <div className="fixed inset-0 z-50 bg-[#050720]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full text-center space-y-5 shadow-2xl">
            <div>
              <h2 className="text-lg font-bold font-['Sora'] text-[#050720]">Demo Scheduled</h2>
              <p className="text-xs text-[#050720]/60 mt-1">Please review the information.</p>
            </div>

            {/* Demo Overview Card */}
            <div className="bg-white border border-[#050720]/15 rounded-xl p-5 text-left space-y-4">
              <h4 className="text-xs font-bold font-['Sora']">Demo Overview</h4>
              <div className="grid grid-cols-2 gap-y-3 text-xs">
                <div>
                  <span className="text-[10px] text-[#050720]/50 block">Lead Name</span>
                  <span className="font-semibold text-sm">{selectedDemo.name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#050720]/50 block">Faculty Name</span>
                  <span className="font-semibold text-sm">{selectedDemo.faculty}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#050720]/50 block">Demo Date</span>
                  <span className="font-semibold text-sm">{selectedDemo.demoDate}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#050720]/50 block">Demo Time</span>
                  <span className="font-semibold text-sm">{selectedDemo.timeSlot}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#050720]/50 block">Course</span>
                  <span className="font-semibold text-sm">{selectedDemo.course}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#050720]/50 block">Mode</span>
                  <span className="font-semibold text-sm">{selectedDemo.mode}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setShowRescheduleSuccessModal(false);
                setView('details');
              }}
              className="w-full py-2.5 bg-[#FFB908] hover:bg-[#E5A607] rounded-lg text-xs font-bold text-[#050720] transition-colors shadow-xs"
            >
              Go back
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. SCHEDULE SUCCESS MODAL (NEW DEMO)                      */}
      {/* ========================================================= */}
      {showScheduleSuccessModal && (
        <div className="fixed inset-0 z-50 bg-[#050720]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center space-y-5 shadow-2xl">
            <div>
              <h2 className="text-lg font-bold font-['Sora'] text-[#050720]">Demo has been scheduled</h2>
              <div className="text-xs text-[#050720]/70 mt-3 space-y-0.5">
                <p>Date: {selectedDemo.demoDate}</p>
                <p>Time: {selectedDemo.timeSlot}</p>
              </div>
            </div>
            <button
              onClick={() => {
                setShowScheduleSuccessModal(false);
                setView('details');
              }}
              className="w-full py-2.5 bg-[#FFB908] hover:bg-[#E5A607] rounded-lg text-xs font-bold text-[#050720] transition-colors shadow-xs"
            >
              View demo details
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. CANCELLATION MODAL                                     */}
      {/* ========================================================= */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-[#050720]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center space-y-4 shadow-2xl">
            <h2 className="text-base font-bold font-['Sora'] text-[#050720]">Cancel demo?</h2>
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
                className="flex-1 py-2 border border-[#050720]/20 rounded-lg text-xs font-bold hover:bg-[#050720]/5 transition-colors"
              >
                Keep Demo
              </button>
              <button
                onClick={handleConfirmCancel}
                className="flex-1 py-2 bg-[#FFB908] hover:bg-[#E5A607] rounded-lg text-xs font-bold text-[#050720] transition-colors shadow-xs"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 7. DEMO DETAILS VIEW                                      */}
      {/* ========================================================= */}
      {view === 'details' && selectedDemo && (
        <div className="space-y-6 max-w-4xl">
          <button
            onClick={() => setView('table')}
            className="flex items-center gap-2 text-2xl font-bold font-['Sora'] hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="w-6 h-6 text-[#050720]" />
            <span>
              {selectedDemo.status === 'Completed'
                ? 'Completed demo details'
                : selectedDemo.status === 'Cancelled'
                ? 'Cancelled demo details'
                : 'Scheduled demo details'}
            </span>
          </button>

          <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-6">
            <h3 className="text-sm font-bold font-['Sora']">Demo Overview</h3>
            
            <div className="grid grid-cols-2 gap-y-4 text-xs">
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Lead Name</span>
                <span className="font-semibold text-sm">{selectedDemo.name}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Faculty Name</span>
                <span className="font-semibold text-sm">{selectedDemo.faculty}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Demo Date</span>
                <span className="font-semibold text-sm">{selectedDemo.demoDate}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Demo Time</span>
                <span className="font-semibold text-sm">{selectedDemo.timeSlot}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Course</span>
                <span className="font-semibold text-sm">{selectedDemo.course}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Mode</span>
                <span className="font-semibold text-sm">{selectedDemo.mode}</span>
              </div>
            </div>

            {selectedDemo.status === 'Cancelled' && (
              <div className="pt-2">
                <span className="text-[10px] text-[#050720]/50 block">Reason for cancellation</span>
                <span className="font-semibold text-xs text-[#050720] mt-0.5 block">
                  {selectedDemo.cancellationReason || 'No Response from Student'}
                </span>
              </div>
            )}

            {selectedDemo.status === 'Completed' && (
              <div className="space-y-4 pt-2">
                <div>
                  <span className="text-[10px] text-[#050720]/50 block">Demo feedback</span>
                  <p className="text-xs text-[#050720]/80 mt-1 leading-relaxed">
                    {selectedDemo.feedback || 'Student showed strong interest in the course structure and tools.'}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] text-[#050720]/50 block mb-2">Attendance screenshot</span>
                  <div className="rounded-xl overflow-hidden border border-[#050720]/15 bg-[#1F2430] p-4 flex flex-col items-center justify-center min-h-[220px] text-white">
                    <div className="flex items-center gap-4 w-full justify-center">
                      <div className="w-48 h-32 bg-slate-700 rounded-lg flex flex-col items-center justify-center text-xs">
                        <Video className="w-6 h-6 text-amber-400 mb-1" />
                        <span className="font-semibold">{selectedDemo.name}</span>
                        <span className="text-[10px] text-slate-300">Student</span>
                      </div>
                      <div className="w-48 h-32 bg-slate-700 rounded-lg flex flex-col items-center justify-center text-xs">
                        <Video className="w-6 h-6 text-emerald-400 mb-1" />
                        <span className="font-semibold">{selectedDemo.faculty}</span>
                        <span className="text-[10px] text-slate-300">Instructor</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-3 font-mono">Zoom Session Verified: {selectedDemo.demoDate} • {selectedDemo.timeSlot}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-4 pt-4 border-t border-[#050720]/10">
              {selectedDemo.status === 'Scheduled' && (
                <>
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="flex-1 py-2.5 border border-[#050720]/20 rounded-lg text-xs font-bold hover:bg-[#050720]/5 transition-colors"
                  >
                    Cancel Demo
                  </button>
                  <button
                    onClick={() => handleStartReschedule(selectedDemo)}
                    className="flex-1 py-2.5 bg-[#FFB908] hover:bg-[#E5A607] rounded-lg text-xs font-bold text-[#050720] transition-colors shadow-xs"
                  >
                    Reschedule Demo
                  </button>
                </>
              )}

              {selectedDemo.status === 'Completed' && (
                <>
                  <button
                    onClick={() => setView('table')}
                    className="flex-1 py-2.5 border border-[#050720]/20 rounded-lg text-xs font-bold hover:bg-[#050720]/5 transition-colors"
                  >
                    Go Back
                  </button>
                  <button
                    onClick={() => alert(`Follow-up scheduled for ${selectedDemo.name}!`)}
                    className="flex-1 py-2.5 bg-[#FFB908] hover:bg-[#E5A607] rounded-lg text-xs font-bold text-[#050720] transition-colors shadow-xs"
                  >
                    Schedule follow-up
                  </button>
                </>
              )}

              {selectedDemo.status === 'Cancelled' && (
                <>
                  <button
                    onClick={() => setView('table')}
                    className="flex-1 py-2.5 border border-[#050720]/20 rounded-lg text-xs font-bold hover:bg-[#050720]/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleStartReschedule(selectedDemo)}
                    className="flex-1 py-2.5 bg-[#FFB908] hover:bg-[#E5A607] rounded-lg text-xs font-bold text-[#050720] transition-colors shadow-xs"
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