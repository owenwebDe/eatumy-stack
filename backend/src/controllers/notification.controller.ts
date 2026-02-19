import type { Request, Response } from 'express';
import prisma from '../utils/prisma.js';

export class NotificationController {
  static async getMyNotifications(req: Request, res: Response) {
    try {
      // @ts-ignore
      const userId = req.user.id as string;
      const notifications = await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 50
      });
      res.json(notifications);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch notifications' });
    }
  }

  static async markAsRead(req: Request, res: Response) {
      try {
          const { id } = req.params;
          const notificationId = id as string;
          // @ts-ignore
          const userId = req.user.id as string;
          
          await prisma.notification.updateMany({
              where: { id: notificationId, userId }, // Ensure ownership
              data: { isRead: true }
          });
          res.json({ success: true });
      } catch (error) {
          res.status(500).json({ error: "Failed to update notification" });
      }
  }

  static async markAllAsRead(req: Request, res: Response) {
      try {
          // @ts-ignore
          const userId = req.user.id as string;
          
          await prisma.notification.updateMany({
              where: { userId, isRead: false },
              data: { isRead: true }
          });
          res.json({ success: true });
      } catch (error) {
          res.status(500).json({ error: "Failed to update notifications" });
      }
  }
}
