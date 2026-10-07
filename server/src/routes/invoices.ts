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

// POST create or request invoice (From Sales Fees or Admin)
router.post('/', async (req: Request, res: Response) => {
  try {
    const count = await Invoice.countDocuments();
    const totalFees = Number(req.body.totalFees) || 0;
    const isApproved = req.body.approvalStatus === 'Approved';
    const amountToCredit = isApproved ? (Number(req.body.paidFees) || 0) : 0;
    const remainingFees = Math.max(0, totalFees - amountToCredit);
    const invoiceCode = req.body.invoiceCode || `GST/${String(count + 1).padStart(3, '0')}`;

    let existing = null;
    if (req.body.studentName) {
      existing = await Invoice.findOne({
        studentName: { $regex: new RegExp(`^${req.body.studentName.trim()}$`, 'i') },
      });
    }

    if (existing) {
      existing.approvalStatus = req.body.approvalStatus || 'Requests';
      if (req.body.installments && req.body.installments.length > 0) {
        existing.installments = req.body.installments;
      }
      if (isApproved) {
        existing.paidFees += amountToCredit;
        existing.remainingFees = Math.max(0, existing.totalFees - existing.paidFees);
        existing.paymentStatus = existing.remainingFees === 0 ? 'Paid' : 'Partially Paid';
      }
      const saved = await existing.save();
      return res.status(200).json(saved);
    }

    const newInvoice = new Invoice({
      ...req.body,
      srNo: String(count + 1).padStart(2, '0'),
      invoiceCode,
      totalFees,
      paidFees: amountToCredit, // Only credited if generated directly as Approved by Admin
      remainingFees,
      paymentStatus: amountToCredit >= totalFees && totalFees > 0 ? 'Paid' : 'Partially Paid',
      approvalStatus: req.body.approvalStatus || 'Requests',
      approvedOn: isApproved ? new Date().toLocaleDateString('en-GB').replace(/\//g, '-') : '-',
      installments: req.body.installments || [],
    });

    const saved = await newInvoice.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create invoice', error });
  }
});

// PATCH record installment request (Pending admin approval)
router.patch('/:id/installment', async (req: Request, res: Response) => {
  try {
    const { amount, installmentRecord } = req.body;
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    const payAmt = Number(amount) || 0;

    // Do NOT add to paidFees here! Kept as pending until Admin approves.
    invoice.approvalStatus = 'Requests';

    if (installmentRecord) {
      invoice.installments.unshift({
        id: installmentRecord.id || `inst-${Date.now()}`,
        installmentTitle: installmentRecord.title || `Installment #${invoice.installments.length + 1}`,
        dueDate: installmentRecord.dueDate || invoice.dueDate,
        paidDate: installmentRecord.paidDate || new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
        amount: payAmt,
        amountLeft: Math.max(0, invoice.totalFees - invoice.paidFees - payAmt),
        status: 'Pending', // Pending until approval
      });
    }

    const saved = await invoice.save();
    res.json(saved);
  } catch (error) {
    res.status(500).json({ message: 'Failed to record installment', error });
  }
});

// PATCH approve invoice: credits the amount to paidFees
router.patch('/:id/approve', async (req: Request, res: Response) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    invoice.approvalStatus = 'Approved';
    invoice.approvedOn = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');

    // Calculate total approved fees from installments or credit pending installment
    let totalApproved = 0;
    if (invoice.installments && invoice.installments.length > 0) {
      invoice.installments.forEach((inst: any) => {
        inst.status = 'Paid';
        totalApproved += Number(inst.amount) || 0;
      });
      invoice.paidFees = Math.min(invoice.totalFees, totalApproved);
    } else {
      invoice.paidFees = invoice.totalFees;
    }

    invoice.remainingFees = Math.max(0, invoice.totalFees - invoice.paidFees);
    invoice.paymentStatus = invoice.remainingFees === 0 ? 'Paid' : 'Partially Paid';

    const saved = await invoice.save();
    res.json(saved);
  } catch (error) {
    res.status(500).json({ message: 'Failed to approve invoice', error });
  }
});

// PATCH reject invoice: no fees added, status marked Cancelled
router.patch('/:id/reject', async (req: Request, res: Response) => {
  try {
    const { reason } = req.body;
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    invoice.approvalStatus = 'Cancelled';
    invoice.rejectedReason = reason || 'Rejected by administrator';

    // Mark pending installments as Cancelled/Rejected without touching paidFees
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