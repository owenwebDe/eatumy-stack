import { Router } from 'express';
import { DailyMetricController } from '../controllers/metric.controller.js';
import { authMiddleware, adminOnly } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/', authMiddleware, DailyMetricController.create);
router.get('/system-stats', authMiddleware, adminOnly, DailyMetricController.getSystemStats);
router.get('/fleet-summary', authMiddleware, DailyMetricController.getDailyFleetSummary);
router.get('/performance', authMiddleware, adminOnly, DailyMetricController.getPerformanceStats);
router.get('/:hotelId', authMiddleware, DailyMetricController.getByHotel);

export default router;
