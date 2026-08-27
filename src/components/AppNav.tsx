"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/patients", label: "Patients" },
  { href: "/profile", label: "My profile" },
  { href: "/referred", label: "Refered" },
  { href: "/severity", label: "Severity" },
  { href: "/bill", label: "Bill" },
];

export function AppNav() {
  const pathname = usePathname();
  const { data } = useSession();

  return (
    <header className="app-nav">
      <div className="app-nav-inner">
        <Link href="/dashboard" className="brand-mark">
          <span className="brand-mark-dot" aria-hidden />
          ClinCase
        </Link>
        <nav className="app-nav-links">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={pathname.startsWith(link.href) ? "nav-link active" : "nav-link"}
            >
              {link.label}
            </Link>
          ))}
          <a
            href="https://ayush.gov.in/"
            className="nav-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            Ministry
          </a>
        </nav>
        <div className="app-nav-user">
          <Link href="/profile" className="nav-user-name">
            {data?.user?.name ?? "Clinician"}
          </Link>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => signOut({ callbackUrl: "/" })}>
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
