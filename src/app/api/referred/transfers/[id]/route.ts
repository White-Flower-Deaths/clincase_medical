import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { apiError, apiOk, handleApi } from "@/lib/api";

export const dynamic = "force-dynamic";

type Params = { params: { id: string } };

export async function DELETE(_req: NextRequest, { params }: Params) {
  return handleApi(async () => {
    const { session, error } = await requireSession();
    if (error || !session) return error!;

    const existing = await prisma.patientTransfer.findFirst({
      where: { id: params.id, doctorId: session.user.id },
    });
    if (!existing) return apiError("Record not found", 404);

    await prisma.patientTransfer.delete({ where: { id: existing.id } });
    return apiOk({ ok: true });
  });
}
