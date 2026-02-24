import { Router } from 'express';
import { UserController } from '../controllers/user.controller.js';
import { authMiddleware, adminOnly } from '../middlewares/auth.middleware.js';

const router = Router();

// Shareholder routes
router.get('/profile', authMiddleware, UserController.getProfile);
router.post('/bank-accounts', authMiddleware, UserController.addBankAccount);

// Admin routes
router.get('/', authMiddleware, adminOnly, UserController.getAll);
router.get('/admins', authMiddleware, adminOnly, UserController.getAdmins);
router.post('/', authMiddleware, adminOnly, UserController.create);
// router.post('/', UserController.create); // TEMP: Disable auth for testing
router.put('/:id', authMiddleware, adminOnly, UserController.update);
router.put('/:id/kyc', authMiddleware, adminOnly, UserController.updateKyc);
router.get('/:id/kyc-documents', authMiddleware, adminOnly, UserController.getKycDocuments);
router.post('/:id/kyc-documents', authMiddleware, adminOnly, UserController.addKycDocument);
router.delete('/:id/kyc-documents/:docId', authMiddleware, adminOnly, UserController.deleteKycDocument);
router.put('/:id/terminate', authMiddleware, adminOnly, UserController.terminate);
router.delete('/:id', authMiddleware, adminOnly, UserController.delete);

export default router;
