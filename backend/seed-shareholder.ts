import prisma from './src/utils/prisma.js';

async function main() {
  const userMobile = '8888888888'; 
  
  const existingUser = await prisma.user.findUnique({
    where: { mobile: userMobile }
  });

  if (!existingUser) {
    const user = await prisma.user.create({
      data: {
        name: 'Test Shareholder',
        mobile: userMobile,
        role: 'INVESTOR',
        status: 'ACTIVE',
        kycStatus: 'VERIFIED'
      }
    });
    console.log('Shareholder created:', user);
  } else {
    console.log('Shareholder already exists:', existingUser);
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
