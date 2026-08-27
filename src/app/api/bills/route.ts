import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { apiError, apiOk, handleApi } from "@/lib/api";

export const dynamic = "force-dynamic";

const billSchema = z.object({
  description: z.string().trim().min(1).max(500),
  amountRupees: z.coerce.number().positive().max(10_000_000),
  paid: z.boolean().optional(),
  patientId: z.string().min(1).optional().nullable(),
});

export async function GET() {
  return handleApi(async () => {
    const { session, error } = await requireSession();
    if (error || !session) return error!;

    const items = await prisma.bill.findMany({
      where: { doctorId: session.user.id },
      orderBy: { billedAt: "desc" },
      include: {
        patient: {
          select: { id: true, firstName: true, lastName: true, mrn: true },
        },
      },
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

    const parsed = billSchema.safeParse(body);
    if (!parsed.success) return apiError("Invalid billing details");

    if (parsed.data.patientId) {
      const patient = await prisma.patient.findUnique({
        where: { id: parsed.data.patientId },
        select: { id: true },
      });
      if (!patient) return apiError("Patient not found", 404);
    }

    const item = await prisma.bill.create({
      data: {
        doctorId: session.user.id,
        description: parsed.data.description,
        amountRupees: Math.round(parsed.data.amountRupees * 100) / 100,
        paid: parsed.data.paid ?? false,
        patientId: parsed.data.patientId || null,
      },
      include: {
        patient: {
          select: { id: true, firstName: true, lastName: true, mrn: true },
        },
      },
    });
    return apiOk(item, 201);
  });
}
