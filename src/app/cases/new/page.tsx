import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { AppNav } from "@/components/AppNav";
import { CaseWizard } from "@/components/CaseWizard";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { emptyCaseForm, formatPatientName } from "@/lib/case";

export const dynamic = "force-dynamic";

export default async function NewCasePage({
  searchParams,
}: {
  searchParams: { patientId?: string; caseId?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const patientId = searchParams.patientId;
  if (!patientId) redirect("/patients");

  const patient = await prisma.patient.findUnique({ where: { id: patientId } });
  if (!patient) notFound();

  let initial = emptyCaseForm();
  const caseId = searchParams.caseId;

  if (caseId) {
    const existing = await prisma.case.findUnique({ where: { id: caseId } });
    if (!existing || existing.patientId !== patientId) notFound();
    initial = {
      chiefComplaint: existing.chiefComplaint ?? "",
      hpi: existing.hpi ?? "",
      pastHistory: existing.pastHistory ?? "",
      surgicalHistory: existing.surgicalHistory ?? "",
      familyHistory: existing.familyHistory ?? "",
      socialHistory: existing.socialHistory ?? "",
      medications: existing.medications ?? "",
      allergies: existing.allergies ?? "",
      reviewOfSystems: existing.reviewOfSystems ?? "",
      vitals: existing.vitals ?? emptyCaseForm().vitals,
      examination: existing.examination ?? "",
      assessment: existing.assessment ?? "",
      plan: existing.plan ?? "",
    };
  }

  return (
    <>
      <AppNav />
      <main className="page">
        <CaseWizard
          patientId={patient.id}
          patientName={formatPatientName(patient)}
          caseId={caseId}
          initial={initial}
        />
      </main>
    </>
  );
}
