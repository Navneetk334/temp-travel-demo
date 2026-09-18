import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'super@temptravels.com';
  const password = 'Password@123';
  const passwordHash = await bcrypt.hash(password, 10);

  const admin = await prisma.admin.upsert({
    where: { email },
    update: {
      passwordHash,
      role: 'SUPER_ADMIN',
      isActive: true,
    },
    create: {
      name: 'Master Admin',
      email,
      passwordHash,
      role: 'SUPER_ADMIN',
      isActive: true,
      permissions: ['ALL'],
    },
  });

  console.log('Master admin seeded:', admin.email);
}

main().catch(console.error).finally(() => prisma.$disconnect());
