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

// POST create invoice
router.post('/', async (req: Request, res: Response) => {
  try {
    const count = await Invoice.countDocuments();
    const newInvoice = new Invoice({
      ...req.body,
      srNo: String(count + 1).padStart(2, '0'),
      invoiceCode: req.body.invoiceCode || `GST/${String(count + 1).padStart(3, '0')}`,
    });
    const saved = await newInvoice.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create invoice', error });
  }
});

// PATCH add installment payment
router.patch('/:id/installment', async (req: Request, res: Response) => {
  try {
    const { amount, installmentRecord } = req.body;
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    invoice.paidFees += Number(amount) || 0;
    invoice.remainingFees = Math.max(0, invoice.totalFees - invoice.paidFees);
    invoice.status = invoice.remainingFees === 0 ? 'Paid' : 'Partially Paid';

    const saved = await invoice.save();
    res.json(saved);
  } catch (error) {
    res.status(500).json({ message: 'Failed to record installment', error });
  }
});


router.get('/fees', async (req, res) => {
  try {
    // Return fee data or empty array if not yet in DB
    res.json([]);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching fees' });
  }
});


export const invoiceRoutes = router;