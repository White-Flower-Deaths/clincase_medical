"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeletePatientButton({
  patientId,
  patientName,
}: {
  patientId: string;
  patientName: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onDelete() {
    const ok = window.confirm(
      `Delete record for ${patientName}? This removes the patient and related cases, transfers, casualty status, and linked bills. This cannot be undone.`
    );
    if (!ok) return;

    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/patients/${patientId}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Could not delete patient");
        setBusy(false);
        return;
      }
      router.push("/patients");
      router.refresh();
    } catch {
      setError("Could not delete patient");
      setBusy(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        className="btn btn-danger btn-sm"
        onClick={onDelete}
        disabled={busy}
      >
        {busy ? "Deleting…" : "Delete record"}
      </button>
      {error && <p className="error-msg" style={{ marginTop: "0.5rem" }}>{error}</p>}
    </div>
  );
}
