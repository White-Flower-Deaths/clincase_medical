import { NextRequest } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { apiError, apiOk, handleApi } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  return handleApi(async () => {
    const { session, error } = await requireSession();
    if (error || !session) return error!;
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        specialty: true,
        role: true,
        createdAt: true,
      },
    });
    if (!user) return apiError("User not found", 404);
    return apiOk(user);
  });
}

const updateSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional().nullable(),
  specialty: z.string().optional().nullable(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6).optional().or(z.literal("")),
});

export async function PATCH(req: NextRequest) {
  return handleApi(async () => {
    const { session, error } = await requireSession();
    if (error || !session) return error!;
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return apiError("Invalid request body");
    }
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) return apiError("Invalid profile details");

    const data = parsed.data;
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) return apiError("User not found", 404);

    const email = data.email.toLowerCase().trim();
    if (email !== user.email) {
      const taken = await prisma.user.findUnique({ where: { email } });
      if (taken) return apiError("Email already in use", 409);
    }

    let passwordHash: string | undefined;
    if (data.newPassword && data.newPassword.length > 0) {
      if (!data.currentPassword) return apiError("Current password is required to set a new password");
      const valid = await bcrypt.compare(data.currentPassword, user.passwordHash);
      if (!valid) return apiError("Current password is incorrect");
      passwordHash = await bcrypt.hash(data.newPassword, 10);
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: data.name.trim(),
        email,
        phone: data.phone?.trim() || null,
        specialty: data.specialty?.trim() || null,
        ...(passwordHash ? { passwordHash } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        specialty: true,
        role: true,
      },
    });
    return apiOk(updated);
  });
}
