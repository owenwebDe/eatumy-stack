import type { Request, Response } from 'express';
import prisma from '../utils/prisma.js';
import { Prisma } from '@prisma/client';

export class DailyMetricController {
  static async create(req: Request, res: Response) {
    const { hotelId, date, ordersCount, revenue, expenses } = req.body;
    try {
      const metric = await prisma.dailyMetric.upsert({
        where: {
          hotelId_date: {
            hotelId,
            date: new Date(date)
          }
        },
        update: {
          ordersCount,
          revenue,
          expenses
        },
        create: {
          hotelId,
          date: new Date(date),
          ordersCount,
          revenue,
          expenses
        }
      });
      res.status(201).json(metric);
    } catch (error) {
      res.status(500).json({ error: 'Failed to log daily metrics' });
    }
  }

  static async getByHotel(req: Request, res: Response) {
    const { hotelId } = req.params;
    const { limit = '30' } = req.query;
    try {
      const metrics = await prisma.dailyMetric.findMany({
        where: { hotelId: hotelId as string },
        take: parseInt(limit as string),
        orderBy: { date: 'desc' }
      });
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch metrics' });
    }
  }

  static async getSystemStats(req: Request, res: Response) {
    try {
      const [shareholders, kitchens, pendingWithdrawals, walletBalance] = await Promise.all([
        prisma.user.count({ where: { role: 'INVESTOR' } }),
        prisma.hotel.count({ where: { status: 'ACTIVE' } }),
        prisma.withdrawal.count({ where: { status: 'PENDING' } }),
        0 // Mocking wallet balance
      ]);

      res.json({
        shareholders,
        kitchens,
        pendingWithdrawals,
        walletBalance
      });
    } catch (error) {
      console.error("Stats Error:", error);
      res.status(500).json({ error: 'Failed to fetch system stats' });
    }
  }

  static async getDailyFleetSummary(req: Request, res: Response) {
    const { date } = req.query;
    const searchDate = date ? new Date(date as string) : new Date();
    // Normalize to start of day if needed, or assume simple date match if stored as date-only.
    // Prisma DateTime is timestamp. We should filter by range or store strictly.
    // For now, assuming direct match or fetching all for "today"

    const startOfDay = new Date(searchDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(searchDate);
    endOfDay.setHours(23, 59, 59, 999);

    try {
      const metrics = await prisma.dailyMetric.aggregate({
        _sum: {
          ordersCount: true,
          revenue: true
        },
        where: {
          date: {
            gte: startOfDay,
            lte: endOfDay
          }
        }
      });

      const activeKitchens = await prisma.hotel.count({ where: { status: 'ACTIVE' } });
      const reportingKitchens = await prisma.dailyMetric.count({
        where: {
          date: {
            gte: startOfDay,
            lte: endOfDay
          }
        }
      });

      res.json({
        totalOrders: metrics._sum.ordersCount || 0,
        revenue: metrics._sum.revenue || 0,
        reportingCount: reportingKitchens,
        totalKitchens: activeKitchens
      });
    } catch (error) {
      console.error("Fleet Summary Error:", error);
      res.status(500).json({ error: 'Failed to fetch fleet summary' });
    }
  }

  static async getAll(req: Request, res: Response) {
    const { date } = req.query;
    // Default to today if not specified
    const searchDate = date ? new Date(date as string) : new Date();
    const startOfDay = new Date(searchDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(searchDate);
    endOfDay.setHours(23, 59, 59, 999);

    try {
      const metrics = await prisma.dailyMetric.findMany({
        where: {
          date: {
            gte: startOfDay,
            lte: endOfDay
          }
        },
        include: {
          hotel: {
            select: { name: true }
          }
        }
      });
      res.json(metrics);
    } catch (error) {
      console.error("Get All Metrics Error:", error);
      res.status(500).json({ error: 'Failed to fetch metrics' });
    }
  }

  static async getPerformanceStats(req: Request, res: Response) {
    try {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
      sixMonthsAgo.setDate(1);
      sixMonthsAgo.setHours(0, 0, 0, 0);

      const metrics = await prisma.dailyMetric.findMany({
        where: {
          date: {
            gte: sixMonthsAgo
          }
        },
        select: {
          date: true,
          revenue: true,
          expenses: true
        },
        orderBy: {
          date: 'asc'
        }
      });

      // Group by month
      const monthlyData: Record<string, { month: string, revenue: number, expenses: number }> = {};

      // Initialize last 6 months
      for (let i = 0; i < 6; i++) {
        const d = new Date();
        d.setMonth(d.getMonth() - (5 - i));
        const monthName = d.toLocaleString('default', { month: 'short' });
        const year = d.getFullYear();
        const key = `${monthName} ${year}`;
        monthlyData[key] = { month: key, revenue: 0, expenses: 0 };
      }

      metrics.forEach((m: any) => {
        const d = new Date(m.date);
        const monthName = d.toLocaleString('default', { month: 'short' });
        const year = d.getFullYear();
        const key = `${monthName} ${year}`;

        if (monthlyData[key]) {
          monthlyData[key].revenue += m.revenue || 0;
          monthlyData[key].expenses += m.expenses || 0;
        }
      });

      res.json(Object.values(monthlyData));
    } catch (error) {
      console.error("Performance Stats Error:", error);
      res.status(500).json({ error: 'Failed to fetch performance stats' });
    }
  }
}
