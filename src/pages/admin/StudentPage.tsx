import React, { useState, useEffect } from 'react';
import { ArrowLeft, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { batchService, BatchItem } from '../../services/batchService';
import { leadService } from '../../services/leadService';

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
  remark: string;
  metrics: {
    thisMonth: number;
    lastMonth: number;
    average: number;
  };
  lectures: AttendanceLecture[];
}

const COURSES = ['All', 'UI/UX Design', 'No Code', 'Full Stack', 'Full-stack Development', 'Portfolio'];

export const AdminStudentPage: React.FC = () => {
  const [view, setView] = useState<'list' | 'details'>('list');
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);
  const [courseFilter, setCourseFilter] = useState('All');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      const [batches, leads] = await Promise.all([
        batchService.getAllBatches().catch(() => [] as BatchItem[]),
        leadService.getAllLeads().catch(() => [] as any[]),
      ]);

      const studentList: StudentRecord[] = [];
      const seenNames = new Set<string>();

      // 1. Process batch students with live lecture attendance
      batches.forEach((batch) => {
        (batch.students || []).forEach((st: any, idx: number) => {
          const rawName = st.name || `${st.firstName || ''} ${st.lastName || ''}`.trim() || 'Student';
          seenNames.add(rawName.toLowerCase());

          const nameParts = rawName.split(' ');
          const fName = st.firstName || nameParts[0] || 'Student';
          const lName = st.lastName || nameParts.slice(1).join(' ') || '';

          const studentLectures: AttendanceLecture[] = (batch.lectures || []).map((lec: any, lIdx: number) => {
            const hasRecord = (lec.studentsList || []).find(
              (s: any) => (s.name || '').trim().toLowerCase() === rawName.toLowerCase()
            );

            const isPresent = hasRecord
              ? Boolean(hasRecord.isPresent ?? hasRecord.present)
              : false;

            return {
              id: lec.id || `lec-${lIdx}`,
              topic: lec.lectureTopic || lec.title || lec.topic || 'Lecture Session',
              date: lec.date || batch.startDate,
              status: isPresent ? 'Present' : 'Absent',
            };
          });

          const totalLecs = studentLectures.length;
          const attendedLecs = studentLectures.filter((l) => l.status === 'Present').length;

          let dynamicPercent = 0;
          let ratioStr = '00/00';

          if (totalLecs > 0) {
            dynamicPercent = Math.round((attendedLecs / totalLecs) * 100);
            ratioStr = `${String(attendedLecs).padStart(2, '0')}/${String(totalLecs).padStart(2, '0')}`;
          } else if (st.attendanceRatio && st.attendanceRatio.includes('/')) {
            const [att, tot] = st.attendanceRatio.split('/').map((n: string) => parseInt(n, 10));
            dynamicPercent = tot > 0 ? Math.round((att / tot) * 100) : 0;
            ratioStr = st.attendanceRatio;
          }

          studentList.push({
            id: st.id || st._id || `${batch.id}-st-${idx}`,
            srNo: '',
            firstName: fName,
            lastName: lName,
            startDate: st.startDate || batch.startDate || '—',
            contact: st.contact || '—',
            course: batch.course || 'UI/UX Design',
            batch: batch.batchCode || '—',
            address: st.address || '—',
            attendanceRatio: ratioStr,
            remark: st.remark || (dynamicPercent >= 75 ? 'Regular Attendance' : 'Active'),
            metrics: {
              thisMonth: dynamicPercent,
              lastMonth: dynamicPercent,
              average: dynamicPercent,
            },
            lectures: studentLectures,
          });
        });
      });

      // 2. Include all enrolled leads even if not yet placed into a batch
      leads
        .filter((l) => l.status === 'Enrolled')
        .forEach((l) => {
          const fullName = `${l.firstName || ''} ${l.lastName || ''}`.trim() || 'Student';
          if (!seenNames.has(fullName.toLowerCase())) {
            seenNames.add(fullName.toLowerCase());
            studentList.push({
              id: l.id,
              srNo: '',
              firstName: l.firstName || '',
              lastName: l.lastName || '',
              startDate: l.enquiryDate || '—',
              contact: l.contactNo || '—',
              course: l.course || 'UI/UX Design',
              batch: 'Pending Batch',
              address: l.address || '—',
              attendanceRatio: '00/00',
              remark: 'Newly Enrolled',
              metrics: {
                thisMonth: 0,
                lastMonth: 0,
                average: 0,
              },
              lectures: [],
            });
          }
        });

      setStudents(studentList);
      if (studentList.length > 0 && !selectedStudent) {
        setSelectedStudent(studentList[0]);
      } else if (studentList.length === 0) {
        setSelectedStudent(null);
      }
    } catch (err) {
      console.error('Failed to load students from server:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const filteredStudents = students.filter((student) => {
    if (courseFilter === 'All') return true;
    return student.course.toLowerCase().includes(courseFilter.toLowerCase()) ||
      courseFilter.toLowerCase().includes(student.course.toLowerCase());
  });

  return (
    <div className="font-['Onest'] text-[#050720] pb-16">
      {view === 'list' && (
        <div className="space-y-6">
          <h1 className="text-2xl font-bold font-['Sora']">Student Management</h1>

          <div className="bg-white border border-[#050720]/10 rounded-xl p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold font-['Sora']">Student List</h2>

            <div className="flex items-center gap-3 relative z-10 pt-1">
              <span className="text-xs text-[#050720]/70 font-medium">Sort by:</span>
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center justify-between gap-3 px-3 py-1.5 bg-white border border-[#050720]/20 rounded-lg text-xs font-medium min-w-[130px] cursor-pointer"
                >
                  <span>{courseFilter === 'All' ? 'All Courses' : courseFilter}</span>
                  {isDropdownOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {isDropdownOpen && (
                  <div className="absolute left-0 top-9 w-44 bg-white border border-[#050720]/15 rounded-lg shadow-lg py-1 z-20">
                    {COURSES.map((course) => (
                      <button
                        key={course}
                        onClick={() => {
                          setCourseFilter(course);
                          setIsDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs hover:bg-[#FFB908]/15 text-[#050720] cursor-pointer"
                      >
                        {course === 'All' ? 'All Courses' : course}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {isLoading ? (
              <div className="py-12 text-center text-xs text-[#050720]/50">
                Loading students from database...
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#050720]/50">
                No students enrolled in {courseFilter === 'All' ? 'the institute' : courseFilter}.
              </div>
            ) : (
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
                  {filteredStudents.map((std, index) => {
                    const isGoodAttendance = std.metrics.average >= 75;

                    return (
                      <tr key={std.id} className="hover:bg-[#FFB908]/5 transition-colors">
                        <td className="py-3.5 text-[#050720]/70">
                          {String(index + 1).padStart(2, '0')}
                        </td>
                        <td className="py-3.5 font-medium">
                          {std.firstName} {std.lastName}
                        </td>
                        <td className="py-3.5 text-[#050720]/70">{std.startDate}</td>
                        <td className="py-3.5 text-[#050720]/70">{std.contact}</td>
                        <td className="py-3.5">
                          <span
                            className={`font-semibold ${
                              isGoodAttendance ? 'text-[#10B981]' : 'text-[#EF4444]'
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
                            className="px-3 py-1 border border-[#050720]/30 rounded text-[11px] font-semibold text-[#050720] hover:bg-[#050720]/5 transition-colors cursor-pointer"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

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
                <span className="text-[11px] font-semibold text-[#050720]">01 of 10</span>
                <button className="p-1 hover:text-[#050720] cursor-pointer">
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {view === 'details' && selectedStudent && (
        <div className="space-y-6">
          <button
            onClick={() => setView('list')}
            className="flex items-center gap-2 text-2xl font-bold font-['Sora'] hover:opacity-80 transition-opacity cursor-pointer"
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
                <span className="font-semibold text-sm">{selectedStudent.lastName || '—'}</span>
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

          <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-6">
            <h3 className="text-sm font-bold font-['Sora']">Attendance</h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'This Month', percent: selectedStudent.metrics.thisMonth },
                { label: 'Last Month', percent: selectedStudent.metrics.lastMonth },
                { label: 'Average', percent: selectedStudent.metrics.average },
              ].map((stat, i) => (
                <div key={i} className="border border-[#050720]/10 rounded-xl p-5 text-center flex flex-col items-center">
                  <span className="text-2xl font-extrabold font-['Sora']">
                    {stat.percent}%
                  </span>
                  <div className="w-32 h-1.5 bg-[#E2E8F0] rounded-full mt-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        stat.percent >= 75 ? 'bg-[#10B981]' : 'bg-[#EF4444]'
                      }`}
                      style={{ width: `${stat.percent}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-[#050720]/50 mt-2 font-medium">{stat.label}</span>
                </div>
              ))}
            </div>

            <div className="space-y-3 pt-2">
              {selectedStudent.lectures.length === 0 ? (
                <div className="border border-[#050720]/10 rounded-xl px-5 py-4 flex items-center justify-between">
                  <span className="text-xs font-bold text-[#050720]">Lecture 1</span>
                  <div className="text-right">
                    <span
                      className={`text-xs font-semibold block ${
                        selectedStudent.metrics.average > 0 ? 'text-[#10B981]' : 'text-[#EF4444]'
                      }`}
                    >
                      {selectedStudent.metrics.average > 0 ? 'Present' : 'Absent'}
                    </span>
                    <span className="text-[10px] text-[#050720]/50 block mt-0.5">
                      {selectedStudent.startDate}
                    </span>
                  </div>
                </div>
              ) : (
                selectedStudent.lectures.map((lec) => (
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
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};