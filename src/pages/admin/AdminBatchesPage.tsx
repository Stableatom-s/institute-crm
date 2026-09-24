import React, { useState } from 'react';
import { ArrowLeft, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Check } from 'lucide-react';

// Data Interfaces
interface LectureStudentItem {
  srNo: string;
  name: string;
  startDate: string;
  contact: string;
  remark: string;
  isPresent: boolean;
}

interface BatchLectureItem {
  id: string;
  srNo: string;
  lectureTopic: string;
  date: string;
  timeSlot?: string;
  hoursSpent: string;
  attendanceRatio: string;
  topicsCovered?: string[];
  assignmentGiven?: string;
  studentsList?: LectureStudentItem[];
}

interface BatchStudentItem {
  id: string;
  srNo: string;
  firstName: string;
  lastName: string;
  startDate: string;
  contact: string;
  attendanceRatio: string;
  remark: string;
  address?: string;
  metrics?: {
    thisMonth: number;
    lastMonth: number;
    average: number;
  };
  lecturesSummary?: {
    id: string;
    topic: string;
    date: string;
    status: 'Present' | 'Absent';
  }[];
}

interface BatchRecord {
  id: string;
  srNo: string;
  batchCode: string;
  startDate: string;
  endDate: string;
  course: string;
  faculty: string;
  studentCount: number;
  completedLectures: number;
  hoursSpent: number;
  students: BatchStudentItem[];
  lectures: BatchLectureItem[];
}

// Master Mock Data
const INITIAL_BATCHES: BatchRecord[] = [
  {
    id: 'b-1',
    srNo: '01',
    batchCode: 'MWF-JAN-2026',
    startDate: '21-12-2025',
    endDate: '21-05-2026',
    course: 'UI/UX Design',
    faculty: 'Poorva Pande',
    studentCount: 5,
    completedLectures: 2,
    hoursSpent: 2,
    students: [
      {
        id: 's-1',
        srNo: '01',
        firstName: 'Tanaya',
        lastName: 'Junnarkar',
        startDate: '21-12-2025',
        contact: '9158745870',
        attendanceRatio: '02/02',
        remark: 'Regular Attendance',
        address: 'Pune',
        metrics: { thisMonth: 50, lastMonth: 50, average: 50 },
        lecturesSummary: [
          { id: 'ls-1', topic: 'Introduction to UI/UX', date: '02-01-2026', status: 'Present' },
          { id: 'ls-2', topic: 'Understanding of UI/UX', date: '04-01-2026', status: 'Absent' },
        ],
      },
      {
        id: 's-2',
        srNo: '02',
        firstName: 'Aashi',
        lastName: 'Shah',
        startDate: '21-12-2025',
        contact: '9876543152',
        attendanceRatio: '01/02',
        remark: 'Irregular attendance',
        address: 'Mumbai',
        metrics: { thisMonth: 50, lastMonth: 50, average: 50 },
        lecturesSummary: [
          { id: 'ls-3', topic: 'Introduction to UI/UX', date: '02-01-2026', status: 'Absent' },
          { id: 'ls-4', topic: 'Understanding of UI/UX', date: '04-01-2026', status: 'Present' },
        ],
      },
      {
        id: 's-3',
        srNo: '03',
        firstName: 'Vishwajeet',
        lastName: 'Pawale',
        startDate: '21-12-2025',
        contact: '8987456512',
        attendanceRatio: '01/02',
        remark: 'Irregular attendance',
        address: 'Pune',
        metrics: { thisMonth: 50, lastMonth: 50, average: 50 },
        lecturesSummary: [
          { id: 'ls-5', topic: 'Introduction to UI/UX', date: '02-01-2026', status: 'Present' },
          { id: 'ls-6', topic: 'Understanding of UI/UX', date: '04-01-2026', status: 'Absent' },
        ],
      },
      {
        id: 's-4',
        srNo: '04',
        firstName: 'Vishwajeet',
        lastName: 'Pawale',
        startDate: '21-12-2025',
        contact: '8987456512',
        attendanceRatio: '01/02',
        remark: 'Irregular attendance',
        address: 'Pune',
        metrics: { thisMonth: 50, lastMonth: 50, average: 50 },
        lecturesSummary: [],
      },
      {
        id: 's-5',
        srNo: '05',
        firstName: 'Vishwajeet',
        lastName: 'Pawale',
        startDate: '21-12-2025',
        contact: '8987456512',
        attendanceRatio: '01/02',
        remark: 'Irregular attendance',
        address: 'Pune',
        metrics: { thisMonth: 50, lastMonth: 50, average: 50 },
        lecturesSummary: [],
      },
    ],
    lectures: [
      {
        id: 'lec-1',
        srNo: '01',
        lectureTopic: 'Introduction to UI/UX Design',
        date: '02-01-2026',
        timeSlot: '11:00-12:00',
        hoursSpent: '01',
        attendanceRatio: '05/05',
        topicsCovered: [
          'Overview of User Interface (UI) and User Experience (UX) and how they differ',
          'Importance of user-centered design in digital products',
          'Real-world examples of good vs poor user experience',
        ],
        assignmentGiven: 'Study your favourite application',
        studentsList: [
          { srNo: '01', name: 'Ashish Mehta', startDate: '21-12-2025', contact: '9158745870', remark: 'Assignment done', isPresent: true },
          { srNo: '02', name: 'Tanaya Junnarkar', startDate: '21-12-2025', contact: '9876543152', remark: 'Assignment done', isPresent: true },
          { srNo: '03', name: 'Aashi Shah', startDate: '21-12-2025', contact: '9876543152', remark: 'Assignment done', isPresent: true },
          { srNo: '04', name: 'Aashi Shah', startDate: '21-12-2025', contact: '9876543152', remark: 'Assignment done', isPresent: true },
          { srNo: '05', name: 'Aashi Shah', startDate: '21-12-2025', contact: '9876543152', remark: 'Assignment done', isPresent: true },
        ],
      },
      {
        id: 'lec-2',
        srNo: '02',
        lectureTopic: 'Understanding of UI/UX',
        date: '21-12-2025',
        timeSlot: '11:00-01:00',
        hoursSpent: '02',
        attendanceRatio: '04/05',
        topicsCovered: ['Design thinking stages', 'User research basics'],
        assignmentGiven: 'Prepare a persona interview questionnaire',
        studentsList: [
          { srNo: '01', name: 'Ashish Mehta', startDate: '21-12-2025', contact: '9158745870', remark: 'Assignment done', isPresent: true },
          { srNo: '02', name: 'Tanaya Junnarkar', startDate: '21-12-2025', contact: '9876543152', remark: 'Assignment done', isPresent: true },
          { srNo: '03', name: 'Aashi Shah', startDate: '21-12-2025', contact: '9876543152', remark: 'Assignment done', isPresent: true },
          { srNo: '04', name: 'Aashi Shah', startDate: '21-12-2025', contact: '9876543152', remark: 'Assignment in progress', isPresent: true },
          { srNo: '05', name: 'Aashi Shah', startDate: '21-12-2025', contact: '9876543152', remark: 'Absent', isPresent: false },
        ],
      },
    ],
  },
  {
    id: 'b-2',
    srNo: '02',
    batchCode: 'TTS-JAN-2026',
    startDate: '03-01-2026',
    endDate: '03-06-2026',
    course: 'No Code',
    faculty: 'Tanmay Kalbhor',
    studentCount: 6,
    completedLectures: 1,
    hoursSpent: 2,
    students: [],
    lectures: [],
  },
  {
    id: 'b-3',
    srNo: '03',
    batchCode: 'WEEKEND-JAN-2026',
    startDate: '07-01-2026',
    endDate: '07-07-2026',
    course: 'UI/UX Design',
    faculty: 'Tanmay Kalbhor',
    studentCount: 4,
    completedLectures: 0,
    hoursSpent: 0,
    students: [],
    lectures: [],
  },
  {
    id: 'b-4',
    srNo: '04',
    batchCode: 'MWF-FEB-2026',
    startDate: '07-02-2026',
    endDate: '07-08-2026',
    course: 'UI/UX Design',
    faculty: 'Tanmay Kalbhor',
    studentCount: 4,
    completedLectures: 0,
    hoursSpent: 0,
    students: [],
    lectures: [],
  },
  {
    id: 'b-5',
    srNo: '05',
    batchCode: 'TTS-FEB-2026',
    startDate: '08-01-2026',
    endDate: '08-07-2026',
    course: 'UI/UX Design',
    faculty: 'Tanmay Kalbhor',
    studentCount: 4,
    completedLectures: 0,
    hoursSpent: 0,
    students: [],
    lectures: [],
  },
];

const COURSES = ['Course', 'UI/UX Design', 'No Code', 'Full-Stack'];

export const AdminBatchPage: React.FC = () => {
  const [currentView, setCurrentView] = useState<'roster' | 'batch-details' | 'student-details' | 'lecture-details'>('roster');
  const [selectedBatch, setSelectedBatch] = useState<BatchRecord>(INITIAL_BATCHES[0]);
  const [selectedStudent, setSelectedStudent] = useState<BatchStudentItem>(INITIAL_BATCHES[0].students[0]);
  const [selectedLecture, setSelectedLecture] = useState<BatchLectureItem>(INITIAL_BATCHES[0].lectures[0]);

  const [courseFilter, setCourseFilter] = useState('Course');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const filteredBatches = INITIAL_BATCHES.filter((b) => {
    if (courseFilter === 'Course') return true;
    return b.course.toLowerCase() === courseFilter.toLowerCase();
  });

  return (
    <div className="font-['Onest'] text-[#050720] pb-16">

      {/* ========================================================= */}
      {/* 1. MASTER BATCH MANAGEMENT ROSTER (SCREENSHOT 1)          */}
      {/* ========================================================= */}
      {currentView === 'roster' && (
        <div className="space-y-6">
          <h1 className="text-2xl font-bold font-['Sora']">Batch Management</h1>

          {/* 4 Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-[#050720]/10 rounded-xl p-5 text-center shadow-xs">
              <span className="text-[11px] font-semibold text-[#050720] block">Total Batches</span>
              <span className="text-2xl font-extrabold font-['Sora'] block mt-1">05</span>
              <span className="text-[10px] text-[#050720]/50 block mt-1">All time</span>
            </div>
            <div className="bg-white border border-[#050720]/10 rounded-xl p-5 text-center shadow-xs">
              <span className="text-[11px] font-semibold text-[#050720] block">Ongoing</span>
              <span className="text-2xl font-extrabold font-['Sora'] block mt-1">02</span>
              <span className="text-[10px] text-[#050720]/50 block mt-1">Wire framing Phase</span>
            </div>
            <div className="bg-white border border-[#050720]/10 rounded-xl p-5 text-center shadow-xs">
              <span className="text-[11px] font-semibold text-[#050720] block">Upcoming</span>
              <span className="text-2xl font-extrabold font-['Sora'] block mt-1">02</span>
              <span className="text-[10px] text-[#050720]/50 block mt-1">Newly enrolled</span>
            </div>
            <div className="bg-white border border-[#050720]/10 rounded-xl p-5 text-center shadow-xs">
              <span className="text-[11px] font-semibold text-[#050720] block">Completed</span>
              <span className="text-2xl font-extrabold font-['Sora'] block mt-1">01</span>
              <span className="text-[10px] text-[#050720]/50 block mt-1">Portfolio completed</span>
            </div>
          </div>

          {/* Batches Table Card */}
          <div className="bg-white border border-[#050720]/10 rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-3 relative z-10 pt-1">
              <span className="text-xs text-[#050720]/70 font-medium">Sort by:</span>
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center justify-between gap-3 px-3 py-1.5 bg-white border border-[#050720]/20 rounded-lg text-xs font-medium min-w-[110px]"
                >
                  <span>{courseFilter}</span>
                  {isDropdownOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
                {isDropdownOpen && (
                  <div className="absolute left-0 top-9 w-40 bg-white border border-[#050720]/15 rounded-lg shadow-lg py-1 z-20">
                    {COURSES.map((c) => (
                      <button
                        key={c}
                        onClick={() => {
                          setCourseFilter(c);
                          setIsDropdownOpen(false);
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
                    <td className="py-3.5 text-[#050720]/70">0{batch.studentCount}</td>
                    <td className="py-3.5 text-right">
                      <button
                        onClick={() => {
                          setSelectedBatch(batch);
                          setCurrentView('batch-details');
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
      {/* 2. BATCH DETAILS VIEW (SCREENSHOT 2)                      */}
      {/* ========================================================= */}
      {currentView === 'batch-details' && (
        <div className="space-y-6">
          <button
            onClick={() => setCurrentView('roster')}
            className="flex items-center gap-2 text-2xl font-bold font-['Sora'] hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="w-6 h-6 text-[#050720]" />
            <span>Batch Details</span>
          </button>

          {/* 2 Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white border border-[#050720]/10 rounded-xl p-5 text-center shadow-xs">
              <span className="text-[11px] font-semibold text-[#050720] block">Completed Lectures</span>
              <span className="text-2xl font-extrabold font-['Sora'] block mt-1">0{selectedBatch.completedLectures}</span>
              <span className="text-[10px] text-[#050720]/50 block mt-1">This Week</span>
            </div>
            <div className="bg-white border border-[#050720]/10 rounded-xl p-5 text-center shadow-xs">
              <span className="text-[11px] font-semibold text-[#050720] block">Hours spent</span>
              <span className="text-2xl font-extrabold font-['Sora'] block mt-1">0{selectedBatch.hoursSpent}</span>
              <span className="text-[10px] text-[#050720]/50 block mt-1">Total lecture hours</span>
            </div>
          </div>

          {/* Batch Overview */}
          <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold font-['Sora']">Batch Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 text-xs">
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Batch</span>
                <span className="font-semibold text-sm">{selectedBatch.batchCode}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Faculty</span>
                <span className="font-semibold text-sm">{selectedBatch.faculty}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Course</span>
                <span className="font-semibold text-sm">{selectedBatch.course}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Student Count</span>
                <span className="font-semibold text-sm">0{selectedBatch.studentCount}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Start Date</span>
                <span className="font-semibold text-sm">{selectedBatch.startDate}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">End Date</span>
                <span className="font-semibold text-sm">{selectedBatch.endDate}</span>
              </div>
            </div>
          </div>

          {/* Student Details Card */}
          <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold font-['Sora']">Student Details</h3>
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#050720]/10 text-[#050720] font-bold">
                  <th className="pb-3.5 font-semibold">Sr. No.</th>
                  <th className="pb-3.5 font-semibold">Student Name</th>
                  <th className="pb-3.5 font-semibold">Start Date</th>
                  <th className="pb-3.5 font-semibold">Contact</th>
                  <th className="pb-3.5 font-semibold">Attendance</th>
                  <th className="pb-3.5 font-semibold">Remark</th>
                  <th className="pb-3.5 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#050720]/5 text-[#050720]">
                {selectedBatch.students.map((student) => (
                  <tr key={student.id} className="hover:bg-[#FFB908]/5 transition-colors">
                    <td className="py-3.5 text-[#050720]/70">{student.srNo}</td>
                    <td className="py-3.5 font-medium">{student.firstName} {student.lastName}</td>
                    <td className="py-3.5 text-[#050720]/70">{student.startDate}</td>
                    <td className="py-3.5 text-[#050720]/70">{student.contact}</td>
                    <td className="py-3.5">
                      <span className={`font-semibold ${
                        student.attendanceRatio === '02/02' ? 'text-[#10B981]' : 'text-[#EF4444]'
                      }`}>
                        {student.attendanceRatio}
                      </span>
                    </td>
                    <td className="py-3.5 text-[#050720]/70">{student.remark}</td>
                    <td className="py-3.5 text-right">
                      <button
                        onClick={() => {
                          setSelectedStudent(student);
                          setCurrentView('student-details');
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

          {/* Lectures Card */}
          <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold font-['Sora']">Lectures</h3>
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#050720]/10 text-[#050720] font-bold">
                  <th className="pb-3.5 font-semibold">Sr. No.</th>
                  <th className="pb-3.5 font-semibold">Lecture Topic</th>
                  <th className="pb-3.5 font-semibold">Date</th>
                  <th className="pb-3.5 font-semibold">Hours Spent</th>
                  <th className="pb-3.5 font-semibold">Attendance</th>
                  <th className="pb-3.5 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#050720]/5 text-[#050720]">
                {selectedBatch.lectures.map((lec) => (
                  <tr key={lec.id} className="hover:bg-[#FFB908]/5 transition-colors">
                    <td className="py-3.5 text-[#050720]/70">{lec.srNo}</td>
                    <td className="py-3.5 font-medium">{lec.lectureTopic}</td>
                    <td className="py-3.5 text-[#050720]/70">{lec.date}</td>
                    <td className="py-3.5 text-[#050720]/70">{lec.hoursSpent}</td>
                    <td className="py-3.5 text-[#050720]/70 font-semibold">{lec.attendanceRatio}</td>
                    <td className="py-3.5 text-right">
                      <button
                        onClick={() => {
                          setSelectedLecture(lec);
                          setCurrentView('lecture-details');
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
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. STUDENT DETAILS DRILLDOWN VIEW (SCREENSHOT 3)          */}
      {/* ========================================================= */}
      {currentView === 'student-details' && (
        <div className="space-y-6">
          <button
            onClick={() => setCurrentView('batch-details')}
            className="flex items-center gap-2 text-2xl font-bold font-['Sora'] hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="w-6 h-6 text-[#050720]" />
            <span>Student Details</span>
          </button>

          <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold font-['Sora']">Student Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 text-xs">
              <div>
                <span className="text-[10px] text-[#050720]/50 block">First Name</span>
                <span className="font-semibold text-sm">{selectedStudent.firstName}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Last Name</span>
                <span className="font-semibold text-sm">{selectedStudent.lastName}</span>
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
                <span className="font-semibold text-sm">{selectedStudent.startDate}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Address</span>
                <span className="font-semibold text-sm">{selectedStudent.address || 'Pune'}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Mobile</span>
                <span className="font-semibold text-sm">{selectedStudent.contact}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Remark</span>
                <span className="font-semibold text-sm">{selectedStudent.remark}</span>
              </div>
            </div>
          </div>

          {/* Attendance Section */}
          <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-6">
            <h3 className="text-sm font-bold font-['Sora']">Attendance</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="border border-[#050720]/10 rounded-xl p-5 text-center flex flex-col items-center">
                <span className="text-xl font-bold font-['Sora']">{selectedStudent.metrics?.thisMonth ?? 50}%</span>
                <div className="w-32 h-1.5 bg-[#E2E8F0] rounded-full mt-3 overflow-hidden">
                  <div className="h-full bg-[#10B981] rounded-full" style={{ width: `${selectedStudent.metrics?.thisMonth ?? 50}%` }} />
                </div>
                <span className="text-[10px] text-[#050720]/50 mt-2 font-medium">This Month</span>
              </div>
              <div className="border border-[#050720]/10 rounded-xl p-5 text-center flex flex-col items-center">
                <span className="text-xl font-bold font-['Sora']">{selectedStudent.metrics?.lastMonth ?? 50}%</span>
                <div className="w-32 h-1.5 bg-[#E2E8F0] rounded-full mt-3 overflow-hidden">
                  <div className="h-full bg-[#10B981] rounded-full" style={{ width: `${selectedStudent.metrics?.lastMonth ?? 50}%` }} />
                </div>
                <span className="text-[10px] text-[#050720]/50 mt-2 font-medium">Last Month</span>
              </div>
              <div className="border border-[#050720]/10 rounded-xl p-5 text-center flex flex-col items-center">
                <span className="text-xl font-bold font-['Sora']">{selectedStudent.metrics?.average ?? 50}%</span>
                <div className="w-32 h-1.5 bg-[#E2E8F0] rounded-full mt-3 overflow-hidden">
                  <div className="h-full bg-[#10B981] rounded-full" style={{ width: `${selectedStudent.metrics?.average ?? 50}%` }} />
                </div>
                <span className="text-[10px] text-[#050720]/50 mt-2 font-medium">Average</span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              {(selectedStudent.lecturesSummary || []).map((lec) => (
                <div key={lec.id} className="border border-[#050720]/10 rounded-xl px-5 py-4 flex items-center justify-between">
                  <span className="text-xs font-bold text-[#050720]">{lec.topic}</span>
                  <div className="text-right">
                    <span className={`text-xs font-semibold block ${lec.status === 'Present' ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                      {lec.status}
                    </span>
                    <span className="text-[10px] text-[#050720]/50 block mt-0.5">{lec.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. LECTURE DETAILS VIEW (SCREENSHOT 4)                    */}
      {/* ========================================================= */}
      {currentView === 'lecture-details' && (
        <div className="space-y-6">
          <button
            onClick={() => setCurrentView('batch-details')}
            className="flex items-center gap-2 text-2xl font-bold font-['Sora'] hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="w-6 h-6 text-[#050720]" />
            <span>Lectures</span>
          </button>

          {/* Lecture Metadata */}
          <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-5">
            <h3 className="text-sm font-bold font-['Sora']">Lecture Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 text-xs">
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Lecture Title</span>
                <span className="font-semibold text-sm">{selectedLecture.lectureTopic}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Course</span>
                <span className="font-semibold text-sm">{selectedBatch.course}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Date</span>
                <span className="font-semibold text-sm">{selectedLecture.date}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Time Slot</span>
                <span className="font-semibold text-sm">{selectedLecture.timeSlot || '11:00-12:00'}</span>
              </div>
            </div>

            {/* Topics Covered & Homework */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div>
                <span className="text-[10px] text-[#050720]/50 block mb-1">Topics Covered</span>
                <ul className="list-disc list-inside space-y-1 text-xs text-[#050720]/90">
                  {(selectedLecture.topicsCovered || []).map((topic, i) => (
                    <li key={i}>{topic}</li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block mb-1">Assignment Given</span>
                <p className="text-xs text-[#050720]/90">{selectedLecture.assignmentGiven || 'Study your favourite application'}</p>
              </div>
            </div>
          </div>

          {/* Student Lecture Attendance Checklist */}
          <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold font-['Sora']">Attendance</h3>
            <div className="flex gap-8 text-xs font-semibold pb-2">
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Total Students</span>
                <span className="text-sm">0{selectedLecture.studentsList?.length || 5}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Present Students</span>
                <span className="text-sm">0{selectedLecture.studentsList?.filter((s) => s.isPresent).length || 5}</span>
              </div>
            </div>

            <h4 className="text-xs font-bold font-['Sora'] pt-2">Student Details</h4>
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#050720]/10 text-[#050720] font-bold">
                  <th className="pb-3.5 font-semibold w-12"></th>
                  <th className="pb-3.5 font-semibold">Sr. No.</th>
                  <th className="pb-3.5 font-semibold">Student Name</th>
                  <th className="pb-3.5 font-semibold">Start Date</th>
                  <th className="pb-3.5 font-semibold">Contact</th>
                  <th className="pb-3.5 font-semibold">Remark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#050720]/5 text-[#050720]">
                {(selectedLecture.studentsList || []).map((st) => (
                  <tr key={st.srNo} className="hover:bg-[#FFB908]/5 transition-colors">
                    <td className="py-3.5">
                      <div className="w-4 h-4 rounded border border-[#050720]/30 flex items-center justify-center bg-white">
                        {st.isPresent && <Check className="w-3 h-3 text-[#050720]" />}
                      </div>
                    </td>
                    <td className="py-3.5 text-[#050720]/70">{st.srNo}</td>
                    <td className="py-3.5 font-medium">{st.name}</td>
                    <td className="py-3.5 text-[#050720]/70">{st.startDate}</td>
                    <td className="py-3.5 text-[#050720]/70">{st.contact}</td>
                    <td className="py-3.5 text-[#050720]/70">{st.remark}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};