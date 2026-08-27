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

const upsertSchema = z.object({
  patientId: z.string().min(1),
  severity: z.enum(CASUALTY_SEVERITIES),
  notes: z.string().trim().max(2000).optional().nullable(),
});

export async function GET() {
  return handleApi(async () => {
    const { session, error } = await requireSession();
    if (error || !session) return error!;

    const items = await prisma.casualty.findMany({
      where: { doctorId: session.user.id },
      orderBy: { updatedAt: "desc" },
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

    const parsed = upsertSchema.safeParse(body);
    if (!parsed.success) return apiError("Invalid casualty details");

    const patient = await prisma.patient.findUnique({
      where: { id: parsed.data.patientId },
      select: { id: true },
    });
    if (!patient) return apiError("Patient not found", 404);

    const item = await prisma.casualty.upsert({
      where: {
        doctorId_patientId: {
          doctorId: session.user.id,
          patientId: parsed.data.patientId,
        },
      },
      create: {
        doctorId: session.user.id,
        patientId: parsed.data.patientId,
        severity: parsed.data.severity,
        notes: parsed.data.notes || null,
      },
      update: {
        severity: parsed.data.severity,
        notes: parsed.data.notes || null,
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
