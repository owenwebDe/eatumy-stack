import prisma from './src/utils/prisma.js';

async function main() {
    const users = await prisma.user.findMany({
        select: {
            name: true,
            mobile: true,
            role: true
        }
    });
    console.log('--- Current Users in DB ---');
    users.forEach(u => console.log(`${u.role}: ${u.name} - ${u.mobile}`));
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
