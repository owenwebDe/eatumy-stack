
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

console.log("DATABASE_URL:", process.env.DATABASE_URL ? "Set" : "Not Set");

async function main() {
  try {
    const users = await prisma.user.findMany();
    console.log("Existing Users:", users);
    
    if (users.length === 0) {
        console.log("No users found. Attempting to create a test user...");
        const newUser = await prisma.user.create({
            data: {
                name: "Test Shareholder",
                mobile: "9999999999", // Common test number
                role: "INVESTOR",
                status: "ACTIVE"
            }
        });
        console.log("Created Test User:", newUser);
    }
  } catch (error) {
    console.error("DB Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
