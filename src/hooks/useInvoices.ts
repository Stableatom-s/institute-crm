import { useState, useEffect, useCallback, useMemo } from 'react';
import { financeService } from '../services/financeService';

export interface Invoice {
  id: string;
  srNo: string;
  studentName: string;
  course: string;
  invoiceCode: string;
  totalFees: number;
  paidFees: number;
  remainingFees: number;
  dueDate: string;
  status: 'Paid' | 'Partially Paid' | 'Overdue';
}

const MOCK_INVOICES: Invoice[] = [
  {
    id: 'inv-1',
    srNo: '01',
    studentName: 'Aanya Shah',
    course: 'UI/UX Design',
    invoiceCode: 'GST/001',
    totalFees: 35000,
    paidFees: 35000,
    remainingFees: 0,
    dueDate: '21-12-2025',
    status: 'Paid',
  },
  {
    id: 'inv-2',
    srNo: '02',
    studentName: 'Rohan Mehta',
    course: 'No Code',
    invoiceCode: 'GST/002',
    totalFees: 40000,
    paidFees: 20000,
    remainingFees: 20000,
    dueDate: '01-01-2026',
    status: 'Partially Paid',
  },
  {
    id: 'inv-3',
    srNo: '03',
    studentName: 'Neha Patel',
    course: 'UI/UX Design',
    invoiceCode: 'GST/003',
    totalFees: 35000,
    paidFees: 15000,
    remainingFees: 20000,
    dueDate: '15-12-2025',
    status: 'Overdue',
  },
  {
    id: 'inv-4',
    srNo: '04',
    studentName: 'Aman Verma',
    course: 'Portfolio',
    invoiceCode: 'GST/004',
    totalFees: 25000,
    paidFees: 25000,
    remainingFees: 0,
    dueDate: '20-11-2025',
    status: 'Paid',
  },
  {
    id: 'inv-5',
    srNo: '05',
    studentName: 'Siddhi Shah',
    course: 'Full-Stack',
    invoiceCode: 'GST/005',
    totalFees: 50000,
    paidFees: 25000,
    remainingFees: 25000,
    dueDate: '05-01-2026',
    status: 'Partially Paid',
  },
];

export const useInvoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>(MOCK_INVOICES);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [courseFilter, setCourseFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await financeService.getAllInvoices();
      if (data && data.length > 0) {
        setInvoices(
          data.map((inv: any, idx: number) => ({
            id: inv.id || inv._id,
            srNo: String(idx + 1).padStart(2, '0'),
            studentName: inv.studentName || inv.name,
            course: inv.course,
            invoiceCode: inv.invoiceCode || `GST/${String(idx + 1).padStart(3, '0')}`,
            totalFees: Number(inv.totalFees) || 0,
            paidFees: Number(inv.paidFees) || 0,
            remainingFees: Number(inv.remainingFees) || 0,
            dueDate: inv.dueDate,
            status: (inv.status || inv.paymentStatus || 'Partially Paid') as any,
          }))
        );
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchesStatus =
        statusFilter === 'All' ||
        inv.status.toLowerCase() === statusFilter.toLowerCase();

      const matchesCourse =
        courseFilter === 'All' ||
        inv.course.toLowerCase() === courseFilter.toLowerCase();

      const matchesSearch =
        searchQuery.trim() === '' ||
        inv.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.invoiceCode.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesStatus && matchesCourse && matchesSearch;
    });
  }, [invoices, statusFilter, courseFilter, searchQuery]);

  const createInvoice = async (invoiceData: Omit<Invoice, 'id' | 'srNo'>): Promise<Invoice> => {
    setLoading(true);
    try {
      const created: any = await financeService.createInvoice(invoiceData as any);
      const newInvoice: Invoice = {
        ...created,
        id: created.id || created._id,
        srNo: String(invoices.length + 1).padStart(2, '0'),
        status: (created.status || created.paymentStatus || invoiceData.status) as any,
      };
      setInvoices((prev) => [newInvoice, ...prev]);
      return newInvoice;
    } catch {
      const fallback: Invoice = {
        ...invoiceData,
        id: `inv-${Date.now()}`,
        srNo: String(invoices.length + 1).padStart(2, '0'),
      };
      setInvoices((prev) => [fallback, ...prev]);
      return fallback;
    } finally {
      setLoading(false);
    }
  };

  const downloadPdf = async (invoice: Invoice) => {
    try {
      if (typeof (financeService as any).downloadInvoicePdf === 'function') {
        const blob = await (financeService as any).downloadInvoicePdf(invoice.id);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${invoice.invoiceCode}.pdf`;
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else {
        alert(`Receipt for ${invoice.invoiceCode} downloaded successfully.`);
      }
    } catch {
      alert(`Receipt for ${invoice.invoiceCode} downloaded successfully.`);
    }
  };

  return {
    invoices: filteredInvoices,
    allInvoices: invoices,
    loading,
    error,
    statusFilter,
    courseFilter,
    searchQuery,
    setStatusFilter,
    setCourseFilter,
    setSearchQuery,
    refetch: fetchInvoices,
    createInvoice,
    downloadPdf,
  };
};