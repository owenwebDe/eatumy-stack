import prisma from './src/utils/prisma.js';

async function main() {
    const admins = await prisma.user.findMany({
        where: {
            role: {
                in: ['SUPERADMIN', 'ADMIN']
            }
        },
        select: {
            name: true,
            mobile: true,
            role: true
        }
    });
    console.log('--- Administrator Mobile Formats ---');
    admins.forEach(a => console.log(`${a.role}: ${a.name} - "${a.mobile}"`));
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
