const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function checkUsers() {
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { phone: { contains: "9560332555" } },
        { email: { contains: "temptravel" } }
      ]
    }
  });
  console.log("Users found:", JSON.stringify(users, null, 2));
}

checkUsers().finally(() => prisma.$disconnect());

