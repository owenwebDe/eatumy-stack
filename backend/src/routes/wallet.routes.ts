import { Router } from 'express';
import { WalletController } from '../controllers/wallet.controller.js';
import { authMiddleware, adminOnly } from '../middlewares/auth.middleware.js';

const router = Router();

// User Routes
router.get('/balance', authMiddleware, WalletController.getBalance);
router.get('/transactions', authMiddleware, WalletController.getTransactions);
router.post('/deposit-request', authMiddleware, WalletController.requestDeposit);

// Admin Routes
router.post('/deposit', authMiddleware, adminOnly, WalletController.deposit);
router.get('/deposit-requests', authMiddleware, adminOnly, WalletController.getDepositRequests);
router.post('/deposit-requests/:id/approve', authMiddleware, adminOnly, WalletController.approveDeposit);
router.post('/deposit-requests/:id/reject', authMiddleware, adminOnly, WalletController.rejectDeposit);

export default router;
