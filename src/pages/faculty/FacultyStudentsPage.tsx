import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { batchService, BatchItem } from '../../services/batchService';

interface AttendanceLecture {
  id: string;
  topic: string;
  date: string;
  status: 'Present' | 'Absent';
}

interface StudentRecord {
  id: string;
  srNo: string;
  name: string;
  firstName: string;
  lastName: string;
  startDate: string;
  contact: string;
  attendance: string;
  attendedCount: number;
  totalCount: number;
  remark: string;
  course: string;
  batchCode: string;
  batchId: string;
  email: string;
  address: string;
  metrics: {
    thisMonth: number;
    lastMonth: number;
    average: number;
  };
  lectures: AttendanceLecture[];
}

export const FacultyStudentsPage: React.FC = () => {
  const auth = useAuth() as any;
  const currentUserName = (auth?.user?.name || '').trim().toLowerCase();

  const [view, setView] = useState<'list' | 'details'>('list');
  const [courseFilter, setCourseFilter] = useState('All');
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Strict student isolation: Only display students in batches taught by the logged-in faculty
  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      const allBatches: BatchItem[] = await batchService.getAllBatches();

      // Only match batches belonging directly to this faculty member
      const facultyBatches = allBatches.filter((b) => {
        const batchFaculty = (b.faculty || '').trim().toLowerCase();
        if (!currentUserName || !batchFaculty) return false;
        return (
          batchFaculty === currentUserName ||
          batchFaculty.includes(currentUserName) ||
          currentUserName.includes(batchFaculty)
        );
      });

      const studentList: StudentRecord[] = [];

      facultyBatches.forEach((batch) => {
        (batch.students || []).forEach((st: any, idx: number) => {
          const rawName =
            st.name ||
            `${st.firstName || ''} ${st.lastName || ''}`.trim() ||
            'Unnamed Student';
          const nameParts = rawName.split(' ');
          const fName = st.firstName || nameParts[0] || 'Student';
          const lName = st.lastName || nameParts.slice(1).join(' ') || '';

          const studentLectures: AttendanceLecture[] = (batch.lectures || []).map((lec: any, lIdx: number) => {
            const hasRecord = (lec.studentsList || []).find(
              (s: any) => (s.name || '').trim().toLowerCase() === rawName.toLowerCase()
            );

            const isPresent = hasRecord
              ? (hasRecord.isPresent ?? hasRecord.present ?? false)
              : false;

            return {
              id: lec.id || `lec-${lIdx}`,
              topic: lec.lectureTopic || lec.title || lec.topic || 'Lecture Session',
              date: lec.date || batch.startDate,
              status: isPresent ? 'Present' : 'Absent',
            };
          });

          const totalLecs = studentLectures.length;
          const presentLecs = studentLectures.filter((l) => l.status === 'Present').length;

          let dynamicPercent = 0;
          let attendanceStr = '00/00';

          if (totalLecs > 0) {
            dynamicPercent = Math.round((presentLecs / totalLecs) * 100);
            attendanceStr = `${String(presentLecs).padStart(2, '0')}/${String(totalLecs).padStart(2, '0')}`;
          } else if (st.attendanceRatio && st.attendanceRatio.includes('/')) {
            const [p, t] = st.attendanceRatio.split('/').map((n: string) => parseInt(n, 10));
            dynamicPercent = t > 0 ? Math.round((p / t) * 100) : 0;
            attendanceStr = st.attendanceRatio;
          } else if (st.attendance && st.attendance.includes('%')) {
            dynamicPercent = parseInt(st.attendance.replace('%', ''), 10) || 0;
            attendanceStr = st.attendance;
          }

          studentList.push({
            id: st.id || st._id || `st-${batch.id}-${idx}`,
            srNo: String(studentList.length + 1).padStart(2, '0'),
            name: rawName,
            firstName: fName,
            lastName: lName,
            startDate: st.startDate || batch.startDate || '—',
            contact: st.contact || '—',
            attendance: attendanceStr,
            attendedCount: presentLecs,
            totalCount: totalLecs,
            remark: st.remark || (dynamicPercent >= 75 ? 'Regular Attendance' : 'Irregular Attendance'),
            course: batch.course || '',
            batchCode: batch.batchCode || '—',
            batchId: batch.id,
            email: st.email || '',
            address: st.address || '—',
            metrics: {
              thisMonth: dynamicPercent,
              lastMonth: dynamicPercent,
              average: dynamicPercent,
            },
            lectures: studentLectures,
          });
        });
      });

      setStudents(studentList);
      if (studentList.length > 0 && !selectedStudent) {
        setSelectedStudent(studentList[0]);
      } else if (studentList.length === 0) {
        setSelectedStudent(null);
      }
    } catch (err) {
      console.error('Failed to load students for faculty:', err);
      setStudents([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [currentUserName]);

  const filteredStudents = students.filter((s) =>
    courseFilter === 'All' ? true : s.course.toLowerCase() === courseFilter.toLowerCase()
  );

  return (
    <div className="font-['Onest'] space-y-6 pb-16 text-[#050720]">
      {/* 1. LIST VIEW */}
      {view === 'list' && (
        <>
          <h1 className="text-2xl font-bold font-['Sora']">Student Management</h1>

          <div className="bg-white border border-[#050720]/10 rounded-xl p-6 shadow-xs">
            <h2 className="text-base font-bold font-['Sora'] mb-4">Student List</h2>

            <div className="flex items-center gap-2 mb-6">
              <span className="text-xs text-[#050720]/60 font-medium">Sort by:</span>
              <select
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                className="border border-[#050720]/15 rounded-md px-3 py-1 text-xs text-[#050720] bg-white focus:outline-none cursor-pointer"
              >
                <option value="All">All Courses</option>
                <option value="UI/UX Design">UI/UX Design</option>
                <option value="No Code">No Code</option>
                <option value="Portfolio">Portfolio</option>
                <option value="Full Stack">Full Stack</option>
                <option value="React Native">React Native</option>
                <option value="React">React</option>
              </select>
            </div>

            {isLoading ? (
              <div className="py-12 text-center text-xs text-[#050720]/50">
                Loading students from database...
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#050720]/50">
                No students found in your assigned batches.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#050720]/10 text-[#050720]/70 pb-3 font-semibold">
                    <th className="pb-3">Sr. No.</th>
                    <th className="pb-3">Student Name</th>
                    <th className="pb-3">Start Date</th>
                    <th className="pb-3">Contact</th>
                    <th className="pb-3">Attendance</th>
                    <th className="pb-3">Remark</th>
                    <th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#050720]/5 text-[#050720]">
                  {filteredStudents.map((row, index) => {
                    const isGood = row.metrics.average >= 75;

                    return (
                      <tr key={row.id} className="hover:bg-[#FFB908]/5 transition-colors">
                        <td className="py-3.5 text-[#050720]/70">
                          {String(index + 1).padStart(2, '0')}
                        </td>
                        <td className="py-3.5 font-medium">{row.name}</td>
                        <td className="py-3.5 text-[#050720]/70">{row.startDate}</td>
                        <td className="py-3.5 text-[#050720]/70">{row.contact}</td>
                        <td className="py-3.5 font-semibold">
                          <span className={isGood ? 'text-emerald-600' : 'text-rose-500'}>
                            {row.attendance}
                          </span>
                        </td>
                        <td className="py-3.5 text-[#050720]/70">{row.remark}</td>
                        <td className="py-3.5 text-right">
                          <button
                            onClick={() => {
                              setSelectedStudent(row);
                              setView('details');
                            }}
                            className="px-3.5 py-1 border border-[#050720]/30 rounded text-[11px] font-semibold text-[#050720] hover:bg-[#050720]/5 transition-colors cursor-pointer"
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

            <div className="flex justify-end items-center gap-3 mt-6 text-xs text-[#050720]/60">
              <span>Jump to</span>
              <span className="border border-[#050720]/20 rounded px-2 py-0.5 text-[#050720] font-medium">
                01
              </span>
              <span>&lt; 01 of 10 &gt;</span>
            </div>
          </div>
        </>
      )}

      {/* 2. DETAILS VIEW */}
      {view === 'details' && selectedStudent && (
        <div className="space-y-6">
          <button
            onClick={() => setView('list')}
            className="flex items-center gap-2 text-2xl font-bold font-['Sora'] hover:opacity-80 transition-opacity cursor-pointer"
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
                <span className="font-semibold text-sm">{selectedStudent.lastName || '—'}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Batch</span>
                <span className="font-semibold text-sm">{selectedStudent.batchCode}</span>
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
                <span className="text-[10px] text-[#050720]/50 block">Add remark</span>
                <span className="font-semibold text-sm">{selectedStudent.remark}</span>
              </div>
            </div>
          </div>

          {/* Attendance Section */}
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