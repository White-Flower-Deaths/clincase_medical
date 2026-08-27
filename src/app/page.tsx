import Link from "next/link";

const steps = [
  "Patient",
  "Chief complaint",
  "History",
  "Exam",
  "Investigations",
  "Assessment",
  "Plan",
];

export default function HomePage() {
  return (
    <main className="landing">
      <div className="landing-atmosphere" aria-hidden>
        <span className="orb orb-a" />
        <span className="orb orb-b" />
        <span className="orb orb-c" />
        <div className="case-sheet">
          <div className="case-sheet-spine" />
          <div className="case-sheet-lines">
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
          <div className="case-sheet-stamp">Case</div>
        </div>
      </div>

      <header className="landing-nav">
        <div className="brand-mark">
          <span className="brand-mark-dot" aria-hidden />
          ClinCase
        </div>
        <Link href="/login" className="btn btn-secondary btn-sm">
          Clinician login
        </Link>
      </header>

      <section className="landing-hero">
        <div className="landing-copy">
          <p className="landing-kicker">For practising clinicians</p>
          <h1>ClinCase</h1>
          <p className="landing-lead">
            A quiet workspace for complete case taking — history, exam, and plan
            without the scramble of loose notes.
          </p>
          <div className="cta-row">
            <Link href="/login" className="btn btn-primary">
              Start case taking
            </Link>
            <Link href="/login" className="btn btn-secondary">
              Open demo clinic
            </Link>
          </div>
        </div>
      </section>

      <section className="landing-flow" aria-labelledby="flow-title">
        <div className="landing-flow-inner">
          <p className="eyebrow">Guided intake</p>
          <h2 id="flow-title">Seven steps. One coherent case.</h2>
          <p className="landing-flow-copy">
            Move from first contact to management plan in a fixed clinical
            sequence — drafts autosave as you go.
          </p>
          <ol className="flow-steps">
            {steps.map((step, i) => (
              <li key={step} style={{ animationDelay: `${0.08 * i}s` }}>
                <span className="flow-num">{String(i + 1).padStart(2, "0")}</span>
                <span className="flow-label">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </main>
  );
}
