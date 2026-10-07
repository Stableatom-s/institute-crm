import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'radiquolab-crm-secure-key-2026';

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    if (user.status === 'Inactive') {
      return res.status(403).json({ message: 'Your account has been deactivated. Contact admin.' });
    }

    // Support both bcrypt hashes and raw initial seed passwords
    let isMatch = false;
    if (user.password?.startsWith('$2a$') || user.password?.startsWith('$2b$')) {
      isMatch = await bcrypt.compare(password, user.password);
    } else {
      isMatch = user.password === password;
      if (isMatch) {
        // Upgrade plain password to bcrypt hash on valid login
        user.password = await bcrypt.hash(password, 10);
        await user.save();
      }
    }

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const payload = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: payload,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Authentication failed', error: error.message });
  }
});

// GET /api/auth/me (Returns authenticated user profile)
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.id).select('-password');
    if (!user || user.status === 'Inactive') {
      return res.status(404).json({ message: 'User session not found or inactive.' });
    }
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to retrieve session', error: error.message });
  }
});

export const authRoutes = router;
export default router;