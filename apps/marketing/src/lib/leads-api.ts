/**
 * Client-side API for submitting leads directly to admin-svc.
 *
 * Since the marketing site is a static export (no Next.js API routes),
 * forms submit directly to admin-svc which has CORS configured for
 * the marketing domain.
 */

import { attachUtmToPayload } from "./utm";

const ADMIN_API_URL =
  process.env.NEXT_PUBLIC_ADMIN_API_URL ?? "https://api.aivolearning.com";

interface LeadPayload {
  organizationName?: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  districtSize?: number;
  source: string;
  stage?: string;
  message?: string;
  metadata?: Record<string, unknown>;
}

interface LeadResponse {
  lead: { id: string };
}

export async function submitLead(payload: LeadPayload): Promise<LeadResponse> {
  const enriched = attachUtmToPayload(payload);

  const response = await fetch(`${ADMIN_API_URL}/public/leads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(enriched),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(
      (body as Record<string, string>).error ?? `Request failed: ${response.status}`,
    );
  }

  return response.json();
}
