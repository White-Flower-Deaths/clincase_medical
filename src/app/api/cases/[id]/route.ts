import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { apiError, apiOk, handleApi } from "@/lib/api";

export const dynamic = "force-dynamic";

type Params = { params: { id: string } };

const updateSchema = z.object({
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

export async function GET(_req: NextRequest, { params }: Params) {
  return handleApi(async () => {
    const { error } = await requireSession();
    if (error) return error;
    const clinicalCase = await prisma.case.findUnique({
      where: { id: params.id },
      include: { patient: true, doctor: { select: { id: true, name: true, email: true } } },
    });
    if (!clinicalCase) return apiError("Case not found", 404);
    return apiOk(clinicalCase);
  });
}

export async function PATCH(req: NextRequest, { params }: Params) {
  return handleApi(async () => {
    const { error } = await requireSession();
    if (error) return error;
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return apiError("Invalid request body");
    }
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) return apiError("Invalid case details");
    const existing = await prisma.case.findUnique({ where: { id: params.id }, select: { id: true } });
    if (!existing) return apiError("Case not found", 404);
    const updated = await prisma.case.update({
      where: { id: existing.id },
      data: parsed.data,
      include: { patient: true },
    });
    return apiOk(updated);
  });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  return handleApi(async () => {
    const { error } = await requireSession();
    if (error) return error;
    const existing = await prisma.case.findUnique({ where: { id: params.id }, select: { id: true } });
    if (!existing) return apiError("Case not found", 404);
    await prisma.case.delete({ where: { id: existing.id } });
    return apiOk({ ok: true });
  });
}
