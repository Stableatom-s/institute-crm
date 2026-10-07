import { Router, Request, Response } from 'express';
import { TeamMember } from '../models/TeamMember';
import { User } from '../models/User';

const router = Router();

// 1. GET all team members (with auto-seeding if empty)
router.get('/', async (_req: Request, res: Response) => {
  try {
    let members = await TeamMember.find().sort({ createdAt: 1 });
    res.json(members);
  } catch (error: any) {
    res.status(500).json({ message: 'Error retrieving team members', error: error.message });
  }
});

// 2. POST create new member & register login user
router.post('/', async (req: Request, res: Response) => {
  try {
    const { password, ...memberData } = req.body;
    const count = await TeamMember.countDocuments();
    const srNo = String(count + 1).padStart(2, '0');

    const fullName = `${memberData.firstName || ''} ${memberData.lastName || ''}`.trim() || memberData.name;
    const member = new TeamMember({
      ...memberData,
      name: fullName,
      srNo,
    });
    const savedMember = await member.save();

    // Map role to user login role ('Faculty' -> 'faculty', 'Sales' -> 'sales')
    const userRole = memberData.role?.toLowerCase().includes('sales') ? 'sales' : 'faculty';

    // Provision or update user login account
    let existingUser = await User.findOne({ email: memberData.email.toLowerCase() });
    if (!existingUser) {
      await new User({
        name: fullName,
        email: memberData.email.toLowerCase(),
        password: password || 'password123',
        role: userRole,
        status: 'Active',
      }).save();
    } else {
      existingUser.status = 'Active';
      existingUser.role = userRole;
      if (password) existingUser.password = password;
      await existingUser.save();
    }

    res.status(201).json(savedMember);
  } catch (error: any) {
    res.status(400).json({ message: 'Failed to create team member', error: error.message });
  }
});

// 3. PUT update member details
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const updated = await TeamMember.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Member not found' });

    // Sync User name/role if email matches
    if (updated.email) {
      const userRole = updated.role?.toLowerCase().includes('sales') ? 'sales' : 'faculty';
      await User.findOneAndUpdate(
        { email: updated.email.toLowerCase() },
        { name: updated.name, role: userRole }
      );
    }

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to update member', error: error.message });
  }
});

// 4. PATCH update status (Deactivate / Restore)
router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const { status, activeTill } = req.body;
    const member = await TeamMember.findById(req.params.id);
    if (!member) return res.status(404).json({ message: 'Member not found' });

    member.status = status;
    if (activeTill !== undefined) member.activeTill = activeTill;
    await member.save();

    // Block or re-enable user login
    if (member.email) {
      await User.findOneAndUpdate(
        { email: member.email.toLowerCase() },
        { status: status === 'Active' ? 'Active' : 'Inactive' }
      );
    }

    res.json(member);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to update member status', error: error.message });
  }
});

export const teamRoutes = router;
export default router;