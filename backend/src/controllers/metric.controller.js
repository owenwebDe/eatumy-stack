import prisma from '../utils/prisma.js';
export class DailyMetricController {
    static async create(req, res) {
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
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to log daily metrics' });
        }
    }
    static async getByHotel(req, res) {
        const { hotelId } = req.params;
        const { limit = '30' } = req.query;
        try {
            const metrics = await prisma.dailyMetric.findMany({
                where: { hotelId: hotelId },
                take: parseInt(limit),
                orderBy: { date: 'desc' }
            });
            res.json(metrics);
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to fetch metrics' });
        }
    }
}
//# sourceMappingURL=metric.controller.js.map