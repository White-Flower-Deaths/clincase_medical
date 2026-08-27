import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { formatDistanceToNow } from "date-fns";
import { AppNav } from "@/components/AppNav";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPatientName } from "@/lib/case";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

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
      prisma.patient.findMany({
        take: 5,
        orderBy: { updatedAt: "desc" },
      }),
    ]);

  return (
    <>
      <AppNav />
      <main className="page fade-in">
        <header className="page-header">
          <div>
            <p className="eyebrow">Workspace</p>
            <h1>Welcome, {session.user.name?.split(" ")[0] ?? "Doctor"}</h1>
            <p className="muted">Your patient cases at a glance.</p>
          </div>
          <div className="cta-row">
            <Link href="/patients/new" className="btn btn-secondary">
              New patient
            </Link>
            <Link href="/patients" className="btn btn-primary">
              Open patients
            </Link>
          </div>
        </header>

        <section className="stats-row">
          <div className="stat">
            <div className="stat-value">{patientCount}</div>
            <div className="stat-label">Patients</div>
          </div>
          <div className="stat">
            <div className="stat-value">{caseCount}</div>
            <div className="stat-label">Total cases</div>
          </div>
          <div className="stat">
            <div className="stat-value">{draftCount}</div>
            <div className="stat-label">Drafts</div>
          </div>
          <div className="stat">
            <div className="stat-value">{completedCount}</div>
            <div className="stat-label">Completed</div>
          </div>
        </section>

        <div className="split">
          <section className="panel">
            <h2>Recent cases</h2>
            <ul className="list">
              {recentCases.length === 0 && <li className="muted">No cases yet.</li>}
              {recentCases.map((c) => (
                <li key={c.id} className="list-item">
                  <div>
                    <Link href={`/cases/${c.id}`}>
                      <strong>{formatPatientName(c.patient)}</strong>
                    </Link>
                    <p className="muted" style={{ margin: "0.2rem 0 0", fontSize: "0.9rem" }}>
                      {c.chiefComplaint || "Untitled case"} ·{" "}
                      {formatDistanceToNow(c.updatedAt, { addSuffix: true })}
                    </p>
                  </div>
                  <span className={`badge badge-${c.status}`}>{c.status}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="panel">
            <h2>Recent patients</h2>
            <ul className="list">
              {recentPatients.map((p) => (
                <li key={p.id} className="list-item">
                  <div>
                    <Link href={`/patients/${p.id}`}>
                      <strong>{formatPatientName(p)}</strong>
                    </Link>
                    <p className="muted" style={{ margin: "0.2rem 0 0", fontSize: "0.9rem" }}>
                      {p.mrn} · {p.age}y · {p.sex}
                    </p>
                  </div>
                  <Link
                    href={`/cases/new?patientId=${p.id}`}
                    className="btn btn-ghost btn-sm"
                  >
                    New case
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>
    </>
  );
}
