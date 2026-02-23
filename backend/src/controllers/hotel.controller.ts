import type { Request, Response } from 'express';
import prisma from '../utils/prisma.js';
import { AuthService } from '../services/auth.service.js';

export class HotelController {
  static async getAll(req: Request, res: Response) {
    try {
      const hotels = await prisma.hotel.findMany({
        include: {
          branchManager: true,
          _count: {
            select: { investments: true }
          },
          // Aggregate invested amount
          investments: {
            select: {
              investedAmount: true
            }
          }
        }
      });
      console.log(`[DEBUG] HotelController.getAll found ${hotels.length} hotels.`);
      if (hotels.length > 0) {
        console.log(`[DEBUG] First hotel: ${hotels[0]!.name} (Status: ${hotels[0]!.status})`);
      } else {
        console.log(`[DEBUG] No hotels found in DB.`);
      }

      // Transform to include raised amount
      const enrichedHotels = hotels.map(hotel => {
        const raised = hotel.investments.reduce((sum, inv) => sum + inv.investedAmount, 0);
        const { investments, ...rest } = hotel; // Remove raw investments array
        return {
          ...rest,
          raised
        };
      });

      res.json(enrichedHotels);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch businesses' });
    }
  }

  static async getById(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const hotel = await prisma.hotel.findUnique({
        where: { id: id as string },
        include: {
          investments: {
            include: { user: true }
          },
          dailyMetrics: {
            take: 30,
            orderBy: { date: 'desc' }
          }
        }
      });
      if (!hotel) return res.status(404).json({ error: 'Business not found' });
      res.json(hotel);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch business details' });
    }
  }

  static async create(req: Request, res: Response) {
    const { name, city, shareModel, totalUnits, withdrawMode, windowStartDay, windowEndDay, valuation, minInvestment, roi } = req.body;

    try {
      const hotel = await prisma.hotel.create({
        data: {
          name,
          city,
          shareModel,
          totalUnits: totalUnits ? parseInt(totalUnits) : null,
          withdrawMode,
          windowStartDay: windowStartDay ? parseInt(windowStartDay) : null,
          windowEndDay: windowEndDay ? parseInt(windowEndDay) : null,
          valuation: valuation ? parseFloat(valuation) : 0,
          minInvestment: minInvestment ? parseFloat(minInvestment) : 0,
          roi
        }
      });
      res.status(201).json(hotel);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to create business' });
    }
  }

  static async update(req: Request, res: Response) {
    const { id } = req.params;
    const data = req.body;
    try {
      const hotel = await prisma.hotel.update({
        where: { id: id as string },
        data
      });
      res.json(hotel);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update business' });
    }
  }

  static async assignManager(req: Request, res: Response) {
    const { id } = req.params; // Hotel ID
    const { userId } = req.body;
    try {
      if (!userId) {
        // Handle unassigning
        const hotel = await prisma.hotel.update({
          where: { id: id as string },
          data: { branchManagerId: null }
        });
        return res.json({ message: 'Manager unassigned successfully', hotel });
      }

      // 1. Find the user
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // 2. Update hotel manager
      const hotel = await prisma.hotel.update({
        where: { id: id as string },
        data: { branchManagerId: userId }
      });

      // 3. Update user role to BRANCH_MANAGER
      await prisma.user.update({
        where: { id: userId },
        data: { role: 'BRANCH_MANAGER' }
      });

      res.json({ message: 'Manager assigned successfully', hotel });
    } catch (error: any) {
      console.error("Assign Manager Error:", error);
      if (error.code === 'P2002') {
        return res.status(400).json({ error: 'User is already a manager of another branch or this branch already has a manager.' });
      }
      res.status(500).json({ error: 'Failed to assign manager' });
    }
  }
  static async delete(req: Request, res: Response) {
    const { id } = req.params;
    try {
      // 1. Check for active investments
      const hotel = await prisma.hotel.findUnique({
        where: { id: id as string },
        include: {
          _count: {
            select: { investments: true }
          }
        }
      });

      if (!hotel) return res.status(404).json({ error: 'Business not found' });

      if (hotel._count.investments > 0) {
        return res.status(400).json({
          error: 'Cannot delete business with active investments. Please migrate or close investments first.'
        });
      }

      await prisma.hotel.delete({
        where: { id: id as string }
      });

      res.json({ message: 'Business deleted successfully' });
    } catch (error) {
      console.error("Delete Hotel Error:", error);
      res.status(500).json({ error: 'Failed to delete business' });
    }
  }
}
