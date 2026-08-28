import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { apiOk, handleApi } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  return handleApi(async () => {
    const { session, error } = await requireSession();
    if (error || !session) return error!;
    const [patientCount, caseCount, draftCount, completedCount, recentCases, recentPatients] =
      await Promise.all([
        prisma.patient.count(),
        prisma.case.count(),
        prisma.case.count({ where: { status: "draft" } }),
        prisma.case.count({ where: { status: "completed" } }),
        prisma.case.findMany({
          take: 6,
          orderBy: { updatedAt: "desc" },
          include: { patient: true, doctor: { select: { name: true } } },
        }),
        prisma.patient.findMany({ take: 5, orderBy: { updatedAt: "desc" } }),
      ]);
    return apiOk({
      doctorName: session.user.name,
      stats: { patients: patientCount, cases: caseCount, drafts: draftCount, completed: completedCount },
      recentCases,
      recentPatients,
    });
  });
}
