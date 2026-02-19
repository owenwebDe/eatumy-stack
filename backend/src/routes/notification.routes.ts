import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', authMiddleware, NotificationController.getMyNotifications);
router.post('/read-all', authMiddleware, NotificationController.markAllAsRead);
router.post('/:id/read', authMiddleware, NotificationController.markAsRead);


export default router;
