import { PrismaClient } from "@prisma/client";
import { randomBytes } from "crypto";
import { sendResetEmail } from "@/lib/reset-email";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) {
      return new Response(JSON.stringify({ error: "Email is required." }), {
        status: 400,
      });
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      const token = randomBytes(32).toString("hex");
      const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour
      await prisma.passwordResetToken.upsert({
        where: { userId: user.id },
        update: { token, expiresAt: expires },
        create: { userId: user.id, token, expiresAt: expires },
      });
      await sendResetEmail(email, token);
    }
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (e: any) {
    return new Response(
      JSON.stringify({ error: e.message || "Server error." }),
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}
