import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { AppNav } from "@/components/AppNav";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BillManager } from "@/components/BillManager";

export const dynamic = "force-dynamic";

export default async function BillPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const [patients, bills] = await Promise.all([
    prisma.patient.findMany({
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      select: { id: true, firstName: true, lastName: true, mrn: true },
    }),
    prisma.bill.findMany({
      where: { doctorId: session.user.id },
      orderBy: { billedAt: "desc" },
      include: { patient: { select: { firstName: true, lastName: true, mrn: true } } },
    }),
  ]);

  return (
    <>
      <AppNav />
      <main className="page fade-in">
        <header className="page-header">
          <div>
            <p className="eyebrow">Accounts</p>
            <h1>Bill</h1>
            <p className="muted">Record amounts in rupees and track payment status.</p>
          </div>
        </header>
        <BillManager
          patients={patients}
          bills={bills.map((bill) => ({
            ...bill,
            billedAt: bill.billedAt.toISOString(),
          }))}
        />
      </main>
    </>
  );
}
