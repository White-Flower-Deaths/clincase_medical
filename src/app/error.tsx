"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="auth-wrap">
      <section className="auth-card">
        <p className="eyebrow">ClinCase</p>
        <h1>Unable to load this page</h1>
        <p className="muted">Please try again. If the issue continues, contact your system administrator.</p>
        <button type="button" className="btn btn-primary" onClick={reset}>
          Try again
        </button>
      </section>
    </main>
  );
}
