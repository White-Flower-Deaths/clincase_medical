import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import {
  apiError,
  apiOk,
  handleApi,
  REFERRAL_NETWORK_TYPES,
} from "@/lib/api";

export const dynamic = "force-dynamic";

const networkSchema = z.object({
  kind: z.enum(REFERRAL_NETWORK_TYPES),
  name: z.string().trim().min(1).max(200),
  details: z.string().trim().max(2000).optional().nullable(),
  contact: z.string().trim().max(200).optional().nullable(),
});

export async function GET() {
  return handleApi(async () => {
    const { session, error } = await requireSession();
    if (error || !session) return error!;

    const items = await prisma.referralNetwork.findMany({
      where: { doctorId: session.user.id },
      orderBy: [{ kind: "asc" }, { updatedAt: "desc" }],
    });
    return apiOk(items);
  });
}

export async function POST(req: NextRequest) {
  return handleApi(async () => {
    const { session, error } = await requireSession();
    if (error || !session) return error!;

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return apiError("Invalid request body");
    }

    const parsed = networkSchema.safeParse(body);
    if (!parsed.success) return apiError("Invalid referral details");

    const item = await prisma.referralNetwork.create({
      data: {
        doctorId: session.user.id,
        kind: parsed.data.kind,
        name: parsed.data.name,
        details: parsed.data.details || null,
        contact: parsed.data.contact || null,
      },
    });
    return apiOk(item, 201);
  });
}
