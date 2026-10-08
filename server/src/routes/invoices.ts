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

// Helper: Calculate total approved paid amount from an installments array
function calculatePaidFromInstallments(installments: any[] = [], defaultPaid = 0): number {
  if (!installments || installments.length === 0) return defaultPaid;
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
    const requestedPaidFees = Number(req.body.paidFees) || 0;
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
      
      // Update installments list if provided
      if (req.body.timeline && req.body.timeline.length > 0) {
        existing.installments = req.body.timeline.map((t: any) => ({
          id: t.id || `inst-${Date.now()}`,
          installmentTitle: t.installmentTitle || t.title,
          dueDate: t.dueDate,
          paidDate: t.paidDate,
          amount: typeof t.amount === 'string' ? parseInt(t.amount.replace(/[^0-9]/g, ''), 10) || 0 : Number(t.amount) || 0,
          amountLeft: typeof t.amountLeft === 'string' ? parseInt(t.amountLeft.replace(/[^0-9]/g, ''), 10) || 0 : Number(t.amountLeft) || 0,
          status: isApproved ? 'Paid' : (t.status || 'Pending'),
        }));
      }

      // DO NOT ACCUMULATE BLINDLY. Set paid fees to exact target or sum of approved installments
      if (isApproved) {
        const approvedSum = calculatePaidFromInstallments(existing.installments, requestedPaidFees);
        existing.paidFees = Math.min(existing.totalFees, approvedSum > 0 ? approvedSum : requestedPaidFees);
      }
      
      existing.remainingFees = Math.max(0, existing.totalFees - existing.paidFees);
      existing.paymentStatus = existing.remainingFees === 0 ? 'Paid' : 'Partially Paid';
      
      const saved = await existing.save();
      return res.status(200).json(saved);
    }

    // New invoice
    const initialPaid = isApproved ? requestedPaidFees : 0;
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
      installments: (req.body.timeline || req.body.installments || []).map((t: any) => ({
        id: t.id || `inst-${Date.now()}`,
        installmentTitle: t.installmentTitle || t.title,
        dueDate: t.dueDate,
        paidDate: t.paidDate,
        amount: typeof t.amount === 'string' ? parseInt(t.amount.replace(/[^0-9]/g, ''), 10) || 0 : Number(t.amount) || 0,
        amountLeft: typeof t.amountLeft === 'string' ? parseInt(t.amountLeft.replace(/[^0-9]/g, ''), 10) || 0 : Number(t.amountLeft) || 0,
        status: isApproved ? 'Paid' : (t.status || 'Pending'),
      })),
    });

    const saved = await newInvoice.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create invoice', error });
  }
});

// PATCH record installment request
router.patch('/:id/installment', async (req: Request, res: Response) => {
  try {
    const { amount, installmentRecord } = req.body;
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    const payAmt = typeof amount === 'string' ? parseInt(amount.replace(/[^0-9]/g, ''), 10) || 0 : Number(amount) || 0;
    invoice.approvalStatus = 'Requests';

    if (installmentRecord) {
      invoice.installments.unshift({
        id: installmentRecord.id || `inst-${Date.now()}`,
        installmentTitle: installmentRecord.title || `Installment #${invoice.installments.length + 1}`,
        dueDate: installmentRecord.dueDate || invoice.dueDate,
        paidDate: installmentRecord.paidDate || new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
        amount: payAmt,
        amountLeft: Math.max(0, invoice.totalFees - invoice.paidFees - payAmt),
        status: 'Pending',
      });
    }

    const saved = await invoice.save();
    res.json(saved);
  } catch (error) {
    res.status(500).json({ message: 'Failed to record installment', error });
  }
});

// PATCH approve invoice: accurately recalculate paidFees
router.patch('/:id/approve', async (req: Request, res: Response) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    invoice.approvalStatus = 'Approved';
    invoice.approvedOn = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');

    if (invoice.installments && invoice.installments.length > 0) {
      let approvedSum = 0;
      invoice.installments.forEach((inst: any) => {
        inst.status = 'Paid';
        const num = typeof inst.amount === 'string' ? parseInt(inst.amount.replace(/[^0-9]/g, ''), 10) || 0 : Number(inst.amount) || 0;
        approvedSum += num;
      });
      // Cap at total fees, never allow exceeding total
      invoice.paidFees = Math.min(invoice.totalFees, approvedSum);
    } else {
      // If no installment breakdowns were specified, only mark what was recorded, capped at total
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