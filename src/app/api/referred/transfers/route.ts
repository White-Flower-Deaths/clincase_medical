import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { apiError, apiOk, handleApi } from "@/lib/api";

export const dynamic = "force-dynamic";

const transferSchema = z.object({
  patientId: z.string().min(1),
  shiftedTo: z.string().trim().min(1).max(300),
  ward: z.string().trim().max(200).optional().nullable(),
  underDoctor: z.string().trim().max(200).optional().nullable(),
  notes: z.string().trim().max(2000).optional().nullable(),
});

export async function GET() {
  return handleApi(async () => {
    const { session, error } = await requireSession();
    if (error || !session) return error!;

    const items = await prisma.patientTransfer.findMany({
      where: { doctorId: session.user.id },
      orderBy: { createdAt: "desc" },
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

    const parsed = transferSchema.safeParse(body);
    if (!parsed.success) return apiError("Invalid transfer details");

    const patient = await prisma.patient.findUnique({
      where: { id: parsed.data.patientId },
      select: { id: true },
    });
    if (!patient) return apiError("Patient not found", 404);

    const item = await prisma.patientTransfer.create({
      data: {
        doctorId: session.user.id,
        patientId: parsed.data.patientId,
        shiftedTo: parsed.data.shiftedTo,
        ward: parsed.data.ward || null,
        underDoctor: parsed.data.underDoctor || null,
        notes: parsed.data.notes || null,
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
