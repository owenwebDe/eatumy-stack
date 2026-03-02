import type { Request, Response } from 'express';
import prisma from '../utils/prisma.js';
import { NotificationService } from '../services/notification.service.js';

export class BankController {
    // Investor: Get own bank accounts
    static async getMine(req: any, res: Response) {
        try {
            const accounts = await prisma.bankAccount.findMany({
                where: { userId: req.user.id },
                orderBy: { created_at: 'desc' }
            });
            res.json(accounts);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch bank accounts' });
        }
    }

    // Investor: Add new bank account
    static async add(req: any, res: Response) {
        const { accountName, accountNumber, ifsc, bankName, upiId } = req.body;
        try {
            const bank = await prisma.bankAccount.create({
                data: {
                    userId: req.user.id,
                    accountName,
                    accountNumber, // In prod, encrypt this
                    ifsc,
                    bankName,
                    upiId,
                    status: 'PENDING'
                }
            });

            // Notify Admins
            await NotificationService.notifyAdmins({
                title: 'New Bank Verification Request',
                message: `User ${req.user.name} added a new bank account (${bankName}) and is awaiting verification.`,
                type: 'BANK_VERIFICATION'
            });

            res.status(201).json(bank);
        } catch (error) {
            res.status(500).json({ error: 'Failed to add bank account' });
        }
    }

    // Investor: Delete bank account
    static async delete(req: any, res: Response) {
        const { id } = req.params;
        try {
            await prisma.bankAccount.delete({
                where: {
                    id,
                    userId: req.user.id // Security check
                }
            });
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: 'Failed to delete bank account' });
        }
    }

    // Admin: Get all pending bank accounts
    static async getPending(req: Request, res: Response) {
        try {
            const pending = await prisma.bankAccount.findMany({
                where: { status: 'PENDING' },
                include: {
                    user: {
                        select: { name: true, email: true, mobile: true }
                    }
                },
                orderBy: { created_at: 'asc' }
            });
            res.json(pending);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch pending accounts' });
        }
    }

    // Admin: Verify bank account (Approve/Reject)
    static async verify(req: any, res: Response) {
        const { id } = req.params;
        const { status, rejectionReason } = req.body;

        if (!['APPROVED', 'REJECTED'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        try {
            const bank = await prisma.bankAccount.update({
                where: { id },
                data: {
                    status,
                    rejectionReason: status === 'REJECTED' ? rejectionReason : null,
                    verifiedAt: new Date()
                },
                include: { user: true }
            });

            // Notify User
            await prisma.notification.create({
                data: {
                    userId: bank.userId,
                    type: status === 'APPROVED' ? 'GENERAL' : 'GENERAL',
                    title: status === 'APPROVED' ? 'Bank Account Approved' : 'Bank Account Rejected',
                    message: status === 'APPROVED'
                        ? `Your bank account (${bank.bankName} - ${bank.accountNumber.slice(-4)}) has been verified and is ready for withdrawals.`
                        : `Your bank account was rejected. Reason: ${rejectionReason || 'No reason provided.'}`
                }
            });

            res.json(bank);
        } catch (error) {
            res.status(500).json({ error: 'Failed to verify bank account' });
        }
    }
}
