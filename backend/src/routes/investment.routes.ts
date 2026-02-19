import { Router } from 'express';
import { InvestmentController } from '../controllers/investment.controller.js';
import { authMiddleware, adminOnly } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/all', authMiddleware, adminOnly, InvestmentController.getAll);
router.get('/', authMiddleware, InvestmentController.getMyInvestments);
router.post('/', authMiddleware, InvestmentController.create);
router.post('/user/:userId', authMiddleware, InvestmentController.getByUserId);
router.post('/request/:id', authMiddleware, adminOnly, InvestmentController.approveRequest);

export default router;
