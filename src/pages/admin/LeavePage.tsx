import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  ChevronDown, 
  ChevronUp, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  X 
} from 'lucide-react';
import { attendanceService } from '../../services/attendanceService';

export type LeaveTab = 'Active' | 'Pending' | 'Rejected';

export interface LeaveRequest {
  id: string;
  srNo: string;
  name: string;
  firstName: string;
  lastName: string;
  role: 'Faculty' | 'Salesperson';
  mobile: string;
  email: string;
  leaveDate: string;
  fromDate: string;
  toDate: string;
  leaveType: 'Sick' | 'Casual' | 'Vacation';
  reason: string;
  applicationDate: string;
  noOfDays: string;
  status: LeaveTab;
  rejectionReason?: string;
}

const LEAVE_TYPES = ['Leave Type', 'Sick', 'Casual', 'Vacation'];

export const AdminLeavePage: React.FC = () => {
  const [view, setView] = useState<'table' | 'details'>('table');
  const [activeTab, setActiveTab] = useState<LeaveTab>('Active');
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters
  const [filterType, setFilterType] = useState('Leave Type');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  // Modals state
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [targetRequest, setTargetRequest] = useState<LeaveRequest | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');

  // Confirmation Alert Dialogs
  const [showApprovedNotice, setShowApprovedNotice] = useState(false);
  const [showRejectedNotice, setShowRejectedNotice] = useState(false);

  // Load from backend
  const loadLeaves = async () => {
    try {
      setIsLoading(true);
      const data = await attendanceService.getAllLeaves();
      if (Array.isArray(data) && data.length > 0) {
        setRequests(data as LeaveRequest[]);
        if (!selectedLeave) setSelectedLeave(data[0] as LeaveRequest);
      } else {
        setRequests([]);
      }
    } catch (err) {
      console.error('Failed to load leaves:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLeaves();
  }, []);

  // Current tab items
  const tabItems = requests.filter((r) => r.status === activeTab);

  // Filtered by leave type
  const filteredItems = tabItems.filter((r) => {
    if (filterType === 'Leave Type') return true;
    return r.leaveType.toLowerCase() === filterType.toLowerCase();
  });

  // Approve handler (Persists to MongoDB)
  const handleConfirmApprove = async () => {
    if (!targetRequest) return;
    try {
      await attendanceService.approveLeave(targetRequest.id);
      await loadLeaves();
      setShowApproveModal(false);
      setShowApprovedNotice(true);
      setTimeout(() => setShowApprovedNotice(false), 2000);
    } catch (err) {
      console.error('Failed to approve leave:', err);
      alert('Failed to approve leave on server.');
    }
  };

  // Reject handler (Persists to MongoDB)
  const handleConfirmReject = async () => {
    if (!targetRequest) return;
    try {
      const reason = rejectionReasonInput || 'Leave request not approved by admin.';
      await attendanceService.rejectLeave(targetRequest.id, reason);
      await loadLeaves();
      setShowRejectModal(false);
      setRejectionReasonInput('');
      setShowRejectedNotice(true);
      setTimeout(() => setShowRejectedNotice(false), 2000);
    } catch (err) {
      console.error('Failed to reject leave:', err);
      alert('Failed to reject leave on server.');
    }
  };

  return (
    <div className="font-['Onest'] text-[#050720] pb-16">
      {/* ========================================================= */}
      {/* 1. MAIN LEAVE MANAGEMENT TABLE VIEW                       */}
      {/* ========================================================= */}
      {view === 'table' && (
        <div className="space-y-6">
          <h1 className="text-2xl font-bold font-['Sora']">Leave Management</h1>

          <div className="bg-white border border-[#050720]/10 rounded-xl p-6 shadow-xs space-y-5">
            {/* Tabs */}
            <div className="flex items-center gap-8 border-b border-[#050720]/10 pb-3">
              {(['Active', 'Pending', 'Rejected'] as LeaveTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setFilterType('Leave Type');
                  }}
                  className={`text-sm font-semibold transition-all relative pb-2 cursor-pointer ${
                    activeTab === tab
                      ? 'text-[#050720] font-bold'
                      : 'text-[#050720]/50 hover:text-[#050720]'
                  }`}
                >
                  <span>{tab}</span>
                  {activeTab === tab && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FFB908] rounded-full" />
                  )}
                </button>
              ))}
            </div>

            {/* Filter by Leave Type */}
            <div className="flex items-center gap-3 relative z-10">
              <span className="text-xs text-[#050720]/70 font-medium">Sort by:</span>
              <div className="relative">
                <button
                  onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                  className="flex items-center justify-between gap-3 px-3 py-1.5 bg-[#F8FAFC] border border-[#050720]/15 rounded-lg text-xs font-medium min-w-[110px] cursor-pointer"
                >
                  <span>{filterType}</span>
                  {isFilterDropdownOpen ? (
                    <ChevronUp className="w-3.5 h-3.5 text-[#050720]/50" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-[#050720]/50" />
                  )}
                </button>
                {isFilterDropdownOpen && (
                  <div className="absolute left-0 top-9 w-36 bg-white border border-[#050720]/15 rounded-lg shadow-lg py-1 z-20">
                    {LEAVE_TYPES.map((t) => (
                      <button
                        key={t}
                        onClick={() => {
                          setFilterType(t);
                          setIsFilterDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs hover:bg-[#FFB908]/15 text-[#050720] cursor-pointer"
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {isLoading ? (
              <div className="py-12 text-center text-xs text-[#050720]/50">
                Loading leave applications from database...
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#050720]/50">
                No {activeTab.toLowerCase()} leave applications found.
              </div>
            ) : (
              <>
                {/* A. Active Tab Table */}
                {activeTab === 'Active' && (
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#050720]/10 text-[#050720] font-bold">
                        <th className="pb-3.5 font-semibold">Sr. No.</th>
                        <th className="pb-3.5 font-semibold">Name</th>
                        <th className="pb-3.5 font-semibold">Role</th>
                        <th className="pb-3.5 font-semibold">Mobile</th>
                        <th className="pb-3.5 font-semibold">Email</th>
                        <th className="pb-3.5 font-semibold">Leave date</th>
                        <th className="pb-3.5 font-semibold">Leave Type</th>
                        <th className="pb-3.5 font-semibold">Reason</th>
                        <th className="pb-3.5 text-right font-semibold">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#050720]/5 text-[#050720]">
                      {filteredItems.map((item) => (
                        <tr key={item.id} className="hover:bg-[#FFB908]/5 transition-colors">
                          <td className="py-3.5 text-[#050720]/70">{item.srNo}</td>
                          <td className="py-3.5 font-medium">{item.name}</td>
                          <td className="py-3.5 text-[#050720]/70">{item.role}</td>
                          <td className="py-3.5 text-[#050720]/70">{item.mobile}</td>
                          <td className="py-3.5 text-[#050720]/70">{item.email}</td>
                          <td className="py-3.5 text-[#050720]/70">{item.leaveDate}</td>
                          <td className="py-3.5 text-[#050720]/70">{item.leaveType}</td>
                          <td className="py-3.5 text-[#050720]/70">{item.reason}</td>
                          <td className="py-3.5 text-right">
                            <button
                              onClick={() => {
                                setSelectedLeave(item);
                                setView('details');
                              }}
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

                {/* B. Pending Tab Table */}
                {activeTab === 'Pending' && (
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#050720]/10 text-[#050720] font-bold">
                        <th className="pb-3.5 font-semibold">Sr. No.</th>
                        <th className="pb-3.5 font-semibold">Name</th>
                        <th className="pb-3.5 font-semibold">Role</th>
                        <th className="pb-3.5 font-semibold">Mobile</th>
                        <th className="pb-3.5 font-semibold">Email</th>
                        <th className="pb-3.5 font-semibold">Leave Type</th>
                        <th className="pb-3.5 font-semibold">Reason</th>
                        <th className="pb-3.5 font-semibold">From</th>
                        <th className="pb-3.5 font-semibold">To</th>
                        <th className="pb-3.5 text-right font-semibold">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#050720]/5 text-[#050720]">
                      {filteredItems.map((item) => (
                        <tr key={item.id} className="hover:bg-[#FFB908]/5 transition-colors">
                          <td className="py-3.5 text-[#050720]/70">{item.srNo}</td>
                          <td className="py-3.5 font-medium">{item.name}</td>
                          <td className="py-3.5 text-[#050720]/70">{item.role}</td>
                          <td className="py-3.5 text-[#050720]/70">{item.mobile}</td>
                          <td className="py-3.5 text-[#050720]/70">{item.email}</td>
                          <td className="py-3.5 text-[#050720]/70">{item.leaveType}</td>
                          <td className="py-3.5 text-[#050720]/70">{item.reason}</td>
                          <td className="py-3.5 text-[#050720]/70">{item.fromDate}</td>
                          <td className="py-3.5 text-[#050720]/70">{item.toDate}</td>
                          <td className="py-3.5 text-right">
                            <div className="flex items-center justify-end gap-2.5">
                              <button
                                onClick={() => {
                                  setTargetRequest(item);
                                  setShowApproveModal(true);
                                }}
                                title="Approve Leave"
                                className="text-[#10B981] hover:scale-110 transition-transform p-0.5 cursor-pointer"
                              >
                                <Check className="w-4 h-4 stroke-[3]" />
                              </button>
                              <button
                                onClick={() => {
                                  setTargetRequest(item);
                                  setShowRejectModal(true);
                                }}
                                title="Reject Leave"
                                className="text-[#EF4444] hover:scale-110 transition-transform p-0.5 cursor-pointer"
                              >
                                <X className="w-4 h-4 stroke-[3]" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {/* C. Rejected Tab Table */}
                {activeTab === 'Rejected' && (
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#050720]/10 text-[#050720] font-bold">
                        <th className="pb-3.5 font-semibold">Sr. No.</th>
                        <th className="pb-3.5 font-semibold">Employee Name</th>
                        <th className="pb-3.5 font-semibold">Role</th>
                        <th className="pb-3.5 font-semibold">Leave Type</th>
                        <th className="pb-3.5 font-semibold">Reason</th>
                        <th className="pb-3.5 text-right font-semibold">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#050720]/5 text-[#050720]">
                      {filteredItems.map((item) => (
                        <tr key={item.id} className="hover:bg-[#FFB908]/5 transition-colors">
                          <td className="py-3.5 text-[#050720]/70">{item.srNo}</td>
                          <td className="py-3.5 font-medium">{item.name}</td>
                          <td className="py-3.5 text-[#050720]/70">{item.role}</td>
                          <td className="py-3.5 text-[#050720]/70">{item.leaveType}</td>
                          <td className="py-3.5 text-[#050720]/70">{item.reason}</td>
                          <td className="py-3.5 text-right">
                            <button
                              onClick={() => {
                                setSelectedLeave(item);
                                setView('details');
                              }}
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
              </>
            )}

            {/* Pagination Footer */}
            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-[#050720]/5 text-xs text-[#050720]/70">
              <span className="text-[11px]">Jump to</span>
              <input
                type="text"
                defaultValue="01"
                className="w-8 h-7 text-center border border-[#050720]/20 rounded text-xs text-[#050720] font-semibold"
              />
              <div className="flex items-center gap-1.5 ml-2">
                <button className="p-1 hover:text-[#050720] cursor-pointer"><ChevronLeft className="w-3.5 h-3.5" /></button>
                <span className="text-[11px] font-semibold text-[#050720]">01 of 10</span>
                <button className="p-1 hover:text-[#050720] cursor-pointer"><ChevronRight className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. LEAVE DETAILS VIEW                                     */}
      {/* ========================================================= */}
      {view === 'details' && selectedLeave && (
        <div className="space-y-6 max-w-5xl">
          <button
            onClick={() => setView('table')}
            className="flex items-center gap-2 text-2xl font-bold font-['Sora'] hover:opacity-80 transition-opacity cursor-pointer"
          >
            <ArrowLeft className="w-6 h-6 text-[#050720]" />
            <span>Leave Details</span>
          </button>

          <div className="bg-white rounded-xl border border-[#050720]/10 p-7 shadow-xs space-y-6">
            <div className="grid grid-cols-2 gap-y-5 text-xs">
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Employee Name</span>
                <span className="font-semibold text-sm">{selectedLeave.name}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Role</span>
                <span className="font-semibold text-sm">{selectedLeave.role}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Leave Type</span>
                <span className="font-semibold text-sm">{selectedLeave.leaveType}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Leave Reason</span>
                <span className="font-semibold text-sm">{selectedLeave.reason}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Leave from</span>
                <span className="font-semibold text-sm">{selectedLeave.fromDate}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Leave to</span>
                <span className="font-semibold text-sm">{selectedLeave.toDate}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Application Date</span>
                <span className="font-semibold text-sm">{selectedLeave.applicationDate}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">No. of days</span>
                <span className="font-semibold text-sm">{selectedLeave.noOfDays}</span>
              </div>
            </div>

            {selectedLeave.status === 'Rejected' && (
              <div className="pt-2 border-t border-[#050720]/10">
                <span className="text-[10px] text-[#050720]/50 block">Reason for rejection</span>
                <span className="font-semibold text-xs text-[#050720] mt-1 block">
                  {selectedLeave.rejectionReason || 'Critical work scheduled on the requested date'}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. APPROVE LEAVE MODAL                                    */}
      {/* ========================================================= */}
      {showApproveModal && targetRequest && (
        <div className="fixed inset-0 z-50 bg-[#050720]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-7 max-w-lg w-full space-y-5 shadow-2xl">
            <h2 className="text-base font-bold font-['Sora'] text-[#050720]">Approve Leave?</h2>

            <div className="grid grid-cols-2 gap-y-3.5 text-xs text-[#050720]">
              <div>
                <span className="text-[10px] text-[#050720]/50 block">First Name</span>
                <span className="font-semibold">{targetRequest.firstName}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Last Name</span>
                <span className="font-semibold">{targetRequest.lastName}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">From date</span>
                <span className="font-semibold">{targetRequest.fromDate}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">To date</span>
                <span className="font-semibold">{targetRequest.toDate}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Reason for leave</span>
                <span className="font-semibold">{targetRequest.leaveType} leave</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">No. of days</span>
                <span className="font-semibold">{targetRequest.noOfDays}</span>
              </div>
            </div>

            <div className="flex gap-3 pt-3">
              <button
                onClick={() => setShowApproveModal(false)}
                className="flex-1 py-2.5 border border-[#050720]/20 rounded-lg text-xs font-bold hover:bg-[#050720]/5 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmApprove}
                className="flex-1 py-2.5 bg-[#FFB908] hover:bg-[#E5A607] rounded-lg text-xs font-bold text-[#050720] transition-colors shadow-xs cursor-pointer"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. REJECT LEAVE MODAL                                     */}
      {/* ========================================================= */}
      {showRejectModal && targetRequest && (
        <div className="fixed inset-0 z-50 bg-[#050720]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-7 max-w-lg w-full space-y-4 shadow-2xl">
            <h2 className="text-base font-bold font-['Sora'] text-[#050720]">Reject Leave?</h2>

            <div className="grid grid-cols-2 gap-y-3.5 text-xs text-[#050720]">
              <div>
                <span className="text-[10px] text-[#050720]/50 block">First Name</span>
                <span className="font-semibold">{targetRequest.firstName}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Last Name</span>
                <span className="font-semibold">{targetRequest.lastName}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">From date</span>
                <span className="font-semibold">{targetRequest.fromDate}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">To date</span>
                <span className="font-semibold">{targetRequest.toDate}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Reason for leave</span>
                <span className="font-semibold">{targetRequest.leaveType} leave</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">No. of days</span>
                <span className="font-semibold">{targetRequest.noOfDays}</span>
              </div>
            </div>

            <div>
              <input
                type="text"
                placeholder="Reason for rejection"
                value={rejectionReasonInput}
                onChange={(e) => setRejectionReasonInput(e.target.value)}
                className="w-full bg-[#F8FAFC] text-xs px-3.5 py-2.5 rounded-lg border border-[#050720]/15 focus:outline-none focus:border-[#050720]"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 py-2.5 border border-[#050720]/20 rounded-lg text-xs font-bold hover:bg-[#050720]/5 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="flex-1 py-2.5 bg-[#FFB908] hover:bg-[#E5A607] rounded-lg text-xs font-bold text-[#050720] transition-colors shadow-xs cursor-pointer"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. CONFIRMATION ALERT DIALOGS                             */}
      {/* ========================================================= */}
      {showApprovedNotice && (
        <div className="fixed inset-0 z-50 bg-[#050720]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center space-y-1.5 shadow-2xl">
            <h3 className="text-base font-bold font-['Sora'] text-[#050720]">Leave Approved</h3>
            <p className="text-xs text-[#050720]/60">Leave has been approved by the admin.</p>
          </div>
        </div>
      )}

      {showRejectedNotice && (
        <div className="fixed inset-0 z-50 bg-[#050720]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center space-y-1.5 shadow-2xl">
            <h3 className="text-base font-bold font-['Sora'] text-[#050720]">Leave Rejected</h3>
            <p className="text-xs text-[#050720]/60">Leave has been rejected by the admin.</p>
          </div>
        </div>
      )}
    </div>
  );
};