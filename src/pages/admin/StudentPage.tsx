import React, { useState } from 'react';
import { ArrowLeft, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';

interface AttendanceLecture {
  id: string;
  topic: string;
  date: string;
  status: 'Present' | 'Absent';
}

interface StudentRecord {
  id: string;
  srNo: string;
  firstName: string;
  lastName: string;
  startDate: string;
  contact: string;
  course: string;
  batch: string;
  address: string;
  attendanceRatio: string;
  remark: 'Regular Attendance' | 'Irregular Attendance' | 'Irregular attendance';
  metrics: {
    thisMonth: number;
    lastMonth: number;
    average: number;
  };
  lectures: AttendanceLecture[];
}

const INITIAL_STUDENTS: StudentRecord[] = [
  {
    id: 'std-1',
    srNo: '01',
    firstName: 'Tanaya',
    lastName: 'Junnarkar',
    startDate: '21-12-2025',
    contact: '9158745870',
    course: 'UI/UX Design',
    batch: 'MWF-JAN-2026',
    address: 'Pune',
    attendanceRatio: '02/02',
    remark: 'Regular Attendance',
    metrics: {
      thisMonth: 50,
      lastMonth: 50,
      average: 50,
    },
    lectures: [
      { id: 'lec-1', topic: 'Introduction to UI/UX', date: '02-01-2026', status: 'Present' },
      { id: 'lec-2', topic: 'Understanding of UI/UX', date: '04-01-2026', status: 'Absent' },
    ],
  },
  {
    id: 'std-2',
    srNo: '02',
    firstName: 'Aashi',
    lastName: 'Shah',
    startDate: '21-12-2025',
    contact: '9876543152',
    course: 'UI/UX Design',
    batch: 'TTS-JAN-2026',
    address: 'Mumbai',
    attendanceRatio: '01/02',
    remark: 'Irregular Attendance',
    metrics: {
      thisMonth: 50,
      lastMonth: 50,
      average: 50,
    },
    lectures: [
      { id: 'lec-3', topic: 'Introduction to UI/UX', date: '02-01-2026', status: 'Absent' },
      { id: 'lec-4', topic: 'Understanding of UI/UX', date: '04-01-2026', status: 'Present' },
    ],
  },
  {
    id: 'std-3',
    srNo: '03',
    firstName: 'Vishwajeet',
    lastName: 'Pawale',
    startDate: '21-12-2025',
    contact: '8987456512',
    course: 'UI/UX Design',
    batch: 'WEEKEND-JAN-2026',
    address: 'Pune',
    attendanceRatio: '01/02',
    remark: 'Irregular attendance',
    metrics: {
      thisMonth: 50,
      lastMonth: 50,
      average: 50,
    },
    lectures: [
      { id: 'lec-5', topic: 'Introduction to UI/UX', date: '02-01-2026', status: 'Present' },
      { id: 'lec-6', topic: 'Understanding of UI/UX', date: '04-01-2026', status: 'Absent' },
    ],
  },
];

const COURSES = ['UI/UX Design', 'No Code', 'Full-Stack', 'Portfolio'];

export const AdminStudentPage: React.FC = () => {
  const [view, setView] = useState<'list' | 'details'>('list');
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord>(INITIAL_STUDENTS[0]);
  const [courseFilter, setCourseFilter] = useState('UI/UX Design');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const filteredStudents = INITIAL_STUDENTS.filter(
    (student) => student.course.toLowerCase() === courseFilter.toLowerCase()
  );

  return (
    <div className="font-['Onest'] text-[#050720] pb-16">
      {/* ========================================================= */}
      {/* 1. STUDENT MANAGEMENT DIRECTORY (SCREENSHOT 1)            */}
      {/* ========================================================= */}
      {view === 'list' && (
        <div className="space-y-6">
          <h1 className="text-2xl font-bold font-['Sora']">Student Management</h1>

          <div className="bg-white border border-[#050720]/10 rounded-xl p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold font-['Sora']">Student List</h2>

            {/* Course Filter Dropdown */}
            <div className="flex items-center gap-3 relative z-10 pt-1">
              <span className="text-xs text-[#050720]/70 font-medium">Sort by:</span>
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center justify-between gap-3 px-3 py-1.5 bg-white border border-[#050720]/20 rounded-lg text-xs font-medium min-w-[130px]"
                >
                  <span>{courseFilter}</span>
                  {isDropdownOpen ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>

                {isDropdownOpen && (
                  <div className="absolute left-0 top-9 w-40 bg-white border border-[#050720]/15 rounded-lg shadow-lg py-1 z-20">
                    {COURSES.map((course) => (
                      <button
                        key={course}
                        onClick={() => {
                          setCourseFilter(course);
                          setIsDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs hover:bg-[#FFB908]/15 text-[#050720]"
                      >
                        {course}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Students Table */}
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
                {filteredStudents.map((std) => (
                  <tr key={std.id} className="hover:bg-[#FFB908]/5 transition-colors">
                    <td className="py-3.5 text-[#050720]/70">{std.srNo}</td>
                    <td className="py-3.5 font-medium">
                      {std.firstName} {std.lastName}
                    </td>
                    <td className="py-3.5 text-[#050720]/70">{std.startDate}</td>
                    <td className="py-3.5 text-[#050720]/70">{std.contact}</td>
                    <td className="py-3.5">
                      <span
                        className={`font-semibold ${
                          std.attendanceRatio === '02/02' ? 'text-[#10B981]' : 'text-[#EF4444]'
                        }`}
                      >
                        {std.attendanceRatio}
                      </span>
                    </td>
                    <td className="py-3.5 text-[#050720]/70">{std.remark}</td>
                    <td className="py-3.5 text-right">
                      <button
                        onClick={() => {
                          setSelectedStudent(std);
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
      {/* 2. DETAILED STUDENT ATTENDANCE PROFILE (SCREENSHOT 2)      */}
      {/* ========================================================= */}
      {view === 'details' && selectedStudent && (
        <div className="space-y-6">
          <button
            onClick={() => setView('list')}
            className="flex items-center gap-2 text-2xl font-bold font-['Sora'] hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="w-6 h-6 text-[#050720]" />
            <span>Student Details</span>
          </button>

          {/* Student Overview Card */}
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
                <span className="font-semibold text-sm">{selectedStudent.batch}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Course</span>
                <span className="font-semibold text-sm">{selectedStudent.course}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Start Date</span>
                <span className="font-semibold text-sm">{selectedStudent.startDate}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Address</span>
                <span className="font-semibold text-sm">{selectedStudent.address}</span>
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

            {/* Attendance Progress Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* This Month */}
              <div className="border border-[#050720]/10 rounded-xl p-5 text-center flex flex-col items-center">
                <span className="text-xl font-bold font-['Sora']">
                  {selectedStudent.metrics.thisMonth}%
                </span>
                <div className="w-32 h-1.5 bg-[#E2E8F0] rounded-full mt-3 overflow-hidden">
                  <div
                    className="h-full bg-[#10B981] rounded-full"
                    style={{ width: `${selectedStudent.metrics.thisMonth}%` }}
                  />
                </div>
                <span className="text-[10px] text-[#050720]/50 mt-2 font-medium">This Month</span>
              </div>

              {/* Last Month */}
              <div className="border border-[#050720]/10 rounded-xl p-5 text-center flex flex-col items-center">
                <span className="text-xl font-bold font-['Sora']">
                  {selectedStudent.metrics.lastMonth}%
                </span>
                <div className="w-32 h-1.5 bg-[#E2E8F0] rounded-full mt-3 overflow-hidden">
                  <div
                    className="h-full bg-[#10B981] rounded-full"
                    style={{ width: `${selectedStudent.metrics.lastMonth}%` }}
                  />
                </div>
                <span className="text-[10px] text-[#050720]/50 mt-2 font-medium">Last Month</span>
              </div>

              {/* Average */}
              <div className="border border-[#050720]/10 rounded-xl p-5 text-center flex flex-col items-center">
                <span className="text-xl font-bold font-['Sora']">
                  {selectedStudent.metrics.average}%
                </span>
                <div className="w-32 h-1.5 bg-[#E2E8F0] rounded-full mt-3 overflow-hidden">
                  <div
                    className="h-full bg-[#10B981] rounded-full"
                    style={{ width: `${selectedStudent.metrics.average}%` }}
                  />
                </div>
                <span className="text-[10px] text-[#050720]/50 mt-2 font-medium">Average</span>
              </div>
            </div>

            {/* Lecture Log Cards */}
            <div className="space-y-3 pt-2">
              {selectedStudent.lectures.map((lec) => (
                <div
                  key={lec.id}
                  className="border border-[#050720]/10 rounded-xl px-5 py-4 flex items-center justify-between"
                >
                  <span className="text-xs font-bold text-[#050720]">{lec.topic}</span>
                  <div className="text-right">
                    <span
                      className={`text-xs font-semibold block ${
                        lec.status === 'Present' ? 'text-[#10B981]' : 'text-[#EF4444]'
                      }`}
                    >
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
    </div>
  );
};