import { NextRequest, NextResponse } from "next/server";

let settingsStore = {
  maintenanceMode: false,
  maxDistrictSize: 5000,
  defaultTrialDays: 30,
  enforceSSO: false,
  apiRateLimit: 1000,
};

const admins = [
  { id: "a1", name: "Elena Rodriguez", email: "elena@aivo.com", platformRole: "super_admin", lastLoginAt: "2026-04-09T14:00:00Z" },
  { id: "a2", name: "Marcus Chen", email: "marcus@aivo.com", platformRole: "ops_manager", lastLoginAt: "2026-04-09T10:30:00Z" },
  { id: "a3", name: "Priya Sharma", email: "priya@aivo.com", platformRole: "content_manager", lastLoginAt: "2026-04-08T16:00:00Z" },
  { id: "a4", name: "Jordan Blake", email: "jordan@aivo.com", platformRole: "support_agent", lastLoginAt: "2026-04-09T12:45:00Z" },
  { id: "a5", name: "Taylor Kim", email: "taylor@aivo.com", platformRole: "billing_manager", lastLoginAt: "2026-04-07T09:00:00Z" },
];

export async function GET() {
  return NextResponse.json({
    ...settingsStore,
    admins,
  });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();

  if (typeof body.maintenanceMode === "boolean") settingsStore.maintenanceMode = body.maintenanceMode;
  if (typeof body.maxDistrictSize === "number" && body.maxDistrictSize > 0) settingsStore.maxDistrictSize = body.maxDistrictSize;
  if (typeof body.defaultTrialDays === "number" && body.defaultTrialDays > 0) settingsStore.defaultTrialDays = body.defaultTrialDays;
  if (typeof body.enforceSSO === "boolean") settingsStore.enforceSSO = body.enforceSSO;
  if (typeof body.apiRateLimit === "number" && body.apiRateLimit > 0) settingsStore.apiRateLimit = body.apiRateLimit;

  return NextResponse.json({ ...settingsStore, admins });
}
