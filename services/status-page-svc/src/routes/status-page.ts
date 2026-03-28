import type { FastifyInstance } from "fastify";
import { eq, desc, gte, ne, and, or } from "drizzle-orm";
import {
  monitoredServices,
  serviceChecks,
  incidents,
  incidentUpdates,
  maintenanceWindows,
  uptimeDaily,
} from "@aivo/db";

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  OPERATIONAL: { bg: "#10B981", text: "#FFFFFF", label: "Operational" },
  DEGRADED: { bg: "#F59E0B", text: "#FFFFFF", label: "Degraded Performance" },
  PARTIAL_OUTAGE: { bg: "#F97316", text: "#FFFFFF", label: "Partial Outage" },
  MAJOR_OUTAGE: { bg: "#EF4444", text: "#FFFFFF", label: "Major Outage" },
};

const IMPACT_COLORS: Record<string, string> = {
  NONE: "#6B7280",
  MINOR: "#F59E0B",
  MAJOR: "#F97316",
  CRITICAL: "#EF4444",
};

const INCIDENT_STATUS_LABELS: Record<string, string> = {
  INVESTIGATING: "Investigating",
  IDENTIFIED: "Identified",
  MONITORING: "Monitoring",
  RESOLVED: "Resolved",
};

export async function statusPageRoutes(app: FastifyInstance) {
  app.get("/", async (_request, reply) => {
    const services = await app.db
      .select()
      .from(monitoredServices)
      .where(eq(monitoredServices.isEnabled, true))
      .orderBy(monitoredServices.displayOrder);

    const serviceStatuses = await Promise.all(
      services.map(async (svc) => {
        const [latest] = await app.db
          .select()
          .from(serviceChecks)
          .where(eq(serviceChecks.serviceId, svc.id))
          .orderBy(desc(serviceChecks.checkedAt))
          .limit(1);
        return {
          ...svc,
          currentStatus: (latest?.status ?? "OPERATIONAL") as string,
          responseTimeMs: latest?.responseTimeMs ?? null,
        };
      }),
    );

    const groups = new Map<string, typeof serviceStatuses>();
    for (const svc of serviceStatuses) {
      const group = groups.get(svc.groupName) ?? [];
      group.push(svc);
      groups.set(svc.groupName, group);
    }

    const activeIncidents = await app.db
      .select()
      .from(incidents)
      .where(ne(incidents.status, "RESOLVED"))
      .orderBy(desc(incidents.createdAt))
      .limit(10);

    const activeIncidentUpdates = new Map<string, (typeof incidentUpdates.$inferSelect)[]>();
    for (const incident of activeIncidents) {
      const updates = await app.db
        .select()
        .from(incidentUpdates)
        .where(eq(incidentUpdates.incidentId, incident.id))
        .orderBy(desc(incidentUpdates.createdAt));
      activeIncidentUpdates.set(incident.id, updates);
    }

    const now = new Date();
    const upcomingMaintenance = await app.db
      .select()
      .from(maintenanceWindows)
      .where(
        and(
          or(
            eq(maintenanceWindows.status, "SCHEDULED"),
            eq(maintenanceWindows.status, "IN_PROGRESS"),
          ),
          gte(maintenanceWindows.scheduledEnd, now),
        ),
      )
      .orderBy(maintenanceWindows.scheduledStart)
      .limit(5);

    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const dateStr = ninetyDaysAgo.toISOString().split("T")[0];

    const uptimeData = await Promise.all(
      services.map(async (svc) => {
        const daily = await app.db
          .select()
          .from(uptimeDaily)
          .where(
            and(
              eq(uptimeDaily.serviceId, svc.id),
              gte(uptimeDaily.date, dateStr),
            ),
          )
          .orderBy(uptimeDaily.date);
        const avg =
          daily.length > 0
            ? (daily.reduce((sum, d) => sum + parseFloat(d.uptimePercentage), 0) / daily.length).toFixed(3)
            : "100.000";
        return { name: svc.displayName, uptimePercentage: avg, daily };
      }),
    );

    const pastIncidents = await app.db
      .select()
      .from(incidents)
      .where(
        and(
          eq(incidents.status, "RESOLVED"),
          gte(incidents.createdAt, ninetyDaysAgo),
        ),
      )
      .orderBy(desc(incidents.createdAt))
      .limit(20);

    const overallStatus = computeOverall(serviceStatuses);
    const statusInfo = STATUS_COLORS[overallStatus] ?? STATUS_COLORS.OPERATIONAL;

    const html = renderPage({
      overallStatus,
      statusInfo,
      groups,
      activeIncidents,
      activeIncidentUpdates,
      upcomingMaintenance,
      uptimeData,
      pastIncidents,
    });

    return reply.type("text/html").send(html);
  });
}

function computeOverall(services: { currentStatus: string; isCritical: boolean }[]): string {
  if (services.length === 0) return "OPERATIONAL";
  const criticalDown = services.filter(
    (s) => s.isCritical && (s.currentStatus === "MAJOR_OUTAGE" || s.currentStatus === "PARTIAL_OUTAGE"),
  );
  if (criticalDown.length > 1) return "MAJOR_OUTAGE";
  if (criticalDown.length === 1) return "PARTIAL_OUTAGE";
  if (services.some((s) => s.currentStatus === "DEGRADED")) return "DEGRADED";
  if (services.some((s) => s.currentStatus === "PARTIAL_OUTAGE" || s.currentStatus === "MAJOR_OUTAGE")) return "PARTIAL_OUTAGE";
  return "OPERATIONAL";
}

interface PageData {
  overallStatus: string;
  statusInfo: { bg: string; text: string; label: string };
  groups: Map<string, { displayName: string; currentStatus: string; responseTimeMs: number | null }[]>;
  activeIncidents: (typeof incidents.$inferSelect)[];
  activeIncidentUpdates: Map<string, (typeof incidentUpdates.$inferSelect)[]>;
  upcomingMaintenance: (typeof maintenanceWindows.$inferSelect)[];
  uptimeData: { name: string; uptimePercentage: string; daily: (typeof uptimeDaily.$inferSelect)[] }[];
  pastIncidents: (typeof incidents.$inferSelect)[];
}

function esc(str: string): string {
  return str.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function renderPage(data: PageData): string {
  const { overallStatus, statusInfo, groups, activeIncidents, activeIncidentUpdates, upcomingMaintenance, uptimeData, pastIncidents } = data;

  let servicesHtml = "";
  for (const [groupName, services] of groups) {
    const groupServices = services
      .map((svc) => {
        const si = STATUS_COLORS[svc.currentStatus] ?? STATUS_COLORS.OPERATIONAL;
        const rt = svc.responseTimeMs !== null ? `${svc.responseTimeMs}ms` : "";
        return `<div class="svc-row">
          <div class="svc-name"><span class="status-dot" style="background:${si.bg}"></span>${esc(svc.displayName)}</div>
          <div class="svc-meta"><span class="rt">${rt}</span><span class="status-label" style="color:${si.bg}">${si.label}</span></div>
        </div>`;
      })
      .join("");
    servicesHtml += `<div class="group">
      <div class="group-header">${esc(groupName)}</div>
      <div class="group-body">${groupServices}</div>
    </div>`;
  }

  let incidentsHtml = "";
  if (activeIncidents.length > 0) {
    const items = activeIncidents
      .map((inc) => {
        const impactColor = IMPACT_COLORS[inc.impact] ?? "#6B7280";
        const updates = activeIncidentUpdates.get(inc.id) ?? [];
        const updatesHtml = updates
          .map(
            (u) =>
              `<div class="update-item"><span class="update-status">${INCIDENT_STATUS_LABELS[u.status] ?? u.status}</span><span class="update-time">${new Date(u.createdAt).toLocaleString()}</span><p class="update-msg">${esc(u.message)}</p></div>`,
          )
          .join("");
        return `<div class="incident-card">
          <div class="incident-header"><span class="impact-badge" style="background:${impactColor}">${esc(inc.impact)}</span><h3>${esc(inc.title)}</h3></div>
          <p class="incident-status">${INCIDENT_STATUS_LABELS[inc.status] ?? inc.status} &mdash; ${new Date(inc.createdAt).toLocaleString()}</p>
          <div class="updates">${updatesHtml}</div>
        </div>`;
      })
      .join("");
    incidentsHtml = `<section class="section"><h2>Active Incidents</h2>${items}</section>`;
  }

  let maintenanceHtml = "";
  if (upcomingMaintenance.length > 0) {
    const items = upcomingMaintenance
      .map(
        (m) =>
          `<div class="maintenance-card"><h3>${esc(m.title)}</h3><p>${m.description ? esc(m.description) : ""}</p><p class="maintenance-time">${new Date(m.scheduledStart).toLocaleString()} &mdash; ${new Date(m.scheduledEnd).toLocaleString()}</p><span class="maintenance-status">${esc(m.status)}</span></div>`,
      )
      .join("");
    maintenanceHtml = `<section class="section"><h2>Upcoming Maintenance</h2>${items}</section>`;
  }

  let uptimeHtml = "";
  if (uptimeData.length > 0) {
    const bars = uptimeData
      .map((svc) => {
        const pct = parseFloat(svc.uptimePercentage);
        const color = pct >= 99.9 ? "#10B981" : pct >= 99.0 ? "#F59E0B" : "#EF4444";
        return `<div class="uptime-row"><span class="uptime-name">${esc(svc.name)}</span><div class="uptime-bar-container"><div class="uptime-bar" style="width:${Math.min(pct, 100)}%;background:${color}"></div></div><span class="uptime-pct">${svc.uptimePercentage}%</span></div>`;
      })
      .join("");
    uptimeHtml = `<section class="section"><h2>90-Day Uptime</h2>${bars}</section>`;
  }

  let historyHtml = "";
  if (pastIncidents.length > 0) {
    const items = pastIncidents
      .map(
        (inc) =>
          `<div class="history-item"><div class="history-header"><span class="impact-badge" style="background:${IMPACT_COLORS[inc.impact] ?? "#6B7280"}">${esc(inc.impact)}</span><span>${esc(inc.title)}</span></div><p class="history-time">${new Date(inc.createdAt).toLocaleDateString()} &mdash; Resolved ${inc.resolvedAt ? new Date(inc.resolvedAt).toLocaleDateString() : "N/A"}</p></div>`,
      )
      .join("");
    historyHtml = `<section class="section"><h2>Incident History</h2>${items}</section>`;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>AIVO System Status</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter','Segoe UI',system-ui,-apple-system,sans-serif;background:#f8f9fc;color:#1a1a2e;line-height:1.6}
.container{max-width:800px;margin:0 auto;padding:24px 16px}
header{text-align:center;padding:40px 0 32px}
.logo{font-size:28px;font-weight:800;color:#7C3AED;letter-spacing:-0.03em}
.logo-sub{font-size:14px;color:#6B7280;margin-top:2px}
.overall-badge{display:inline-block;padding:10px 24px;border-radius:24px;color:${statusInfo.text};background:${statusInfo.bg};font-weight:600;font-size:18px;margin-top:16px}
.section{margin:32px 0}
.section h2{font-size:18px;font-weight:600;margin-bottom:16px;color:#374151;padding-bottom:8px;border-bottom:1px solid #E5E7EB}
.group{background:#fff;border-radius:12px;border:1px solid #E5E7EB;margin-bottom:16px;overflow:hidden}
.group-header{padding:12px 20px;font-weight:600;font-size:14px;color:#6B7280;background:#F9FAFB;border-bottom:1px solid #E5E7EB;text-transform:uppercase;letter-spacing:0.05em}
.group-body{padding:0}
.svc-row{display:flex;justify-content:space-between;align-items:center;padding:12px 20px;border-bottom:1px solid #F3F4F6}
.svc-row:last-child{border-bottom:none}
.svc-name{display:flex;align-items:center;gap:10px;font-weight:500}
.status-dot{width:10px;height:10px;border-radius:50%;display:inline-block;flex-shrink:0}
.svc-meta{display:flex;align-items:center;gap:16px}
.rt{font-size:13px;color:#9CA3AF;min-width:50px;text-align:right}
.status-label{font-size:13px;font-weight:500;min-width:120px;text-align:right}
.incident-card{background:#fff;border-radius:12px;border:1px solid #E5E7EB;padding:20px;margin-bottom:12px}
.incident-header{display:flex;align-items:center;gap:12px}
.incident-header h3{font-size:16px;font-weight:600}
.impact-badge{display:inline-block;padding:2px 10px;border-radius:12px;color:#fff;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em}
.incident-status{font-size:13px;color:#6B7280;margin-top:8px}
.updates{margin-top:12px;padding-top:12px;border-top:1px solid #F3F4F6}
.update-item{margin-bottom:12px}
.update-status{font-weight:600;font-size:13px;color:#374151}
.update-time{font-size:12px;color:#9CA3AF;margin-left:8px}
.update-msg{font-size:14px;color:#4B5563;margin-top:4px}
.maintenance-card{background:#fff;border-radius:12px;border:1px solid #E5E7EB;padding:20px;margin-bottom:12px}
.maintenance-card h3{font-size:16px;font-weight:600;margin-bottom:8px}
.maintenance-time{font-size:13px;color:#6B7280;margin-top:4px}
.maintenance-status{display:inline-block;padding:2px 10px;border-radius:12px;background:#3B82F6;color:#fff;font-size:11px;font-weight:600;margin-top:8px}
.uptime-row{display:flex;align-items:center;gap:12px;margin-bottom:8px}
.uptime-name{width:200px;font-size:14px;font-weight:500;flex-shrink:0}
.uptime-bar-container{flex:1;height:24px;background:#E5E7EB;border-radius:6px;overflow:hidden}
.uptime-bar{height:100%;border-radius:6px;transition:width 0.3s}
.uptime-pct{width:70px;text-align:right;font-size:14px;font-weight:600;flex-shrink:0}
.history-item{background:#fff;border-radius:8px;border:1px solid #E5E7EB;padding:12px 16px;margin-bottom:8px}
.history-header{display:flex;align-items:center;gap:10px;font-size:14px}
.history-time{font-size:12px;color:#9CA3AF;margin-top:4px}
.subscribe-section{background:#fff;border-radius:12px;border:1px solid #E5E7EB;padding:24px;text-align:center;margin:32px 0}
.subscribe-section h2{margin-bottom:8px}
.subscribe-section p{color:#6B7280;font-size:14px;margin-bottom:16px}
.subscribe-form{display:flex;gap:8px;max-width:400px;margin:0 auto}
.subscribe-form input{flex:1;padding:10px 14px;border:1px solid #D1D5DB;border-radius:8px;font-size:14px;outline:none}
.subscribe-form input:focus{border-color:#7C3AED;box-shadow:0 0 0 3px rgba(124,58,237,0.1)}
.subscribe-form button{padding:10px 20px;background:#7C3AED;color:#fff;border:none;border-radius:8px;font-weight:600;font-size:14px;cursor:pointer}
.subscribe-form button:hover{background:#6D28D9}
footer{text-align:center;padding:32px 0;color:#9CA3AF;font-size:13px}
@media(max-width:640px){.uptime-name{width:100px;font-size:12px}.svc-meta{gap:8px}.status-label{min-width:80px;font-size:12px}}
</style>
</head>
<body>
<div class="container">
<header>
<div class="logo">AIVO</div>
<div class="logo-sub">System Status</div>
<div class="overall-badge">${esc(statusInfo.label)}</div>
</header>
<section class="section"><h2>Services</h2>${servicesHtml}</section>
${incidentsHtml}
${maintenanceHtml}
${uptimeHtml}
${historyHtml}
<div class="subscribe-section">
<h2>Subscribe to Updates</h2>
<p>Get notified when we create, update, or resolve incidents.</p>
<form class="subscribe-form" onsubmit="return handleSubscribe(event)">
<input type="email" name="email" placeholder="you@example.com" required>
<button type="submit">Subscribe</button>
</form>
<p id="subscribe-msg" style="margin-top:8px;display:none"></p>
</div>
<footer>&copy; ${new Date().getFullYear()} AIVO Learning. All rights reserved.</footer>
</div>
<script>
function handleSubscribe(e){
e.preventDefault();
var email=e.target.email.value;
var msg=document.getElementById('subscribe-msg');
fetch('/status/subscribers',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:email})})
.then(function(r){return r.json()})
.then(function(d){msg.style.display='block';msg.style.color='#10B981';msg.textContent=d.message||'Subscribed!';e.target.reset()})
.catch(function(){msg.style.display='block';msg.style.color='#EF4444';msg.textContent='Failed to subscribe. Please try again.'});
return false;
}
</script>
</body>
</html>`;
}
