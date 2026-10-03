// src/hooks/useInvoices.ts
import { useState, useEffect, useCallback } from 'react';
import { financeService, InvoiceItem, FeeItem, CreateInvoicePayload } from '../services/financeService';

export const useInvoices = () => {
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [fees, setFees] = useState<FeeItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [invoicesData, feesData] = await Promise.all([
        financeService.getInvoices(),
        financeService.getFees(),
      ]);
      setInvoices(invoicesData);
      setFees(feesData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch financial records.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const approveInvoice = async (id: string) => {
    const updated = await financeService.approveInvoice(id);
    setInvoices((prev) => prev.map((inv) => (inv.id === updated.id ? updated : inv)));
  };

  const rejectInvoice = async (id: string, reason: string) => {
    const updated = await financeService.rejectInvoice(id, reason);
    setInvoices((prev) => prev.map((inv) => (inv.id === updated.id ? updated : inv)));
  };

  const createInvoice = async (payload: CreateInvoicePayload) => {
    const newInvoice = await financeService.createInvoice(payload);
    setInvoices((prev) => [newInvoice, ...prev]);
    return newInvoice;
  };

  const addFeeRemark = async (feeId: string, title: string, date: string, description: string) => {
    await financeService.saveFeeRemark(feeId, title, date, description);
  };

  return {
    invoices,
    fees,
    loading,
    error,
    refresh: fetchData,
    approveInvoice,
    rejectInvoice,
    createInvoice,
    addFeeRemark,
  };
};