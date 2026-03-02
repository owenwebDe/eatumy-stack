import prisma from './src/utils/prisma.js';

async function main() {
    await prisma.user.upsert({
        where: { email: 'Equitrust99@gmail.com' },
        update: { role: 'ADMIN' },
        create: {
            email: 'Equitrust99@gmail.com',
            mobile: '+910000000099',
            name: 'Equitrust Admin',
            role: 'ADMIN',
            status: 'ACTIVE'
        }
    });
    console.log('Admin user Equitrust99@gmail.com created successfully.');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
