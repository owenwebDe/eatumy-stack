import type { Request, Response } from 'express';
import prisma from '../utils/prisma.js';

export class WalletController {
  static async deposit(req: Request, res: Response) {
    const { userId, amount, description, referenceId } = req.body;

    if (!userId || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid deposit details' });
    }

    const amountVal = parseFloat(amount);

    try {
      // Transaction: Update Balance + Log Transaction
      const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.update({
          where: { id: userId },
          data: {
            walletBalance: { increment: amountVal }
          }
        });
        
        console.log(`[WALLET] Deposited ${amountVal} to User ${userId}. New Balance: ${user.walletBalance}`);

        const transaction = await tx.walletTransaction.create({
          data: {
            userId,
            amount: amountVal,
            type: 'DEPOSIT',
            description: description || 'Admin Deposit',
            referenceId
          }
        });

        return { user, transaction };
      });

      res.status(201).json(result);
    } catch (error) {
      console.error("Deposit Error:", error);
      res.status(500).json({ error: 'Failed to deposit funds' });
    }
  }

  static async getBalance(req: any, res: Response) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { walletBalance: true, transactions: { orderBy: { created_at: 'desc' }, take: 10 } }
      });

      if (!user) return res.status(404).json({ error: 'User not found' });
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch balance' });
    }
  }

  static async getTransactions(req: any, res: Response) {
      try {
          const transactions = await prisma.walletTransaction.findMany({
              where: { userId: req.user.id },
              orderBy: { created_at: 'desc' }
          });
          res.json(transactions);
      } catch (error) {
          res.status(500).json({ error: 'Failed to fetch transactions' });
      }
  }

  static async requestDeposit(req: any, res: Response) {
      const { amount, referenceId } = req.body;
      const userId = req.user.id;

      if (!amount || amount <= 0) {
          return res.status(400).json({ error: 'Invalid amount' });
      }

      try {
          const request = await prisma.depositRequest.create({
              data: {
                  userId,
                  amount: parseFloat(amount),
                  referenceId,
                  status: 'PENDING'
              }
          });

          await prisma.notification.create({
              data: {
                  userId,
                  type: 'DEPOSIT_REQUEST',
                  title: 'Deposit Requested',
                  message: `Your deposit request for ₹${amount} has been received and is pending approval.`
              }
          });

          res.status(201).json(request);
      } catch (error) {
          console.error("Deposit Request Error:", error);
          res.status(500).json({ error: 'Failed to request deposit' });
      }
  }

  static async getDepositRequests(req: Request, res: Response) {
      try {
          const requests = await prisma.depositRequest.findMany({
              where: { status: 'PENDING' },
              include: { user: true },
              orderBy: { createdAt: 'desc' }
          });
          res.json(requests);
      } catch (error) {
          res.status(500).json({ error: 'Failed to fetch requests' });
      }
  }

  static async approveDeposit(req: Request, res: Response) {
      const { id } = req.params;
      const requestId = id as string;
      
      try {
          // @ts-ignore
          const result = await prisma.$transaction(async (tx) => {
             const request = await tx.depositRequest.findUnique({ where: { id: requestId } });
             if (!request || request.status !== 'PENDING') {
                 throw new Error("Invalid request");
             }

             // Update Request
             await tx.depositRequest.update({
                 where: { id: requestId },
                 data: { status: 'APPROVED', approvedAt: new Date() }
             });

             // Update User Balance
             const user = await tx.user.update({
                 where: { id: request.userId },
                 data: { walletBalance: { increment: request.amount } }
             });

             // Create Transaction Log
             await tx.walletTransaction.create({
                 data: {
                     userId: request.userId,
                     amount: request.amount,
                     type: 'DEPOSIT',
                     description: 'Deposit Request Approved',
                     referenceId: request.id
                 }
             });

             await tx.notification.create({
                 data: {
                     userId: request.userId,
                     type: 'DEPOSIT_APPROVED',
                     title: 'Deposit Approved',
                     message: `Your deposit of ₹${request.amount} has been approved and credited to your wallet.`
                 }
             });

             return user;
          });

          res.json({ message: "Approved" });
      } catch (error) {
          console.error(error);
          res.status(500).json({ error: "Failed to approve" });
      }
  }

  static async rejectDeposit(req: Request, res: Response) {
      const { id } = req.params;
      const requestId = id as string;

      try {
          const request = await prisma.depositRequest.update({
              where: { id: requestId },
              data: { status: 'REJECTED', rejectedAt: new Date() }
          });

          await prisma.notification.create({
              data: {
                  userId: request.userId,
                  type: 'DEPOSIT_REJECTED',
                  title: 'Deposit Rejected',
                  message: `Your deposit request for ₹${request.amount} has been rejected.`
              }
          });

          res.json({ message: "Rejected" });
      } catch (error) {
          res.status(500).json({ error: "Failed to reject" });
      }
  }
}
