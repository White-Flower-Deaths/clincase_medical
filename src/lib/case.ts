export const CASE_STEPS = [
  { id: "complaint", title: "Chief complaint", fields: ["chiefComplaint"] as const },
  { id: "hpi", title: "History of present illness", fields: ["hpi"] as const },
  {
    id: "history",
    title: "Past & social history",
    fields: ["pastHistory", "surgicalHistory", "familyHistory", "socialHistory"] as const,
  },
  {
    id: "meds",
    title: "Medications & allergies",
    fields: ["medications", "allergies"] as const,
  },
  { id: "ros", title: "Review of systems", fields: ["reviewOfSystems"] as const },
  {
    id: "exam",
    title: "Vitals & examination",
    fields: ["vitals", "examination"] as const,
  },
  {
    id: "plan",
    title: "Assessment & plan",
    fields: ["assessment", "plan"] as const,
  },
] as const;

export type CaseFormData = {
  chiefComplaint: string;
  hpi: string;
  pastHistory: string;
  surgicalHistory: string;
  familyHistory: string;
  socialHistory: string;
  medications: string;
  allergies: string;
  reviewOfSystems: string;
  vitals: string;
  examination: string;
  assessment: string;
  plan: string;
};

export const emptyCaseForm = (): CaseFormData => ({
  chiefComplaint: "",
  hpi: "",
  pastHistory: "",
  surgicalHistory: "",
  familyHistory: "",
  socialHistory: "",
  medications: "",
  allergies: "",
  reviewOfSystems: "",
  vitals: JSON.stringify(
    { bp: "", hr: "", rr: "", temp: "", spo2: "", weight: "" },
    null,
    2
  ),
  examination: "",
  assessment: "",
  plan: "",
});

export function formatPatientName(p: { firstName: string; lastName: string }) {
  return `${p.firstName} ${p.lastName}`;
}
