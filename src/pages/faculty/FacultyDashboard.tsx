import React from 'react';
import { useNavigate } from 'react-router-dom';

interface DemoItem {
  srNo: string;
  name: string;
  timeSlot: string;
  demoDate: string;
  course: string;
  mode: 'Online' | 'Offline';
}

interface BatchItem {
  srNo: string;
  batch: string;
  startDate: string;
  course: string;
  studentCount: string;
}

const METRIC_CARDS = [
  { label: 'Total Batches', value: '05', subtext: 'All time' },
  { label: 'Ongoing', value: '02', subtext: 'Wire framing Phase' },
  { label: 'Upcoming', value: '02', subtext: 'Newly enrolled' },
  { label: 'Completed', value: '01', subtext: 'Portfolio completed' },
];

const UPCOMING_DEMOS: DemoItem[] = [
  { srNo: '01', name: 'Aanya Shah', timeSlot: '11:00 - 12:00', demoDate: '21-12-2025', course: 'UI/UX Design', mode: 'Online' },
  { srNo: '02', name: 'Rohan Mehta', timeSlot: '01:00 - 02:00', demoDate: '21-12-2025', course: 'No Code', mode: 'Online' },
  { srNo: '03', name: 'Neha Patel', timeSlot: '03:00 - 04:00', demoDate: '21-12-2025', course: 'UI/UX Design', mode: 'Offline' },
  { srNo: '04', name: 'Anish Verma', timeSlot: '03:00 - 04:00', demoDate: '21-12-2025', course: 'Portfolio', mode: 'Offline' },
  { srNo: '05', name: 'Siddhi Shah', timeSlot: '01:00 - 02:00', demoDate: '21-12-2025', course: 'Full-Stack', mode: 'Online' },
];

const ONGOING_BATCHES: BatchItem[] = [
  { srNo: '01', batch: 'MWF-JAN-2026', startDate: '21-01-2026', course: 'UI/UX Design', studentCount: '05' },
  { srNo: '02', batch: 'TTS-JAN-2026', startDate: '22-01-2026', course: 'No Code', studentCount: '06' },
  { srNo: '03', batch: 'WEEKEND-JAN-2026', startDate: '26-01-2026', course: 'UI/UX Design', studentCount: '04' },
  { srNo: '04', batch: 'WEEKEND-DEC-2025', startDate: '26-12-2025', course: 'UI/UX Design', studentCount: '04' },
  { srNo: '05', batch: 'WEEKEND-NOV-2025', startDate: '26-11-2025', course: 'UI/UX Design', studentCount: '04' },
];

export const FacultyDashboardPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="font-['Onest'] space-y-6 pb-12">
      {/* Page Title */}
      <h1 className="text-2xl font-bold text-[#050720] font-['Sora']">Dashboard</h1>

      {/* 4 Metric Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {METRIC_CARDS.map((card, idx) => (
          <div
            key={idx}
            className="bg-white border border-[#050720]/10 rounded-xl p-5 text-center shadow-xs"
          >
            <span className="text-xs font-semibold text-[#050720]/80">{card.label}</span>
            <div className="text-2xl font-extrabold text-[#050720] font-['Sora'] mt-1">{card.value}</div>
            <span className="text-[11px] text-[#050720]/40">{card.subtext}</span>
          </div>
        ))}
      </div>

      {/* Table 1: Upcoming Demo */}
      <div className="bg-white border border-[#050720]/10 rounded-xl p-6 shadow-xs">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm font-bold text-[#050720] font-['Sora']">Upcoming Demo</h2>
          <button
            onClick={() => navigate('/faculty/demo-management')}
            className="text-xs font-medium text-[#2F65FF] hover:underline cursor-pointer"
          >
            View all
          </button>
        </div>

        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#050720]/10 text-[#050720]/70 pb-3 font-semibold">
              <th className="pb-3">Sr. No.</th>
              <th className="pb-3">Name</th>
              <th className="pb-3">Time Slot</th>
              <th className="pb-3">Demo Date</th>
              <th className="pb-3">Course</th>
              <th className="pb-3">Mode</th>
              <th className="pb-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#050720]/5 text-[#050720]">
            {UPCOMING_DEMOS.map((demo) => (
              <tr key={demo.srNo} className="hover:bg-[#FFB908]/5 transition-colors">
                <td className="py-3.5 text-[#050720]/70">{demo.srNo}</td>
                <td className="py-3.5 font-medium">{demo.name}</td>
                <td className="py-3.5 text-[#050720]/70">{demo.timeSlot}</td>
                <td className="py-3.5 text-[#050720]/70">{demo.demoDate}</td>
                <td className="py-3.5 text-[#050720]/70">{demo.course}</td>
                <td className="py-3.5 text-[#050720]/70">{demo.mode}</td>
                <td className="py-3.5 text-right">
                  <button
                    onClick={() => navigate('/faculty/demo-management')}
                    className="px-3.5 py-1 border border-[#050720]/30 rounded text-[11px] font-semibold text-[#050720] hover:bg-[#050720]/5 transition-colors cursor-pointer"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Table 2: Ongoing Batches */}
      <div className="bg-white border border-[#050720]/10 rounded-xl p-6 shadow-xs">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm font-bold text-[#050720] font-['Sora']">Ongoing Batches</h2>
          <button
            onClick={() => navigate('/faculty/batches')}
            className="text-xs font-medium text-[#2F65FF] hover:underline cursor-pointer"
          >
            View all
          </button>
        </div>

        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#050720]/10 text-[#050720]/70 pb-3 font-semibold">
              <th className="pb-3">Sr. No.</th>
              <th className="pb-3">Batch</th>
              <th className="pb-3">Start Date</th>
              <th className="pb-3">Course</th>
              <th className="pb-3">Student count</th>
              <th className="pb-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#050720]/5 text-[#050720]">
            {ONGOING_BATCHES.map((batch) => (
              <tr key={batch.srNo} className="hover:bg-[#FFB908]/5 transition-colors">
                <td className="py-3.5 text-[#050720]/70">{batch.srNo}</td>
                <td className="py-3.5 font-medium">{batch.batch}</td>
                <td className="py-3.5 text-[#050720]/70">{batch.startDate}</td>
                <td className="py-3.5 text-[#050720]/70">{batch.course}</td>
                <td className="py-3.5 text-[#050720]/70">{batch.studentCount}</td>
                <td className="py-3.5 text-right">
                  <button
                    onClick={() => navigate('/faculty/batches')}
                    className="px-3.5 py-1 border border-[#050720]/30 rounded text-[11px] font-semibold text-[#050720] hover:bg-[#050720]/5 transition-colors cursor-pointer"
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
  );
};