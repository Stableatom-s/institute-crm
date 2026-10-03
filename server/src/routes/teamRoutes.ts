// src/routes/teamRoutes.ts
import { Router, Request, Response } from 'express';
import { TeamMember } from '../models/TeamMember';

const router = Router();

// 1. GET /api/team — Fetch all team members (or filter by status)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    const query = status ? { status: status as string } : {};
    
    const members = await TeamMember.find(query).sort({ createdAt: -1 });

    // Format output to match frontend interface
    const formattedMembers = members.map((m, index) => ({
      id: m._id.toString(),
      srNo: m.srNo || String(index + 1).padStart(2, '0'),
      firstName: m.firstName,
      lastName: m.lastName,
      name: m.name,
      role: m.role,
      mobile: m.mobile,
      altMobile: m.altMobile,
      email: m.email,
      address: m.address,
      education: m.education,
      course: m.course,
      assignedBatches: m.assignedBatches,
      activeTill: m.activeTill,
      status: m.status,
      photoUrl: m.photoUrl,
      workHistory: m.workHistory,
      leaveHistory: m.leaveHistory,
    }));

    return res.status(200).json(formattedMembers);
  } catch (error) {
    console.error('Error fetching team members:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// 2. POST /api/team — Add new team member and dispatch credentials
router.post('/', async (req: Request, res: Response) => {
  try {
    const { password, ...memberData } = req.body;

    const newMember = new TeamMember({
      ...memberData,
      status: 'Active',
    });

    const savedMember = await newMember.save();

    // TODO: Send automated login email with credentials using Nodemailer or Resend
    console.log(`[EMAIL DISPATCH] Credentials sent to ${savedMember.email} with temporary password: ${password}`);

    return res.status(201).json({
      id: savedMember._id.toString(),
      ...savedMember.toObject(),
    });
  } catch (error) {
    console.error('Error creating team member:', error);
    return res.status(500).json({ message: 'Failed to create team member' });
  }
});

// 3. PUT /api/team/:id — Update existing team member fields
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedMember = await TeamMember.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedMember) {
      return res.status(404).json({ message: 'Team member not found' });
    }

    return res.status(200).json({
      id: updatedMember._id.toString(),
      ...updatedMember.toObject(),
    });
  } catch (error) {
    console.error('Error updating team member:', error);
    return res.status(500).json({ message: 'Failed to update team member' });
  }
});

// 4. PATCH /api/team/:id/remove — Set status to Inactive & save removal reason
router.patch('/:id/remove', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const todayDate = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const deactivatedMember = await TeamMember.findByIdAndUpdate(
      id,
      {
        $set: {
          status: 'Inactive',
          removalReason: reason || 'N/A',
          activeTill: todayDate,
        },
      },
      { new: true }
    );

    if (!deactivatedMember) {
      return res.status(404).json({ message: 'Team member not found' });
    }

    return res.status(200).json({
      id: deactivatedMember._id.toString(),
      ...deactivatedMember.toObject(),
    });
  } catch (error) {
    console.error('Error removing team member:', error);
    return res.status(500).json({ message: 'Failed to deactivate team member' });
  }
});

// 5. PATCH /api/team/:id/restore — Set user status back to Active
router.patch('/:id/restore', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const restoredMember = await TeamMember.findByIdAndUpdate(
      id,
      {
        $set: { status: 'Active' },$unset: { activeTill: '', removalReason: '' },
      },
      { new: true }
    );

    if (!restoredMember) {
      return res.status(404).json({ message: 'Team member not found' });
    }

    return res.status(200).json({
      id: restoredMember._id.toString(),
      ...restoredMember.toObject(),
    });
  } catch (error) {
    console.error('Error restoring team member:', error);
    return res.status(500).json({ message: 'Failed to restore team member access' });
  }
});

export default router;