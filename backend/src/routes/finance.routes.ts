import { Router } from 'express';
import { FinancialController } from '../controllers/finance.controller.js';
import { authMiddleware, adminOnly } from '../middlewares/auth.middleware.js';

const router = Router();

// Allocation & Payout (Admin only)
router.post('/allocate', authMiddleware, adminOnly, FinancialController.allocateProfit);
router.post('/payout', authMiddleware, adminOnly, FinancialController.payoutDividends);

// Stats (User)
router.get('/stats', authMiddleware, FinancialController.getProfitStats);

// Withdrawals
router.post('/withdraw', authMiddleware, FinancialController.requestWithdrawal);
router.get('/pending', authMiddleware, adminOnly, FinancialController.getPendingWithdrawals);
router.post('/withdraw/:id/approve', authMiddleware, adminOnly, FinancialController.approveWithdrawal);
router.post('/withdraw/:id/reject', authMiddleware, adminOnly, FinancialController.rejectWithdrawal);

export default router;
