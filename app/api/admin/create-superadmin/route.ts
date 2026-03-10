import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { email, password, fullName, phone } = await req.json();
    if (!email || !password || !fullName) {
      return new Response(JSON.stringify({ error: 'Missing required fields.' }), { status: 400 });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    // Upsert user
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
    // Upsert superadmin
    await prisma.superAdmin.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id },
    });
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message || 'Server error.' }), { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
