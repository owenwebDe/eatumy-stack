
import prisma from './src/utils/prisma.js';
import { Role, Status, ShareModel, WithdrawMode } from '@prisma/client';

async function main() {
    console.log('Starting reseed...');

    // 1. Admin
    try {
        await prisma.user.upsert({
            where: { mobile: '9999999999' },
            update: {},
            create: {
                name: 'Admin User',
                mobile: '9999999999',
                email: 'admin@eatumy.com',
                role: 'ADMIN',
                status: 'ACTIVE',
                walletBalance: 1000000 
            }
        });
        console.log('Admin seeded.');
    } catch (e) {
        console.error('Error seeding admin:', e);
    }

    // 2. Investor
    try {
        const investor = await prisma.user.upsert({
            where: { mobile: '8888888888' },
            update: {},
            create: {
                name: 'John Investor',
                mobile: '8888888888',
                email: 'john@example.com',
                role: 'INVESTOR',
                status: 'ACTIVE',
                walletBalance: 50000 
            }
        });
        console.log(`Investor seeded: ${investor.mobile}`);
    } catch (e) {
        console.error('Error seeding investor:', e);
    }

    // 3. Hotels
    const hotelsData = [
        {
            name: 'Eatumy Cloud Kitchen - HSR Layout',
            city: 'Bengaluru',
            address: 'HSR Layout Sector 2', 
            logoUrl: 'https://images.unsplash.com/photo-1556910103-1c02745a30bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
            status: 'ACTIVE',
            shareModel: 'UNITS',
            totalUnits: 1000,
            withdrawMode: 'MONTHLY_WINDOW',
            valuation: 5000000,
            minInvestment: 5000,
            roi: '18-24%'
        },
        {
            name: 'Eatumy Cloud Kitchen - Koramangala',
            city: 'Bengaluru',
            address: 'Koramangala 5th Block',
            logoUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
            status: 'ACTIVE',
            shareModel: 'PERCENT',
            totalUnits: 100,
            withdrawMode: 'ANYTIME',
            valuation: 8000000,
            minInvestment: 10000,
            roi: '20-25%'
        },
        {
            name: 'Eatumy Cloud Kitchen - Indiranagar',
            city: 'Bengaluru',
            address: 'Indiranagar 100ft Road',
            logoUrl: 'https://images.unsplash.com/photo-1550966871-3ed3c6227685?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
            status: 'LAUNCHING',
            shareModel: 'UNITS',
            totalUnits: 2000,
            withdrawMode: 'MONTHLY_WINDOW',
            valuation: 4500000,
            minInvestment: 2500,
            roi: '15-20%' 
        }
    ];

    for (const data of hotelsData) {
        try {
            // @ts-ignore
            const existing = await prisma.hotel.findFirst({ where: { name: data.name } });
            if (!existing) {
                // @ts-ignore
                await prisma.hotel.create({ data });
                console.log(`Created hotel: ${data.name}`);
            } else {
                console.log(`Hotel already exists: ${data.name}`);
            }
        } catch (e) {
            console.error(`Error seeding hotel ${data.name}:`, e);
        }
    }

    console.log('Seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => {
        // @ts-ignore
        prisma.$disconnect();
    });
