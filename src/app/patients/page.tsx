import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { AppNav } from "@/components/AppNav";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPatientName } from "@/lib/case";
import { PatientSearch } from "@/components/PatientSearch";

export const dynamic = "force-dynamic";

export default async function PatientsPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const q = searchParams.q?.trim() ?? "";
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
    include: { _count: { select: { cases: true } } },
  });

  return (
    <>
      <AppNav />
      <main className="page fade-in">
        <header className="page-header">
          <div>
            <p className="eyebrow">Registry</p>
            <h1>Patients</h1>
            <p className="muted">{patients.length} record{patients.length === 1 ? "" : "s"}</p>
          </div>
          <Link href="/patients/new" className="btn btn-primary">
            Register patient
          </Link>
        </header>

        <section className="panel">
          <PatientSearch initialQuery={q} />
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>MRN</th>
                  <th>Name</th>
                  <th>Age / Sex</th>
                  <th>Phone</th>
                  <th>Cases</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {patients.length === 0 && (
                  <tr>
                    <td colSpan={6} className="muted">
                      No patients found.
                    </td>
                  </tr>
                )}
                {patients.map((p) => (
                  <tr key={p.id}>
                    <td>{p.mrn}</td>
                    <td>
                      <Link href={`/patients/${p.id}`}>
                        <strong>{formatPatientName(p)}</strong>
                      </Link>
                    </td>
                    <td>
                      {p.age} / {p.sex}
                    </td>
                    <td>{p.phone || "—"}</td>
                    <td>{p._count.cases}</td>
                    <td>
                      <Link href={`/cases/new?patientId=${p.id}`} className="btn btn-ghost btn-sm">
                        New case
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </>
  );
}
