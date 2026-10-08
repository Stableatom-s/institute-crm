import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { demoService, DemoItem } from '../../services/demoService';
import { batchService, BatchItem } from '../../services/batchService';

export const FacultyDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const auth = useAuth() as any;
  const currentUserName = (auth?.user?.name || '').trim().toLowerCase();

  const [demos, setDemos] = useState<DemoItem[]>([]);
  const [batches, setBatches] = useState<BatchItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!currentUserName) return;
      try {
        setIsLoading(true);
        const [allDemos, allBatches] = await Promise.all([
          demoService.getAllDemos(),
          batchService.getAllBatches(),
        ]);

        // Strict filter: match only demos assigned to this faculty member
        const facultyDemos = allDemos.filter((d) => {
          const facultyName = (d.faculty || '').trim().toLowerCase();
          return (
            facultyName === currentUserName ||
            (currentUserName.length > 0 && facultyName.includes(currentUserName)) ||
            (facultyName.length > 0 && currentUserName.includes(facultyName))
          );
        });
        setDemos(facultyDemos.filter((d) => d.status === 'Scheduled'));

        // Strict filter: match only batches assigned to this faculty member
        const facultyBatches = allBatches.filter((b) => {
          const facultyName = (b.faculty || '').trim().toLowerCase();
          return (
            facultyName === currentUserName ||
            (currentUserName.length > 0 && facultyName.includes(currentUserName)) ||
            (facultyName.length > 0 && currentUserName.includes(facultyName))
          );
        });
        setBatches(facultyBatches);
      } catch (err) {
        console.error('Failed to load faculty dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentUserName]);

  const totalBatchesCount = batches.length;
  const ongoingBatches = batches.filter((b) => (b.students?.length || 0) > 0);
  const upcomingBatches = batches.filter((b) => (b.students?.length || 0) === 0);
  const totalCompletedLectures = batches.reduce(
    (acc, b) => acc + (b.lectures?.length || 0),
    0
  );

  const metricCards = [
    {
      label: 'Total Batches',
      value: String(totalBatchesCount).padStart(2, '0'),
      subtext: 'All time',
    },
    {
      label: 'Ongoing',
      value: String(ongoingBatches.length).padStart(2, '0'),
      subtext: 'Active sessions',
    },
    {
      label: 'Upcoming',
      value: String(upcomingBatches.length).padStart(2, '0'),
      subtext: 'Newly enrolled',
    },
    {
      label: 'Completed',
      value: String(totalCompletedLectures).padStart(2, '0'),
      subtext: 'Lectures delivered',
    },
  ];

  return (
    <div className="font-['Onest'] space-y-6 pb-12">
      <h1 className="text-2xl font-bold text-[#050720] font-['Sora']">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metricCards.map((card, idx) => (
          <div
            key={idx}
            className="bg-white border border-[#050720]/10 rounded-xl p-5 text-center shadow-xs"
          >
            <span className="text-xs font-semibold text-[#050720]/80">{card.label}</span>
            <div className="text-2xl font-extrabold text-[#050720] font-['Sora'] mt-1">
              {card.value}
            </div>
            <span className="text-[11px] text-[#050720]/40">{card.subtext}</span>
          </div>
        ))}
      </div>

      <div className="bg-white border border-[#050720]/10 rounded-xl p-6 shadow-xs">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm font-bold text-[#050720] font-['Sora']">Upcoming Demo</h2>
          <button
            onClick={() => navigate('/faculty/demos')}
            className="text-xs font-medium text-[#2F65FF] hover:underline cursor-pointer"
          >
            View all
          </button>
        </div>

        {isLoading ? (
          <div className="py-8 text-center text-xs text-[#050720]/50">
            Loading upcoming demos from database...
          </div>
        ) : demos.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#050720]/50">
            No upcoming demos scheduled.
          </div>
        ) : (
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
              {demos.slice(0, 5).map((demo, index) => (
                <tr key={demo.id} className="hover:bg-[#FFB908]/5 transition-colors">
                  <td className="py-3.5 text-[#050720]/70">
                    {String(index + 1).padStart(2, '0')}
                  </td>
                  <td className="py-3.5 font-medium">
                    {demo.name} {demo.lastName || ''}
                  </td>
                  <td className="py-3.5 text-[#050720]/70">{demo.timeSlot}</td>
                  <td className="py-3.5 text-[#050720]/70">{demo.demoDate}</td>
                  <td className="py-3.5 text-[#050720]/70">{demo.course}</td>
                  <td className="py-3.5 text-[#050720]/70">{demo.mode}</td>
                  <td className="py-3.5 text-right">
                    <button
                      onClick={() => navigate('/faculty/demos')}
                      className="px-3.5 py-1 border border-[#050720]/30 rounded text-[11px] font-semibold text-[#050720] hover:bg-[#050720]/5 transition-colors cursor-pointer"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

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

        {isLoading ? (
          <div className="py-8 text-center text-xs text-[#050720]/50">
            Loading batches from database...
          </div>
        ) : batches.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#050720]/50">
            No active batches found.
          </div>
        ) : (
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
              {batches.slice(0, 5).map((batch, index) => (
                <tr key={batch.id} className="hover:bg-[#FFB908]/5 transition-colors">
                  <td className="py-3.5 text-[#050720]/70">
                    {String(index + 1).padStart(2, '0')}
                  </td>
                  <td className="py-3.5 font-medium">{batch.batchCode}</td>
                  <td className="py-3.5 text-[#050720]/70">{batch.startDate}</td>
                  <td className="py-3.5 text-[#050720]/70">{batch.course}</td>
                  <td className="py-3.5 text-[#050720]/70">
                    {String(batch.students?.length || 0).padStart(2, '0')}
                  </td>
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
        )}
      </div>
    </div>
  );
};