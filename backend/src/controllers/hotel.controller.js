import prisma from '../utils/prisma.js';
export class HotelController {
    static async getAll(req, res) {
        try {
            const hotels = await prisma.hotel.findMany({
                include: {
                    _count: {
                        select: { investments: true }
                    }
                }
            });
            res.json(hotels);
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to fetch businesses' });
        }
    }
    static async getById(req, res) {
        const { id } = req.params;
        try {
            const hotel = await prisma.hotel.findUnique({
                where: { id: id },
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
            if (!hotel)
                return res.status(404).json({ error: 'Business not found' });
            res.json(hotel);
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to fetch business details' });
        }
    }
    static async create(req, res) {
        const { name, city, shareModel, totalUnits, withdrawMode, windowStartDay, windowEndDay } = req.body;
        try {
            const hotel = await prisma.hotel.create({
                data: {
                    name,
                    city,
                    shareModel,
                    totalUnits,
                    withdrawMode,
                    windowStartDay,
                    windowEndDay
                }
            });
            res.status(201).json(hotel);
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to create business' });
        }
    }
    static async update(req, res) {
        const { id } = req.params;
        const data = req.body;
        try {
            const hotel = await prisma.hotel.update({
                where: { id: id },
                data
            });
            res.json(hotel);
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to update business' });
        }
    }
}
//# sourceMappingURL=hotel.controller.js.map