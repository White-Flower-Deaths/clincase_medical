"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type Patient = { id: string; firstName: string; lastName: string; mrn: string };
type Bill = { id: string; description: string; amountRupees: number; paid: boolean; billedAt: string; patient: Omit<Patient, "id"> | null };

const formatter = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 });

export function BillManager({ patients, bills }: { patients: Patient[]; bills: Bill[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/bills", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ description: form.get("description"), amountRupees: Number(form.get("amountRupees")), paid: form.get("paid") === "on", patientId: form.get("patientId") || null }) });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(typeof payload.error === "string" ? payload.error : "Unable to save billing record.");
      event.currentTarget.reset();
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to save billing record.");
    } finally {
      setBusy(false);
    }
  }

  async function updatePaid(id: string, paid: boolean) {
    setError("");
    try {
      const response = await fetch(`/api/bills/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ paid }) });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(typeof payload.error === "string" ? payload.error : "Unable to update billing record.");
      router.refresh();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Unable to update billing record."); }
  }

  return <div className="records-layout">
    <section className="panel">
      <h2>Add billing record</h2>
      <form className="form-grid" onSubmit={onSubmit}>
        <label className="field full"><span>Patient (optional)</span><select name="patientId" defaultValue=""><option value="">General billing record</option>{patients.map((patient) => <option key={patient.id} value={patient.id}>{patient.firstName} {patient.lastName} ({patient.mrn})</option>)}</select></label>
        <label className="field"><span>Description</span><input name="description" required maxLength={500} /></label>
        <label className="field"><span>Amount (Rs.)</span><input name="amountRupees" type="number" min="0.01" max="10000000" step="0.01" required /></label>
        <label className="check-field full"><input name="paid" type="checkbox" /> Mark as paid</label>
        <div className="form-actions full"><button className="btn btn-primary" disabled={busy}>{busy ? "Saving..." : "Save bill"}</button></div>
      </form>
      {error && <p className="error-msg">{error}</p>}
    </section>
    <section className="panel"><h2>Billing history</h2><div className="table-wrap"><table className="data"><thead><tr><th>Patient</th><th>Description</th><th>Amount</th><th>Status</th></tr></thead><tbody>{bills.length === 0 ? <tr><td colSpan={4} className="muted">No billing records saved.</td></tr> : bills.map((bill) => <tr key={bill.id}><td>{bill.patient ? `${bill.patient.firstName} ${bill.patient.lastName}` : "General"}</td><td>{bill.description}</td><td>{formatter.format(bill.amountRupees)}</td><td><button type="button" className={`badge payment-toggle ${bill.paid ? "paid" : "unpaid"}`} onClick={() => updatePaid(bill.id, !bill.paid)}>{bill.paid ? "Paid" : "Unpaid"}</button></td></tr>)}</tbody></table></div></section>
  </div>;
}
