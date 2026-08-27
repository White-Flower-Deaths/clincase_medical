"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type Patient = { id: string; firstName: string; lastName: string; mrn: string };
type NetworkRecord = { id: string; kind: string; name: string; details: string | null; contact: string | null };
type Transfer = {
  id: string;
  shiftedTo: string;
  ward: string | null;
  underDoctor: string | null;
  notes: string | null;
  createdAt: string;
  patient: { firstName: string; lastName: string; mrn: string };
};

const networkTypes = ["doctor", "medicine", "checkup", "hospital"] as const;

function patientName(patient: Patient) {
  return `${patient.firstName} ${patient.lastName} (${patient.mrn})`;
}

async function request(url: string, options: RequestInit) {
  const response = await fetch(url, options);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(typeof payload.error === "string" ? payload.error : "Unable to save the record.");
  return payload;
}

export function ReferredManager({
  patients,
  networkRecords,
  transfers,
}: {
  patients: Patient[];
  networkRecords: NetworkRecord[];
  transfers: Transfer[];
}) {
  const router = useRouter();
  const [networkBusy, setNetworkBusy] = useState(false);
  const [transferBusy, setTransferBusy] = useState(false);
  const [error, setError] = useState("");

  async function saveNetwork(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setNetworkBusy(true);
    setError("");
    try {
      await request("/api/referred/network", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: form.get("kind"), name: form.get("name"), details: form.get("details"), contact: form.get("contact"),
        }),
      });
      event.currentTarget.reset();
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to save the record.");
    } finally {
      setNetworkBusy(false);
    }
  }

  async function saveTransfer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setTransferBusy(true);
    setError("");
    try {
      await request("/api/referred/transfers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: form.get("patientId"), shiftedTo: form.get("shiftedTo"), ward: form.get("ward"),
          underDoctor: form.get("underDoctor"), notes: form.get("notes"),
        }),
      });
      event.currentTarget.reset();
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to save the record.");
    } finally {
      setTransferBusy(false);
    }
  }

  async function remove(url: string) {
    setError("");
    try {
      await request(url, { method: "DELETE" });
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to remove the record.");
    }
  }

  return (
    <div className="records-layout">
      <section className="panel">
        <h2>Referral contacts</h2>
        <form className="form-grid" onSubmit={saveNetwork}>
          <label className="field"><span>Record type</span><select name="kind" defaultValue="doctor">{networkTypes.map((type) => <option key={type} value={type}>{type[0].toUpperCase() + type.slice(1)}</option>)}</select></label>
          <label className="field"><span>Name</span><input name="name" required maxLength={200} /></label>
          <label className="field"><span>Contact</span><input name="contact" maxLength={200} /></label>
          <label className="field"><span>Details</span><input name="details" maxLength={2000} /></label>
          <div className="form-actions full"><button className="btn btn-primary" disabled={networkBusy}>{networkBusy ? "Saving..." : "Save contact"}</button></div>
        </form>
        <div className="record-list">
          {networkRecords.length === 0 ? <p className="muted">No referral contacts saved.</p> : networkRecords.map((record) => (
            <article className="record-item" key={record.id}>
              <div><span className="badge badge-info">{record.kind}</span><strong>{record.name}</strong><p className="muted">{[record.contact, record.details].filter(Boolean).join(" · ") || "No additional details"}</p></div>
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => remove(`/api/referred/network/${record.id}`)}>Remove</button>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2>Patient transfers</h2>
        <form className="form-grid" onSubmit={saveTransfer}>
          <label className="field full"><span>Patient</span><select name="patientId" required defaultValue=""><option value="" disabled>Select a patient</option>{patients.map((patient) => <option key={patient.id} value={patient.id}>{patientName(patient)}</option>)}</select></label>
          <label className="field"><span>Shifted to</span><input name="shiftedTo" required maxLength={300} /></label>
          <label className="field"><span>Ward</span><input name="ward" maxLength={200} /></label>
          <label className="field"><span>Under doctor</span><input name="underDoctor" maxLength={200} /></label>
          <label className="field"><span>Notes</span><input name="notes" maxLength={2000} /></label>
          <div className="form-actions full"><button className="btn btn-primary" disabled={transferBusy || patients.length === 0}>{transferBusy ? "Saving..." : "Save transfer"}</button></div>
        </form>
        <div className="record-list">
          {transfers.length === 0 ? <p className="muted">No patient transfers saved.</p> : transfers.map((transfer) => (
            <article className="record-item" key={transfer.id}>
              <div><strong>{transfer.patient.firstName} {transfer.patient.lastName} <span className="muted">({transfer.patient.mrn})</span></strong><p className="muted">{transfer.shiftedTo}{transfer.ward ? ` · Ward: ${transfer.ward}` : ""}{transfer.underDoctor ? ` · Dr. ${transfer.underDoctor}` : ""}{transfer.notes ? ` · ${transfer.notes}` : ""}</p></div>
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => remove(`/api/referred/transfers/${transfer.id}`)}>Remove</button>
            </article>
          ))}
        </div>
      </section>
      {error && <p className="error-msg">{error}</p>}
    </div>
  );
}
