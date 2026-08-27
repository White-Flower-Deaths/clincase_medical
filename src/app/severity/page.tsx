import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { AppNav } from "@/components/AppNav";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SeverityManager } from "@/components/SeverityManager";

export const dynamic = "force-dynamic";

export default async function SeverityPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const [patients, records] = await Promise.all([
    prisma.patient.findMany({
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      select: { id: true, firstName: true, lastName: true, mrn: true },
    }),
    prisma.casualty.findMany({
      where: { doctorId: session.user.id },
      orderBy: { updatedAt: "desc" },
      include: { patient: { select: { firstName: true, lastName: true, mrn: true } } },
    }),
  ]);

  return (
    <>
      <AppNav />
      <main className="page fade-in">
        <header className="page-header">
          <div>
            <p className="eyebrow">Patient status</p>
            <h1>Severity</h1>
            <p className="muted">Set the current status using one of the six clinical outcomes.</p>
          </div>
        </header>
        <SeverityManager
          patients={patients}
          records={records.map((record) => ({ ...record, updatedAt: record.updatedAt.toISOString() }))}
        />
      </main>
    </>
  );
}
