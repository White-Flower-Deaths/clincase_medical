"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CASE_STEPS, CaseFormData, emptyCaseForm } from "@/lib/case";

type Props = {
  patientId: string;
  patientName: string;
  caseId?: string;
  initial?: Partial<CaseFormData> & { status?: string };
};

const fieldMeta: Record<
  keyof CaseFormData,
  { label: string; placeholder: string; rows?: number }
> = {
  chiefComplaint: {
    label: "Chief complaint",
    placeholder: "Primary reason for visit in the patient's words",
    rows: 3,
  },
  hpi: {
    label: "History of present illness",
    placeholder: "Onset, location, duration, character, aggravating/relieving factors, severity…",
    rows: 8,
  },
  pastHistory: {
    label: "Past medical history",
    placeholder: "Chronic conditions, hospitalizations",
    rows: 4,
  },
  surgicalHistory: {
    label: "Surgical history",
    placeholder: "Prior surgeries and years",
    rows: 3,
  },
  familyHistory: {
    label: "Family history",
    placeholder: "Relevant hereditary or familial conditions",
    rows: 3,
  },
  socialHistory: {
    label: "Social history",
    placeholder: "Tobacco, alcohol, occupation, living situation",
    rows: 3,
  },
  medications: {
    label: "Current medications",
    placeholder: "Drug, dose, frequency",
    rows: 5,
  },
  allergies: {
    label: "Allergies",
    placeholder: "Drug / food / environmental — reaction",
    rows: 3,
  },
  reviewOfSystems: {
    label: "Review of systems",
    placeholder: "Pertinent positives and negatives by system",
    rows: 8,
  },
  vitals: {
    label: "Vitals (JSON or free text)",
    placeholder: '{"bp":"120/80","hr":"72",...}',
    rows: 6,
  },
  examination: {
    label: "Physical examination",
    placeholder: "General appearance, HEENT, CV, Resp, Abd, Neuro, Extremities…",
    rows: 8,
  },
  assessment: {
    label: "Assessment",
    placeholder: "Working diagnoses / clinical impression",
    rows: 5,
  },
  plan: {
    label: "Plan",
    placeholder: "Workup, treatment, follow-up, patient education",
    rows: 6,
  },
};

export function CaseWizard({ patientId, patientName, caseId, initial }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<CaseFormData>(() => ({
    ...emptyCaseForm(),
    ...initial,
  }));
  const [activeCaseId, setActiveCaseId] = useState<string | undefined>(caseId);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const progress = useMemo(() => ((step + 1) / CASE_STEPS.length) * 100, [step]);

  useEffect(() => {
    setMessage("");
    setError("");
  }, [step]);

  function updateField<K extends keyof CaseFormData>(key: K, value: CaseFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function persist(status: "draft" | "completed") {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const payload = { ...form, status, patientId };
      let id = activeCaseId;

      if (!id) {
        const res = await fetch("/api/cases", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create case");
        id = data.id as string;
        setActiveCaseId(id);
      } else {
        const res = await fetch(`/api/cases/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to save case");
      }

      if (status === "completed") {
        setMessage("Case completed");
        router.push(`/cases/${id}`);
        router.refresh();
      } else {
        setMessage("Draft saved");
        if (!caseId && id) {
          router.replace(`/cases/new?patientId=${patientId}&caseId=${id}`);
        }
      }
      return id;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
      return null;
    } finally {
      setSaving(false);
    }
  }

  async function next() {
    await persist("draft");
    if (step < CASE_STEPS.length - 1) setStep((s) => s + 1);
  }

  async function finish() {
    await persist("completed");
  }

  const current = CASE_STEPS[step];

  return (
    <div className="wizard">
      <aside className="wizard-rail">
        <p className="wizard-patient">{patientName}</p>
        <h2 className="wizard-title">Case taking</h2>
        <div className="wizard-progress-track" aria-hidden>
          <div className="wizard-progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <ol className="wizard-steps">
          {CASE_STEPS.map((s, i) => (
            <li key={s.id}>
              <button
                type="button"
                className={`wizard-step ${i === step ? "current" : ""} ${i < step ? "done" : ""}`}
                onClick={() => setStep(i)}
              >
                <span className="wizard-step-num">{i + 1}</span>
                <span>{s.title}</span>
              </button>
            </li>
          ))}
        </ol>
      </aside>

      <section className="wizard-panel fade-in" key={current.id}>
        <header className="wizard-panel-head">
          <p className="eyebrow">Step {step + 1} of {CASE_STEPS.length}</p>
          <h3>{current.title}</h3>
        </header>

        <div className="wizard-fields">
          {current.fields.map((field) => {
            const meta = fieldMeta[field];
            return (
              <label key={field} className="field">
                <span>{meta.label}</span>
                <textarea
                  rows={meta.rows ?? 4}
                  value={form[field]}
                  placeholder={meta.placeholder}
                  onChange={(e) => updateField(field, e.target.value)}
                />
              </label>
            );
          })}
        </div>

        <footer className="wizard-actions">
          <button
            type="button"
            className="btn btn-ghost"
            disabled={step === 0 || saving}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
          >
            Back
          </button>
          <div className="wizard-actions-right">
            {message && <span className="save-msg">{message}</span>}
            {error && <span className="error-msg">{error}</span>}
            <button
              type="button"
              className="btn btn-secondary"
              disabled={saving}
              onClick={() => persist("draft")}
            >
              {saving ? "Saving…" : "Save draft"}
            </button>
            {step < CASE_STEPS.length - 1 ? (
              <button type="button" className="btn btn-primary" disabled={saving} onClick={next}>
                Continue
              </button>
            ) : (
              <button type="button" className="btn btn-primary" disabled={saving} onClick={finish}>
                Complete case
              </button>
            )}
          </div>
        </footer>
      </section>
    </div>
  );
}
