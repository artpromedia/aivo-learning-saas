"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Plus, CheckCircle, XCircle, Clock, RefreshCw, Trash2, Send, Webhook,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { PurpleGradientHeader } from "@/components/brand/PurpleGradientHeader";
import { PageWrapper, BackLink, ExpandableCard, EmptyState, AnimatedCard } from "@/components/ui/PageDesign";
import { apiFetch } from "@/lib/api";

interface WebhookEndpoint {
  id: string;
  url: string;
  eventTypes: string[];
  enabled: boolean;
  description?: string;
  createdAt: string;
}

interface WebhookDelivery {
  id: string;
  eventType: string;
  status: "PENDING" | "DELIVERED" | "FAILED" | "RETRYING";
  httpStatus?: number;
  attempts: number;
  createdAt: string;
  deliveredAt?: string;
}

interface NewWebhookForm {
  url: string;
  eventTypes: string[];
  description: string;
}

const AVAILABLE_EVENT_TYPES = [
  "learner.session.completed",
  "learner.mastery.updated",
  "brain.recommendation.created",
  "iep.goal.met",
];

export default function WebhooksPage() {
  const t = useTranslations("districtAdmin");
  const [endpoints, setEndpoints] = useState<WebhookEndpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [form, setForm] = useState<NewWebhookForm>({ url: "", eventTypes: [], description: "" });
  const [creating, setCreating] = useState(false);
  const [selectedEndpoint, setSelectedEndpoint] = useState<string | null>(null);
  const [deliveries, setDeliveries] = useState<WebhookDelivery[]>([]);
  const [loadingDeliveries, setLoadingDeliveries] = useState(false);

  const fetchEndpoints = useCallback(async () => {
    try {
      const result = await apiFetch<WebhookEndpoint[]>("/api/integrations/webhooks");
      setEndpoints(result ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("failedToLoadWebhooks"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEndpoints(); }, [fetchEndpoints]);

  async function handleCreate() {
    setCreating(true);
    try {
      await apiFetch("/api/integrations/webhooks", { method: "POST", body: JSON.stringify(form) });
      setShowCreateModal(false);
      setForm({ url: "", eventTypes: [], description: "" });
      await fetchEndpoints();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("failedToCreateWebhook"));
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await apiFetch(`/api/integrations/webhooks/${id}`, { method: "DELETE" });
      await fetchEndpoints();
      if (selectedEndpoint === id) setSelectedEndpoint(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("failedToDeleteWebhook"));
    }
  }

  async function handleTest(id: string) {
    try {
      await apiFetch(`/api/integrations/webhooks/${id}/test`, { method: "POST" });
      if (selectedEndpoint === id) await fetchDeliveries(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("testFailed"));
    }
  }

  async function fetchDeliveries(endpointId: string) {
    setLoadingDeliveries(true);
    try {
      const result = await apiFetch<{ items: WebhookDelivery[] }>(`/api/integrations/webhooks/${endpointId}/deliveries`);
      setDeliveries(result.items ?? []);
      setSelectedEndpoint(endpointId);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("failedToLoadDeliveries"));
    } finally {
      setLoadingDeliveries(false);
    }
  }

  function toggleEventType(eventType: string) {
    setForm((prev) => ({
      ...prev,
      eventTypes: prev.eventTypes.includes(eventType)
        ? prev.eventTypes.filter((t) => t !== eventType)
        : [...prev.eventTypes, eventType],
    }));
  }

  const deliveryStatusBadge = (status: string) => {
    switch (status) {
      case "DELIVERED": return <Badge variant="success">{t("delivered")}</Badge>;
      case "FAILED": return <Badge variant="error">{t("failed")}</Badge>;
      case "RETRYING": return <Badge variant="warning">{t("retrying")}</Badge>;
      default: return <Badge variant="secondary">{t("pending")}</Badge>;
    }
  };

  return (
    <PageWrapper>
      <BackLink href="/admin/district/integrations">{t("backToIntegrations")}</BackLink>

      <PurpleGradientHeader className="rounded-3xl mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/20">
            <Webhook size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">{t("webhooksTitle")}</h1>
            <p className="mt-0.5 text-white/80 text-sm">{t("webhooksSubtitle")}</p>
          </div>
        </div>
      </PurpleGradientHeader>

      {error && (
        <div className="mb-6 p-4 rounded-3xl bg-[#FFE0E0] dark:bg-[#991B1B]/10 border border-[#FECACA] dark:border-[#991B1B]/30 text-[#991B1B] dark:text-[#F87171]">
          {error}
        </div>
      )}

      <div className="mb-6">
        <Button leftIcon={<Plus size={16} />} onClick={() => setShowCreateModal(true)}>{t("registerEndpoint")}</Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (<Skeleton key={i} height={100} className="w-full rounded-3xl" />))}
        </div>
      ) : endpoints.length === 0 ? (
        <EmptyState
          icon={<Webhook size={32} />}
          title={t("noWebhookEndpoints")}
          description={t("noWebhookEndpointsDescription")}
          delay={200}
        />
      ) : (
        <div className="space-y-4">
          {endpoints.map((endpoint, idx) => (
            <AnimatedCard key={endpoint.id} delay={200 + idx * 80}>
              <Card className={selectedEndpoint === endpoint.id ? "ring-2 ring-[#7C3AED]" : ""}>
                <CardBody>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 cursor-pointer" onClick={() => fetchDeliveries(endpoint.id)}>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-mono" style={{ color: "var(--aivo-text)" }}>{endpoint.url}</p>
                        <Badge variant={endpoint.enabled ? "success" : "secondary"}>
                          {endpoint.enabled ? t("active") : t("disabled")}
                        </Badge>
                      </div>
                      {endpoint.description && (
                        <p className="text-xs mb-2" style={{ color: "var(--aivo-text-secondary)" }}>{endpoint.description}</p>
                      )}
                      <div className="flex flex-wrap gap-1">
                        {endpoint.eventTypes.map((et) => (<Badge key={et} variant="secondary">{et}</Badge>))}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button size="sm" variant="outline" onClick={() => handleTest(endpoint.id)}><Send size={14} /></Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(endpoint.id)} className="text-red-500"><Trash2 size={14} /></Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </AnimatedCard>
          ))}
        </div>
      )}

      {selectedEndpoint && (
        <div className="mt-6">
          <ExpandableCard
            icon={<Clock size={16} />}
            title={t("recentDeliveries")}
            subtitle={t("recentDeliveriesSubtitle")}
            gradient="linear-gradient(135deg, #6B7280, #4B5563)"
            delay={400}
          >
            {loadingDeliveries ? (
              <Skeleton height={100} className="w-full rounded-3xl" />
            ) : deliveries.length === 0 ? (
              <p className="text-sm py-4 text-center" style={{ color: "var(--aivo-text-secondary)" }}>{t("noDeliveriesYet")}</p>
            ) : (
              <div className="space-y-2">
                {deliveries.map((d) => (
                  <div key={d.id} className="flex items-center gap-4 p-3 border border-[#E8DDF0] dark:border-[#3D2D5C] rounded-3xl">
                    {d.status === "DELIVERED" ? <CheckCircle size={16} className="text-green-500" /> : d.status === "FAILED" ? <XCircle size={16} className="text-red-500" /> : <Clock size={16} className="text-yellow-500" />}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono">{d.eventType}</span>
                        {deliveryStatusBadge(d.status)}
                        {d.httpStatus && <span className="text-xs text-[#A89BB5]">{t("httpStatus", { status: d.httpStatus })}</span>}
                      </div>
                      <p className="text-xs text-[#A89BB5]">{new Date(d.createdAt).toLocaleString()} — {t("attempts", { count: d.attempts })}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ExpandableCard>
        </div>
      )}

      <Modal
        open={showCreateModal}
        onClose={() => !creating && setShowCreateModal(false)}
        title={t("registerWebhookModal")}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowCreateModal(false)} disabled={creating}>{t("cancel")}</Button>
            <Button onClick={handleCreate} loading={creating} disabled={!form.url || form.eventTypes.length === 0}>{t("register")}</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--aivo-text)" }}>{t("endpointUrlLabel")}</label>
            <input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder={t("endpointUrlPlaceholder")}
              className="w-full px-4 py-2.5 rounded-3xl border border-[#E8DDF0] dark:border-[#3D2D5C] bg-white dark:bg-[#2A1E45] text-[var(--aivo-text)] focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent outline-none text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--aivo-text)" }}>{t("descriptionOptionalLabel")}</label>
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder={t("descriptionPlaceholder")}
              className="w-full px-4 py-2.5 rounded-3xl border border-[#E8DDF0] dark:border-[#3D2D5C] bg-white dark:bg-[#2A1E45] text-[var(--aivo-text)] focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent outline-none text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--aivo-text)" }}>{t("eventTypesLabel")}</label>
            <div className="space-y-2">
              {AVAILABLE_EVENT_TYPES.map((et) => (
                <label key={et} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.eventTypes.includes(et)} onChange={() => toggleEventType(et)} className="w-4 h-4 rounded border-[#E8DDF0] text-[#7C3AED] focus:ring-[#7C3AED]" />
                  <span className="text-sm font-mono" style={{ color: "var(--aivo-text)" }}>{et}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </PageWrapper>
  );
}
