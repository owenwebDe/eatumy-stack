
import { PrismaClient, Role, Status, ShareModel, WithdrawMode } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

    // 1. Create Admin
    const admin = await prisma.user.upsert({
        where: { mobile: '9999999999' },
        update: {},
        create: {
            name: 'Admin User',
            mobile: '9999999999',
            email: 'admin@eatumy.com',
            role: Role.ADMIN,
            status: Status.ACTIVE,
            walletBalance: 1000000 // Rich Admin
        }
    });
    console.log('Admin created:', admin.mobile);

    // 2. Create Investor
    const investor = await prisma.user.upsert({
        where: { mobile: '8888888888' },
        update: {},
        create: {
            name: 'John Investor',
            mobile: '8888888888',
            email: 'john@example.com',
            role: Role.INVESTOR,
            status: Status.ACTIVE,
            walletBalance: 50000 // Starting balance
        }
    });
    console.log('Investor created:', investor.mobile);

    // 3. Create Hotels
    const hotelsData = [
        {
            name: 'Eatumy Cloud Kitchen - HSR Layout',
            city: 'Bengaluru',
            address: 'HSR Layout Sector 2', // Address is optional but good to have
            logoUrl: 'https://images.unsplash.com/photo-1556910103-1c02745a30bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
            status: Status.ACTIVE,
            shareModel: ShareModel.UNITS,
            totalUnits: 1000,
            withdrawMode: WithdrawMode.MONTHLY_WINDOW,
            valuation: 5000000,
            minInvestment: 5000,
            roi: '18-24%'
        },
        {
            name: 'Eatumy Cloud Kitchen - Koramangala',
            city: 'Bengaluru',
            address: 'Koramangala 5th Block',
            logoUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
            status: Status.ACTIVE,
            shareModel: ShareModel.PERCENT,
            totalUnits: 100,
            withdrawMode: WithdrawMode.ANYTIME,
            valuation: 8000000,
            minInvestment: 10000,
            roi: '20-25%'
        },
        {
            name: 'Eatumy Cloud Kitchen - Indiranagar',
            city: 'Bengaluru',
            address: 'Indiranagar 100ft Road',
            logoUrl: 'https://images.unsplash.com/photo-1550966871-3ed3c6227685?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
            status: Status.LAUNCHING,
            shareModel: ShareModel.UNITS,
            totalUnits: 2000,
            withdrawMode: WithdrawMode.MONTHLY_WINDOW,
            valuation: 4500000,
            minInvestment: 2500,
            roi: '15-20%' // Conservative estimate for new
        }
    ];

    for (const data of hotelsData) {
        // We use name as a pseudo-unique key for upsert logic in seed, 
        // though strictly we should use unique fields. We'll just create if not exists using findFirst.
        const existing = await prisma.hotel.findFirst({ where: { name: data.name } });
        if (!existing) {
            await prisma.hotel.create({ data });
            console.log(`Created hotel: ${data.name}`);
        } else {
            console.log(`Hotel already exists: ${data.name}`);
        }
    }

    // 4. Create some initial metrics for the active hotels
    const activeHotels = await prisma.hotel.findMany({ where: { status: Status.ACTIVE } });
    for (const hotel of activeHotels) {
        // Check if metric exists for today
        const today = new Date();
        today.setHours(0,0,0,0);
        
        const metric = await prisma.dailyMetric.findUnique({
            where: {
                hotelId_date: {
                    hotelId: hotel.id,
                    date: today
                }
            }
        });

        if (!metric) {
            await prisma.dailyMetric.create({
                data: {
                    hotelId: hotel.id,
                    date: today,
                    ordersCount: Math.floor(Math.random() * 50) + 10,
                    revenue: Math.floor(Math.random() * 10000) + 2000,
                    expenses: Math.floor(Math.random() * 5000) + 1000
                }
            });
            console.log(`Created daily metrics for ${hotel.name}`);
        }
    }

    console.log('Seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
