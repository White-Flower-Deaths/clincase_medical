"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppNav } from "@/components/AppNav";

export default function NewPatientPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    age: "",
    sex: "Female",
    phone: "",
    email: "",
    address: "",
    notes: "",
  });

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/patients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        age: Number(form.age),
        email: form.email || null,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(typeof data.error === "string" ? data.error : "Could not create patient");
      return;
    }
    router.push(`/patients/${data.id}`);
    router.refresh();
  }

  return (
    <>
      <AppNav />
      <main className="page fade-in">
        <header className="page-header">
          <div>
            <p className="eyebrow">Registration</p>
            <h1>New patient</h1>
          </div>
          <Link href="/patients" className="btn btn-ghost">
            Cancel
          </Link>
        </header>

        <form className="panel" onSubmit={onSubmit} style={{ maxWidth: 720 }}>
          <div className="form-grid">
            <label className="field">
              <span>First name</span>
              <input required value={form.firstName} onChange={(e) => set("firstName", e.target.value)} />
            </label>
            <label className="field">
              <span>Last name</span>
              <input required value={form.lastName} onChange={(e) => set("lastName", e.target.value)} />
            </label>
            <label className="field">
              <span>Age</span>
              <input
                required
                type="number"
                min={0}
                max={130}
                value={form.age}
                onChange={(e) => set("age", e.target.value)}
              />
            </label>
            <label className="field">
              <span>Sex</span>
              <select value={form.sex} onChange={(e) => set("sex", e.target.value)}>
                <option>Female</option>
                <option>Male</option>
                <option>Other</option>
                <option>Prefer not to say</option>
              </select>
            </label>
            <label className="field">
              <span>Phone</span>
              <input value={form.phone} onChange={(e) => set("phone", e.target.value)} />
            </label>
            <label className="field">
              <span>Email</span>
              <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
            </label>
            <label className="field full">
              <span>Address</span>
              <input value={form.address} onChange={(e) => set("address", e.target.value)} />
            </label>
            <label className="field full">
              <span>Notes</span>
              <textarea rows={3} value={form.notes} onChange={(e) => set("notes", e.target.value)} />
            </label>
          </div>
          {error && <p className="error-msg">{error}</p>}
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Saving…" : "Create patient"}
          </button>
        </form>
      </main>
    </>
  );
}
