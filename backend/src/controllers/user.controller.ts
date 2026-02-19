import type { Request, Response } from 'express';
import prisma from '../utils/prisma.js';

export class UserController {
  static async getAll(req: Request, res: Response) {
    try {
      const users = await prisma.user.findMany({
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

  static async getProfile(req: any, res: Response) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: {
          bankAccounts: true,
          investments: {
            include: { hotel: true }
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
    const { name, mobile, role = 'INVESTOR' } = req.body;
    try {
      const existingUser = await prisma.user.findUnique({ where: { mobile } });
      if (existingUser) {
        return res.status(400).json({ error: 'User with this mobile already exists' });
      }

      const user = await prisma.user.create({
        data: {
          name,
          mobile,
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
}
