import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
const router = Router();
router.post('/request-otp', AuthController.requestOTP);
router.post('/verify-otp', AuthController.verifyOTP);
export default router;
//# sourceMappingURL=auth.routes.js.map