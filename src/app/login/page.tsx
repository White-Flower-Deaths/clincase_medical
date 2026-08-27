"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("doctor@clincase.dev");
  const [password, setPassword] = useState("demo1234");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Invalid email or password");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="auth-wrap">
      <div className="auth-card">
        <Link href="/" className="brand-mark" style={{ marginBottom: "1.25rem" }}>
          <span className="brand-mark-dot" aria-hidden />
          ClinCase
        </Link>
        <p className="eyebrow">Clinician access</p>
        <h1>Sign in</h1>
        <p className="muted" style={{ marginBottom: "1.25rem" }}>
          Continue to your patient case workspace.
        </p>
        <form onSubmit={onSubmit}>
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label className="field">
            <span>Password</span>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          {error && <p className="error-msg">{error}</p>}
          <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <div className="demo-hint">
          Demo: <strong>doctor@clincase.dev</strong> / <strong>demo1234</strong>
        </div>
      </div>
    </main>
  );
}
