import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Superadmin credentials (change as needed)
  const email = 'superadmin@example.com';
  const password = 'SuperSecurePassword123!';
  const fullName = 'Super Admin';
  const phone = '1234567890';

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create the user with SUPER_ADMIN role
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      password: hashedPassword,
      fullName,
      phone,
      role: UserRole.SUPER_ADMIN,
    },
  });

  // Create the SuperAdmin record if not exists
  await prisma.superAdmin.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
    },
  });

  console.log('Superadmin created:', email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
