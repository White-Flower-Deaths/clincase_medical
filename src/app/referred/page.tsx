import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { AppNav } from "@/components/AppNav";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ReferredManager } from "@/components/ReferredManager";

export const dynamic = "force-dynamic";

export default async function ReferredPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const [patients, networkRecords, transfers] = await Promise.all([
    prisma.patient.findMany({
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      select: { id: true, firstName: true, lastName: true, mrn: true },
    }),
    prisma.referralNetwork.findMany({
      where: { doctorId: session.user.id },
      orderBy: [{ kind: "asc" }, { updatedAt: "desc" }],
    }),
    prisma.patientTransfer.findMany({
      where: { doctorId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: { patient: { select: { firstName: true, lastName: true, mrn: true } } },
    }),
  ]);

  return (
    <>
      <AppNav />
      <main className="page fade-in">
        <header className="page-header">
          <div>
            <p className="eyebrow">Records</p>
            <h1>Refered</h1>
            <p className="muted">Keep referral contacts and patient transfer history together.</p>
          </div>
        </header>
        <ReferredManager
          patients={patients}
          networkRecords={networkRecords}
          transfers={transfers.map((item) => ({
            ...item,
            createdAt: item.createdAt.toISOString(),
            updatedAt: item.updatedAt.toISOString(),
          }))}
        />
      </main>
    </>
  );
}
