import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { apiError, apiOk, handleApi } from "@/lib/api";

export const dynamic = "force-dynamic";

type Params = { params: { id: string } };

const updateSchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  age: z.coerce.number().int().min(0).max(130),
  sex: z.string().trim().min(1).max(40),
  phone: z.string().trim().max(40).optional().nullable(),
  email: z
    .string()
    .email()
    .optional()
    .nullable()
    .or(z.literal("")),
  address: z.string().trim().max(500).optional().nullable(),
  notes: z.string().trim().max(2000).optional().nullable(),
});

export async function GET(_req: NextRequest, { params }: Params) {
  return handleApi(async () => {
    const { session, error } = await requireSession();
    if (error || !session) return error!;

    const patient = await prisma.patient.findUnique({
      where: { id: params.id },
      include: {
        cases: {
          where: { doctorId: session.user.id },
          orderBy: { updatedAt: "desc" },
          include: { doctor: { select: { id: true, name: true } } },
        },
      },
    });

    if (!patient) return apiError("Patient not found", 404);
    return apiOk(patient);
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
    if (!parsed.success) return apiError("Invalid patient details");

    const existing = await prisma.patient.findUnique({
      where: { id: params.id },
      select: { id: true },
    });
    if (!existing) return apiError("Patient not found", 404);

    const patient = await prisma.patient.update({
      where: { id: params.id },
      data: {
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        age: parsed.data.age,
        sex: parsed.data.sex,
        phone: parsed.data.phone || null,
        email: parsed.data.email || null,
        address: parsed.data.address || null,
        notes: parsed.data.notes || null,
      },
    });

    return apiOk(patient);
  });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  return handleApi(async () => {
    const { error } = await requireSession();
    if (error) return error;

    const existing = await prisma.patient.findUnique({
      where: { id: params.id },
      select: { id: true },
    });
    if (!existing) return apiError("Patient not found", 404);

    await prisma.patient.delete({ where: { id: params.id } });
    return apiOk({ ok: true });
  });
}
