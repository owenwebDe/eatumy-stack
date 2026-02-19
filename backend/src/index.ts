import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import prisma from './utils/prisma.js';

const app = express();
// Force restart for Prisma Client update (Retry 2)
const port = process.env.PORT || 5000;

app.use(cors({
  origin: '*', // Allow all for dev
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Health Check
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ message: 'Backend is healthy & DB is connected' });
  } catch (error) {
    res.status(500).json({ message: 'Backend is healthy, but DB is disconnected', error });
  }
});

// Basic Route for root
app.get('/', (req, res) => {
  res.send('EatumyHolder API is running');
});

// Import Routes
import authRoutes from './routes/auth.routes.js';
import hotelRoutes from './routes/hotel.routes.js';
import userRoutes from './routes/user.routes.js';
import investmentRoutes from './routes/investment.routes.js';
import metricRoutes from './routes/metric.routes.js';
import walletRoutes from './routes/wallet.routes.js';

import branchRoutes from './routes/branch.routes.js';

app.use('/api/auth', authRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/users', userRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/metrics', metricRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/branch', branchRoutes);

import financeRoutes from './routes/finance.routes.js';
app.use('/api/finance', financeRoutes);

import notificationRoutes from './routes/notification.routes.js';
app.use('/api/notifications', notificationRoutes);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
  console.log(`[server]: Prisma configured with driverAdapters`);
});
