import { Router } from 'express';
import { HotelController } from '../controllers/hotel.controller.js';
import { authMiddleware, adminOnly } from '../middlewares/auth.middleware.js';
const router = Router();
// Public/Shareholder routes (Only view)
router.get('/', authMiddleware, HotelController.getAll);
router.get('/:id', authMiddleware, HotelController.getById);
// Admin-only routes (Full CRUD)
router.post('/', authMiddleware, adminOnly, HotelController.create);
router.put('/:id', authMiddleware, adminOnly, HotelController.update);
export default router;
//# sourceMappingURL=hotel.routes.js.map