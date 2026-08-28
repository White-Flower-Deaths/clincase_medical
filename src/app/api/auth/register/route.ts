import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { apiError, apiOk, handleApi } from "@/lib/api";

const registrationSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(320),
  password: z.string().min(8).max(128),
});

export async function POST(req: NextRequest) {
  return handleApi(async () => {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return apiError("Invalid request body");
    }

    const parsed = registrationSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("Enter a name, valid email, and password of at least 8 characters.");
    }

    const email = parsed.data.email.toLowerCase();
    const passwordHash = await bcrypt.hash(parsed.data.password, 12);

    try {
      const user = await prisma.user.create({
        data: {
          name: parsed.data.name,
          email,
          passwordHash,
          role: "doctor",
        },
        select: { id: true, name: true, email: true },
      });
      return apiOk(user, 201);
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002"
      ) {
        return apiError("An account with this email already exists.", 409);
      }
      throw err;
    }
  });
}
