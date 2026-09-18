import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  ChevronDown, 
  ChevronUp, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Check, 
  X, 
  Search 
} from 'lucide-react';

// --- TYPES ---
interface BatchItem {
  id: string;
  srNo: string;
  batchCode: string;
  startDate: string;
  endDate?: string;
  course: string;
  faculty: string;
  studentCount: number;
  timeSlot?: string;
}

interface StudentItem {
  srNo: string;
  name: string;
  startDate: string;
  contact: string;
  attendance: string;
  remark: string;
  fees: string;
}

interface LectureItem {
  id: string;
  title: string;
  date: string;
  timeSlot: string;
  course: string;
  topics: string[];
  assignment: string;
  totalStudents: number;
  presentStudents: number;
}

// --- INITIAL SEED DATA ---
const INITIAL_BATCHES: BatchItem[] = [
  { id: 'b1', srNo: '01', batchCode: 'MWF-JAN-2026', startDate: '01-01-2026', endDate: '21-05-2026', course: 'UI/UX Design', faculty: 'Poorva Pande', studentCount: 5, timeSlot: '11:00 - 12:00' },
  { id: 'b2', srNo: '02', batchCode: 'TTS-JAN-2026', startDate: '03-01-2026', endDate: '23-05-2026', course: 'No Code', faculty: 'Tanmay Kalbhor', studentCount: 6, timeSlot: '01:00 - 02:00' },
  { id: 'b3', srNo: '03', batchCode: 'WEEKEND-JAN-2026', startDate: '07-01-2026', endDate: '27-05-2026', course: 'UI/UX Design', faculty: 'Tanmay Kalbhor', studentCount: 4, timeSlot: '10:00 - 01:00' },
  { id: 'b4', srNo: '04', batchCode: 'MWF-FEB-2026', startDate: '07-02-2026', endDate: '27-06-2026', course: 'UI/UX Design', faculty: 'Tanmay Kalbhor', studentCount: 4, timeSlot: '03:00 - 04:00' },
  { id: 'b5', srNo: '05', batchCode: 'TTS-FEB-2026', startDate: '08-01-2026', endDate: '28-06-2026', course: 'UI/UX Design', faculty: 'Tanmay Kalbhor', studentCount: 4, timeSlot: '04:00 - 05:00' },
];

const RECENT_STUDENTS: StudentItem[] = [
  { srNo: '01', name: 'Tanaya Junnarkar', startDate: '21-12-2025', contact: '9158745870', attendance: '100%', remark: 'Assignment done', fees: '₹35,000 Paid' },
  { srNo: '02', name: 'Aashi Shah', startDate: '21-12-2025', contact: '9876543152', attendance: '85%', remark: 'Assignment done', fees: '₹35,000 Paid' },
  { srNo: '03', name: 'Vishwajeet Pawale', startDate: '21-12-2025', contact: '8987456512', attendance: '65%', remark: 'Irregular attendance', fees: '₹35,000 Paid' },
];

const INITIAL_LECTURES: LectureItem[] = [
  {
    id: 'lec-1',
    title: 'Introduction to UI/UX',
    date: '02-01-2026',
    timeSlot: '11:00-12:00',
    course: 'UI/UX Design',
    topics: [
      'Overview of User Interface (UI) and User Experience (UX) and how they differ',
      'Importance of user-centered design in digital products',
      'Real-world examples of good vs poor user experience',
    ],
    assignment: 'Study your favourite application',
    totalStudents: 5,
    presentStudents: 5,
  },
  {
    id: 'lec-2',
    title: 'Understanding of UI/UX',
    date: '04-01-2026',
    timeSlot: '11:00-12:00',
    course: 'UI/UX Design',
    topics: [
      'Design thinking process and user journey mapping',
      'Information Architecture and wireframing fundamentals',
    ],
    assignment: 'Create user persona and journey map',
    totalStudents: 5,
    presentStudents: 5,
  },
];

const COURSE_OPTIONS = ['All', 'UI/UX Design', 'No Code', 'Full Stack', 'Portfolio', 'React Native', 'React'];
const FACULTY_OPTIONS = ['Poorva Pande', 'Tanmay Kalbhor', 'Neeraj Joshi', 'Aparna Kulkarni'];

export const BatchManagementPage: React.FC = () => {
  // Navigation states: 'list' | 'details' | 'create' | 'add-student' | 'student-detail' | 'lecture-view'
  const [currentView, setCurrentView] = useState<'list' | 'details' | 'create' | 'add-student' | 'student-detail' | 'lecture-view'>('list');
  
  // Data holders
  const [batches, setBatches] = useState<BatchItem[]>(INITIAL_BATCHES);
  const [selectedBatch, setSelectedBatch] = useState<BatchItem>(INITIAL_BATCHES[0]);
  const [selectedStudent, setSelectedStudent] = useState<StudentItem | null>(null);
  const [selectedLecture, setSelectedLecture] = useState<LectureItem>(INITIAL_LECTURES[0]);

  // Filters & Dropdowns
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Form State for "Create Batch"
  const [formData, setFormData] = useState({
    batchName: '',
    faculty: '',
    startDate: '',
    endDate: '',
    timeSlot: '',
  });
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Selected checkboxes for "Add Student" screen
  const [checkedStudents, setCheckedStudents] = useState<string[]>([]);

  // Filtered Batches
  const filteredBatches = selectedCourseFilter === 'All' 
    ? batches 
    : batches.filter((b) => b.course.toLowerCase() === selectedCourseFilter.toLowerCase());

  // Handle student toggle
  const toggleStudentCheck = (name: string) => {
    setCheckedStudents((prev) => 
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  // Submit new batch after review
  const handleFinalCreateBatch = () => {
    const newEntry: BatchItem = {
      id: `b-${Date.now()}`,
      srNo: String(batches.length + 1).padStart(2, '0'),
      batchCode: formData.batchName || 'NEW-BATCH-2026',
      startDate: formData.startDate || '01-02-2026',
      endDate: formData.endDate || '01-06-2026',
      course: 'UI/UX Design',
      faculty: formData.faculty || 'Tanmay Kalbhor',
      studentCount: 0,
      timeSlot: formData.timeSlot || '11:00 - 12:00',
    };
    setBatches([newEntry, ...batches]);
    setShowConfirmModal(false);
    setSelectedBatch(newEntry);
    setCurrentView('details');
  };

  return (
    <div className="font-['Onest'] text-[#050720] pb-12">

      {/* ========================================================= */}
      {/* 1. BATCH LIST VIEW                                        */}
      {/* ========================================================= */}
      {currentView === 'list' && (
        <div className="space-y-6">
          <h1 className="text-2xl font-bold font-['Sora']">Batch Management</h1>

          {/* KPI Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-[#050720]/10 text-center shadow-xs">
              <span className="text-xs font-bold text-[#050720] block">Total Batches</span>
              <span className="text-3xl font-extrabold font-['Sora'] mt-1 block">05</span>
              <span className="text-[11px] text-[#050720]/50 font-medium">All time</span>
            </div>
            <div className="bg-white p-5 rounded-xl border border-[#050720]/10 text-center shadow-xs">
              <span className="text-xs font-bold text-[#050720] block">Ongoing</span>
              <span className="text-3xl font-extrabold font-['Sora'] mt-1 block">02</span>
              <span className="text-[11px] text-[#050720]/50 font-medium">Wire framing Phase</span>
            </div>
            <div className="bg-white p-5 rounded-xl border border-[#050720]/10 text-center shadow-xs">
              <span className="text-xs font-bold text-[#050720] block">Upcoming</span>
              <span className="text-3xl font-extrabold font-['Sora'] mt-1 block">02</span>
              <span className="text-[11px] text-[#050720]/50 font-medium">Newly enrolled</span>
            </div>
            <div className="bg-white p-5 rounded-xl border border-[#050720]/10 text-center shadow-xs">
              <span className="text-xs font-bold text-[#050720] block">Completed</span>
              <span className="text-3xl font-extrabold font-['Sora'] mt-1 block">01</span>
              <span className="text-[11px] text-[#050720]/50 font-medium">Portfolio completed</span>
            </div>
          </div>

          {/* Action Row: Course Filter Dropdown & Create Batch Button */}
          <div className="flex justify-between items-center relative z-10 pt-2">
            <div className="relative">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#050720]/70 font-medium">Sort by:</span>
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="flex items-center justify-between gap-3 px-3 py-1.5 bg-white border border-[#050720]/20 rounded-lg text-xs font-medium min-w-[130px]"
                >
                  <span>{selectedCourseFilter === 'All' ? 'Course' : selectedCourseFilter}</span>
                  {isFilterOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Exact Course Dropdown Selection Menu */}
              {isFilterOpen && (
                <div className="absolute left-14 top-9 w-44 bg-white border border-[#050720]/15 rounded-lg shadow-lg py-1">
                  {COURSE_OPTIONS.map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        setSelectedCourseFilter(c);
                        setIsFilterOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs hover:bg-[#FFB908]/15 transition-colors ${
                        selectedCourseFilter === c ? 'font-bold text-[#050720]' : 'text-[#050720]/80'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => {
                setFormData({ batchName: '', faculty: '', startDate: '', endDate: '', timeSlot: '' });
                setCurrentView('create');
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#FFB908] hover:bg-[#E5A607] rounded-lg text-xs font-bold text-[#050720] transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Create Batch</span>
            </button>
          </div>

          {/* Batches Table */}
          <div className="bg-white border border-[#050720]/10 rounded-xl p-6 shadow-xs">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#050720]/10 text-[#050720] font-bold">
                  <th className="pb-3.5 font-semibold">Sr. No.</th>
                  <th className="pb-3.5 font-semibold">Batch</th>
                  <th className="pb-3.5 font-semibold">Start Date</th>
                  <th className="pb-3.5 font-semibold">Course</th>
                  <th className="pb-3.5 font-semibold">Faculty</th>
                  <th className="pb-3.5 font-semibold">Student count</th>
                  <th className="pb-3.5 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#050720]/5 text-[#050720]">
                {filteredBatches.map((batch) => (
                  <tr key={batch.id} className="hover:bg-[#FFB908]/5 transition-colors">
                    <td className="py-3.5 text-[#050720]/70">{batch.srNo}</td>
                    <td className="py-3.5 font-medium">{batch.batchCode}</td>
                    <td className="py-3.5 text-[#050720]/70">{batch.startDate}</td>
                    <td className="py-3.5 text-[#050720]/70">{batch.course}</td>
                    <td className="py-3.5 text-[#050720]/70">{batch.faculty}</td>
                    <td className="py-3.5 text-[#050720]/70">{String(batch.studentCount).padStart(2, '0')}</td>
                    <td className="py-3.5 text-right">
                      <button
                        onClick={() => {
                          setSelectedBatch(batch);
                          setCurrentView('details');
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

            {/* Pagination Footer matching screenshot */}
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
      {/* 2. CREATE BATCH STEP 1: INPUT FORM                       */}
      {/* ========================================================= */}
      {currentView === 'create' && (
        <div className="space-y-6 max-w-4xl">
          <button
            onClick={() => setCurrentView('list')}
            className="flex items-center gap-2 text-2xl font-bold font-['Sora'] hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="w-6 h-6 text-[#050720]" />
            <span>Create batch</span>
          </button>

          <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-6">
            <h3 className="text-sm font-bold font-['Sora']">Batch Details</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <input
                  type="text"
                  placeholder="Batch name*"
                  value={formData.batchName}
                  onChange={(e) => setFormData({ ...formData, batchName: e.target.value })}
                  className="w-full bg-[#F8FAFC] text-xs px-3.5 py-2.5 rounded-lg border border-[#050720]/15 focus:outline-none focus:border-[#050720]"
                />
              </div>
              <div>
                <select
                  value={formData.faculty}
                  onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
                  className="w-full bg-[#F8FAFC] text-xs px-3.5 py-2.5 rounded-lg border border-[#050720]/15 focus:outline-none focus:border-[#050720]"
                >
                  <option value="">Faculty*</option>
                  {FACULTY_OPTIONS.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Start date*"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full bg-[#F8FAFC] text-xs px-3.5 py-2.5 rounded-lg border border-[#050720]/15 focus:outline-none focus:border-[#050720]"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="End date*"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full bg-[#F8FAFC] text-xs px-3.5 py-2.5 rounded-lg border border-[#050720]/15 focus:outline-none focus:border-[#050720]"
                />
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Time Slot*"
                  value={formData.timeSlot}
                  onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                  className="w-full bg-[#F8FAFC] text-xs px-3.5 py-2.5 rounded-lg border border-[#050720]/15 focus:outline-none focus:border-[#050720] pr-10"
                />
                <Clock className="w-4 h-4 text-[#050720]/40 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t border-[#050720]/10">
              <button
                onClick={() => setCurrentView('list')}
                className="flex-1 py-2.5 border border-[#050720]/20 rounded-lg text-xs font-bold hover:bg-[#050720]/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowConfirmModal(true)}
                className="flex-1 py-2.5 bg-[#FFB908] hover:bg-[#E5A607] rounded-lg text-xs font-bold text-[#050720] transition-colors shadow-xs"
              >
                Create Batch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2B. CREATE BATCH STEP 2: CONFIRMATION MODAL               */}
      {/* ========================================================= */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-[#050720]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full text-center space-y-5 shadow-xl">
            <div>
              <h2 className="text-lg font-bold font-['Sora']">Create Batch</h2>
              <p className="text-xs text-[#050720]/60 mt-1">Please review the information before continuing.</p>
            </div>

            {/* Overview Box */}
            <div className="bg-white border border-[#050720]/15 rounded-xl p-5 text-left space-y-4">
              <h4 className="text-xs font-bold font-['Sora']">Batch Overview</h4>
              <div className="grid grid-cols-2 gap-y-3 text-xs">
                <div>
                  <span className="text-[10px] text-[#050720]/50 block">Batch</span>
                  <span className="font-semibold">{formData.batchName || 'MWF-JAN-2026'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#050720]/50 block">Faculty</span>
                  <span className="font-semibold">{formData.faculty || 'Tanmay Kalbhor'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#050720]/50 block">Start Date</span>
                  <span className="font-semibold">{formData.startDate || '21-12-2025'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#050720]/50 block">End Date</span>
                  <span className="font-semibold">{formData.endDate || '21-05-2026'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#050720]/50 block">Course</span>
                  <span className="font-semibold">UI/UX Design</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#050720]/50 block">Student Count</span>
                  <span className="font-semibold">00</span>
                </div>
              </div>
            </div>

            {/* Modal Controls */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 border border-[#050720]/20 rounded-lg text-xs font-bold hover:bg-[#050720]/5 transition-colors"
              >
                Make changes
              </button>
              <button
                onClick={handleFinalCreateBatch}
                className="flex-1 py-2.5 bg-[#FFB908] hover:bg-[#E5A607] rounded-lg text-xs font-bold text-[#050720] transition-colors shadow-xs"
              >
                Create batch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. BATCH DETAILS VIEW                                     */}
      {/* ========================================================= */}
      {currentView === 'details' && (
        <div className="space-y-6">
          <button
            onClick={() => setCurrentView('list')}
            className="flex items-center gap-2 text-2xl font-bold font-['Sora'] hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="w-6 h-6 text-[#050720]" />
            <span>Batch Details</span>
          </button>

          {/* Conditional Stats (Only shown if students exist) */}
          {selectedBatch.studentCount > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-xl border border-[#050720]/10 text-center shadow-xs">
                <span className="text-xs font-bold block">Attendance</span>
                <span className="text-3xl font-extrabold font-['Sora'] mt-1 block">85%</span>
                <span className="text-[11px] text-[#050720]/50 font-medium">This Month</span>
              </div>
              <div className="bg-white p-5 rounded-xl border border-[#050720]/10 text-center shadow-xs">
                <span className="text-xs font-bold block">Fee Collection</span>
                <span className="text-3xl font-extrabold font-['Sora'] mt-1 block">100%</span>
                <span className="text-[11px] text-[#050720]/50 font-medium">05/05 Paid</span>
              </div>
              <div className="bg-white p-5 rounded-xl border border-[#050720]/10 text-center shadow-xs">
                <span className="text-xs font-bold block">Total Sessions</span>
                <span className="text-3xl font-extrabold font-['Sora'] mt-1 block">02</span>
                <span className="text-[11px] text-[#050720]/50 font-medium">02/20</span>
              </div>
              <div className="bg-white p-5 rounded-xl border border-[#050720]/10 text-center shadow-xs">
                <span className="text-xs font-bold block">Assignments</span>
                <span className="text-3xl font-extrabold font-['Sora'] mt-1 block">01</span>
                <span className="text-[11px] text-[#050720]/50 font-medium">Completed</span>
              </div>
            </div>
          )}

          {/* Batch Overview Card */}
          <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold font-['Sora']">Batch Overview</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 text-xs">
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Batch</span>
                <span className="font-semibold text-sm">{selectedBatch.batchCode}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Faculty</span>
                <span className="font-semibold text-sm">{selectedBatch.faculty}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Start Date</span>
                <span className="font-semibold text-sm">{selectedBatch.startDate}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">End Date</span>
                <span className="font-semibold text-sm">{selectedBatch.endDate || '21-05-2026'}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Course</span>
                <span className="font-semibold text-sm">{selectedBatch.course}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Student Count</span>
                <span className="font-semibold text-sm">{String(selectedBatch.studentCount).padStart(2, '0')}</span>
              </div>
            </div>

            {/* If zero students, show big Add Student CTA (Screenshot 3) */}
            {selectedBatch.studentCount === 0 && (
              <div className="pt-4 border-t border-[#050720]/10">
                <button
                  onClick={() => setCurrentView('add-student')}
                  className="w-full py-2.5 bg-[#FFB908] hover:bg-[#E5A607] rounded-lg text-xs font-bold text-[#050720] transition-colors shadow-xs flex items-center justify-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Student</span>
                </button>
              </div>
            )}
          </div>

          {/* Student Details Table (If students enrolled) */}
          {selectedBatch.studentCount > 0 && (
            <div className="bg-white border border-[#050720]/10 rounded-xl p-6 shadow-xs space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold font-['Sora']">Student Details</h3>
                <button
                  onClick={() => setCurrentView('add-student')}
                  className="flex items-center gap-1 px-3 py-1.5 bg-[#FFB908] hover:bg-[#E5A607] rounded-lg text-xs font-bold text-[#050720] transition-colors shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Student</span>
                </button>
              </div>

              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#050720]/10 text-[#050720] font-bold">
                    <th className="pb-3.5 font-semibold">Sr. No.</th>
                    <th className="pb-3.5 font-semibold">Student Name</th>
                    <th className="pb-3.5 font-semibold">Start Date</th>
                    <th className="pb-3.5 font-semibold">Contact</th>
                    <th className="pb-3.5 font-semibold">Attendance</th>
                    <th className="pb-3.5 font-semibold">Remark</th>
                    <th className="pb-3.5 font-semibold">Fees</th>
                    <th className="pb-3.5 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#050720]/5 text-[#050720]">
                  {RECENT_STUDENTS.map((st) => (
                    <tr key={st.srNo} className="hover:bg-[#FFB908]/5 transition-colors">
                      <td className="py-3 text-[#050720]/70">{st.srNo}</td>
                      <td className="py-3 font-medium">{st.name}</td>
                      <td className="py-3 text-[#050720]/70">{st.startDate}</td>
                      <td className="py-3 text-[#050720]/70">{st.contact}</td>
                      <td className="py-3 font-semibold">{st.attendance}</td>
                      <td className="py-3 text-[#050720]/70">{st.remark}</td>
                      <td className="py-3 font-semibold">{st.fees}</td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => {
                            setSelectedStudent(st);
                            setCurrentView('student-detail');
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
            </div>
          )}

          {/* Lectures List Cards */}
          {selectedBatch.studentCount > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold font-['Sora']">Lectures</h3>
              <div className="space-y-3">
                {INITIAL_LECTURES.map((lec) => (
                  <div key={lec.id} className="bg-white border border-[#050720]/10 rounded-xl p-5 shadow-xs flex justify-between items-center">
                    <div>
                      <h4 className="text-xs font-bold font-['Sora']">{lec.title}</h4>
                      <span className="text-[11px] text-[#050720]/50">{lec.date}</span>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <button
                        onClick={() => {
                          setSelectedLecture(lec);
                          setCurrentView('lecture-view');
                        }}
                        className="px-3 py-1 border border-[#050720]/30 rounded text-[11px] font-semibold text-[#050720] hover:bg-[#050720]/5 transition-colors"
                      >
                        View
                      </button>
                      <span className="text-[10px] text-[#10B981] font-semibold">Completed</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. ADD STUDENT TO BATCH                                    */}
      {/* ========================================================= */}
      {currentView === 'add-student' && (
        <div className="space-y-6 max-w-4xl">
          <button
            onClick={() => setCurrentView('details')}
            className="flex items-center gap-2 text-2xl font-bold font-['Sora'] hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="w-6 h-6 text-[#050720]" />
            <span>Add student</span>
          </button>

          <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-6">
            {/* Search Student Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search student by name/contact"
                className="w-full bg-[#F8FAFC] text-xs px-3.5 py-2.5 pr-10 rounded-lg border border-[#050720]/15 focus:outline-none focus:border-[#050720]"
              />
              <Search className="w-4 h-4 text-[#050720]/40 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <div>
              <h4 className="text-xs font-bold font-['Sora'] mb-3">Recently Enrolled</h4>
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#050720]/10 text-[#050720] font-bold">
                    <th className="pb-3.5 font-semibold">Sr. No.</th>
                    <th className="pb-3.5 font-semibold">Student Name</th>
                    <th className="pb-3.5 font-semibold">Start Date</th>
                    <th className="pb-3.5 font-semibold">Contact</th>
                    <th className="pb-3.5 font-semibold">Attendance</th>
                    <th className="pb-3.5 font-semibold">Fees</th>
                    <th className="pb-3.5 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#050720]/5 text-[#050720]">
                  {RECENT_STUDENTS.map((st) => (
                    <tr key={st.srNo} className="hover:bg-[#FFB908]/5 transition-colors">
                      <td className="py-3 text-[#050720]/70">{st.srNo}</td>
                      <td className="py-3 font-medium">{st.name}</td>
                      <td className="py-3 text-[#050720]/70">{st.startDate}</td>
                      <td className="py-3 text-[#050720]/70">{st.contact}</td>
                      <td className="py-3 font-semibold">{st.attendance}</td>
                      <td className="py-3 font-semibold">{st.fees}</td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => toggleStudentCheck(st.name)}
                          className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ml-auto ${
                            checkedStudents.includes(st.name)
                              ? 'bg-[#FFB908] border-[#FFB908] text-[#050720]'
                              : 'border-[#050720]/30 hover:border-[#050720]'
                          }`}
                        >
                          {checkedStudents.includes(st.name) && <Check className="w-3 h-3 stroke-[3]" />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex gap-4 pt-4 border-t border-[#050720]/10">
              <button
                onClick={() => setCurrentView('details')}
                className="flex-1 py-2.5 border border-[#050720]/20 rounded-lg text-xs font-bold hover:bg-[#050720]/5 transition-colors flex items-center justify-center gap-1.5"
              >
                <X className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>
              <button
                onClick={() => {
                  setSelectedBatch({
                    ...selectedBatch,
                    studentCount: selectedBatch.studentCount + (checkedStudents.length || 1),
                  });
                  setCurrentView('details');
                }}
                className="flex-1 py-2.5 bg-[#FFB908] hover:bg-[#E5A607] rounded-lg text-xs font-bold text-[#050720] transition-colors shadow-xs flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Student</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. VIEW STUDENT DETAILS                                   */}
      {/* ========================================================= */}
      {currentView === 'student-detail' && (
        <div className="space-y-6">
          <button
            onClick={() => setCurrentView('details')}
            className="flex items-center gap-2 text-2xl font-bold font-['Sora'] hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="w-6 h-6 text-[#050720]" />
            <span>Student Details</span>
          </button>

          {/* Student Profile Card */}
          <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold font-['Sora']">Student Overview</h3>
            <div className="grid grid-cols-2 gap-y-4 text-xs">
              <div>
                <span className="text-[10px] text-[#050720]/50 block">First Name</span>
                <span className="font-semibold text-sm">{selectedStudent?.name.split(' ')[0] || 'Aanya'}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Last Name</span>
                <span className="font-semibold text-sm">{selectedStudent?.name.split(' ')[1] || 'Shah'}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Mobile</span>
                <span className="font-semibold text-sm">{selectedStudent?.contact || '9078675645'}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Fees</span>
                <span className="font-semibold text-sm">{selectedStudent?.fees || '₹35,000 Paid'}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Batch</span>
                <span className="font-semibold text-sm">{selectedBatch.batchCode}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Course</span>
                <span className="font-semibold text-sm">{selectedBatch.course}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Start Date</span>
                <span className="font-semibold text-sm">{selectedStudent?.startDate || '21-12-2025'}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Address</span>
                <span className="font-semibold text-sm">Pune</span>
              </div>
            </div>
          </div>

          {/* Attendance KPI Cards */}
          <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-6">
            <h3 className="text-sm font-bold font-['Sora']">Attendance</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="bg-[#F8FAFC] border border-[#050720]/10 rounded-xl p-5">
                <span className="text-2xl font-extrabold font-['Sora'] block">100%</span>
                <div className="w-24 h-1.5 bg-[#10B981] rounded-full mx-auto my-2" />
                <span className="text-[11px] text-[#050720]/50 font-medium">This Month</span>
              </div>
              <div className="bg-[#F8FAFC] border border-[#050720]/10 rounded-xl p-5">
                <span className="text-2xl font-extrabold font-['Sora'] block">100%</span>
                <div className="w-24 h-1.5 bg-[#10B981] rounded-full mx-auto my-2" />
                <span className="text-[11px] text-[#050720]/50 font-medium">Last Month</span>
              </div>
              <div className="bg-[#F8FAFC] border border-[#050720]/10 rounded-xl p-5">
                <span className="text-2xl font-extrabold font-['Sora'] block">100%</span>
                <div className="w-24 h-1.5 bg-[#10B981] rounded-full mx-auto my-2" />
                <span className="text-[11px] text-[#050720]/50 font-medium">Average</span>
              </div>
            </div>

            {/* Attendance Session Logs */}
            <div className="space-y-3 pt-2">
              <div className="border border-[#050720]/10 rounded-xl p-4 flex justify-between items-center">
                <div>
                  <h4 className="text-xs font-bold font-['Sora']">Introduction to UI/UX</h4>
                  <span className="text-[10px] text-[#050720]/50">2026-01-02</span>
                </div>
                <span className="text-[11px] font-semibold text-[#10B981]">Present</span>
              </div>
              <div className="border border-[#050720]/10 rounded-xl p-4 flex justify-between items-center">
                <div>
                  <h4 className="text-xs font-bold font-['Sora']">Understanding of UI/UX</h4>
                  <span className="text-[10px] text-[#050720]/50">2026-01-04</span>
                </div>
                <span className="text-[11px] font-semibold text-[#10B981]">Present</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. VIEW LECTURES SCREEN                                   */}
      {/* ========================================================= */}
      {currentView === 'lecture-view' && (
        <div className="space-y-6">
          <button
            onClick={() => setCurrentView('details')}
            className="flex items-center gap-2 text-2xl font-bold font-['Sora'] hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="w-6 h-6 text-[#050720]" />
            <span>Lecture View</span>
          </button>

          {/* Lecture Info Card */}
          <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-5">
            <h3 className="text-sm font-bold font-['Sora']">Lecture Details</h3>
            <div className="grid grid-cols-2 gap-y-4 text-xs">
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Lecture title</span>
                <span className="font-semibold text-sm">{selectedLecture.title}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Course</span>
                <span className="font-semibold text-sm">{selectedLecture.course}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Date</span>
                <span className="font-semibold text-sm">{selectedLecture.date}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Time Slot</span>
                <span className="font-semibold text-sm">{selectedLecture.timeSlot}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Topics Covered</span>
                <ul className="list-disc pl-4 space-y-1 text-xs text-[#050720]/80 mt-1">
                  {selectedLecture.topics.map((top, idx) => (
                    <li key={idx}>{top}</li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Assignment Given</span>
                <span className="font-semibold text-xs text-[#050720]/80 mt-1 block">
                  {selectedLecture.assignment}
                </span>
              </div>
            </div>
          </div>

          {/* Attendance Overview Card */}
          <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold font-['Sora']">Attendance</h3>
            <div className="grid grid-cols-2 text-xs pb-2">
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Total Students</span>
                <span className="text-xl font-bold font-['Sora']">05</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Present Students</span>
                <span className="text-xl font-bold font-['Sora']">05</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold font-['Sora'] mb-3">Student Details</h4>
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#050720]/10 text-[#050720] font-bold">
                    <th className="pb-3.5 font-semibold">Sr. No.</th>
                    <th className="pb-3.5 font-semibold">Student Name</th>
                    <th className="pb-3.5 font-semibold">Start Date</th>
                    <th className="pb-3.5 font-semibold">Contact</th>
                    <th className="pb-3.5 font-semibold">Remark</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#050720]/5 text-[#050720]">
                  {RECENT_STUDENTS.map((st) => (
                    <tr key={st.srNo} className="hover:bg-[#FFB908]/5 transition-colors">
                      <td className="py-3 text-[#050720]/70">{st.srNo}</td>
                      <td className="py-3 font-medium">{st.name}</td>
                      <td className="py-3 text-[#050720]/70">{st.startDate}</td>
                      <td className="py-3 text-[#050720]/70">{st.contact}</td>
                      <td className="py-3 text-[#050720]/70">{st.remark}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};