import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import { leadRoutes } from './routes/leads';
import { demoRoutes } from './routes/demo';
import batchRoutes from './routes/batches';   
import { invoiceRoutes } from './routes/invoices';
import { attendanceRoutes } from './routes/attendance';
import leaveRoutes from './routes/leaves';
import teamRoutes from './routes/team';
import authRoutes from './routes/auth';
import notificationRoutes from './routes/notifications';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

// Dynamic CORS configuration allowing localhost and production Vercel domains
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (such as mobile apps, curl, or Postman)
      if (!origin) return callback(null, true);

      const isExplicitlyAllowed = allowedOrigins.includes(origin);
      const isVercelDomain = origin.endsWith('.vercel.app');

      if (isExplicitlyAllowed || isVercelDomain) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Application API routes
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/demos', demoRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/notifications', notificationRoutes);

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});

export default app;