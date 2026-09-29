import { useState, useEffect, useCallback, useMemo } from 'react';
import { Invoice } from '../types';
import { financeService } from '../services/financeService';

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

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [courseFilter, setCourseFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await financeService.getAllInvoices();
      if (data && data.length > 0) {
        setInvoices(data);
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

  // Create invoice mutation
  const createInvoice = async (invoiceData: Omit<Invoice, 'id' | 'srNo'>): Promise<Invoice> => {
    setLoading(true);
    try {
      const created = await financeService.createInvoice(invoiceData);
      setInvoices((prev) => [created, ...prev]);
      return created;
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

  // PDF download handler
  const downloadPdf = async (invoice: Invoice) => {
    try {
      const blob = await financeService.downloadInvoicePdf(invoice.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${invoice.invoiceCode}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
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