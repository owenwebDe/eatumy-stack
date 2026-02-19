import { Router } from 'express';
import { InvestmentController } from '../controllers/investment.controller.js';
import { authMiddleware, adminOnly } from '../middlewares/auth.middleware.js';
const router = Router();
router.get('/', authMiddleware, adminOnly, InvestmentController.getAll);
router.post('/', authMiddleware, adminOnly, InvestmentController.create);
router.get('/user/:userId', authMiddleware, InvestmentController.getByUserId);
export default router;
//# sourceMappingURL=investment.routes.js.map