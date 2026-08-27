import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import {
  apiError,
  apiOk,
  CASUALTY_SEVERITIES,
  handleApi,
} from "@/lib/api";

export const dynamic = "force-dynamic";

type Params = { params: { id: string } };

const patchSchema = z.object({
  severity: z.enum(CASUALTY_SEVERITIES).optional(),
  notes: z.string().trim().max(2000).optional().nullable(),
});

export async function PATCH(req: NextRequest, { params }: Params) {
  return handleApi(async () => {
    const { session, error } = await requireSession();
    if (error || !session) return error!;

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return apiError("Invalid request body");
    }

    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) return apiError("Invalid casualty details");

    const existing = await prisma.casualty.findFirst({
      where: { id: params.id, doctorId: session.user.id },
    });
    if (!existing) return apiError("Record not found", 404);

    const item = await prisma.casualty.update({
      where: { id: existing.id },
      data: {
        ...(parsed.data.severity ? { severity: parsed.data.severity } : {}),
        ...(parsed.data.notes !== undefined
          ? { notes: parsed.data.notes || null }
          : {}),
      },
      include: {
        patient: {
          select: { id: true, firstName: true, lastName: true, mrn: true },
        },
      },
    });
    return apiOk(item);
  });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  return handleApi(async () => {
    const { session, error } = await requireSession();
    if (error || !session) return error!;

    const existing = await prisma.casualty.findFirst({
      where: { id: params.id, doctorId: session.user.id },
    });
    if (!existing) return apiError("Record not found", 404);

    await prisma.casualty.delete({ where: { id: existing.id } });
    return apiOk({ ok: true });
  });
}
