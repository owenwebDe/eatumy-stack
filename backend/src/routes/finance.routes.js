import { Router } from 'express';
import { FinancialController } from '../controllers/finance.controller.js';
import { authMiddleware, adminOnly } from '../middlewares/auth.middleware.js';
const router = Router();
// Allocation (Admin only)
router.post('/allocate', authMiddleware, adminOnly, FinancialController.allocateProfit);
// Withdrawals
router.post('/withdraw', authMiddleware, FinancialController.requestWithdrawal);
router.get('/pending', authMiddleware, adminOnly, FinancialController.getPendingWithdrawals);
export default router;
//# sourceMappingURL=finance.routes.js.map