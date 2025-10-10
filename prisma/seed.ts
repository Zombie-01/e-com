// prisma/seed.ts

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const admins = [
    {
      email: "admin@orchid.com",
      password: "orchid!123",
      name: "Admin",
      phone: "99999999",
      role: "ADMIN",
    },
    {
      email: "superadmin@orchid.com",
      password: "superorchid!123",
      name: "Super Admin",
      phone: "99999998",
      role: "ADMIN",
    },
  ];

  for (const admin of admins) {
    const existingAdmin = await prisma.user.findUnique({
      where: { email: admin.email },
    });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(admin.password, 10);

      await prisma.user.create({
        data: {
          email: admin.email,
          password: hashedPassword,
          name: admin.name,
          role: admin.role,
        },
      });

      console.log(`✅ Admin user created: ${admin.email}`);
    } else {
      console.log(`ℹ️ Admin user already exists: ${admin.email}`);
    }
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
