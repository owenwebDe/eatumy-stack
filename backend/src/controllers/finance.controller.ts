import type { Request, Response } from 'express';
import prisma from '../utils/prisma.js';

export class FinancialController {
  // Allocate Profit for a Hotel for a specific month
  static async allocateProfit(req: Request, res: Response) {
    const { hotelId, month, netProfit } = req.body;
    
    try {
      // 1. Create or Update Monthly Profit Record
      const monthlyProfit = await prisma.monthlyProfit.upsert({
        where: {
          hotelId_month: {
            hotelId,
            month: new Date(month)
          }
        },
        update: { netProfit, allocated: true },
        create: { hotelId, month: new Date(month), netProfit, allocated: true }
      });

      // 2. Fetch all active investments for this hotel
      const investments = await prisma.investment.findMany({
        where: { hotelId, status: 'APPROVED' },
        include: { user: true }
      });

      // 3. Logic to distribute profit
      const allocations = [];
      const hotel = await prisma.hotel.findUnique({ where: { id: hotelId } });
      
      if (!hotel) return res.status(404).json({ error: 'Hotel not found' });

      for (const inv of investments) {
        let profitShare = 0;
        
        if (hotel.shareModel === 'PERCENT' && inv.sharePercent) {
          profitShare = (netProfit * inv.sharePercent) / 100;
        } else if (hotel.shareModel === 'UNITS' && inv.shareUnits && hotel.totalUnits) {
          profitShare = (netProfit * inv.shareUnits) / hotel.totalUnits;
        }

        if (profitShare > 0) {
          const entry = await prisma.profitLedger.upsert({
            where: {
              userId_hotelId_month: {
                userId: inv.userId,
                hotelId,
                month: new Date(month)
              }
            },
            update: { profitAllocated: profitShare },
            create: {
              userId: inv.userId,
              hotelId,
              month: new Date(month),
              profitAllocated: profitShare
            }
          });
          allocations.push(entry);
        }
      }

      res.json({ message: 'Profit allocated successfully', count: allocations.length });
    } catch (error) {
      res.status(500).json({ error: 'Profit allocation failed' });
    }
  }

  // Request Withdrawal
  static async requestWithdrawal(req: any, res: Response) {
    const { amount, bankAccountId, hotelId } = req.body;
    
    try {
      // Basic check: Does user have enough balance? (Draft logic)
      // For now, allow request, admin will review.
      const withdrawal = await prisma.withdrawal.create({
        data: {
          userId: req.user.id,
          hotelId,
          amount: parseFloat(amount),
          status: 'PENDING'
        }
      });

      await prisma.notification.create({
          data: {
              userId: req.user.id,
              type: 'WITHDRAWAL_REQUEST',
              title: 'Withdrawal Requested',
              message: `Your withdrawal request for ₹${amount} has been received.`
          }
      });

      res.status(201).json(withdrawal);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Withdrawal request failed' });
    }
  }

  // Admin: Get All Pending Withdrawals
  static async getPendingWithdrawals(req: Request, res: Response) {
    try {
      const withdrawals = await prisma.withdrawal.findMany({
        where: { status: 'PENDING' },
        include: { user: true, hotel: true },
        orderBy: { requestedAt: 'desc' }
      });
      res.json(withdrawals);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch withdrawals' });
    }
  }

  static async approveWithdrawal(req: Request, res: Response) {
      const { id } = req.params;
      const withdrawalId = id as string;
      try {
          await prisma.$transaction(async (tx) => {
             const withdrawal = await tx.withdrawal.findUnique({ where: { id: withdrawalId } });
             if (!withdrawal || withdrawal.status !== 'PENDING') throw new Error("Invalid withdrawal");

             // Deduct Balance
             await tx.user.update({
                 where: { id: withdrawal.userId },
                 data: { walletBalance: { decrement: withdrawal.amount } }
             });

             await tx.withdrawal.update({
                 where: { id: withdrawalId },
                 data: { status: 'APPROVED', reviewedAt: new Date(), reviewedBy: 'ADMIN' }
             });

             await tx.walletTransaction.create({
                 data: {
                     userId: withdrawal.userId,
                     amount: -withdrawal.amount,
                     type: 'WITHDRAWAL',
                     description: 'Withdrawal Approved',
                     referenceId: withdrawal.id
                 }
             });

             await tx.notification.create({
                 data: {
                     userId: withdrawal.userId,
                     type: 'WITHDRAWAL_APPROVED',
                     title: 'Withdrawal Approved',
                     message: `Your withdrawal of ₹${withdrawal.amount} has been approved.`
                 }
             });
          });

          res.json({ message: "Approved" });
      } catch (error) {
          console.error(error);
          res.status(500).json({ error: "Failed to approve" });
      }
  }

  static async rejectWithdrawal(req: Request, res: Response) {
      const { id } = req.params;
      const withdrawalId = id as string;
      try {
          const withdrawal = await prisma.withdrawal.update({
              where: { id: withdrawalId },
              data: { status: 'REJECTED', reviewedAt: new Date(), reviewedBy: 'ADMIN' }
          });
          
          await prisma.notification.create({
             data: {
                 userId: withdrawal.userId,
                 type: 'WITHDRAWAL_REJECTED',
                 title: 'Withdrawal Rejected',
                 message: `Your withdrawal request for ₹${withdrawal.amount} was rejected.`
             }
          });
          res.json({ message: "Rejected" });
      } catch (error) {
          res.status(500).json({ error: "Failed to reject" });
      }
  }
}
