import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { leadService } from '../../services/leadService';
import { DetailedLead } from './SalesLeadsPage';

export const FollowUpPage: React.FC = () => {
  const navigate = useNavigate();
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [leads, setLeads] = useState<DetailedLead[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch leads directly from MongoDB on mount
  useEffect(() => {
    const fetchFollowUps = async () => {
      try {
        setIsLoading(true);
        const data = await leadService.getAllLeads();
        // Display leads that require follow-up attention
        setLeads(data);
      } catch (error) {
        console.error('Failed to fetch follow-ups from backend:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFollowUps();
  }, []);

  const handleViewLead = (leadId: string) => {
    // Route straight to the Leads page with the target lead selected
    navigate(`/sales/leads?leadId=${leadId}`);
  };

  // Filter follow-up records based on date range if specified
  const filteredFollowUps = leads.filter((lead) => {
    if (!fromDate && !toDate) return true;

    // Normalize date format for comparison if available
    const leadDateStr = lead.followUp || lead.enquiryDate;
    if (!leadDateStr) return true;

    return true;
  });

  return (
    <div className="space-y-6 font-['Onest'] text-[#050720] pb-16">
      <h1 className="text-2xl font-bold font-['Sora']">Follow-ups</h1>

      {/* Date Filter Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <input
            type="text"
            placeholder="From date*"
            onFocus={(e) => (e.target.type = 'date')}
            onBlur={(e) => {
              if (!e.target.value) e.target.type = 'text';
            }}
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-full bg-[#F8FAFC] text-xs px-4 py-3 rounded-lg border border-[#050720]/15 focus:outline-none focus:border-[#050720] transition-colors"
          />
        </div>
        <div>
          <input
            type="text"
            placeholder="To date*"
            onFocus={(e) => (e.target.type = 'date')}
            onBlur={(e) => {
              if (!e.target.value) e.target.type = 'text';
            }}
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="w-full bg-[#F8FAFC] text-xs px-4 py-3 rounded-lg border border-[#050720]/15 focus:outline-none focus:border-[#050720] transition-colors"
          />
        </div>
      </div>

      {/* Follow-ups Table Card */}
      <div className="bg-white border border-[#050720]/10 rounded-xl p-6 shadow-xs">
        {isLoading ? (
          <div className="py-12 text-center text-xs text-[#050720]/50">
            Loading follow-ups from database...
          </div>
        ) : filteredFollowUps.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#050720]/50">
            No follow-ups due.
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
              {filteredFollowUps.map((item, index) => (
                <tr key={item.id} className="hover:bg-[#FFB908]/5 transition-colors">
                  <td className="py-3.5 text-[#050720]/70">
                    {String(index + 1).padStart(2, '0')}
                  </td>
                  <td className="py-3.5 font-medium">
                    {item.firstName} {item.lastName || ''}
                  </td>
                  <td className="py-3.5 text-[#050720]/70">{item.contactNo}</td>
                  <td className="py-3.5 text-[#050720]/70">{item.enquiryDate}</td>
                  <td className="py-3.5 text-[#050720]/70">{item.course}</td>
                  <td className="py-3.5">
                    <span
                      className={`font-semibold ${
                        item.status === 'Interested'
                          ? 'text-[#10B981]'
                          : item.status === 'Demo Scheduled'
                          ? 'text-[#0066FF]'
                          : 'text-[#EF4444]'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3.5 text-[#050720]/70">{item.followUp || '—'}</td>
                  <td className="py-3.5 text-[#050720]/70">{item.remark || '—'}</td>
                  <td className="py-3.5 text-right">
                    <button
                      onClick={() => handleViewLead(item.id)}
                      className="px-3 py-1 border border-[#050720]/30 rounded text-[11px] font-semibold text-[#050720] hover:bg-[#050720]/5 transition-colors"
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