"use client";

import { FormEvent, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { AppNav } from "@/components/AppNav";

type Profile = {
  name: string;
  email: string;
  phone: string;
  specialty: string;
};

export default function ProfilePage() {
  const { update } = useSession();
  const [form, setForm] = useState<Profile>({
    name: "",
    email: "",
    phone: "",
    specialty: "",
  });
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/profile")
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load profile");
        setForm({
          name: data.name ?? "",
          email: data.email ?? "",
          phone: data.phone ?? "",
          specialty: data.specialty ?? "",
        });
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  function set<K extends keyof Profile>(key: K, value: Profile[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined,
      }),
    });
    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(typeof data.error === "string" ? data.error : "Could not save profile");
      return;
    }

    await update({ name: data.name, email: data.email });
    setCurrentPassword("");
    setNewPassword("");
    setMessage("Profile updated");
  }

  return (
    <>
      <AppNav />
      <main className="page fade-in">
        <header className="page-header">
          <div>
            <p className="eyebrow">Account</p>
            <h1>Doctor profile</h1>
            <p className="muted">Update your name, contact details, and password.</p>
          </div>
        </header>

        <form className="panel" onSubmit={onSubmit} style={{ maxWidth: 640 }}>
          {loading ? (
            <p className="muted">Loading profile…</p>
          ) : (
            <>
              <div className="form-grid">
                <label className="field full">
                  <span>Full name</span>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                  />
                </label>
                <label className="field full">
                  <span>Email</span>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                  />
                </label>
                <label className="field">
                  <span>Phone</span>
                  <input
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    placeholder="+91 …"
                  />
                </label>
                <label className="field">
                  <span>Specialty</span>
                  <input
                    value={form.specialty}
                    onChange={(e) => set("specialty", e.target.value)}
                    placeholder="e.g. General Medicine"
                  />
                </label>
              </div>

              <h2 style={{ fontSize: "1.15rem", margin: "0.5rem 0 0.85rem" }}>
                Change password
              </h2>
              <p className="muted" style={{ marginBottom: "0.85rem" }}>
                Leave blank to keep your current password.
              </p>
              <div className="form-grid">
                <label className="field">
                  <span>Current password</span>
                  <input
                    type="password"
                    autoComplete="current-password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </label>
                <label className="field">
                  <span>New password</span>
                  <input
                    type="password"
                    autoComplete="new-password"
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </label>
              </div>

              {error && <p className="error-msg">{error}</p>}
              {message && <p className="save-msg">{message}</p>}

              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? "Saving…" : "Save profile"}
              </button>
            </>
          )}
        </form>
      </main>
    </>
  );
}
