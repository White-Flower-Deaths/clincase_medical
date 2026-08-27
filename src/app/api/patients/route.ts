import { NextRequest } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { apiError, apiOk, handleApi } from "@/lib/api";

export const dynamic = "force-dynamic";

const patientSchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  age: z.coerce.number().int().min(0).max(130),
  sex: z.string().trim().min(1).max(40),
  phone: z.string().trim().max(40).optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal("")),
  address: z.string().trim().max(500).optional().nullable(),
  notes: z.string().trim().max(2000).optional().nullable(),
  mrn: z.string().trim().max(40).optional(),
});

export async function GET(req: NextRequest) {
  return handleApi(async () => {
    const { error } = await requireSession();
    if (error) return error;

    const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";

    const patients = await prisma.patient.findMany({
      where: q
        ? {
            OR: [
              { firstName: { contains: q } },
              { lastName: { contains: q } },
              { mrn: { contains: q } },
              { phone: { contains: q } },
            ],
          }
        : undefined,
      orderBy: { updatedAt: "desc" },
      include: {
        _count: { select: { cases: true } },
      },
    });

    return apiOk(patients);
  });
}

export async function POST(req: NextRequest) {
  return handleApi(async () => {
    const { error } = await requireSession();
    if (error) return error;

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return apiError("Invalid request body");
    }

    const parsed = patientSchema.safeParse(body);
    if (!parsed.success) return apiError("Invalid patient details");

    const data = parsed.data;
    const requestedMrn = data.mrn?.trim();
    let nextMrn = requestedMrn;

    if (!nextMrn) {
      const existingMrns = await prisma.patient.findMany({
        where: { mrn: { startsWith: "MRN-" } },
        select: { mrn: true },
      });
      const highestMrn = existingMrns.reduce((highest, patient) => {
        const number = Number(patient.mrn.slice(4));
        return Number.isInteger(number) ? Math.max(highest, number) : highest;
      }, 1000);
      nextMrn = `MRN-${highestMrn + 1}`;
    }

    for (let attempt = 0; attempt < 5; attempt += 1) {
      try {
        const patient = await prisma.patient.create({
          data: {
            mrn: nextMrn,
            firstName: data.firstName,
            lastName: data.lastName,
            age: data.age,
            sex: data.sex,
            phone: data.phone || null,
            email: data.email || null,
            address: data.address || null,
            notes: data.notes || null,
          },
        });
        return apiOk(patient, 201);
      } catch (err) {
        const isMrnConflict =
          err instanceof Prisma.PrismaClientKnownRequestError &&
          err.code === "P2002" &&
          Array.isArray(err.meta?.target) &&
          err.meta.target.includes("mrn");

        if (!isMrnConflict) throw err;
        if (requestedMrn) return apiError("A patient with this MRN already exists.", 409);

        const suffix: number = Number(nextMrn.slice(4));
        nextMrn = `MRN-${suffix + 1}`;
      }
    }

    return apiError("Could not generate a unique MRN. Please try again.", 409);
  });
}
