"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [registering, setRegistering] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("doctor@clincase.dev");
  const [password, setPassword] = useState("demo1234");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    if (registering) {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error ?? "Could not create account");
        setLoading(false);
        return;
      }
    }
    const res = await signIn("credentials", { email, password, redirect: false });
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
        <h1>{registering ? "Create account" : "Sign in"}</h1>
        <p className="muted" style={{ marginBottom: "1.25rem" }}>
          Continue to your patient case workspace.
        </p>
        <form onSubmit={onSubmit}>
          {registering && (
            <label className="field">
              <span>Name</span>
              <input
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </label>
          )}
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
            {loading ? "Please wait…" : registering ? "Create account" : "Sign in"}
          </button>
        </form>
        <button
          type="button"
          className="btn btn-ghost"
          style={{ width: "100%", marginTop: "0.75rem" }}
          onClick={() => {
            setRegistering((value) => !value);
            setError("");
          }}
        >
          {registering ? "Already have an account? Sign in" : "Create a new account"}
        </button>
        {!registering && <div className="demo-hint">
          Demo: <strong>doctor@clincase.dev</strong> / <strong>demo1234</strong>
        </div>}
      </div>
    </main>
  );
}
