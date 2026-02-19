import prisma from '../utils/prisma.js';
export class InvestmentController {
    static async getAll(req, res) {
        try {
            const investments = await prisma.investment.findMany({
                include: {
                    user: true,
                    hotel: true
                }
            });
            res.json(investments);
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to fetch investments' });
        }
    }
    static async create(req, res) {
        const { userId, hotelId, investedAmount, shareUnits, sharePercent } = req.body;
        try {
            const investment = await prisma.investment.create({
                data: {
                    userId,
                    hotelId,
                    investedAmount,
                    shareUnits,
                    sharePercent
                }
            });
            res.status(201).json(investment);
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to create investment mapping' });
        }
    }
    static async getByUserId(req, res) {
        const { userId } = req.params;
        try {
            const investments = await prisma.investment.findMany({
                where: { userId: userId },
                include: { hotel: true }
            });
            res.json(investments);
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to fetch user investments' });
        }
    }
}
//# sourceMappingURL=investment.controller.js.map