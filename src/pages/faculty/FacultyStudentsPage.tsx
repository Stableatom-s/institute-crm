import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
  const [courseFilter, setCourseFilter] = useState('UI/UX Design');

  const [students] = useState<StudentRecord[]>([
    {
      id: 's1',
      srNo: '01',
      name: 'Tanaya Junnarkar',
      startDate: '21-12-2025',
      contact: '9158745870',
      attendance: '02/02',
      attendedCount: 2,
      totalCount: 2,
      remark: 'Regular Attendance',
      course: 'UI/UX Design',
      batchCode: 'MWF-JAN-2026',
      email: 'tanaya.j@radiquolab.com',
    },
    {
      id: 's2',
      srNo: '02',
      name: 'Aashi Shah',
      startDate: '21-12-2025',
      contact: '9876543152',
      attendance: '01/02',
      attendedCount: 1,
      totalCount: 2,
      remark: 'Irregular Attendance',
      course: 'UI/UX Design',
      batchCode: 'MWF-JAN-2026',
      email: 'aashi.shah@radiquolab.com',
    },
    {
      id: 's3',
      srNo: '03',
      name: 'Vishwajeet Pawale',
      startDate: '21-12-2025',
      contact: '8987456512',
      attendance: '01/02',
      attendedCount: 1,
      totalCount: 2,
      remark: 'Irregular attendance',
      course: 'UI/UX Design',
      batchCode: 'TTS-JAN-2026',
      email: 'vishwajeet.p@radiquolab.com',
    },
  ]);

  const filteredStudents = students.filter((s) =>
    courseFilter === 'All' ? true : s.course === courseFilter
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
            <option value="UI/UX Design">UI/UX Design</option>
            <option value="No Code">No Code</option>
            <option value="Portfolio">Portfolio</option>
            <option value="Full-Stack">Full-Stack</option>
            <option value="All">All Courses</option>
          </select>
        </div>

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
            {filteredStudents.map((row) => {
              const isRegular = row.attendedCount === row.totalCount;
              return (
                <tr key={row.id} className="hover:bg-[#FFB908]/5 transition-colors">
                  <td className="py-3.5 text-[#050720]/70">{row.srNo}</td>
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

        <div className="flex justify-end items-center gap-3 mt-6 text-xs text-[#050720]/60">
          <span>Jump to</span>
          <span className="border border-[#050720]/20 rounded px-2 py-0.5 text-[#050720] font-medium">01</span>
          <span>&lt; 01 of 10 &gt;</span>
        </div>
      </div>
    </div>
  );
};