import { Router, Request, Response } from "express";
import { Lead } from "../models/Lead";

const router = Router();

// GET /api/leads - Fetch all leads
router.get("/", async (_req: Request, res: Response) => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 });
    res.json(leads);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch leads", error });
  }
});

// POST /api/leads - Create new lead
router.post("/", async (req: Request, res: Response) => {
  try {
    const newLead = new Lead(req.body);
    const savedLead = await newLead.save();
    res.status(201).json(savedLead);
  } catch (error) {
    res.status(400).json({ message: "Failed to create lead", error });
  }
});

// PATCH /api/leads/:id/status - Update lead status & add remark/timeline
router.patch("/:id/status", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, remark, newTimelineEntry } = req.body;

    const updateQuery: any = { status };
    if (remark) updateQuery.remark = remark;

    const updateOperation: any = { $set: updateQuery };
    if (newTimelineEntry) {
      updateOperation.$push = { timeline: newTimelineEntry };
    }

    const updatedLead = await Lead.findByIdAndUpdate(id, updateOperation, {
      new: true,
    });

    if (!updatedLead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    res.json(updatedLead);
  } catch (error) {
    res.status(400).json({ message: "Failed to update lead", error });
  }
});

export default router;