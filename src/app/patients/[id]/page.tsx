import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { format } from "date-fns";
import { AppNav } from "@/components/AppNav";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPatientName } from "@/lib/case";
import { DeletePatientButton } from "@/components/DeletePatientButton";

export const dynamic = "force-dynamic";

export default async function PatientDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const patient = await prisma.patient.findUnique({
    where: { id: params.id },
    include: {
      cases: {
        orderBy: { updatedAt: "desc" },
        include: { doctor: { select: { name: true } } },
      },
    },
  });

  if (!patient) notFound();

  return (
    <>
      <AppNav />
      <main className="page fade-in">
        <header className="page-header">
          <div>
            <p className="eyebrow">{patient.mrn}</p>
            <h1>{formatPatientName(patient)}</h1>
            <p className="muted">
              {patient.age} years · {patient.sex}
              {patient.phone ? ` · ${patient.phone}` : ""}
            </p>
          </div>
          <div className="cta-row">
            <Link href="/patients" className="btn btn-ghost">
              Back
            </Link>
            <Link href={`/cases/new?patientId=${patient.id}`} className="btn btn-primary">
              Start case
            </Link>
            <DeletePatientButton
              patientId={patient.id}
              patientName={formatPatientName(patient)}
            />
          </div>
        </header>

        <div className="split">
          <section className="panel">
            <h2>Case history</h2>
            <ul className="list">
              {patient.cases.length === 0 && (
                <li className="muted">No cases yet. Start the first intake.</li>
              )}
              {patient.cases.map((c) => (
                <li key={c.id} className="list-item">
                  <div>
                    <Link href={c.status === "draft" ? `/cases/new?patientId=${patient.id}&caseId=${c.id}` : `/cases/${c.id}`}>
                      <strong>{c.chiefComplaint || "Untitled case"}</strong>
                    </Link>
                    <p className="muted" style={{ margin: "0.2rem 0 0", fontSize: "0.9rem" }}>
                      {c.doctor.name} · {format(c.updatedAt, "dd MMM yyyy, HH:mm")}
                    </p>
                  </div>
                  <span className={`badge badge-${c.status}`}>{c.status}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="panel">
            <h2>Demographics</h2>
            <div className="meta-row" style={{ flexDirection: "column", alignItems: "flex-start" }}>
              <div>
                <strong>Email:</strong> {patient.email || "—"}
              </div>
              <div>
                <strong>Address:</strong> {patient.address || "—"}
              </div>
              <div>
                <strong>Notes:</strong> {patient.notes || "—"}
              </div>
              <div>
                <strong>Registered:</strong> {format(patient.createdAt, "dd MMM yyyy")}
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
