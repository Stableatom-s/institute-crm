import { Router, Request, Response } from 'express';
import { Invoice } from '../models/Invoice';

const router = Router();

// GET all invoices
router.get('/', async (_req: Request, res: Response) => {
  try {
    const invoices = await Invoice.find().sort({ createdAt: -1 });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving invoices', error });
  }
});

// Helper: Calculate total approved paid amount from installments
function calculateApprovedPaid(installments: any[] = []): number {
  return installments
    .filter((inst) => inst.status === 'Paid')
    .reduce((sum, inst) => {
      const amt = typeof inst.amount === 'string'
        ? parseInt(inst.amount.replace(/[^0-9]/g, ''), 10) || 0
        : Number(inst.amount) || 0;
      return sum + amt;
    }, 0);
}

// POST create or request invoice
router.post('/', async (req: Request, res: Response) => {
  try {
    const count = await Invoice.countDocuments();
    const totalFees = Number(req.body.totalFees) || 0;
    const isApproved = req.body.approvalStatus === 'Approved';
    const invoiceCode = req.body.invoiceCode || `GST/${String(count + 1).padStart(3, '0')}`;

    let existing = null;
    if (req.body.studentName) {
      existing = await Invoice.findOne({
        studentName: { $regex: new RegExp(`^${req.body.studentName.trim()}$`, 'i') },
      });
    }

    if (existing) {
      existing.approvalStatus = req.body.approvalStatus || 'Requests';

      if (req.body.timeline && req.body.timeline.length > 0) {
        existing.installments = req.body.timeline.map((t: any) => ({
          id: t.id || `inst-${Date.now()}`,
          installmentTitle: t.installmentTitle || t.title,
          dueDate: t.dueDate,
          paidDate: t.paidDate,
          amount: typeof t.amount === 'string' ? parseInt(t.amount.replace(/[^0-9]/g, ''), 10) || 0 : Number(t.amount) || 0,
          amountLeft: typeof t.amountLeft === 'string' ? parseInt(t.amountLeft.replace(/[^0-9]/g, ''), 10) || 0 : Number(t.amountLeft) || 0,
          status: t.status || (isApproved ? 'Paid' : 'Pending'),
        }));
      }

      // Calculate paid fees only from installments that are marked Paid
      const approvedPaid = calculateApprovedPaid(existing.installments);
      existing.paidFees = Math.min(existing.totalFees, approvedPaid > 0 ? approvedPaid : (isApproved ? Number(req.body.paidFees) || 0 : existing.paidFees));
      existing.remainingFees = Math.max(0, existing.totalFees - existing.paidFees);
      existing.paymentStatus = existing.remainingFees === 0 ? 'Paid' : 'Partially Paid';

      const saved = await existing.save();
      return res.status(200).json(saved);
    }

    // New invoice
    const initialInstallments = (req.body.timeline || req.body.installments || []).map((t: any) => ({
      id: t.id || `inst-${Date.now()}`,
      installmentTitle: t.installmentTitle || t.title,
      dueDate: t.dueDate,
      paidDate: t.paidDate,
      amount: typeof t.amount === 'string' ? parseInt(t.amount.replace(/[^0-9]/g, ''), 10) || 0 : Number(t.amount) || 0,
      amountLeft: typeof t.amountLeft === 'string' ? parseInt(t.amountLeft.replace(/[^0-9]/g, ''), 10) || 0 : Number(t.amountLeft) || 0,
      status: t.status || (isApproved ? 'Paid' : 'Pending'),
    }));

    const approvedPaid = calculateApprovedPaid(initialInstallments);
    const initialPaid = approvedPaid > 0 ? approvedPaid : (isApproved ? Number(req.body.paidFees) || 0 : 0);
    const remainingFees = Math.max(0, totalFees - initialPaid);

    const newInvoice = new Invoice({
      ...req.body,
      srNo: String(count + 1).padStart(2, '0'),
      invoiceCode,
      totalFees,
      paidFees: initialPaid,
      remainingFees,
      paymentStatus: initialPaid >= totalFees && totalFees > 0 ? 'Paid' : 'Partially Paid',
      approvalStatus: req.body.approvalStatus || 'Requests',
      approvedOn: isApproved ? new Date().toLocaleDateString('en-GB').replace(/\//g, '-') : '-',
      installments: initialInstallments,
    });

    const saved = await newInvoice.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create invoice', error });
  }
});

// PATCH record installment request from Sales
router.patch('/:id/installment', async (req: Request, res: Response) => {
  try {
    const { amount, installmentRecord } = req.body;
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    const payAmt = typeof amount === 'string' ? parseInt(amount.replace(/[^0-9]/g, ''), 10) || 0 : Number(amount) || 0;
    
    // Set approval status to Requests so Admin sees it in the Requests queue
    invoice.approvalStatus = 'Requests';

    if (installmentRecord) {
      invoice.installments.unshift({
        id: installmentRecord.id || `inst-${Date.now()}`,
        installmentTitle: installmentRecord.title || `Installment #${invoice.installments.length + 1}`,
        dueDate: installmentRecord.dueDate || invoice.dueDate,
        paidDate: installmentRecord.paidDate || new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
        amount: payAmt,
        amountLeft: Math.max(0, invoice.totalFees - invoice.paidFees - payAmt),
        status: 'Pending', // Pending until Admin clicks Approve
      });
    }

    const saved = await invoice.save();
    res.json(saved);
  } catch (error) {
    res.status(500).json({ message: 'Failed to record installment', error });
  }
});

// PATCH approve invoice (Admin approves the pending request)
router.patch('/:id/approve', async (req: Request, res: Response) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    invoice.approvalStatus = 'Approved';
    invoice.approvedOn = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');

    if (invoice.installments && invoice.installments.length > 0) {
      // Approve all pending installments and set payment date
      invoice.installments.forEach((inst: any) => {
        if (inst.status === 'Pending') {
          inst.status = 'Paid';
          inst.paidDate = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
        }
      });
      const approvedSum = calculateApprovedPaid(invoice.installments);
      invoice.paidFees = Math.min(invoice.totalFees, approvedSum);
    } else {
      invoice.paidFees = Math.min(invoice.totalFees, invoice.paidFees > 0 ? invoice.paidFees : invoice.totalFees);
    }

    invoice.remainingFees = Math.max(0, invoice.totalFees - invoice.paidFees);
    invoice.paymentStatus = invoice.remainingFees === 0 ? 'Paid' : 'Partially Paid';

    const saved = await invoice.save();
    res.json(saved);
  } catch (error) {
    res.status(500).json({ message: 'Failed to approve invoice', error });
  }
});

// PATCH reject invoice
router.patch('/:id/reject', async (req: Request, res: Response) => {
  try {
    const { reason } = req.body;
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    invoice.approvalStatus = 'Cancelled';
    invoice.rejectedReason = reason || 'Rejected by administrator';

    if (invoice.installments) {
      invoice.installments.forEach((inst: any) => {
        if (inst.status === 'Pending') {
          inst.status = 'Overdue';
        }
      });
    }

    const saved = await invoice.save();
    res.json(saved);
  } catch (error) {
    res.status(500).json({ message: 'Failed to reject invoice', error });
  }
});

export const invoiceRoutes = router;
export default router;