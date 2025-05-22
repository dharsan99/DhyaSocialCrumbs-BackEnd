// scripts/seed-client.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function seed() {
  const user = await prisma.user.findFirst();
  if (!user) {
    console.error("❌ No user found. Please create a user first.");
    process.exit(1);
  }

  const client = await prisma.client.create({
    data: {
      name: "Default Client",
      userId: user.id,
    },
  });

  console.log("✅ Client created:", client);
  process.exit(0);
}

seed();