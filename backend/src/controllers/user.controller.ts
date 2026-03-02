import type { Request, Response } from 'express';
import prisma from '../utils/prisma.js';
import { NotificationService } from '../services/notification.service.js';

export class UserController {
  static async getAll(req: Request, res: Response) {
    const { role } = req.query;

    try {
      let whereClause: any = {};
      if (role) {
        whereClause.role = role as string;
      }

      const users = await prisma.user.findMany({
        where: whereClause,
        include: {
          _count: {
            select: { investments: true }
          },
          bankAccounts: true
        }
      });
      res.json(users);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  }

  static async getAdmins(req: Request, res: Response) {
    try {
      const admins = await prisma.user.findMany({
        where: {
          role: {
            in: ['ADMIN', 'SUPERADMIN']
          }
        },
        orderBy: {
          name: 'asc'
        }
      });
      res.json(admins);
    } catch (error) {
      console.error("Failed to fetch admins:", error);
      res.status(500).json({ error: 'Failed to fetch admins' });
    }
  }

  static async getProfile(req: any, res: Response) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: {
          bankAccounts: true,
          investments: {
            include: { hotel: true }
          },
          kycDocuments: {
            orderBy: { uploadedAt: 'desc' }
          }
        }
      });
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  }

  static async updateKyc(req: Request, res: Response) {
    const { id } = req.params;
    const { status } = req.body;
    try {
      const user = await prisma.user.update({
        where: { id: id as string },
        data: { kycStatus: status }
      });
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update KYC status' });
    }
  }

  static async getKycDocuments(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const docs = await prisma.kycDocument.findMany({
        where: { userId: id as string },
        orderBy: { uploadedAt: 'desc' }
      });
      res.json(docs);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch KYC documents' });
    }
  }

  static async addKycDocument(req: Request, res: Response) {
    const { id } = req.params;
    const { type, url } = req.body;
    try {
      const doc = await prisma.kycDocument.create({
        data: {
          userId: id as string,
          type,
          url,
          status: 'APPROVED'
        }
      });

      // Notify Admins
      await NotificationService.notifyAdmins({
        title: 'New KYC Document Uploaded',
        message: `User (ID: ${id}) uploaded a new KYC document (${type}).`,
        type: 'KYC_SUBMISSION'
      });

      res.status(201).json(doc);
    } catch (error) {
      res.status(500).json({ error: 'Failed to add KYC document' });
    }
  }

  static async deleteKycDocument(req: Request, res: Response) {
    const { id, docId } = req.params;
    try {
      await prisma.kycDocument.delete({
        where: {
          id: docId as string,
          userId: id as string // Security check: Ensure doc belongs to user
        }
      });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete KYC document' });
    }
  }

  static async addBankAccount(req: any, res: Response) {
    const { accountName, accountNumber, ifsc, bankName, upiId } = req.body;
    try {
      const bank = await prisma.bankAccount.create({
        data: {
          userId: req.user.id,
          accountName,
          accountNumber, // In prod, encrypt this
          ifsc,
          bankName,
          upiId
        }
      });
      res.status(201).json(bank);
    } catch (error) {
      res.status(500).json({ error: 'Failed to add bank account' });
    }
  }

  static async create(req: Request, res: Response) {
    const { name, mobile, email, role = 'INVESTOR' } = req.body;
    try {
      if (!email || !mobile) {
        return res.status(400).json({ error: 'Both email and mobile are required' });
      }

      const existingUserEmail = await prisma.user.findUnique({ where: { email } });
      if (existingUserEmail) {
        return res.status(400).json({ error: 'User with this email already exists' });
      }

      const existingUserMobile = await prisma.user.findUnique({ where: { mobile } });
      if (existingUserMobile) {
        return res.status(400).json({ error: 'User with this mobile already exists' });
      }

      const user = await prisma.user.create({
        data: {
          name,
          mobile,
          email,
          role,
          status: 'ACTIVE',
          notifications: {
            create: {
              type: 'WELCOME',
              title: 'Welcome to Eatumy!',
              message: 'Your shareholder account has been successfully created. Welcome to the family!'
            }
          }
        }
      });
      res.status(201).json(user);
    } catch (error) {
      console.error("Create user error:", error);
      res.status(500).json({ error: 'Failed to create shareholder', details: error instanceof Error ? error.message : String(error) });
    }
  }

  static async update(req: any, res: Response) {
    const { id } = req.params;
    const { name, email, mobile, role } = req.body;
    try {
      const existingUser = await prisma.user.findUnique({ where: { id: id as string } });
      if (!existingUser) return res.status(404).json({ error: 'User not found' });

      // Role check: Only SUPERADMIN can edit ADMIN or SUPERADMIN
      if (existingUser.role === 'ADMIN' || existingUser.role === 'SUPERADMIN') {
        if (req.user.role !== 'SUPERADMIN') {
          return res.status(403).json({ error: 'Only Super Admins can edit administrator accounts' });
        }
      }

      // Check if email or mobile are being changed to something that already exists
      if (email && email !== existingUser.email) {
        const emailExists = await prisma.user.findUnique({ where: { email } });
        if (emailExists) return res.status(400).json({ error: 'Email already in use by another user' });
      }
      if (mobile && mobile !== existingUser.mobile) {
        const mobileExists = await prisma.user.findUnique({ where: { mobile } });
        if (mobileExists) return res.status(400).json({ error: 'Mobile already in use by another user' });
      }

      const updatedUser = await prisma.user.update({
        where: { id: id as string },
        data: {
          name,
          email,
          mobile,
          // Only allow role update if requester is SUPERADMIN
          ...(role && req.user.role === 'SUPERADMIN' ? { role } : {})
        }
      });
      res.json(updatedUser);
    } catch (error) {
      console.error("Update user error:", error);
      res.status(500).json({ error: 'Failed to update user', details: error instanceof Error ? error.message : String(error) });
    }
  }

  static async terminate(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const user = await prisma.user.update({
        where: { id: id as string },
        data: { status: 'INACTIVE' }
      });
      res.json(user);
    } catch (error) {
      console.error("Terminate user error:", error);
      res.status(500).json({ error: 'Failed to terminate user' });
    }
  }

  static async delete(req: any, res: Response) {
    const { id } = req.params;
    try {
      // Check if user to be deleted is an admin
      const targetUser = await prisma.user.findUnique({ where: { id: id as string } });
      if (!targetUser) return res.status(404).json({ error: 'User not found' });

      // Role check: Only SUPERADMIN can delete ADMIN or SUPERADMIN
      if (targetUser.role === 'ADMIN' || targetUser.role === 'SUPERADMIN') {
        if (req.user.role !== 'SUPERADMIN') {
          return res.status(403).json({ error: 'Only Super Admins can delete administrator accounts' });
        }
      }

      // Delete associated records to avoid foreign key constraint errors
      await prisma.walletTransaction.deleteMany({ where: { userId: id as string } });
      await prisma.depositRequest.deleteMany({ where: { userId: id as string } });
      await prisma.withdrawal.deleteMany({ where: { userId: id as string } });
      await prisma.profitLedger.deleteMany({ where: { userId: id as string } });
      await prisma.investment.deleteMany({ where: { userId: id as string } });
      await prisma.bankAccount.deleteMany({ where: { userId: id as string } });
      await prisma.notification.deleteMany({ where: { userId: id as string } });
      await prisma.auditLog.deleteMany({ where: { actorUserId: id as string } });
      await prisma.kycDocument.deleteMany({ where: { userId: id as string } });

      // Remove branch manager association if any
      await prisma.hotel.updateMany({
        where: { branchManagerId: id as string },
        data: { branchManagerId: null }
      });

      const user = await prisma.user.delete({
        where: { id: id as string }
      });
      res.json(user);
    } catch (error) {
      console.error("Delete user error:", error);
      res.status(500).json({ error: 'Failed to delete user' });
    }
  }
}
