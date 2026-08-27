import { NextResponse } from "next/server";

/** Safe client-facing error — never leak internals. */
export function apiError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function apiOk<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

/** Wrap route handlers: log server-side, return generic 500 to clients. */
export async function handleApi(
  fn: () => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    return await fn();
  } catch (err) {
    console.error("[api]", err);
    return apiError("Something went wrong. Please try again.", 500);
  }
}

export const CASUALTY_SEVERITIES = [
  "discharged",
  "healing",
  "ongoing",
  "shifted",
  "critical",
  "dead",
] as const;

export type CasualtySeverity = (typeof CASUALTY_SEVERITIES)[number];

export const REFERRAL_NETWORK_TYPES = [
  "doctor",
  "medicine",
  "checkup",
  "hospital",
] as const;

export type ReferralNetworkType = (typeof REFERRAL_NETWORK_TYPES)[number];
