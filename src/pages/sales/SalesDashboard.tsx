import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Plus } from 'lucide-react';
import { leadService } from '../../services/leadService';
import { demoService, DemoItem } from '../../services/demoService';
import { financeService } from '../../services/financeService';
import { DetailedLead } from './SalesLeadsPage';

export const SalesDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState<DetailedLead[]>([]);
  const [demos, setDemos] = useState<DemoItem[]>([]);
  const [pendingInvoicesCount, setPendingInvoicesCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const [leadsData, demosData, invoicesData] = await Promise.all([
          leadService.getAllLeads(),
          demoService.getAllDemos(),
          financeService.getAllInvoices().catch(() => []),
        ]);

        setLeads(leadsData);
        setDemos(demosData);

        const pendingInv = invoicesData.filter(
          (inv: any) => (inv.status || inv.paymentStatus) === 'Partially Paid' || (inv.status || inv.paymentStatus) === 'Overdue'
        ).length;
        setPendingInvoicesCount(pendingInv);
      } catch (err) {
        console.error('Failed to load sales dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const totalLeadsCount = leads.length;
  const contactedCount = leads.filter((l) => l.status === 'Contacted').length;
  const demoScheduledCount = leads.filter((l) => l.status === 'Demo Scheduled').length;
  const interestedCount = leads.filter((l) => l.status === 'Interested').length;
  const convertedCount = leads.filter((l) => l.status === 'Enrolled').length;

  const activeFollowUps = leads.filter(
    (l) => l.status === 'Interested' || l.status === 'Demo Scheduled'
  );

  const scheduledDemos = demos.filter((d) => d.status === 'Scheduled');

  const todayStr = new Date()
    .toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
    .replace(/\//g, '-');
  const leadsCreatedTodayCount = leads.filter(
    (l) => l.enquiryDate === todayStr || l.remark === 'Newly Added'
  ).length;

  return (
    <div className="font-['Onest'] text-[#050720] space-y-6 pb-16">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold font-['Sora']">Dashboard</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/sales/demos')}
            className="flex items-center gap-2 px-4 py-2 border border-[#050720]/25 rounded-lg text-xs font-bold text-[#050720] bg-white hover:bg-[#050720]/5 transition-colors shadow-xs cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Schedule Demo</span>
          </button>
          <button
            onClick={() => navigate('/sales/leads')}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#FFB908] hover:bg-[#E5A607] rounded-lg text-xs font-bold text-[#050720] transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add new lead</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-[#050720]/10 p-5 shadow-xs relative overflow-hidden">
          <div className="absolute left-0 top-6 bottom-6 w-1 bg-[#FFB908] rounded-r" />
          <div className="pl-3">
            <h3 className="text-sm font-bold font-['Sora']">Sales Action Overview</h3>
            <span className="text-[10px] text-[#050720]/50 block mt-0.5">This month</span>

            <div className="grid grid-cols-4 gap-2 text-center mt-5">
              <div>
                <span className="text-[10px] text-[#050720]/60 block font-medium">Follow-ups Due</span>
                <span className="text-2xl font-extrabold font-['Sora'] mt-1 block">
                  {String(activeFollowUps.length).padStart(2, '0')}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/60 block font-medium">Leads created today</span>
                <span className="text-2xl font-extrabold font-['Sora'] mt-1 block">
                  {String(leadsCreatedTodayCount).padStart(2, '0')}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/60 block font-medium">Today&apos;s Demos</span>
                <span className="text-2xl font-extrabold font-['Sora'] mt-1 block">
                  {String(scheduledDemos.length).padStart(2, '0')}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/60 block font-medium">Payment Follow-ups</span>
                <span className="text-2xl font-extrabold font-['Sora'] mt-1 block">
                  {String(pendingInvoicesCount).padStart(2, '0')}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#050720]/10 p-5 shadow-xs relative overflow-hidden">
          <div className="absolute left-0 top-6 bottom-6 w-1 bg-[#FFB908] rounded-r" />
          <div className="pl-3">
            <h3 className="text-sm font-bold font-['Sora']">Lead Pipeline Snapshot</h3>
            <span className="text-[10px] text-[#050720]/50 block mt-0.5">This month</span>

            <div className="grid grid-cols-5 gap-1 text-center mt-5">
              <div>
                <span className="text-[10px] text-[#050720]/60 block font-medium">Total</span>
                <span className="text-2xl font-extrabold font-['Sora'] mt-1 block">
                  {String(totalLeadsCount).padStart(2, '0')}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/60 block font-medium">Contacted</span>
                <span className="text-2xl font-extrabold font-['Sora'] mt-1 block">
                  {String(contactedCount).padStart(2, '0')}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/60 block font-medium">Demo Scheduled</span>
                <span className="text-2xl font-extrabold font-['Sora'] mt-1 block">
                  {String(demoScheduledCount).padStart(2, '0')}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/60 block font-medium">Interested</span>
                <span className="text-2xl font-extrabold font-['Sora'] mt-1 block">
                  {String(interestedCount).padStart(2, '0')}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/60 block font-medium">Converted</span>
                <span className="text-2xl font-extrabold font-['Sora'] mt-1 block">
                  {String(convertedCount).padStart(2, '0')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#050720]/10 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold font-['Sora']">Follow-ups</h3>
          <button
            onClick={() => navigate('/sales/follow-up')}
            className="text-xs font-bold text-[#0066FF] hover:underline cursor-pointer"
          >
            View all
          </button>
        </div>

        {isLoading ? (
          <div className="py-8 text-center text-xs text-[#050720]/50">
            Loading follow-ups from database...
          </div>
        ) : activeFollowUps.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#050720]/50">
            No active follow-ups due.
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#050720]/10 text-[#050720] font-bold">
                <th className="pb-3.5 font-semibold">Sr. No.</th>
                <th className="pb-3.5 font-semibold">Name</th>
                <th className="pb-3.5 font-semibold">Contact No.</th>
                <th className="pb-3.5 font-semibold">Enquiry Date</th>
                <th className="pb-3.5 font-semibold">Course</th>
                <th className="pb-3.5 font-semibold">Status</th>
                <th className="pb-3.5 font-semibold">Follow-up</th>
                <th className="pb-3.5 font-semibold">Remark</th>
                <th className="pb-3.5 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#050720]/5 text-[#050720]">
              {activeFollowUps.slice(0, 5).map((item, index) => (
                <tr key={item.id} className="hover:bg-[#FFB908]/5 transition-colors">
                  <td className="py-3.5 text-[#050720]/70">
                    {String(index + 1).padStart(2, '0')}
                  </td>
                  <td className="py-3.5 font-medium">{item.firstName} {item.lastName || ''}</td>
                  <td className="py-3.5 text-[#050720]/70">{item.contactNo}</td>
                  <td className="py-3.5 text-[#050720]/70">{item.enquiryDate}</td>
                  <td className="py-3.5 text-[#050720]/70">{item.course}</td>
                  <td className="py-3.5">
                    <span className={`font-semibold ${item.status === 'Interested' ? 'text-[#10B981]' : 'text-[#0066FF]'
                      }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3.5 text-[#050720]/70">{item.followUp || '—'}</td>
                  <td className="py-3.5 text-[#050720]/70">{item.remark || '—'}</td>
                  <td className="py-3.5 text-right">
                    <button
                      onClick={() => navigate(`/sales/leads?leadId=${item.id}`)}
                      className="px-3 py-1 border border-[#050720]/30 rounded text-[11px] font-semibold text-[#050720] hover:bg-[#050720]/5 transition-colors cursor-pointer"
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

      <div className="bg-white border border-[#050720]/10 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold font-['Sora']">Scheduled Demos</h3>
          <button
            onClick={() => navigate('/sales/demos')}
            className="text-xs font-bold text-[#0066FF] hover:underline cursor-pointer"
          >
            View all
          </button>
        </div>

        {isLoading ? (
          <div className="py-8 text-center text-xs text-[#050720]/50">
            Loading scheduled demos from database...
          </div>
        ) : scheduledDemos.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#050720]/50">
            No demos scheduled at this moment.
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#050720]/10 text-[#050720] font-bold">
                <th className="pb-3.5 font-semibold">Sr. No.</th>
                <th className="pb-3.5 font-semibold">Name</th>
                <th className="pb-3.5 font-semibold">Time Slot</th>
                <th className="pb-3.5 font-semibold">Demo Date</th>
                <th className="pb-3.5 font-semibold">Course</th>
                <th className="pb-3.5 font-semibold">Mode</th>
                <th className="pb-3.5 font-semibold">Faculty</th>
                <th className="pb-3.5 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#050720]/5 text-[#050720]">
              {scheduledDemos.slice(0, 5).map((demo, index) => (
                <tr key={demo.id} className="hover:bg-[#FFB908]/5 transition-colors">
                  <td className="py-3.5 text-[#050720]/70">
                    {String(index + 1).padStart(2, '0')}
                  </td>
                  <td className="py-3.5 font-medium">{demo.name} {demo.lastName || ''}</td>
                  <td className="py-3.5 text-[#050720]/70">{demo.timeSlot}</td>
                  <td className="py-3.5 text-[#050720]/70">{demo.demoDate}</td>
                  <td className="py-3.5 text-[#050720]/70">{demo.course}</td>
                  <td className="py-3.5 text-[#050720]/70">{demo.mode}</td>
                  <td className="py-3.5 text-[#050720]/70">{demo.faculty}</td>
                  <td className="py-3.5 text-right">
                    <button
                      onClick={() => navigate('/sales/demos')}
                      className="px-3 py-1 border border-[#050720]/30 rounded text-[11px] font-semibold text-[#050720] hover:bg-[#050720]/5 transition-colors cursor-pointer"
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