import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  const password = process.argv[3];
  const name = process.argv[4] || "Admin User";
  const role = process.argv[5] || "SUPER_ADMIN";

  if (!email || !password) {
    console.log("Usage: npx ts-node scripts/create-admin.ts <email> <password> [name] [role]");
    console.log("Roles: SUPER_ADMIN, MANAGER, DISPATCHER");
    process.exit(1);
  }

  try {
    const existing = await prisma.admin.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (existing) {
      console.log(`User ${email} already exists! Skipping creation.`);
      process.exit(0);
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const admin = await prisma.admin.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        passwordHash,
        role: role as any,
        isActive: true,
      }
    });

    console.log(`Successfully created admin user:`);
    console.log(`- Email: ${admin.email}`);
    console.log(`- Role: ${admin.role}`);
    console.log(`- Name: ${admin.name}`);
  } catch (err) {
    console.error("Failed to create admin:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
