import React, { useState } from 'react';
import { ArrowLeft, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';

type DemoTab = 'Scheduled' | 'Completed' | 'Cancelled';

interface DemoSessionRecord {
  id: string;
  srNo: string;
  name: string;
  timeSlot: string;
  demoDate: string;
  course: string;
  mode: 'Online' | 'Offline';
  faculty: string;
  status: DemoTab;
  demoStatusLabel?: string; // e.g., "Attended"
  remark?: string;
  feedback?: string;
  cancellationReason?: string;
  screenshotUrl?: string;
}

const INITIAL_DEMOS: DemoSessionRecord[] = [
  // Scheduled Demos
  {
    id: 'demo-s1',
    srNo: '01',
    name: 'Aanya Shah',
    timeSlot: '11:00 - 12:00',
    demoDate: '21-12-2025',
    course: 'UI/UX Design',
    mode: 'Online',
    faculty: 'Tanmay Kalbhor',
    status: 'Scheduled',
  },
  {
    id: 'demo-s2',
    srNo: '02',
    name: 'Rohan Mehta',
    timeSlot: '01:00 - 02:00',
    demoDate: '21-12-2025',
    course: 'No Code',
    mode: 'Online',
    faculty: 'Poorva Pande',
    status: 'Scheduled',
  },
  {
    id: 'demo-s3',
    srNo: '03',
    name: 'Neha Patel',
    timeSlot: '03:00 - 04:00',
    demoDate: '21-12-2025',
    course: 'UI/UX Design',
    mode: 'Offline',
    faculty: 'Tanmay Kalbhor',
    status: 'Scheduled',
  },
  {
    id: 'demo-s4',
    srNo: '04',
    name: 'Anish Verma',
    timeSlot: '03:00 - 04:00',
    demoDate: '21-12-2025',
    course: 'Portfolio',
    mode: 'Offline',
    faculty: 'Poorva Pande',
    status: 'Scheduled',
  },
  {
    id: 'demo-s5',
    srNo: '05',
    name: 'Siddhi Shah',
    timeSlot: '01:00 - 02:00',
    demoDate: '21-12-2025',
    course: 'Full-Stack',
    mode: 'Online',
    faculty: 'Neeraj Joshi',
    status: 'Scheduled',
  },

  // Completed Demos
  {
    id: 'demo-c1',
    srNo: '01',
    name: 'Rohit Shah',
    timeSlot: '11:00 - 12:00',
    demoDate: '21-12-2025',
    course: 'UI/UX Design',
    mode: 'Online',
    faculty: 'Poorva Pande',
    status: 'Completed',
    demoStatusLabel: 'Attended',
    remark: 'Joining soon',
    feedback: 'Student showed strong interest in the course structure and tools. Asked relevant questions about projects and placement support. Recommended for follow-up within 24 hours.',
    screenshotUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 'demo-c2',
    srNo: '02',
    name: 'Ashish Mehta',
    timeSlot: '11:00 - 12:00',
    demoDate: '21-12-2025',
    course: 'UI/UX Design',
    mode: 'Online',
    faculty: 'Poorva Pande',
    status: 'Completed',
    demoStatusLabel: 'Attended',
    remark: 'Joining soon',
    feedback: 'Clear grasp of fundamentals. Eager to begin portfolio track.',
    screenshotUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 'demo-c3',
    srNo: '03',
    name: 'Anush Shah',
    timeSlot: '11:00 - 12:00',
    demoDate: '21-12-2025',
    course: 'UI/UX Design',
    mode: 'Online',
    faculty: 'Poorva Pande',
    status: 'Completed',
    demoStatusLabel: 'Attended',
    remark: 'Joining soon',
    feedback: 'Good participation during the Figma demo.',
    screenshotUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1000&q=80',
  },

  // Cancelled Demos
  {
    id: 'demo-x1',
    srNo: '01',
    name: 'Aanya',
    timeSlot: '11:00-12:00',
    demoDate: '21-12-2025',
    course: 'UI/UX Design',
    mode: 'Online',
    faculty: 'Poorva Pande',
    status: 'Cancelled',
    cancellationReason: 'Unavailable for demo',
  },
  {
    id: 'demo-x2',
    srNo: '02',
    name: 'Rohan Mehta',
    timeSlot: '01:00 - 02:00',
    demoDate: '21-12-2025',
    course: 'No Code',
    mode: 'Online',
    faculty: 'Poorva Pande',
    status: 'Cancelled',
    cancellationReason: 'Timing conflict with college lectures',
  },
  {
    id: 'demo-x3',
    srNo: '03',
    name: 'Neha Patel',
    timeSlot: '03:00 - 04:00',
    demoDate: '21-12-2025',
    course: 'UI/UX Design',
    mode: 'Offline',
    faculty: 'Tanmay Kalbhor',
    status: 'Cancelled',
    cancellationReason: 'Rescheduled to next week',
  },
  {
    id: 'demo-x4',
    srNo: '04',
    name: 'Anish Verma',
    timeSlot: '03:00 - 04:00',
    demoDate: '21-12-2025',
    course: 'Portfolio',
    mode: 'Offline',
    faculty: 'Poorva Pande',
    status: 'Cancelled',
    cancellationReason: 'Personal emergency',
  },
  {
    id: 'demo-x5',
    srNo: '05',
    name: 'Siddhi Shah',
    timeSlot: '01:00 - 02:00',
    demoDate: '21-12-2025',
    course: 'Full-Stack',
    mode: 'Online',
    faculty: 'Neeraj Joshi',
    status: 'Cancelled',
    cancellationReason: 'Internet connectivity failure',
  },
];

const MODES = ['Mode', 'Online', 'Offline'];
const COURSES = ['Course', 'UI/UX Design', 'No Code', 'Portfolio', 'Full-Stack'];

export const AdminDemosPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<DemoTab>('Scheduled');
  const [selectedDemo, setSelectedDemo] = useState<DemoSessionRecord | null>(null);

  // Filters
  const [modeFilter, setModeFilter] = useState('Mode');
  const [courseFilter, setCourseFilter] = useState('Course');
  const [isModeOpen, setIsModeOpen] = useState(false);
  const [isCourseOpen, setIsCourseOpen] = useState(false);

  const filteredDemos = INITIAL_DEMOS.filter((demo) => {
    if (demo.status !== activeTab) return false;
    if (modeFilter !== 'Mode' && demo.mode !== modeFilter) return false;
    if (courseFilter !== 'Course' && demo.course.toLowerCase() !== courseFilter.toLowerCase()) return false;
    return true;
  });

  return (
    <div className="font-['Onest'] text-[#050720] pb-16">
      {/* ========================================================= */}
      {/* 1. DEMO MANAGEMENT TABLE VIEW                             */}
      {/* ========================================================= */}
      {!selectedDemo && (
        <div className="space-y-6">
          <h1 className="text-2xl font-bold font-['Sora']">Demo Management</h1>

          <div className="bg-white border border-[#050720]/10 rounded-xl p-6 shadow-xs space-y-4">
            
            {/* Tabs */}
            <div className="flex items-center gap-8 border-b border-[#050720]/10 text-xs font-bold">
              {(['Scheduled', 'Completed', 'Cancelled'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setModeFilter('Mode');
                    setCourseFilter('Course');
                  }}
                  className={`pb-3 relative transition-colors ${
                    activeTab === tab ? 'text-[#050720]' : 'text-[#050720]/50 hover:text-[#050720]'
                  }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FFB908] rounded-full" />
                  )}
                </button>
              ))}
            </div>

            {/* Sort & Filter Controls */}
            <div className="flex items-center gap-3 relative z-10 pt-1">
              <span className="text-xs text-[#050720]/70 font-medium">Sort by:</span>

              {/* Mode Dropdown */}
              <div className="relative">
                <button
                  onClick={() => {
                    setIsModeOpen(!isModeOpen);
                    setIsCourseOpen(false);
                  }}
                  className="flex items-center justify-between gap-3 px-3 py-1.5 bg-white border border-[#050720]/20 rounded-lg text-xs font-medium min-w-[100px]"
                >
                  <span>{modeFilter}</span>
                  {isModeOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5 text-[#050720]/50" />}
                </button>
                {isModeOpen && (
                  <div className="absolute left-0 top-9 w-32 bg-white border border-[#050720]/15 rounded-lg shadow-lg py-1 z-20">
                    {MODES.map((m) => (
                      <button
                        key={m}
                        onClick={() => {
                          setModeFilter(m);
                          setIsModeOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs hover:bg-[#FFB908]/15 text-[#050720]"
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Course Dropdown */}
              <div className="relative">
                <button
                  onClick={() => {
                    setIsCourseOpen(!isCourseOpen);
                    setIsModeOpen(false);
                  }}
                  className="flex items-center justify-between gap-3 px-3 py-1.5 bg-white border border-[#050720]/20 rounded-lg text-xs font-medium min-w-[110px]"
                >
                  <span>{courseFilter}</span>
                  {isCourseOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5 text-[#050720]/50" />}
                </button>
                {isCourseOpen && (
                  <div className="absolute left-0 top-9 w-40 bg-white border border-[#050720]/15 rounded-lg shadow-lg py-1 z-20">
                    {COURSES.map((c) => (
                      <button
                        key={c}
                        onClick={() => {
                          setCourseFilter(c);
                          setIsCourseOpen(false);
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

            {/* Dynamic Table By Tab */}
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#050720]/10 font-bold">
                  <th className="pb-3.5">Sr. No.</th>
                  <th className="pb-3.5">Name</th>
                  <th className="pb-3.5">Time Slot</th>
                  <th className="pb-3.5">Demo Date</th>
                  <th className="pb-3.5">Course</th>
                  <th className="pb-3.5">Mode</th>
                  {activeTab === 'Completed' ? (
                    <>
                      <th className="pb-3.5">Demo Status</th>
                      <th className="pb-3.5">Remark</th>
                    </>
                  ) : null}
                  <th className="pb-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#050720]/5">
                {filteredDemos.map((demo) => (
                  <tr key={demo.id} className="hover:bg-[#FFB908]/5 transition-colors">
                    <td className="py-3.5 text-[#050720]/70">{demo.srNo}</td>
                    <td className="py-3.5 font-medium">{demo.name}</td>
                    <td className="py-3.5 text-[#050720]/70">{demo.timeSlot}</td>
                    <td className="py-3.5 text-[#050720]/70">{demo.demoDate}</td>
                    <td className="py-3.5 text-[#050720]/70">{demo.course}</td>
                    <td className="py-3.5 text-[#050720]/70">{demo.mode}</td>
                    {activeTab === 'Completed' ? (
                      <>
                        <td className="py-3.5 text-[#050720]/70">{demo.demoStatusLabel || 'Attended'}</td>
                        <td className="py-3.5 text-[#050720]/70">{demo.remark || 'Joining soon'}</td>
                      </>
                    ) : null}
                    <td className="py-3.5 text-right">
                      <button
                        onClick={() => setSelectedDemo(demo)}
                        className="px-3 py-1 border border-[#050720]/30 rounded text-[11px] font-semibold hover:bg-[#050720]/5 transition-colors"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex items-center justify-end gap-3 pt-3 text-xs text-[#050720]/70">
              <span className="text-[11px]">Jump to</span>
              <input
                type="text"
                defaultValue="01"
                className="w-8 h-7 text-center border border-[#050720]/20 rounded font-semibold text-xs"
              />
              <div className="flex items-center gap-1.5 ml-2">
                <button className="p-1 hover:text-[#050720]">
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="text-[11px] font-semibold text-[#050720]">01 of 10</span>
                <button className="p-1 hover:text-[#050720]">
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. SCHEDULED DEMO DETAILS VIEW                            */}
      {/* ========================================================= */}
      {selectedDemo && selectedDemo.status === 'Scheduled' && (
        <div className="space-y-6">
          <button
            onClick={() => setSelectedDemo(null)}
            className="flex items-center gap-2 text-2xl font-bold font-['Sora'] hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="w-6 h-6 text-[#050720]" />
            <span>Scheduled demo details</span>
          </button>

          <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-5">
            <h3 className="text-sm font-bold font-['Sora']">Demo Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 text-xs">
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
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. COMPLETED DEMO DETAILS VIEW                            */}
      {/* ========================================================= */}
      {selectedDemo && selectedDemo.status === 'Completed' && (
        <div className="space-y-6">
          <button
            onClick={() => setSelectedDemo(null)}
            className="flex items-center gap-2 text-2xl font-bold font-['Sora'] hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="w-6 h-6 text-[#050720]" />
            <span>Completed demo details</span>
          </button>

          <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-5">
            <h3 className="text-sm font-bold font-['Sora']">Demo Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 text-xs">
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

            {/* Feedback */}
            <div className="pt-2 text-xs">
              <span className="text-[10px] text-[#050720]/50 block mb-1">Demo feedback</span>
              <p className="leading-relaxed text-[#050720]/90">
                {selectedDemo.feedback ||
                  'Student showed strong interest in the course structure and tools. Asked relevant questions about projects and placement support. Recommended for follow-up within 24 hours.'}
              </p>
            </div>

            {/* Zoom / Video Call Frame Screenshot */}
            <div className="pt-2">
              <span className="text-[10px] text-[#050720]/50 block mb-2">Attendance screenshot</span>
              <div className="rounded-xl overflow-hidden border border-[#050720]/20 bg-[#1E1E1E] max-w-xl">
                {/* Browser/Zoom style top bar */}
                <div className="bg-[#2A2A2A] px-3 py-1.5 flex items-center gap-1.5 border-b border-[#3A3A3A]">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ED6A5E]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#F5BF4F]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#61C554]" />
                  <span className="text-[10px] text-white/50 ml-auto mr-auto font-medium">Zoom Meeting</span>
                </div>
                <div className="p-3 bg-black flex gap-2">
                  <div className="w-1/2 aspect-video bg-neutral-800 rounded-lg overflow-hidden flex items-center justify-center relative">
                    <img
                      src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80"
                      alt="Student"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1 left-2 text-[9px] bg-black/60 text-white px-1.5 py-0.5 rounded">
                      {selectedDemo.name}
                    </span>
                  </div>
                  <div className="w-1/2 aspect-video bg-neutral-800 rounded-lg overflow-hidden flex items-center justify-center relative">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80"
                      alt="Faculty"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1 left-2 text-[9px] bg-black/60 text-white px-1.5 py-0.5 rounded">
                      {selectedDemo.faculty}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. CANCELLED DEMO DETAILS VIEW                            */}
      {/* ========================================================= */}
      {selectedDemo && selectedDemo.status === 'Cancelled' && (
        <div className="space-y-6">
          <button
            onClick={() => setSelectedDemo(null)}
            className="flex items-center gap-2 text-2xl font-bold font-['Sora'] hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="w-6 h-6 text-[#050720]" />
            <span>Cancelled demo details</span>
          </button>

          <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-5">
            <h3 className="text-sm font-bold font-['Sora']">Demo Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 text-xs">
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
              <div className="md:col-span-2">
                <span className="text-[10px] text-[#050720]/50 block">Reason for cancellation</span>
                <span className="font-semibold text-sm text-[#EF4444]">
                  {selectedDemo.cancellationReason || 'Unavailable for demo'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};  