import { Router } from 'express';
import { DailyMetricController } from '../controllers/metric.controller.js';
import { authMiddleware, adminOnly } from '../middlewares/auth.middleware.js';
const router = Router();
router.post('/', authMiddleware, DailyMetricController.create);
router.get('/:hotelId', authMiddleware, DailyMetricController.getByHotel);
export default router;
//# sourceMappingURL=metric.routes.js.map