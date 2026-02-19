import prisma from '../utils/prisma.js';
export class UserController {
    static async getAll(req, res) {
        try {
            const users = await prisma.user.findMany({
                include: {
                    _count: {
                        select: { investments: true }
                    }
                }
            });
            res.json(users);
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to fetch users' });
        }
    }
    static async getProfile(req, res) {
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
            if (!user)
                return res.status(404).json({ error: 'User not found' });
            res.json(user);
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to fetch profile' });
        }
    }
    static async updateKyc(req, res) {
        const { id } = req.params;
        const { status } = req.body;
        try {
            const user = await prisma.user.update({
                where: { id: id },
                data: { kycStatus: status }
            });
            res.json(user);
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to update KYC status' });
        }
    }
    static async addBankAccount(req, res) {
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
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to add bank account' });
        }
    }
}
//# sourceMappingURL=user.controller.js.map