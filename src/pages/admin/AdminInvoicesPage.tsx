import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown,
  Search,
  CheckCircle2
} from 'lucide-react';
import { financeService, InvoiceItem as ServiceInvoiceItem } from '../../services/financeService';
import { leadService } from '../../services/leadService';
import { calculateInvoiceTaxes } from '../../utils/invoiceCalculator';

interface InvoiceItem {
  id: string;
  srNo: string;
  name: string;
  course: string;
  paidFees: string;
  requestAmount: string;
  rawRequestAmount: number;
  mobile: string;
  approvedOn: string;
  email: string;
  invoiceId: string;
  status: 'Approved' | 'Requests' | 'Cancelled';
  rawPaidFees: number;
  rawTotalFees: number;
  dueDate?: string;
  installments?: any[];
}

interface FeeItem {
  id: string;
  srNo: string;
  name: string;
  course: string;
  totalFees: string;
  paid: string;
  rawPaid: number;
  rawTotal: number;
  lastFollowUp: string;
  remarks: string;
  mobile: string;
  email: string;
  paymentDate: string;
  approvedDate: string;
  invoiceId?: string;
  timeline?: any[];
}

interface EnrolledStudentOption {
  name: string;
  firstName: string;
  lastName: string;
  mobile: string;
  email: string;
  course: string;
  totalFees: number;
}

export const AdminInvoicesPage: React.FC = () => {
  const [view, setView] = useState<'main' | 'create' | 'preview' | 'fee-details'>('main');
  const [invoiceTab, setInvoiceTab] = useState<'Approved' | 'Requests' | 'Cancelled'>('Approved');
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [fees, setFees] = useState<FeeItem[]>([]);
  const [enrolledStudents, setEnrolledStudents] = useState<EnrolledStudentOption[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Selection states
  const [selectedFee, setSelectedFee] = useState<FeeItem | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceItem | null>(null);

  // Modals
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showConfirmGenModal, setShowConfirmGenModal] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Calendar State for Fees Details
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<number | null>(null);

  const [createFormData, setCreateFormData] = useState({
    companyName: 'Radiquolab Private Limited',
    companyMobile: '9145272921',
    companyAddress: 'Horizon Chambers, Shop No. 6, GAT NO 281/2, Plot No 26, Kasar Amboli Ghotavade, Pirangut, Mulshi, Pune 412115',
    companyEmail: 'info@radiquolab.com',
    companyGst: '27AANCR8297C1ZT',
    course: '',
    companyPan: 'AANCR8297C',
    companyIec: 'AANCR8297C',
    bankName: 'State Bank of India',
    bankBranch: 'Pirangut',
    accountName: 'Radiquolab Private Limited',
    accountNumber: '20523204478',
    ifsc: 'SBIN0011430',
    swiftCode: 'SBININBB238',
    invoiceType: 'Tax Invoice',
    invoiceNumber: 'GST/001',
    studentName: '',
    studentMobile: '',
    studentEmail: '',
    hsnSac: '9992',
    qtyHrs: '1',
    rate: '-',
    currency: 'INR',
    subtotal: 0,
    cgst: 0,
    sgst: 0,
    igst: 0,
    grandTotal: 0,
    amountInWords: '',
  });

  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [isSearchingStudent, setIsSearchingStudent] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const dbInvoices: ServiceInvoiceItem[] = await financeService.getAllInvoices();
      const allLeads = await leadService.getAllLeads();

      const enrolled = allLeads
        .filter((l) => l.status === 'Enrolled')
        .map((l) => ({
          name: `${l.firstName || ''} ${l.lastName || ''}`.trim(),
          firstName: l.firstName || '',
          lastName: l.lastName || '',
          mobile: l.contactNo || '',
          email: l.email || '',
          course: l.course || '',
          totalFees: parseInt((l.finalFees || '0').replace(/[^0-9]/g, ''), 10) || 0,
        }));
      setEnrolledStudents(enrolled);

      const mappedInvoices: InvoiceItem[] = dbInvoices.map((inv, idx) => {
        const pendingInst = (inv.timeline || []).find((t: any) => t.status === 'Pending') ||
          (inv.installments || []).find((t: any) => t.status === 'Pending');

        const pendingAmtNum = pendingInst 
          ? (typeof pendingInst.amount === 'string' ? parseInt(pendingInst.amount.replace(/[^0-9]/g, ''), 10) || 0 : Number(pendingInst.amount) || 0)
          : (inv.paidFees || 0);

        return {
          id: inv.id,
          srNo: String(idx + 1).padStart(2, '0'),
          name: inv.studentName || '—',
          course: inv.course || '—',
          paidFees: `₹${(inv.paidFees || 0).toLocaleString()}`,
          requestAmount: `₹${pendingAmtNum.toLocaleString()}`,
          rawRequestAmount: pendingAmtNum,
          mobile: inv.mobile || '—',
          approvedOn: inv.approvedOn && inv.approvedOn !== '-' ? inv.approvedOn : (inv.approvalStatus === 'Approved' ? inv.dueDate : '-'),
          email: inv.email || '—',
          invoiceId: inv.invoiceCode || `GST/${String(idx + 1).padStart(3, '0')}`,
          status: (inv.approvalStatus as 'Approved' | 'Requests' | 'Cancelled') || 'Requests',
          rawPaidFees: inv.paidFees || 0,
          rawTotalFees: inv.totalFees || 0,
          dueDate: inv.dueDate || '—',
          installments: inv.timeline || inv.installments || [],
        };
      });

      const mappedFees: FeeItem[] = dbInvoices.map((inv, idx) => ({
        id: inv.id,
        srNo: String(idx + 1).padStart(2, '0'),
        name: inv.studentName || '—',
        course: inv.course || '—',
        totalFees: `₹${(inv.totalFees || 0).toLocaleString()}`,
        paid: `₹${(inv.paidFees || 0).toLocaleString()}`,
        rawPaid: inv.paidFees || 0,
        rawTotal: inv.totalFees || 0,
        lastFollowUp: inv.lastFollowUp || '—',
        remarks: inv.paymentStatus || ((inv.paidFees || 0) >= (inv.totalFees || 0) && (inv.totalFees || 0) > 0 ? 'Paid' : 'Partially Paid'),
        mobile: inv.mobile || '—',
        email: inv.email || '—',
        paymentDate: inv.dueDate || '—',
        approvedDate: inv.approvedOn || '—',
        invoiceId: inv.invoiceCode || `GST/${String(idx + 1).padStart(3, '0')}`,
        timeline: inv.timeline || inv.installments || [],
      }));

      setInvoices(mappedInvoices);
      setFees(mappedFees);

      if (mappedInvoices.length > 0 && !selectedInvoice) setSelectedInvoice(mappedInvoices[0]);
      if (mappedFees.length > 0 && !selectedFee) setSelectedFee(mappedFees[0]);
    } catch (err) {
      console.error('Failed to load admin invoices:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenApproveModal = (inv: InvoiceItem) => {
    setSelectedInvoice(inv);
    setShowApproveModal(true);
  };

  const handleOpenRejectModal = (inv: InvoiceItem) => {
    setSelectedInvoice(inv);
    setShowRejectModal(true);
  };

  const handleApprove = async () => {
    if (!selectedInvoice) return;
    try {
      await financeService.approveInvoice(selectedInvoice.id);
      setShowApproveModal(false);
      await loadData();
      setInvoiceTab('Approved');
    } catch (err) {
      console.error('Failed to approve invoice:', err);
    }
  };

  const handleReject = async () => {
    if (!selectedInvoice) return;
    try {
      await financeService.rejectInvoice(selectedInvoice.id, rejectReason);
      setShowRejectModal(false);
      setRejectReason('');
      await loadData();
    } catch (err) {
      console.error('Failed to reject invoice:', err);
    }
  };

  const handleSelectStudentForBilling = (st: EnrolledStudentOption) => {
    setCreateFormData((prev) => ({
      ...prev,
      studentName: st.name,
      studentMobile: st.mobile,
      studentEmail: st.email,
      course: st.course,
      subtotal: st.totalFees,
      grandTotal: st.totalFees,
      invoiceNumber: `GST/${String(invoices.length + 1).padStart(3, '0')}`,
    }));
    setStudentSearchQuery(st.name);
    setIsSearchingStudent(false);
  };

  const handleFinalGenerateInvoice = async () => {
    try {
      const todayStr = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
      const payload: Partial<ServiceInvoiceItem> = {
        studentName: createFormData.studentName,
        course: createFormData.course,
        totalFees: createFormData.grandTotal,
        paidFees: createFormData.grandTotal,
        remainingFees: 0,
        dueDate: todayStr,
        invoiceCode: createFormData.invoiceNumber,
        mobile: createFormData.studentMobile,
        email: createFormData.studentEmail,
        approvalStatus: 'Approved',
        approvedOn: todayStr,
        paymentStatus: 'Paid',
      };

      await financeService.createInvoice(payload);
      setShowConfirmGenModal(false);
      setShowSuccessToast(true);

      await loadData();

      setTimeout(() => {
        setShowSuccessToast(false);
        setView('main');
      }, 1500);
    } catch (err) {
      console.error('Failed to generate invoice:', err);
      alert('Failed to generate invoice.');
      setShowConfirmGenModal(false);
    }
  };

  const filteredInvoices = invoices.filter((inv) => inv.status === invoiceTab);
  const invoicesGeneratedCount = invoices.filter((i) => i.status === 'Approved' || i.rawPaidFees > 0).length;
  const pendingRequestsCount = invoices.filter((i) => i.status === 'Requests').length;
  const pendingPaymentsCount = fees.filter((f) => f.remarks !== 'Paid').length;

  return (
    <div className="font-['Onest'] text-[#050720] pb-16">
      {/* 1. INVOICE & FEES DASHBOARD */}
      {view === 'main' && (
        <div className="space-y-10">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold font-['Sora']">Invoice</h1>
              <button 
                onClick={() => setView('create')}
                className="px-4 py-2 bg-[#FFB908] hover:bg-[#E5A607] rounded-lg text-xs font-bold text-[#050720] transition-colors shadow-xs cursor-pointer"
              >
                Create Invoice
              </button>
            </div>

            {/* 3 Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white border border-[#050720]/10 rounded-xl p-5 text-center shadow-xs">
                <span className="text-xs font-semibold block">Pending Requests</span>
                <span className="text-2xl font-extrabold font-['Sora'] mt-1 block">
                  {pendingRequestsCount > 0 ? `${pendingRequestsCount}+` : '00'}
                </span>
              </div>
              <div className="bg-white border border-[#050720]/10 rounded-xl p-5 text-center shadow-xs">
                <span className="text-xs font-semibold block">Invoices Generated</span>
                <span className="text-2xl font-extrabold font-['Sora'] mt-1 block">
                  {String(invoicesGeneratedCount).padStart(2, '0')}
                </span>
              </div>
              <div className="bg-white border border-[#050720]/10 rounded-xl p-5 text-center shadow-xs">
                <span className="text-xs font-semibold block">Pending Payments</span>
                <span className="text-2xl font-extrabold font-['Sora'] mt-1 block">
                  {String(pendingPaymentsCount).padStart(2, '0')}
                </span>
              </div>
            </div>

            {/* Invoices Table Card */}
            <div className="bg-white border border-[#050720]/10 rounded-xl p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-8 border-b border-[#050720]/10 text-xs font-bold">
                {(['Approved', 'Requests', 'Cancelled'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setInvoiceTab(tab)}
                    className={`pb-3 relative transition-colors cursor-pointer ${
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

              {isLoading ? (
                <div className="py-12 text-center text-xs text-[#050720]/50">Loading invoices...</div>
              ) : filteredInvoices.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#050720]/50">No invoices in {invoiceTab}.</div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#050720]/10 font-bold">
                      <th className="pb-3.5">Sr. No.</th>
                      <th className="pb-3.5">Name</th>
                      <th className="pb-3.5">Course</th>
                      <th className="pb-3.5">{invoiceTab === 'Requests' ? 'Requested Amount' : 'Paid fees'}</th>
                      <th className="pb-3.5">Mobile</th>
                      <th className="pb-3.5">Approved on</th>
                      <th className="pb-3.5">Email</th>
                      <th className="pb-3.5">Invoice ID</th>
                      <th className="pb-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#050720]/5">
                    {filteredInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-[#FFB908]/5 transition-colors">
                        <td className="py-3.5 text-[#050720]/70">{inv.srNo}</td>
                        <td className="py-3.5 font-medium">{inv.name}</td>
                        <td className="py-3.5 text-[#050720]/70">{inv.course}</td>
                        <td className="py-3.5 font-semibold">
                          {invoiceTab === 'Requests' ? inv.requestAmount : inv.paidFees}
                        </td>
                        <td className="py-3.5 text-[#050720]/70">{inv.mobile}</td>
                        <td className="py-3.5 text-[#050720]/70">{inv.approvedOn}</td>
                        <td className="py-3.5 text-[#050720]/70">{inv.email}</td>
                        <td className="py-3.5 text-[#050720]/70 font-medium">{inv.invoiceId}</td>
                        <td className="py-3.5 text-right">
                          {inv.status === 'Requests' ? (
                            <div className="flex justify-end gap-2">
                              <button 
                                onClick={() => handleOpenApproveModal(inv)} 
                                className="px-2.5 py-1 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded font-semibold text-[11px] hover:bg-emerald-100 cursor-pointer"
                              >
                                Approve
                              </button>
                              <button 
                                onClick={() => handleOpenRejectModal(inv)} 
                                className="px-2.5 py-1 bg-rose-50 text-rose-600 border border-rose-200 rounded font-semibold text-[11px] hover:bg-rose-100 cursor-pointer"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setSelectedInvoice(inv);
                                const installmentToPreview = (inv.installments || []).find((i: any) => i.status === 'Paid') || (inv.installments || [])[0];
                                const previewAmt = installmentToPreview 
                                  ? (typeof installmentToPreview.amount === 'string' ? parseInt(installmentToPreview.amount.replace(/[^0-9]/g, ''), 10) || 0 : Number(installmentToPreview.amount) || 0)
                                  : inv.rawPaidFees;

                                setCreateFormData((prev) => ({
                                  ...prev,
                                  studentName: inv.name,
                                  course: inv.course,
                                  subtotal: previewAmt,
                                  grandTotal: previewAmt,
                                  invoiceNumber: inv.invoiceId,
                                  studentMobile: inv.mobile,
                                  studentEmail: inv.email,
                                }));
                                setView('preview');
                              }}
                              className="px-3 py-1 border border-[#050720]/30 rounded text-[11px] font-semibold hover:bg-[#050720]/5 cursor-pointer"
                            >
                              View
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 text-xs text-[#050720]/70">
                <span className="text-[11px]">Jump to</span>
                <input type="text" defaultValue="01" className="w-8 h-7 text-center border border-[#050720]/20 rounded font-semibold text-xs" />
                <button className="p-1"><ChevronLeft className="w-3.5 h-3.5" /></button>
                <span className="text-[11px] font-semibold text-[#050720]">01 of 10</span>
                <button className="p-1"><ChevronRight className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          </div>

          {/* BOTTOM SECTION: FEES */}
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
                      <td className="py-3.5 text-[#050720]/70">
                        <span className={fee.remarks === 'Paid' ? 'text-emerald-600 font-semibold' : 'text-amber-600 font-semibold'}>
                          {fee.remarks}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <button
                          onClick={() => {
                            setSelectedFee(fee);
                            setView('fee-details');
                          }}
                          className="px-3 py-1 border border-[#050720]/30 rounded text-[11px] font-semibold hover:bg-[#050720]/5 cursor-pointer"
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

      {/* 2. FEES DETAILS VIEW */}
      {view === 'fee-details' && selectedFee && (
        <div className="space-y-6">
          <button
            onClick={() => setView('main')}
            className="flex items-center gap-2 text-2xl font-bold font-['Sora'] hover:opacity-80 cursor-pointer"
          >
            <ArrowLeft className="w-6 h-6" />
            <span>Fees Details</span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-4">
                <h3 className="text-sm font-bold font-['Sora']">Fees Breakdown</h3>
                <div className="flex justify-between items-center text-xs">
                  <div>
                    <span className="text-[10px] text-[#050720]/50 block">Total fees</span>
                    <span className="font-extrabold text-base font-['Sora']">{selectedFee.totalFees}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#050720]/50 block">Paid fees</span>
                    <span className="font-extrabold text-base font-['Sora']">{selectedFee.paid}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#050720]/50 block">Pending</span>
                    <span className="font-extrabold text-base font-['Sora']">
                      ₹{Math.max(0, selectedFee.rawTotal - selectedFee.rawPaid).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] text-[#050720]/60 mb-1">
                    <span>Payment progress</span>
                    <span className="font-semibold text-emerald-600">
                      {selectedFee.rawTotal > 0 ? Math.round((selectedFee.rawPaid / selectedFee.rawTotal) * 100) : 0}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ 
                        width: `${selectedFee.rawTotal > 0 ? Math.min(100, Math.round((selectedFee.rawPaid / selectedFee.rawTotal) * 100)) : 0}%` 
                      }} 
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-4">
                <h3 className="text-sm font-bold font-['Sora']">Student Overview</h3>
                <div className="grid grid-cols-2 gap-y-4 text-xs">
                  <div>
                    <span className="text-[10px] text-[#050720]/50 block">First Name</span>
                    <span className="font-semibold text-sm">{selectedFee.name.split(' ')[0] || '—'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#050720]/50 block">Last Name</span>
                    <span className="font-semibold text-sm">{selectedFee.name.split(' ').slice(1).join(' ') || '—'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#050720]/50 block">Email</span>
                    <span className="font-semibold text-sm">{selectedFee.email}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#050720]/50 block">Mobile</span>
                    <span className="font-semibold text-sm">{selectedFee.mobile}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#050720]/50 block">Course</span>
                    <span className="font-semibold text-sm">{selectedFee.course}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#050720]/50 block">Payment Status</span>
                    <span className={`font-semibold text-sm ${selectedFee.remarks === 'Paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {selectedFee.remarks}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-4">
                <h3 className="text-sm font-bold font-['Sora']">Timeline</h3>
                {(!selectedFee.timeline || selectedFee.timeline.length === 0) ? (
                  <p className="text-xs text-[#050720]/40 italic py-2">No installments recorded yet.</p>
                ) : (
                  <div className="space-y-3">
                    {selectedFee.timeline.map((inst: any, idx: number) => {
                      const isInstPaid = inst.status === 'Paid';
                      const formattedAmt = typeof inst.amount === 'string' ? inst.amount : `₹${(Number(inst.amount) || 0).toLocaleString()}`;
                      const formattedLeft = typeof inst.amountLeft === 'string' ? inst.amountLeft : `₹${(Number(inst.amountLeft) || 0).toLocaleString()}`;

                      return (
                        <div key={inst.id || idx} className="border border-[#050720]/10 rounded-xl p-5 space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-sm font-bold font-['Sora']">{inst.installmentTitle || inst.title || `Installment #${idx + 1}`}</h4>
                              <span className="text-[10px] text-[#050720]/50 block mt-0.5">Due: {inst.dueDate || '—'}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-base font-bold font-['Sora'] block">{formattedAmt}</span>
                              <span className={`text-[10px] font-semibold ${isInstPaid ? 'text-emerald-600' : 'text-amber-600'}`}>
                                {isInstPaid ? 'Paid' : 'Pending Approval'}
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-[#050720]/80">Paid on: {inst.paidDate || '—'}</p>
                          <p className="text-xs text-[#050720]/80">Amount left: {formattedLeft}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-4">
                <h3 className="text-sm font-bold font-['Sora'] text-[#050720]">Add Remark</h3>
                <div>
                  <span className="text-[10px] text-[#050720]/50 block mb-1">Remark title</span>
                  <div className="relative">
                    <select className="w-full bg-[#F8FAFC] text-xs px-3.5 py-2.5 rounded-lg border border-[#050720]/15 appearance-none focus:outline-none">
                      <option value="Follow-up">Follow-up</option>
                      <option value="Next Installment">Next Installment</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-3 text-[#050720]/40 pointer-events-none" />
                  </div>
                </div>

                <div className="border border-[#050720]/15 rounded-xl p-4 bg-white space-y-4">
                  <span className="text-xs font-semibold block mb-3">Select Follow-up Date</span>
                  <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-medium pt-1">
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                      <button 
                        key={d} 
                        onClick={() => setSelectedCalendarDay(d)} 
                        className={`p-1.5 rounded cursor-pointer ${selectedCalendarDay === d ? 'bg-[#FFB908] font-bold' : 'hover:bg-slate-100'}`}
                      >
                        {d < 10 ? `0${d}` : d}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-[#050720]/50 block mb-1">Remark Description</span>
                  <textarea 
                    rows={4}
                    placeholder="Enter remark here.." 
                    className="w-full bg-[#F8FAFC] text-xs p-3 rounded-lg border border-[#050720]/15 focus:outline-none resize-none"
                  />
                </div>

                <button 
                  onClick={() => alert('Remark saved successfully')}
                  className="w-full py-2.5 bg-[#FFB908] hover:bg-[#E5A607] rounded-lg text-xs font-bold text-[#050720] shadow-xs cursor-pointer"
                >
                  Save Remark
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. CREATE INVOICE VIEW */}
      {view === 'create' && (
        <div className="space-y-6 max-w-4xl">
          <button
            onClick={() => setView('main')}
            className="flex items-center gap-2 text-2xl font-bold font-['Sora'] hover:opacity-80 cursor-pointer"
          >
            <ArrowLeft className="w-6 h-6" />
            <span>Create Invoice</span>
          </button>

          <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold font-['Sora']">Bill to</h3>
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search enrolled student by name or contact..." 
                value={studentSearchQuery || createFormData.studentName}
                onFocus={() => setIsSearchingStudent(true)}
                onChange={(e) => {
                  setStudentSearchQuery(e.target.value);
                  setIsSearchingStudent(true);
                  setCreateFormData({ ...createFormData, studentName: e.target.value });
                }}
                className="w-full bg-[#F8FAFC] text-xs px-3.5 py-2.5 pr-10 rounded-lg border border-[#050720]/15 focus:outline-none" 
              />
              <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-[#050720]/40" />
            </div>

            {isSearchingStudent && enrolledStudents.length > 0 && (
              <div className="bg-white border border-[#050720]/15 rounded-xl shadow-xl max-h-48 overflow-y-auto z-30">
                {enrolledStudents
                  .filter((st) => 
                    st.name.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
                    st.mobile.includes(studentSearchQuery)
                  )
                  .map((st, i) => (
                    <div
                      key={i}
                      onClick={() => handleSelectStudentForBilling(st)}
                      className="px-4 py-2.5 text-xs hover:bg-[#FFB908]/15 cursor-pointer flex justify-between items-center border-b border-[#050720]/5"
                    >
                      <div>
                        <span className="font-semibold block">{st.name}</span>
                        <span className="text-[10px] text-[#050720]/60">{st.course} • {st.mobile}</span>
                      </div>
                      <span className="font-bold text-xs">₹{st.totalFees.toLocaleString()}</span>
                    </div>
                  ))}
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <button 
              onClick={() => setView('preview')} 
              className="flex-1 py-3 border border-[#050720]/30 rounded-lg text-xs font-bold text-[#050720] hover:bg-[#050720]/5 cursor-pointer"
            >
              Preview
            </button>
            <button 
              onClick={() => setShowConfirmGenModal(true)} 
              className="flex-1 py-3 bg-[#FFB908] hover:bg-[#E5A607] rounded-lg text-xs font-bold text-[#050720] transition-colors shadow-xs cursor-pointer"
            >
              Generate Invoice
            </button>
          </div>
        </div>
      )}

      {/* 4. INVOICE PREVIEW VIEW (MATCHES REFERENCE WITH 9% CGST & 9% SGST) */}
      {view === 'preview' && (
        <div className="space-y-6 max-w-4xl font-['Onest']">
          <button
            onClick={() => setView('main')}
            className="flex items-center gap-2 text-2xl font-bold font-['Sora'] hover:opacity-80 cursor-pointer"
          >
            <ArrowLeft className="w-6 h-6" />
            <span>Invoice Preview</span>
          </button>

          {(() => {
            const taxes = calculateInvoiceTaxes(createFormData.grandTotal || 0);

            return (
              <div className="bg-white border-2 border-black text-xs text-black shadow-lg">
                <div className="p-3.5 text-center border-b-2 border-black">
                  <h2 className="text-base font-bold font-['Sora']">Radiquolab Private Limited</h2>
                  <p className="text-[11px] mt-1">
                    Horizon Chambers, Shop No. 6, GAT NO 281/2, Plot No 26, Kasar Amboli Ghotavade, Pirangut, Mulshi, Pune 412115
                  </p>
                </div>

                <div className="grid grid-cols-2 border-b-2 border-black text-center text-[11px]">
                  <div className="p-2 border-r-2 border-black">Mobile: +91-9145272921</div>
                  <div className="p-2">Email: info@radiquolab.com</div>
                </div>

                <div className="grid grid-cols-3 border-b-2 border-black text-center text-[10.5px]">
                  <div className="p-2 border-r-2 border-black">GSTIN: 27AANCR8297C1ZT</div>
                  <div className="p-2 border-r-2 border-black">Company PAN: AANCR8297C</div>
                  <div className="p-2">IEC Code: AANCR8297C</div>
                </div>

                <div className="flex justify-between items-center border-b-2 border-black p-2 font-bold text-xs bg-slate-50/50">
                  <span>Tax Invoice</span>
                  <span>Date: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>

                <div className="grid grid-cols-2 border-b-2 border-black min-h-[75px]">
                  <div className="p-2.5 border-r-2 border-black leading-relaxed">
                    <span className="font-bold block">Bill To</span>
                    <span>{createFormData.studentName || '—'}</span>
                    <span className="block text-[#050720]/70">Pune</span>
                  </div>
                  <div className="p-2.5">
                    <span className="font-bold">Invoice No:</span> {createFormData.invoiceNumber || 'GST/001'}
                  </div>
                </div>

                <table className="w-full text-left border-b-2 border-black">
                  <thead className="border-b-2 border-black font-bold">
                    <tr>
                      <th className="p-2 border-r-2 border-black text-center w-12">Sr. No</th>
                      <th className="p-2 border-r-2 border-black">Description</th>
                      <th className="p-2 border-r-2 border-black text-center w-20">Hsn/Sac</th>
                      <th className="p-2 border-r-2 border-black text-center w-16">Qty/Hrs</th>
                      <th className="p-2 border-r-2 border-black text-right w-24">Rate</th>
                      <th className="p-2 border-r-2 border-black text-center w-16">Currency</th>
                      <th className="p-2 text-right w-24">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b-2 border-black">
                      <td className="p-2 border-r-2 border-black text-center">1</td>
                      <td className="p-2 border-r-2 border-black">{createFormData.course || 'Training Program'}</td>
                      <td className="p-2 border-r-2 border-black text-center">9992</td>
                      <td className="p-2 border-r-2 border-black text-center">1</td>
                      <td className="p-2 border-r-2 border-black text-right">{taxes.subtotal.toFixed(2)}</td>
                      <td className="p-2 border-r-2 border-black text-center">INR</td>
                      <td className="p-2 text-right">{taxes.subtotal.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>

                {/* Sub Total & GST Summary */}
                <div className="border-b-2 border-black">
                  <div className="flex border-b border-black/30">
                    <div className="flex-1" />
                    <div className="w-40 p-1.5 font-bold border-l-2 border-black">Sub Total</div>
                    <div className="w-24 p-1.5 text-right border-l-2 border-black font-semibold">{taxes.subtotal.toFixed(2)}</div>
                  </div>
                  <div className="flex border-b border-black/30">
                    <div className="flex-1" />
                    <div className="w-40 p-1.5 border-l-2 border-black">CGST @ 9%</div>
                    <div className="w-24 p-1.5 text-right border-l-2 border-black">{taxes.cgst.toFixed(2)}</div>
                  </div>
                  <div className="flex border-b border-black/30">
                    <div className="flex-1" />
                    <div className="w-40 p-1.5 border-l-2 border-black">SGST @ 9%</div>
                    <div className="w-24 p-1.5 text-right border-l-2 border-black">{taxes.sgst.toFixed(2)}</div>
                  </div>
                  <div className="flex border-b border-black/30">
                    <div className="flex-1" />
                    <div className="w-40 p-1.5 border-l-2 border-black">IGST @ 0%</div>
                    <div className="w-24 p-1.5 text-right border-l-2 border-black">00.00</div>
                  </div>
                  <div className="flex bg-slate-50/50">
                    <div className="flex-1" />
                    <div className="w-40 p-1.5 font-bold border-l-2 border-black text-sm">Grand Total</div>
                    <div className="w-24 p-1.5 text-right border-l-2 border-black font-bold text-sm">{taxes.grandTotal.toFixed(2)}</div>
                  </div>
                </div>

                <div className="p-2.5 text-right border-b-2 border-black font-medium text-[11px]">
                  <strong>In Words:</strong> {taxes.amountInWords}
                </div>

                <div className="p-2.5 border-b-2 border-black text-[11px]">
                  <span className="font-bold block mb-1">Terms And Conditions</span>
                  <p>Payment Term: 15 Days</p>
                  <p>Due Date: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>

                <div className="grid grid-cols-2 p-2.5 min-h-[100px] text-[11px]">
                  <div>
                    <span className="font-bold block mb-1">Bank Details:</span>
                    <p>Bank Name: State Bank of India</p>
                    <p>Branch: Pirangut</p>
                    <p>Account Name: Radiquolab Private Limited</p>
                    <p>Account No: 20523204478</p>
                    <p>IFS Code: SBIN0011430</p>
                    <p>Swift Code: SBININBB238</p>
                  </div>
                  <div className="flex flex-col justify-end items-end text-center">
                    <div className="border-t border-black w-48 pt-1 text-[11px] font-bold">
                      Authorised Signature
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          <div className="flex gap-4">
            <button 
              onClick={() => setView('main')} 
              className="flex-1 py-3 border border-[#050720]/20 rounded-lg text-xs font-bold hover:bg-[#050720]/5 cursor-pointer"
            >
              Cancel
            </button>
            <button 
              onClick={() => setShowConfirmGenModal(true)} 
              className="flex-1 py-3 bg-[#FFB908] hover:bg-[#E5A607] rounded-lg text-xs font-bold text-[#050720] shadow-xs cursor-pointer"
            >
              Generate Invoice
            </button>
          </div>
        </div>
      )}

      {/* 5. APPROVE MODAL */}
      {showApproveModal && selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-[#050720]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl space-y-5">
            <h2 className="text-base font-bold font-['Sora']">Approve Invoice?</h2>
            <div className="grid grid-cols-2 gap-y-3 text-xs">
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Name</span>
                <span className="font-semibold">{selectedInvoice.name}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Invoice</span>
                <span className="font-semibold">{selectedInvoice.invoiceId}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Amount</span>
                <span className="font-semibold text-emerald-600">{selectedInvoice.requestAmount}</span>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button 
                onClick={() => setShowApproveModal(false)} 
                className="flex-1 py-2.5 border border-[#050720]/20 rounded-lg text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleApprove} 
                className="flex-1 py-2.5 bg-[#FFB908] hover:bg-[#E5A607] rounded-lg text-xs font-bold cursor-pointer"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {showRejectModal && selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-[#050720]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl space-y-5">
            <h2 className="text-base font-bold font-['Sora']">Reject Invoice?</h2>
            <input 
              type="text" 
              placeholder="Reason for rejection"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full bg-[#F8FAFC] text-xs px-3.5 py-2.5 rounded-lg border border-[#050720]/15 focus:outline-none"
            />
            <div className="flex gap-3 pt-2">
              <button 
                onClick={() => setShowRejectModal(false)} 
                className="flex-1 py-2.5 border border-[#050720]/20 rounded-lg text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleReject} 
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM GENERATE MODAL */}
      {showConfirmGenModal && (
        <div className="fixed inset-0 z-50 bg-[#050720]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl text-center space-y-4">
            <h2 className="text-base font-bold font-['Sora']">Confirm invoice Generation?</h2>
            <p className="text-xs text-[#050720]/70">
              This invoice will be permanently recorded and shared with the client.
            </p>
            <div className="flex gap-3 pt-2">
              <button 
                onClick={() => setShowConfirmGenModal(false)} 
                className="flex-1 py-2.5 border border-[#050720]/20 rounded-lg text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleFinalGenerateInvoice} 
                className="flex-1 py-2.5 bg-[#FFB908] hover:bg-[#E5A607] rounded-lg text-xs font-bold text-[#050720] cursor-pointer"
              >
                Generate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS TOAST */}
      {showSuccessToast && (
        <div className="fixed inset-0 z-50 bg-[#050720]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl text-center space-y-2">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold font-['Sora']">Invoice Generated</h2>
          </div>
        </div>
      )}
    </div>
  );
};