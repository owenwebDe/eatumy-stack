import type { Request, Response } from 'express';
import prisma from '../utils/prisma.js';

export class BranchController {
  static async getMyKitchen(req: Request, res: Response) {
    // @ts-ignore
    const userId = req.user.id; // From Auth Middleware

    try {
      const hotel = await prisma.hotel.findFirst({
        where: { branchManagerId: userId },
        include: {
            // Include relevant details for the manager
            dailyMetrics: {
                take: 7,
                orderBy: { date: 'desc' }
            },
            withdrawals: {
                take: 5,
                orderBy: { requestedAt: 'desc' }
            }
        }
      });

      if (!hotel) {
        return res.status(404).json({ error: 'No kitchen assigned to this manager' });
      }

      res.json(hotel);
    } catch (error) {
      console.error("Get My Kitchen Error:", error);
      res.status(500).json({ error: 'Failed to fetch kitchen details' });
    }
  }

  static async updateStatus(req: Request, res: Response) {
    // @ts-ignore
    const userId = req.user.id; 
    const { status } = req.body; // 'ACTIVE', 'MAINTENANCE', etc. or boolean isOpen?

    // Valid statuses based on Enum
    const validStatuses = ['ACTIVE', 'MAINTENANCE', 'INACTIVE', 'FROZEN', 'LAUNCHING'];

    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }

    try {
        // Ensure user owns this kitchen
        const hotel = await prisma.hotel.findFirst({ where: { branchManagerId: userId } });
        if (!hotel) return res.status(403).json({ error: 'Not authorized for any kitchen' });

        const updatedHotel = await prisma.hotel.update({
            where: { id: hotel.id },
            data: { status: status }
        });

        res.json(updatedHotel);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update kitchen status' });
    }
  }
}
