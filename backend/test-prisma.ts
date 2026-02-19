import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

async function main() {
  console.log('Testing PG Pool connection...');
  const connectionString = `${process.env.DATABASE_URL}`;
  console.log('URL:', connectionString);

  const pool = new Pool({ connectionString });

  try {
    const client = await pool.connect();
    console.log('PG Client connected successfully!');
    const res = await client.query('SELECT NOW()');
    console.log('PG Query Result:', res.rows[0]);
    client.release();
  } catch (err) {
    console.error('PG Pool Connection Failed:', err);
    process.exit(1);
  }

  console.log('Testing PrismaClient with Adapter...');
  try {
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });
    console.log('PrismaClient created.');

    const result = await prisma.$queryRaw`SELECT 1 as result`;
    console.log('Prisma Query Result:', result);
    
    await prisma.$disconnect();
    await pool.end();
    
  } catch (error: any) {
    console.error('Prisma Error Name:', error.name);
    console.error('Prisma Error Message:', error.message);
    if (error.cause) console.error('Prisma Error Cause:', error.cause);
  }
}

main();
