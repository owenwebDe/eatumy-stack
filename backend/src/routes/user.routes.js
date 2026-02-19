import { Router } from 'express';
import { UserController } from '../controllers/user.controller.js';
import { authMiddleware, adminOnly } from '../middlewares/auth.middleware.js';
const router = Router();
// Shareholder routes
router.get('/profile', authMiddleware, UserController.getProfile);
router.post('/bank-accounts', authMiddleware, UserController.addBankAccount);
// Admin routes
router.get('/', authMiddleware, adminOnly, UserController.getAll);
router.put('/:id/kyc', authMiddleware, adminOnly, UserController.updateKyc);
export default router;
//# sourceMappingURL=user.routes.js.map