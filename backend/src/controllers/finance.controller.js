import prisma from '../utils/prisma.js';
export class FinancialController {
    // Allocate Profit for a Hotel for a specific month
    static async allocateProfit(req, res) {
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
                where: { hotelId, status: 'ACTIVE' },
                include: { user: true }
            });
            // 3. Logic to distribute profit
            const allocations = [];
            const hotel = await prisma.hotel.findUnique({ where: { id: hotelId } });
            if (!hotel)
                return res.status(404).json({ error: 'Hotel not found' });
            for (const inv of investments) {
                let profitShare = 0;
                if (hotel.shareModel === 'PERCENT' && inv.sharePercent) {
                    profitShare = (netProfit * inv.sharePercent) / 100;
                }
                else if (hotel.shareModel === 'UNITS' && inv.shareUnits && hotel.totalUnits) {
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
        }
        catch (error) {
            res.status(500).json({ error: 'Profit allocation failed' });
        }
    }
    // Request Withdrawal
    static async requestWithdrawal(req, res) {
        const { amount, bankAccountId, hotelId } = req.body;
        try {
            // Basic check: Does user have enough balance? (Draft logic)
            // For now, allow request, admin will review.
            const withdrawal = await prisma.withdrawal.create({
                data: {
                    userId: req.user.id,
                    hotelId,
                    amount,
                    status: 'PENDING'
                }
            });
            res.status(201).json(withdrawal);
        }
        catch (error) {
            res.status(500).json({ error: 'Withdrawal request failed' });
        }
    }
    // Admin: Get All Pending Withdrawals
    static async getPendingWithdrawals(req, res) {
        try {
            const withdrawals = await prisma.withdrawal.findMany({
                where: { status: 'PENDING' },
                include: { user: true, hotel: true }
            });
            res.json(withdrawals);
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to fetch withdrawals' });
        }
    }
}
//# sourceMappingURL=finance.controller.js.map