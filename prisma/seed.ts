// prisma/seed.ts

import { PrismaClient } from "@prisma/client";

const bcrypt = require("bcryptjs");

const prisma =  new PrismaClient()

async function main() {
  const adminEmail = "admin@orchid.com";
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash("orchid!123", 10);

    await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: "Admin",
        role: "ADMIN",
      },
    });

    console.log("✅ Admin user created.");
  } else {
    console.log("ℹ️ Admin user already exists.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
