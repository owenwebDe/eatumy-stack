import prisma from './src/utils/prisma.js';

async function main() {
  const adminMobile = '9999999999'; // Default admin mobile
  
  const existingAdmin = await prisma.user.findUnique({
    where: { mobile: adminMobile }
  });

  if (!existingAdmin) {
    const admin = await prisma.user.create({
      data: {
        name: 'Super Admin',
        mobile: adminMobile,
        role: 'SUPERADMIN',
        status: 'ACTIVE',
        kycStatus: 'VERIFIED'
      }
    });
    console.log('Super Admin created:', admin);
  } else {
    console.log('Super Admin already exists:', existingAdmin);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
