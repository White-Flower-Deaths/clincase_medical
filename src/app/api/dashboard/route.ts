import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { apiOk, handleApi } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  return handleApi(async () => {
    const { session, error } = await requireSession();
    if (error || !session) return error!;
    const doctorId = session.user.id;
    const [patientCount, caseCount, draftCount, completedCount, recentCases, recentPatients] =
      await Promise.all([
        prisma.patient.count({ where: { cases: { some: { doctorId } } } }),
        prisma.case.count({ where: { doctorId } }),
        prisma.case.count({ where: { doctorId, status: "draft" } }),
        prisma.case.count({ where: { doctorId, status: "completed" } }),
        prisma.case.findMany({
          where: { doctorId },
          take: 6,
          orderBy: { updatedAt: "desc" },
          include: { patient: true, doctor: { select: { name: true } } },
        }),
        prisma.patient.findMany({
          where: { cases: { some: { doctorId } } },
          take: 5,
          orderBy: { updatedAt: "desc" },
        }),
      ]);
    return apiOk({
      doctorName: session.user.name,
      stats: { patients: patientCount, cases: caseCount, drafts: draftCount, completed: completedCount },
      recentCases,
      recentPatients,
    });
  });
}
