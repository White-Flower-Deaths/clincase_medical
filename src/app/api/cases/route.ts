import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { apiError, apiOk, handleApi } from "@/lib/api";

export const dynamic = "force-dynamic";

const caseSchema = z.object({
  patientId: z.string().min(1),
  status: z.enum(["draft", "completed"]).optional(),
  chiefComplaint: z.string().optional().nullable(),
  hpi: z.string().optional().nullable(),
  pastHistory: z.string().optional().nullable(),
  surgicalHistory: z.string().optional().nullable(),
  familyHistory: z.string().optional().nullable(),
  socialHistory: z.string().optional().nullable(),
  medications: z.string().optional().nullable(),
  allergies: z.string().optional().nullable(),
  reviewOfSystems: z.string().optional().nullable(),
  vitals: z.string().optional().nullable(),
  examination: z.string().optional().nullable(),
  assessment: z.string().optional().nullable(),
  plan: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
  return handleApi(async () => {
    const { error } = await requireSession();
    if (error) return error;

    const patientId = req.nextUrl.searchParams.get("patientId");
    const status = req.nextUrl.searchParams.get("status");
    const cases = await prisma.case.findMany({
      where: {
        ...(patientId ? { patientId } : {}),
        ...(status ? { status } : {}),
      },
      orderBy: { updatedAt: "desc" },
      include: {
        patient: true,
        doctor: { select: { id: true, name: true } },
      },
    });
    return apiOk(cases);
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
    const parsed = caseSchema.safeParse(body);
    if (!parsed.success) return apiError("Invalid case details");

    const patient = await prisma.patient.findUnique({ where: { id: parsed.data.patientId } });
    if (!patient) return apiError("Patient not found", 404);

    const { patientId, ...rest } = parsed.data;
    const created = await prisma.case.create({
      data: {
        patientId,
        doctorId: session.user.id,
        status: rest.status ?? "draft",
        chiefComplaint: rest.chiefComplaint ?? null,
        hpi: rest.hpi ?? null,
        pastHistory: rest.pastHistory ?? null,
        surgicalHistory: rest.surgicalHistory ?? null,
        familyHistory: rest.familyHistory ?? null,
        socialHistory: rest.socialHistory ?? null,
        medications: rest.medications ?? null,
        allergies: rest.allergies ?? null,
        reviewOfSystems: rest.reviewOfSystems ?? null,
        vitals: rest.vitals ?? null,
        examination: rest.examination ?? null,
        assessment: rest.assessment ?? null,
        plan: rest.plan ?? null,
      },
      include: { patient: true },
    });
    return apiOk(created, 201);
  });
}
