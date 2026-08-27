import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { apiError, apiOk, handleApi } from "@/lib/api";

export const dynamic = "force-dynamic";

type Params = { params: { id: string } };

const patchSchema = z.object({
  description: z.string().trim().min(1).max(500).optional(),
  amountRupees: z.coerce.number().positive().max(10_000_000).optional(),
  paid: z.boolean().optional(),
  patientId: z.string().min(1).optional().nullable(),
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
    if (!parsed.success) return apiError("Invalid billing details");

    const existing = await prisma.bill.findFirst({
      where: { id: params.id, doctorId: session.user.id },
    });
    if (!existing) return apiError("Record not found", 404);

    if (parsed.data.patientId) {
      const patient = await prisma.patient.findUnique({
        where: { id: parsed.data.patientId },
        select: { id: true },
      });
      if (!patient) return apiError("Patient not found", 404);
    }

    const item = await prisma.bill.update({
      where: { id: existing.id },
      data: {
        ...(parsed.data.description !== undefined
          ? { description: parsed.data.description }
          : {}),
        ...(parsed.data.amountRupees !== undefined
          ? {
              amountRupees:
                Math.round(parsed.data.amountRupees * 100) / 100,
            }
          : {}),
        ...(parsed.data.paid !== undefined ? { paid: parsed.data.paid } : {}),
        ...(parsed.data.patientId !== undefined
          ? { patientId: parsed.data.patientId || null }
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

    const existing = await prisma.bill.findFirst({
      where: { id: params.id, doctorId: session.user.id },
    });
    if (!existing) return apiError("Record not found", 404);

    await prisma.bill.delete({ where: { id: existing.id } });
    return apiOk({ ok: true });
  });
}
