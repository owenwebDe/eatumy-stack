import { Router } from 'express';
import { BranchController } from '../controllers/branch.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

// These routes require the user to be a logged-in User (potentially specifically a BRANCH_MANAGER)
// We can add a 'managerOnly' middleware later, but for now authenticateToken is base.

router.get('/my-kitchen', authMiddleware, BranchController.getMyKitchen);
router.put('/status', authMiddleware, BranchController.updateStatus);

export default router;
