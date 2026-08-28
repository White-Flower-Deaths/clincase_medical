import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { format } from "date-fns";
import { AppNav } from "@/components/AppNav";
import { PrintButton } from "@/components/PrintButton";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPatientName } from "@/lib/case";

export const dynamic = "force-dynamic";

function Section({ title, body }: { title: string; body?: string | null }) {
  return (
    <section className="case-section">
      <h3>{title}</h3>
      <p>{body?.trim() ? body : "—"}</p>
    </section>
  );
}

export default async function CaseReviewPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const clinicalCase = await prisma.case.findUnique({
    where: { id: params.id },
    include: {
      patient: true,
      doctor: { select: { name: true, email: true } },
    },
  });

  if (!clinicalCase) notFound();

  return (
    <>
      <AppNav />
      <main className="page fade-in">
        <header className="page-header">
          <div>
            <p className="eyebrow">Case review</p>
            <h1>{formatPatientName(clinicalCase.patient)}</h1>
            <div className="meta-row">
              <span className={`badge badge-${clinicalCase.status}`}>{clinicalCase.status}</span>
              <span>MRN {clinicalCase.patient.mrn}</span>
              <span>Dr. {clinicalCase.doctor.name}</span>
              <span>{format(clinicalCase.updatedAt, "dd MMM yyyy, HH:mm")}</span>
            </div>
          </div>
          <div className="cta-row no-print">
            {clinicalCase.status === "draft" && (
              <Link
                href={`/cases/new?patientId=${clinicalCase.patientId}&caseId=${clinicalCase.id}`}
                className="btn btn-secondary"
              >
                Continue editing
              </Link>
            )}
            <PrintButton />
            <Link href={`/patients/${clinicalCase.patientId}`} className="btn btn-ghost">
              Patient
            </Link>
          </div>
        </header>

        <div className="case-review">
          <Section title="Chief complaint" body={clinicalCase.chiefComplaint} />
          <Section title="History of present illness" body={clinicalCase.hpi} />
          <Section title="Past medical history" body={clinicalCase.pastHistory} />
          <Section title="Surgical history" body={clinicalCase.surgicalHistory} />
          <Section title="Family history" body={clinicalCase.familyHistory} />
          <Section title="Social history" body={clinicalCase.socialHistory} />
          <Section title="Medications" body={clinicalCase.medications} />
          <Section title="Allergies" body={clinicalCase.allergies} />
          <Section title="Review of systems" body={clinicalCase.reviewOfSystems} />
          <Section title="Vitals" body={clinicalCase.vitals} />
          <Section title="Examination" body={clinicalCase.examination} />
          <Section title="Assessment" body={clinicalCase.assessment} />
          <Section title="Plan" body={clinicalCase.plan} />
        </div>
      </main>
    </>
  );
}
