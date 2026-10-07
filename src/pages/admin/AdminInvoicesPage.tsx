import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown,
  Search,
  CheckCircle2,
  Download
} from 'lucide-react';
import { financeService, InvoiceItem as ServiceInvoiceItem } from '../../services/financeService';
import { leadService } from '../../services/leadService';

interface InvoiceItem {
  id: string;
  srNo: string;
  name: string;
  course: string;
  paidFees: string;
  mobile: string;
  approvedOn: string;
  email: string;
  invoiceId: string;
  status: 'Approved' | 'Requests' | 'Cancelled';
  rawPaidFees?: number;
  rawTotalFees?: number;
  dueDate?: string;
}

interface FeeItem {
  id: string;
  srNo: string;
  name: string;
  course: string;
  totalFees: string;
  paid: string;
  lastFollowUp: string;
  remarks: string;
  mobile: string;
  email: string;
  paymentDate: string;
  approvedDate: string;
  invoiceId?: string;
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

  // Form State for "Create Invoice" & "Invoice Preview" (Matches Image 3)
  const [createFormData, setCreateFormData] = useState({
    companyName: 'Radiquolab Private Limited',
    companyMobile: '9145272921',
    companyAddress: 'Horizon Chambers, Shop No. 6, GAT NO 281/2, Kasar Amboli Ghotawade, Pirangut, Mulshi, Pune 412115',
    companyEmail: 'info@radiquolab.com',
    companyGst: '27AANCR8297C1ZT',
    course: 'UI/UX Design',
    companyPan: 'AANCR8297C',
    companyIec: 'AANCR8297C',
    bankName: 'State Bank of India',
    bankBranch: 'Pirangut',
    accountName: 'Radiquolab Private Limited',
    accountNumber: '20523204478',
    ifsc: 'SBIN0011430',
    swiftCode: 'SBININBB23B',
    invoiceType: 'Tax Invoice',
    invoiceNumber: 'GST/001',
    studentName: 'Rahul Sharma',
    studentMobile: '9784569874',
    studentEmail: 'rahul@gmail.com',
    hsnSac: '998456',
    qtyHrs: '01',
    rate: '-',
    currency: 'Rupee(₹)',
    subtotal: 35000,
    cgst: 0,
    sgst: 0,
    igst: 0,
    grandTotal: 35000,
    amountInWords: 'Thirty-five thousand only',
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
          email: l.email || `${(l.firstName || 'student').toLowerCase()}@gmail.com`,
          course: l.course || 'UI/UX Design',
          totalFees: parseInt((l.finalFees || '35000').replace(/[^0-9]/g, ''), 10) || 35000,
        }));
      setEnrolledStudents(enrolled);

      const mappedInvoices: InvoiceItem[] = dbInvoices.map((inv, idx) => ({
        id: inv.id,
        srNo: String(idx + 1).padStart(2, '0'),
        name: inv.studentName || '—',
        course: inv.course || '—',
        paidFees: `₹${(inv.paidFees || 0).toLocaleString()}`,
        mobile: inv.mobile || '—',
        approvedOn: inv.approvedOn || (inv.approvalStatus === 'Approved' ? '01-12-2025' : '-'),
        email: inv.email || `${inv.studentName.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
        invoiceId: inv.invoiceCode || `GST/${String(idx + 1).padStart(3, '0')}`,
        status: (inv.approvalStatus as 'Approved' | 'Requests' | 'Cancelled') || 'Requests',
        rawPaidFees: inv.paidFees || 0,
        rawTotalFees: inv.totalFees || 35000,
        dueDate: inv.dueDate || '01-12-2025',
      }));

      const mappedFees: FeeItem[] = dbInvoices.map((inv, idx) => ({
        id: inv.id,
        srNo: String(idx + 1).padStart(2, '0'),
        name: inv.studentName || '—',
        course: inv.course || '—',
        totalFees: `₹${(inv.totalFees || 35000).toLocaleString()}`,
        paid: `₹${(inv.paidFees || 0).toLocaleString()}`,
        lastFollowUp: inv.lastFollowUp || '01-12-2025',
        remarks: inv.paymentStatus || (inv.paidFees >= inv.totalFees && inv.totalFees > 0 ? 'Paid' : 'Partially Paid'),
        mobile: inv.mobile || '—',
        email: inv.email || '—',
        paymentDate: inv.dueDate || '01-12-2025',
        approvedDate: inv.approvedOn || '01-12-2025',
        invoiceId: inv.invoiceCode || `GST/${String(idx + 1).padStart(3, '0')}`,
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
      setInvoiceTab('Approved'); // Automatically switch to Approved tab
      alert(`Invoice ${selectedInvoice.invoiceId} approved successfully.`);
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
      alert(`Invoice ${selectedInvoice.invoiceId} rejected.`);
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
      amountInWords: st.totalFees ? `₹${st.totalFees.toLocaleString()} only` : '',
    }));
    setStudentSearchQuery(st.name);
    setIsSearchingStudent(false);
  };

  const handleFinalGenerateInvoice = async () => {
    try {
      const payload: Partial<ServiceInvoiceItem> = {
        studentName: createFormData.studentName,
        course: createFormData.course,
        totalFees: createFormData.grandTotal,
        paidFees: createFormData.grandTotal,
        remainingFees: 0,
        dueDate: new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
        invoiceCode: createFormData.invoiceNumber,
        mobile: createFormData.studentMobile,
        email: createFormData.studentEmail,
        approvalStatus: 'Approved',
        approvedOn: new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
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

  return (
    <div className="font-['Onest'] text-[#050720] pb-16">
      
      {/* ========================================================= */}
      {/* 1. INVOICE & FEES DASHBOARD                               */}
      {/* ========================================================= */}
      {view === 'main' && (
        <div className="space-y-10">
          
          {/* TOP SECTION: INVOICE */}
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
                  {invoices.filter((i) => i.status === 'Requests').length}+
                </span>
              </div>
              <div className="bg-white border border-[#050720]/10 rounded-xl p-5 text-center shadow-xs">
                <span className="text-xs font-semibold block">Invoices Generated</span>
                <span className="text-2xl font-extrabold font-['Sora'] mt-1 block">
                  {String(invoices.filter((i) => i.status === 'Approved').length).padStart(2, '0')}
                </span>
              </div>
              <div className="bg-white border border-[#050720]/10 rounded-xl p-5 text-center shadow-xs">
                <span className="text-xs font-semibold block">Pending Payments</span>
                <span className="text-2xl font-extrabold font-['Sora'] mt-1 block">
                  {String(fees.filter((f) => f.remarks !== 'Paid').length).padStart(2, '0')}
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
                      <tr key={inv.id} className="hover:bg-[#FFB908]/5 transition-colors">
                        <td className="py-3.5 text-[#050720]/70">{inv.srNo}</td>
                        <td className="py-3.5 font-medium">{inv.name}</td>
                        <td className="py-3.5 text-[#050720]/70">{inv.course}</td>
                        <td className="py-3.5 font-semibold">{inv.paidFees}</td>
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
                                setCreateFormData((prev) => ({
                                  ...prev,
                                  studentName: inv.name,
                                  course: inv.course,
                                  subtotal: inv.rawTotalFees || 35000,
                                  grandTotal: inv.rawPaidFees || 35000,
                                  invoiceNumber: inv.invoiceId,
                                  studentMobile: inv.mobile,
                                  studentEmail: inv.email,
                                  amountInWords: inv.rawPaidFees ? `₹${inv.rawPaidFees.toLocaleString()} only` : '',
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

      {/* ========================================================= */}
      {/* 2. FEES DETAILS VIEW (MATCHES IMAGE 4)                    */}
      {/* ========================================================= */}
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
              
              {/* Fees Breakdown Card */}
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
                      ₹{Math.max(0, (parseInt(selectedFee.totalFees.replace(/[^0-9]/g, ''), 10) || 0) - (parseInt(selectedFee.paid.replace(/[^0-9]/g, ''), 10) || 0)).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] text-[#050720]/60 mb-1">
                    <span>Payment progress</span>
                    <span className="font-semibold text-emerald-600">
                      {Math.round(((parseInt(selectedFee.paid.replace(/[^0-9]/g, ''), 10) || 0) / (parseInt(selectedFee.totalFees.replace(/[^0-9]/g, ''), 10) || 1)) * 100)}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ 
                        width: `${Math.round(((parseInt(selectedFee.paid.replace(/[^0-9]/g, ''), 10) || 0) / (parseInt(selectedFee.totalFees.replace(/[^0-9]/g, ''), 10) || 1)) * 100)}%` 
                      }} 
                    />
                  </div>
                </div>
              </div>

              {/* Student Overview Card */}
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
                  <div>
                    <span className="text-[10px] text-[#050720]/50 block">Invoice</span>
                    <span className="font-semibold text-sm">{selectedFee.invoiceId || 'GST/001'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#050720]/50 block">Amount</span>
                    <span className="font-semibold text-sm">{selectedFee.paid}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#050720]/50 block">Payment Date</span>
                    <span className="font-semibold text-sm">{selectedFee.paymentDate}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#050720]/50 block">Approved Date</span>
                    <span className="font-semibold text-sm">{selectedFee.approvedDate}</span>
                  </div>
                </div>
              </div>

              {/* Timeline Card */}
              <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-4">
                <h3 className="text-sm font-bold font-['Sora']">Timeline</h3>
                <div className="border border-[#050720]/10 rounded-xl p-5 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-bold font-['Sora']">Installment #1</h4>
                      <span className="text-[10px] text-[#050720]/50 block mt-0.5">Due: {selectedFee.paymentDate}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-bold font-['Sora'] block">{selectedFee.paid}</span>
                      <span className="text-[10px] font-semibold text-emerald-600">Paid</span>
                    </div>
                  </div>
                  <p className="text-xs text-[#050720]/80">Paid on: {selectedFee.approvedDate}</p>
                  <p className="text-xs text-[#050720]/80">Amount left: Nil</p>
                  <div className="pt-2 flex justify-end">
                    <button 
                      onClick={() => {
                        setCreateFormData((prev) => ({
                          ...prev,
                          studentName: selectedFee.name,
                          course: selectedFee.course,
                          subtotal: parseInt(selectedFee.totalFees.replace(/[^0-9]/g, ''), 10) || 35000,
                          grandTotal: parseInt(selectedFee.paid.replace(/[^0-9]/g, ''), 10) || 35000,
                          invoiceNumber: selectedFee.invoiceId || 'GST/001',
                          studentMobile: selectedFee.mobile,
                          studentEmail: selectedFee.email,
                        }));
                        setView('preview');
                      }}
                      className="px-4 py-2 border border-[#050720]/30 rounded-lg text-xs font-bold hover:bg-[#050720]/5 cursor-pointer"
                    >
                      View Invoice
                    </button>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Calendar & Remarks (Image 4) */}
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
                  <div className="flex justify-between items-center pt-4 border-t border-[#050720]/10 mt-3 text-[10px]">
                    <button onClick={() => setSelectedCalendarDay(null)} className="text-[#050720]/60 hover:underline cursor-pointer">Clear</button>
                    <button className="font-bold text-[#050720] cursor-pointer">Done</button>
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

      {/* ========================================================= */}
      {/* 3. CREATE INVOICE FORM                                    */}
      {/* ========================================================= */}
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
              <div className="absolute left-6 right-6 top-20 bg-white border border-[#050720]/15 rounded-xl shadow-xl max-h-48 overflow-y-auto z-30">
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

      {/* ========================================================= */}
      {/* 4. INVOICE PREVIEW VIEW (MATCHES IMAGE 3)                 */}
      {/* ========================================================= */}
      {view === 'preview' && (
        <div className="space-y-6 max-w-4xl">
          <button
            onClick={() => setView('main')}
            className="flex items-center gap-2 text-2xl font-bold font-['Sora'] hover:opacity-80 cursor-pointer"
          >
            <ArrowLeft className="w-6 h-6" />
            <span>Invoice Preview</span>
          </button>

          {/* Matches Screenshot 3 */}
          <div className="bg-white border-2 border-[#050720] text-xs font-['Onest'] shadow-lg">
            <div className="p-4 text-center border-b border-[#050720]">
              <h2 className="text-base font-bold font-['Sora']">{createFormData.companyName}</h2>
              <p className="text-[11px] text-[#050720]/80 mt-1">{createFormData.companyAddress}</p>
            </div>

            <div className="grid grid-cols-2 border-b border-[#050720] p-2 text-[11px]">
              <div>Mobile: +91-{createFormData.companyMobile}</div>
              <div>Email: {createFormData.companyEmail}</div>
            </div>

            <div className="grid grid-cols-3 border-b border-[#050720] p-2 text-[10px]">
              <div>GSTIN: {createFormData.companyGst}</div>
              <div>Company PAN: {createFormData.companyPan}</div>
              <div>IEC Code: {createFormData.companyIec}</div>
            </div>

            <div className="flex justify-between items-center border-b border-[#050720] p-2 font-bold bg-[#F8FAFC]">
              <span>Tax Invoice</span>
              <span>Date: 05-01-2026</span>
            </div>

            <div className="grid grid-cols-3 border-b border-[#050720] p-3 text-[11px]">
              <div>
                <span className="text-[10px] text-[#050720]/60 block">Bill To:</span>
                <span className="font-bold text-sm">{createFormData.studentName || 'Rahul Sharma'}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/60 block">Invoice No.:</span>
                <span className="font-bold text-sm">{createFormData.invoiceNumber || 'GST/001'}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/60 block">Country of supply:</span>
                <span>India</span>
              </div>
            </div>

            <table className="w-full text-left border-b border-[#050720]">
              <thead className="border-b border-[#050720] font-bold bg-[#F8FAFC]">
                <tr>
                  <th className="p-2 border-r border-[#050720]">Sr. No.</th>
                  <th className="p-2 border-r border-[#050720]">Description</th>
                  <th className="p-2 border-r border-[#050720]">Hsn/Sac</th>
                  <th className="p-2 border-r border-[#050720]">Qty/Hrs</th>
                  <th className="p-2 border-r border-[#050720]">Rate</th>
                  <th className="p-2 border-r border-[#050720]">Currency</th>
                  <th className="p-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2 border-r border-[#050720]">01</td>
                  <td className="p-2 border-r border-[#050720]">{createFormData.course || 'UI/UX Design'}</td>
                  <td className="p-2 border-r border-[#050720]">{createFormData.hsnSac || '998456'}</td>
                  <td className="p-2 border-r border-[#050720]">{createFormData.qtyHrs || '01'}</td>
                  <td className="p-2 border-r border-[#050720]">-</td>
                  <td className="p-2 border-r border-[#050720]">{createFormData.currency || 'Rupee(₹)'}</td>
                  <td className="p-2 text-right font-bold">{createFormData.grandTotal ? createFormData.grandTotal.toLocaleString() : '35,000'}</td>
                </tr>
              </tbody>
            </table>

            <div className="text-right p-3 space-y-1 text-xs border-b border-[#050720]">
              <div>Subtotal: {createFormData.grandTotal ? createFormData.grandTotal.toLocaleString() : '35,000'}</div>
              <div>CGST @ 0%: 0</div>
              <div>SGST @ 0%: 0</div>
              <div>IGST @ 0%: 0</div>
              <div className="font-bold text-sm pt-1">Grand total: ₹{createFormData.grandTotal ? createFormData.grandTotal.toLocaleString() : '35,000'}</div>
              <div className="text-[10px] text-[#050720]/70">In words: Thirty- five thousand only</div>
            </div>

            <div className="p-3 border-b border-[#050720] text-[11px] space-y-1">
              <span className="font-bold block">Terms & Conditions</span>
              <p>Payment terms: 30 Days</p>
              <p>Due date: 04-Feb-2026</p>
              <p>Billing Period: 04-Oct-2026 to 04-Feb-2026</p>
            </div>

            <div className="grid grid-cols-2 p-3 text-[11px]">
              <div>
                <span className="font-bold block mb-1">Bank Details:</span>
                <p>Bank Name: {createFormData.bankName}</p>
                <p>Branch: {createFormData.bankBranch}</p>
                <p>Account Name: {createFormData.accountName}</p>
                <p>Account Number: {createFormData.accountNumber}</p>
                <p>IFSC: {createFormData.ifsc}</p>
                <p>Swift Code: {createFormData.swiftCode}</p>
              </div>
              <div className="flex flex-col justify-end items-end text-center">
                <div className="border-t border-[#050720] w-44 pt-1 text-[10px] font-semibold">
                  Authorised Signature
                </div>
              </div>
            </div>
          </div>

          {/* Action Row matching Image 3 */}
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

      {/* ========================================================= */}
      {/* 5. MODALS & POPUPS                                        */}
      {/* ========================================================= */}
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
                <span className="font-semibold">{selectedInvoice.paidFees}</span>
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

      {showConfirmGenModal && (
        <div className="fixed inset-0 z-50 bg-[#050720]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl text-center space-y-4">
            <h2 className="text-base font-bold font-['Sora']">Confirm invoice Generation?</h2>
            <p className="text-xs text-[#050720]/70">
              This invoice will be permanently recorded and shared with the client. Once generated, it cannot be deleted, only marked as paid or cancelled.
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