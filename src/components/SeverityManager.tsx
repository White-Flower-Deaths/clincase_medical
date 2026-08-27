"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type Patient = { id: string; firstName: string; lastName: string; mrn: string };
type Record = { id: string; severity: string; notes: string | null; updatedAt: string; patient: Omit<Patient, "id"> };
const severities = ["discharged", "healing", "ongoing", "shifted", "critical", "dead"] as const;

export function SeverityManager({ patients, records }: { patients: Patient[]; records: Record[] }) {
  const router = useRouter();
  const [severity, setSeverity] = useState<(typeof severities)[number]>("ongoing");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/casualty", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ patientId: form.get("patientId"), severity, notes: form.get("notes") }) });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(typeof payload.error === "string" ? payload.error : "Unable to save patient status.");
      event.currentTarget.reset();
      setSeverity("ongoing");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to save patient status.");
    } finally {
      setBusy(false);
    }
  }

  return <div className="records-layout">
    <section className="panel">
      <h2>Set patient severity</h2>
      <form onSubmit={onSubmit}>
        <label className="field"><span>Patient</span><select name="patientId" required defaultValue=""><option value="" disabled>Select a patient</option>{patients.map((patient) => <option key={patient.id} value={patient.id}>{patient.firstName} {patient.lastName} ({patient.mrn})</option>)}</select></label>
        <div className="severity-grid" role="group" aria-label="Severity status">{severities.map((item) => <button key={item} type="button" className={`severity-option severity-${item}${severity === item ? " selected" : ""}`} onClick={() => setSeverity(item)}>{item}</button>)}</div>
        <label className="field"><span>Notes</span><textarea name="notes" rows={3} maxLength={2000} /></label>
        <button className="btn btn-primary" disabled={busy || patients.length === 0}>{busy ? "Saving..." : "Save severity"}</button>
      </form>
      {error && <p className="error-msg">{error}</p>}
    </section>
    <section className="panel"><h2>Current statuses</h2><div className="record-list">{records.length === 0 ? <p className="muted">No patient statuses saved.</p> : records.map((record) => <article className="record-item" key={record.id}><div><strong>{record.patient.firstName} {record.patient.lastName} <span className="muted">({record.patient.mrn})</span></strong><p className="muted">{record.notes || "No notes"}</p></div><span className={`badge severity-badge severity-${record.severity}`}>{record.severity}</span></article>)}</div></section>
  </div>;
}
