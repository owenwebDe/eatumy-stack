import type { Request, Response } from 'express';
import prisma from '../utils/prisma.js';

export class InvestmentController {
  static async getAll(req: Request, res: Response) {
    try {
      const investments = await prisma.investment.findMany({
        include: {
          user: true,
          hotel: true
        }
      });
      res.json(investments);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch investments' });
    }
  }

  static async getMyInvestments(req: any, res: Response) {
      try {
          const userId = req.user.id;
          const investments = await prisma.investment.findMany({
              where: { userId },
              include: { hotel: true }
          });
          res.json(investments);
      } catch (error) {
          res.status(500).json({ error: "Failed to fetch your investments" });
      }
  }

  static async create(req: any, res: Response) {
    const { hotelId, investedAmount, shareUnits } = req.body;
    const userId = req.user.id; 

    if (!hotelId || !investedAmount) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // 1. Check if user has enough balance (Optional: we can check this at approval time too, but good UX to check now)
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user || user.walletBalance < investedAmount) {
            return res.status(400).json({ error: 'Insufficient Wallet Balance' });
        }

        // 2. Create PENDING Investment Request
        const investment = await prisma.investment.create({
            data: {
                userId,
                hotelId,
                investedAmount,
                shareUnits: shareUnits ? parseInt(shareUnits) : null,
                status: 'PENDING'
            }
        });
        
        console.log(`[INVESTMENT] New Request: User ${userId} requested ${investedAmount} in Hotel ${hotelId}`);
        res.status(201).json(investment);

    } catch (error: any) {
      console.error("Buy Share Request Error:", error);
      res.status(500).json({ error: 'Failed to request shares' });
    }
  }

  static async approveRequest(req: Request, res: Response) {
      const { id } = req.params;
      const investmentId = id as string;
      const { status } = req.body; // APPROVED or REJECTED

      if (!['APPROVED', 'REJECTED'].includes(status)) {
          return res.status(400).json({ error: 'Invalid status' });
      }

      try {
          const result = await prisma.$transaction(async (tx) => {
              const investment = await tx.investment.findUnique({ where: { id: investmentId } });
              if (!investment || investment.status !== 'PENDING') {
                  throw new Error("Investment request not found or already processed");
              }

              if (status === 'REJECTED') {
                  return await tx.investment.update({
                      where: { id: investmentId },
                      data: { 
                          status: 'REJECTED',
                          rejectedAt: new Date()
                      }
                  });
              }

              // APPROVE Logic
              // 1. Check Balance Again
              const user = await tx.user.findUnique({ where: { id: investment.userId } });
              if (user!.walletBalance < investment.investedAmount) {
                  throw new Error("Insufficient Wallet Balance for Approval");
              }

              // 2. Deduct Balance
              await tx.user.update({
                  where: { id: investment.userId },
                  data: { walletBalance: { decrement: investment.investedAmount } }
              });

              // 3. Log Transaction
              await tx.walletTransaction.create({
                  data: {
                      userId: investment.userId,
                      amount: -investment.investedAmount,
                      type: 'SHARE_PURCHASE',
                      description: `Share Purchase Approved: Hotel ${investment.hotelId}`,
                      referenceId: investment.id
                  }
              });

              // 4. Update Investment Status
              return await tx.investment.update({
                  where: { id: investmentId },
                  data: { 
                      status: 'APPROVED',
                      approvedAt: new Date(),
                      startDate: new Date()
                  }
              });
          });

          res.json(result);
      } catch (error: any) {
          console.error("Approval Error:", error);
          res.status(400).json({ error: error.message || 'Failed to process request' });
      }
  }

  static async getByUserId(req: Request, res: Response) {
    const { userId } = req.params;
    try {
      const investments = await prisma.investment.findMany({
        where: { userId: userId as string },
        include: { hotel: true }
      });
      res.json(investments);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch user investments' });
    }
  }
}
