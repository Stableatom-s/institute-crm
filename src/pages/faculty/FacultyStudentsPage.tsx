import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { batchService } from '../../services/batchService';

interface StudentRecord {
  id: string;
  srNo: string;
  name: string;
  startDate: string;
  contact: string;
  attendance: string;
  attendedCount: number;
  totalCount: number;
  remark: string;
  course: string;
  batchCode: string;
  email: string;
}

export const FacultyStudentsPage: React.FC = () => {
  const navigate = useNavigate();
  const auth = useAuth() as any;
  const currentUserName = auth?.user?.name || 'Poorva Pande';

  const [courseFilter, setCourseFilter] = useState('All');
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch all batches and extract unique students
  useEffect(() => {
    const fetchStudentsFromBatches = async () => {
      try {
        setIsLoading(true);
        const allBatches = await batchService.getAllBatches();

        // Filter batches belonging to the logged-in faculty member
        const facultyBatches = allBatches.filter(
          (b) =>
            b.faculty.toLowerCase().includes(currentUserName.toLowerCase()) ||
            currentUserName.toLowerCase().includes(b.faculty.toLowerCase())
        );

        const targetBatches = facultyBatches.length > 0 ? facultyBatches : allBatches;

        // Flatten enrolled students across batches
        const studentList: StudentRecord[] = [];
        targetBatches.forEach((batch) => {
          (batch.students || []).forEach((st: any) => {
            const displayName =
              st.name ||
              `${st.firstName || ''} ${st.lastName || ''}`.trim() ||
              'Unnamed Student';

            const attendanceStr = st.attendance || st.attendanceRatio || '100%';
            const attendedCount = attendanceStr.includes('%') ? parseInt(attendanceStr) : 2;
            const totalCount = attendanceStr.includes('%') ? 100 : 2;

            studentList.push({
              id: st.id || st._id || `st-${batch.id}-${studentList.length + 1}`,
              srNo: '',
              name: displayName,
              startDate: st.startDate || batch.startDate || '21-12-2025',
              contact: st.contact || '—',
              attendance: attendanceStr,
              attendedCount,
              totalCount,
              remark: st.remark || 'Regular Attendance',
              course: batch.course || 'UI/UX Design',
              batchCode: batch.batchCode,
              email: st.email || `${displayName.toLowerCase().replace(/\s+/g, '.')}@radiquolab.com`,
            });
          });
        });

        setStudents(studentList);
      } catch (err) {
        console.error('Failed to load students for faculty:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudentsFromBatches();
  }, [currentUserName]);

  const filteredStudents = students.filter((s) =>
    courseFilter === 'All' ? true : s.course.toLowerCase() === courseFilter.toLowerCase()
  );

  const handleViewStudent = (student: StudentRecord) => {
    navigate('/faculty/batches', {
      state: {
        activeTab: 'studentDetail',
        from: 'students',
        batchCode: student.batchCode,
        student: student,
      },
    });
  };

  return (
    <div className="font-['Onest'] space-y-6 pb-12">
      <h1 className="text-2xl font-bold text-[#050720] font-['Sora']">
        Student Management
      </h1>

      <div className="bg-white border border-[#050720]/10 rounded-xl p-6 shadow-xs">
        <h2 className="text-base font-bold text-[#050720] font-['Sora'] mb-4">
          Student List
        </h2>

        <div className="flex items-center gap-2 mb-6">
          <span className="text-xs text-[#050720]/60 font-medium">Sort by:</span>
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="border border-[#050720]/15 rounded-md px-3 py-1 text-xs text-[#050720] bg-white focus:outline-none"
          >
            <option value="All">All Courses</option>
            <option value="UI/UX Design">UI/UX Design</option>
            <option value="No Code">No Code</option>
            <option value="Portfolio">Portfolio</option>
            <option value="Full-Stack">Full-Stack</option>
            <option value="React Native">React Native</option>
          </select>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-xs text-[#050720]/50">
            Loading students from database...
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#050720]/50">
            No students found. Add enrolled students to batches first.
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
                const isRegular =
                  row.attendance === '100%' ||
                  row.attendedCount >= row.totalCount ||
                  row.remark.toLowerCase().includes('regular');

                return (
                  <tr key={row.id} className="hover:bg-[#FFB908]/5 transition-colors">
                    <td className="py-3.5 text-[#050720]/70">
                      {String(index + 1).padStart(2, '0')}
                    </td>
                    <td className="py-3.5 font-medium">{row.name}</td>
                    <td className="py-3.5 text-[#050720]/70">{row.startDate}</td>
                    <td className="py-3.5 text-[#050720]/70">{row.contact}</td>
                    <td className="py-3.5 font-semibold">
                      <span className={isRegular ? 'text-emerald-600' : 'text-rose-500'}>
                        {row.attendance}
                      </span>
                    </td>
                    <td className="py-3.5 text-[#050720]/70">{row.remark}</td>
                    <td className="py-3.5 text-right">
                      <button
                        onClick={() => handleViewStudent(row)}
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
    </div>
  );
};