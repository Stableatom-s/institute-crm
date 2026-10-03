// src/pages/admin/AdminInvoicesPage.tsx
import React, { useState } from 'react';
import { ArrowLeft, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useInvoices } from '../../hooks/useInvoices';
import { InvoiceItem, FeeItem } from '../../services/financeService';

export const AdminInvoicesPage: React.FC = () => {
  const { invoices, fees, loading, error, refresh, approveInvoice, rejectInvoice, createInvoice, addFeeRemark } = useInvoices();

  const [view, setView] = useState<'main' | 'create' | 'preview' | 'fee-details'>('main');
  const [invoiceTab, setInvoiceTab] = useState<'Approved' | 'Requests' | 'Cancelled'>('Approved');

  // Selected items
  const [selectedFee, setSelectedFee] = useState<FeeItem | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceItem | null>(null);

  // Modals
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showConfirmGenModal, setShowConfirmGenModal] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Remarks Form State
  const [remarkTitle, setRemarkTitle] = useState('Follow-up');
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState('December');
  const [selectedYear, setSelectedYear] = useState('2025');
  const [remarkDescription, setRemarkDescription] = useState('');

  // Invoice Generation Form
  const [formData, setFormData] = useState({
    companyName: 'Radiquolab Private Limited',
    companyPhone: '9145272921',
    companyAddress: 'Horizon Chambers, Shop No. 6, GAT NO 281/2, Pirangut, Pune',
    companyEmail: 'info@radiquolab.com',
    gstin: '27AANCR8297C1ZT',
    courseName: 'UI/UX Design',
    companyPan: 'AANCR8297C',
    iecCode: 'AANCR8297C',
    bankName: 'State Bank of India',
    bankBranch: 'Pirangut',
    accountName: 'Radiquolab Private Limited',
    accountNumber: '20523204478',
    ifscCode: 'SBIN0011430',
    swiftCode: 'SBININBB23B',
    billTo: '',
    amount: 35000,
  });

  const filteredInvoices = invoices.filter((inv) => inv.status === invoiceTab);

  const handleApprove = async () => {
    if (!selectedInvoice || !selectedInvoice.id) return;
    try {
      await approveInvoice(selectedInvoice.id);
      setShowApproveModal(false);
    } catch (err: any) {
      alert(`Approval failed: ${err.message}`);
    }
  };

  const handleReject = async () => {
    if (!selectedInvoice || !selectedInvoice.id) return;
    try {
      await rejectInvoice(selectedInvoice.id, rejectReason);
      setShowRejectModal(false);
      setRejectReason('');
    } catch (err: any) {
      alert(`Rejection failed: ${err.message}`);
    }
  };

  const handleGenerateInvoice = async () => {
    try {
      await createInvoice(formData);
      setShowConfirmGenModal(false);
      setShowSuccessToast(true);
      setTimeout(() => {
        setShowSuccessToast(false);
        setView('main');
      }, 1800);
    } catch (err: any) {
      alert(`Invoice generation failed: ${err.message}`);
    }
  };

  const handleSaveRemark = async () => {
  if (!selectedFee || !selectedFee.id) return; // Guard against undefined id

  try {
    const formattedDate = selectedCalendarDay
      ? `${selectedCalendarDay < 10 ? '0' + selectedCalendarDay : selectedCalendarDay}-${selectedMonth}-${selectedYear}`
      : 'N/A';

    await addFeeRemark(selectedFee.id, remarkTitle, formattedDate, remarkDescription);
    alert('Remark added successfully!');
    setRemarkDescription('');
    setSelectedCalendarDay(null);
  } catch (err: any) {
    alert(`Failed to save remark: ${err.message}`);
  }
};

  if (loading) {
    return <div className="p-8 text-center text-xs font-semibold">Loading invoices & fee records...</div>;
  }

  if (error) {
    return (
      <div className="p-8 text-center text-xs text-rose-600 font-semibold space-y-3">
        <p>Error: {error}</p>
        <button onClick={refresh} className="px-4 py-2 bg-[#FFB908] rounded text-[#050720] font-bold">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="font-['Onest'] text-[#050720] pb-16">
      {/* 1. DASHBOARD VIEW */}
      {view === 'main' && (
        <div className="space-y-10">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold font-['Sora']">Invoice</h1>
              <button
                onClick={() => setView('create')}
                className="px-4 py-2 bg-[#FFB908] hover:bg-[#E5A607] rounded-lg text-xs font-bold text-[#050720] transition-colors shadow-xs"
              >
                Create Invoice
              </button>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white border border-[#050720]/10 rounded-xl p-5 text-center shadow-xs">
                <span className="text-xs font-semibold block">Pending Requests</span>
                <span className="text-2xl font-extrabold font-['Sora'] mt-1 block">
                  {invoices.filter((i) => i.status === 'Requests').length}
                </span>
              </div>
              <div className="bg-white border border-[#050720]/10 rounded-xl p-5 text-center shadow-xs">
                <span className="text-xs font-semibold block">Invoices Generated</span>
                <span className="text-2xl font-extrabold font-['Sora'] mt-1 block">
                  {invoices.filter((i) => i.status === 'Approved').length}
                </span>
              </div>
              <div className="bg-white border border-[#050720]/10 rounded-xl p-5 text-center shadow-xs">
                <span className="text-xs font-semibold block">Pending Payments</span>
                <span className="text-2xl font-extrabold font-['Sora'] mt-1 block">02</span>
              </div>
            </div>

            {/* Invoices Table */}
            <div className="bg-white border border-[#050720]/10 rounded-xl p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-8 border-b border-[#050720]/10 text-xs font-bold">
                {(['Approved', 'Requests', 'Cancelled'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setInvoiceTab(tab)}
                    className={`pb-3 relative transition-colors ${
                      invoiceTab === tab ? 'text-[#050720]' : 'text-[#050720]/50'
                    }`}
                  >
                    {tab}
                    {invoiceTab === tab && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FFB908] rounded-full" />
                    )}
                  </button>
                ))}
              </div>

              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#050720]/10 font-bold">
                    <th className="pb-3.5">Sr. No.</th>
                    <th className="pb-3.5">Name</th>
                    <th className="pb-3.5">Course</th>
                    <th className="pb-3.5">Paid fees</th>
                    <th className="pb-3.5">Mobile</th>
                    <th className="pb-3.5">Approved on</th>
                    <th className="pb-3.5">Email</th>
                    <th className="pb-3.5">Invoice ID</th>
                    <th className="pb-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#050720]/5">
                  {filteredInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-[#FFB908]/5">
                      <td className="py-3.5 text-[#050720]/70">{inv.srNo}</td>
                      <td className="py-3.5 font-medium">{inv.name}</td>
                      <td className="py-3.5 text-[#050720]/70">{inv.course}</td>
                      <td className="py-3.5 font-semibold">{inv.paidFees}</td>
                      <td className="py-3.5 text-[#050720]/70">{inv.mobile}</td>
                      <td className="py-3.5 text-[#050720]/70">{inv.approvedOn}</td>
                      <td className="py-3.5 text-[#050720]/70">{inv.email}</td>
                      <td className="py-3.5 text-[#050720]/70">{inv.invoiceId}</td>
                      <td className="py-3.5 text-right">
                        {inv.status === 'Requests' ? (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => {
                                setSelectedInvoice(inv);
                                setShowApproveModal(true);
                              }}
                              className="px-2.5 py-1 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded font-semibold text-[11px]"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => {
                                setSelectedInvoice(inv);
                                setShowRejectModal(true);
                              }}
                              className="px-2.5 py-1 bg-rose-50 text-rose-600 border border-rose-200 rounded font-semibold text-[11px]"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedInvoice(inv);
                              setView('preview');
                            }}
                            className="px-3 py-1 border border-[#050720]/30 rounded text-[11px] font-semibold hover:bg-[#050720]/5"
                          >
                            View
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex items-center justify-end gap-3 pt-3 text-xs text-[#050720]/70">
                <span className="text-[11px]">Jump to</span>
                <input
                  type="text"
                  defaultValue="01"
                  className="w-8 h-7 text-center border border-[#050720]/20 rounded font-semibold text-xs"
                />
                <button className="p-1"><ChevronLeft className="w-3.5 h-3.5" /></button>
                <span className="text-[11px] font-semibold text-[#050720]">01 of 10</span>
                <button className="p-1"><ChevronRight className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          </div>

          {/* Fees Section */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold font-['Sora']">Fees</h2>
            <div className="bg-white border border-[#050720]/10 rounded-xl p-6 shadow-xs space-y-4">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#050720]/10 font-bold">
                    <th className="pb-3.5">Sr. No.</th>
                    <th className="pb-3.5">Name</th>
                    <th className="pb-3.5">Course</th>
                    <th className="pb-3.5">Total fees</th>
                    <th className="pb-3.5">Paid</th>
                    <th className="pb-3.5">Last follow-up</th>
                    <th className="pb-3.5">Remarks</th>
                    <th className="pb-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#050720]/5">
                  {fees.map((fee) => (
                    <tr key={fee.id} className="hover:bg-[#FFB908]/5">
                      <td className="py-3.5 text-[#050720]/70">{fee.srNo}</td>
                      <td className="py-3.5 font-medium">{fee.name}</td>
                      <td className="py-3.5 text-[#050720]/70">{fee.course}</td>
                      <td className="py-3.5">{fee.totalFees}</td>
                      <td className="py-3.5 font-semibold">{fee.paid}</td>
                      <td className="py-3.5 text-[#050720]/70">{fee.lastFollowUp}</td>
                      <td className="py-3.5 text-[#050720]/70">{fee.remarks}</td>
                      <td className="py-3.5 text-right">
                        <button
                          onClick={() => {
                            setSelectedFee(fee);
                            setView('fee-details');
                          }}
                          className="px-3 py-1 border border-[#050720]/30 rounded text-[11px] font-semibold hover:bg-[#050720]/5"
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
        </div>
      )}

      {/* 2. FEE DETAILS VIEW */}
      {view === 'fee-details' && selectedFee && (
        <div className="space-y-6">
          <button
            onClick={() => setView('main')}
            className="flex items-center gap-2 text-2xl font-bold font-['Sora'] hover:opacity-80"
          >
            <ArrowLeft className="w-6 h-6" />
            <span>Fees Details</span>
          </button>
          {/* ...Details cards & Add Remark side panel... */}
        </div>
      )}

      {/* MODALS */}
      {showApproveModal && selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-[#050720]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl space-y-5">
            <h2 className="text-base font-bold font-['Sora']">Approve Invoice?</h2>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowApproveModal(false)}
                className="flex-1 py-2.5 border border-[#050720]/20 rounded-lg text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                className="flex-1 py-2.5 bg-[#FFB908] hover:bg-[#E5A607] rounded-lg text-xs font-bold"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};