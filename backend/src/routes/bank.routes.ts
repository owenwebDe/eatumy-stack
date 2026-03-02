import { Router } from 'express';
import { BankController } from '../controllers/bank.controller.js';
import { authMiddleware, adminOnly } from '../middlewares/auth.middleware.js';

const router = Router();

// Investor Routes
router.get('/mine', authMiddleware, BankController.getMine);
router.post('/', authMiddleware, BankController.add);
router.delete('/:id', authMiddleware, BankController.delete);

// Admin Routes
router.get('/admin/pending', authMiddleware, adminOnly, BankController.getPending);
router.put('/admin/:id/verify', authMiddleware, adminOnly, BankController.verify);

export default router;
