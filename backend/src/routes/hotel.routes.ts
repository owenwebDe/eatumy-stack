import { Router } from 'express';
import { HotelController } from '../controllers/hotel.controller.js';
import { authMiddleware, adminOnly } from '../middlewares/auth.middleware.js';

const router = Router();

// Public/Shareholder routes (Only view)
router.get('/', HotelController.getAll);
router.get('/:id', HotelController.getById);

// Admin-only routes (Full CRUD)
router.post('/', authMiddleware, adminOnly, HotelController.create);
router.put('/:id', authMiddleware, adminOnly, HotelController.update);
router.put('/:id/assign-manager', authMiddleware, adminOnly, HotelController.assignManager);
router.delete('/:id', authMiddleware, adminOnly, HotelController.delete);

export default router;
