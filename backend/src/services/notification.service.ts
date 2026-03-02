import prisma from '../utils/prisma.js';
import { EmailService } from './email.service.js';

export class NotificationService {
    /**
     * Broadcasts a notification to all users with ADMIN or SUPERADMIN roles.
     */
    static async notifyAdmins({ title, message, type = 'GENERAL' }: { title: string, message: string, type?: string }) {
        try {
            // 1. Fetch all admin users
            const admins = await prisma.user.findMany({
                where: {
                    role: {
                        in: ['ADMIN', 'SUPERADMIN']
                    }
                },
                select: { id: true, email: true }
            });

            if (admins.length === 0) {
                console.warn("[NOTIFICATION_SERVICE] No admins found to notify.");
                return;
            }

            // 2. Create notifications for each admin
            await prisma.notification.createMany({
                data: admins.map(admin => ({
                    userId: admin.id,
                    type: type as any,
                    title,
                    message,
                    isRead: false
                }))
            });

            // 3. Send Email alerts to all admins
            const adminEmails = admins.map(admin => admin.email).filter(Boolean) as string[];
            if (adminEmails.length > 0) {
                await EmailService.sendEmail({
                    to: adminEmails,
                    subject: `ADMIN ALERT: ${title}`,
                    body: message
                });
            }

            console.log(`[NOTIFICATION_SERVICE] Notified ${admins.length} admins (DB + Email): ${title}`);
        } catch (error) {
            console.error("[NOTIFICATION_SERVICE] Failed to notify admins:", error);
        }
    }
}
