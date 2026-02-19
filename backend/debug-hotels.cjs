
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    const hotels = await prisma.hotel.findMany();
    console.log('--- DB HOTELS ---');
    console.log(JSON.stringify(hotels, null, 2));
    console.log('-----------------');
  } catch (error) {
    console.error('Error fetching hotels:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
