"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function PatientSearch({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const [q, setQ] = useState(initialQuery);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    router.push(`/patients${params.toString() ? `?${params}` : ""}`);
  }

  return (
    <form className="search-bar" onSubmit={onSubmit}>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search by name, MRN, or phone"
        aria-label="Search patients"
      />
      <button type="submit" className="btn btn-secondary">
        Search
      </button>
    </form>
  );
}
