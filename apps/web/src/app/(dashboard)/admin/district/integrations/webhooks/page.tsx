"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Trash2,
  Send,
  Webhook,
} from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { PurpleGradientHeader } from "@/components/brand/PurpleGradientHeader";
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
      setError(err instanceof Error ? err.message : "Failed to load webhooks");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEndpoints();
  }, [fetchEndpoints]);

  async function handleCreate() {
    setCreating(true);
    try {
      await apiFetch("/api/integrations/webhooks", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setShowCreateModal(false);
      setForm({ url: "", eventTypes: [], description: "" });
      await fetchEndpoints();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create webhook");
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
      setError(err instanceof Error ? err.message : "Failed to delete webhook");
    }
  }

  async function handleTest(id: string) {
    try {
      await apiFetch(`/api/integrations/webhooks/${id}/test`, { method: "POST" });
      if (selectedEndpoint === id) await fetchDeliveries(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Test failed");
    }
  }

  async function fetchDeliveries(endpointId: string) {
    setLoadingDeliveries(true);
    try {
      const result = await apiFetch<{ items: WebhookDelivery[] }>(
        `/api/integrations/webhooks/${endpointId}/deliveries`,
      );
      setDeliveries(result.items ?? []);
      setSelectedEndpoint(endpointId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load deliveries");
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
      case "DELIVERED":
        return <Badge variant="success">Delivered</Badge>;
      case "FAILED":
        return <Badge variant="error">Failed</Badge>;
      case "RETRYING":
        return <Badge variant="warning">Retrying</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  return (
    <div>
      <Link
        href="/admin/district/integrations"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 mb-4"
      >
        <ArrowLeft size={16} />
        Back to Integrations
      </Link>

      <PurpleGradientHeader className="rounded-xl mb-8">
        <h1 className="text-2xl font-bold">Outbound Webhooks</h1>
        <p className="mt-1 text-white/80">
          Manage webhook endpoints and view delivery logs.
        </p>
      </PurpleGradientHeader>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="mb-6">
        <Button leftIcon={<Plus size={16} />} onClick={() => setShowCreateModal(true)}>
          Register Endpoint
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Skeleton key={i} height={100} className="w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {endpoints.length === 0 ? (
            <Card>
              <CardBody>
                <div className="text-center py-8">
                  <Webhook size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                  <p className="text-gray-500">No webhook endpoints registered.</p>
                </div>
              </CardBody>
            </Card>
          ) : (
            endpoints.map((endpoint) => (
              <Card key={endpoint.id} className={selectedEndpoint === endpoint.id ? "ring-2 ring-[#7C3AED]" : ""}>
                <CardBody>
                  <div className="flex items-start justify-between">
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => fetchDeliveries(endpoint.id)}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-mono text-gray-900 dark:text-white">
                          {endpoint.url}
                        </p>
                        <Badge variant={endpoint.enabled ? "success" : "secondary"}>
                          {endpoint.enabled ? "Active" : "Disabled"}
                        </Badge>
                      </div>
                      {endpoint.description && (
                        <p className="text-xs text-gray-500 mb-2">{endpoint.description}</p>
                      )}
                      <div className="flex flex-wrap gap-1">
                        {endpoint.eventTypes.map((et) => (
                          <Badge key={et} variant="secondary">{et}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button size="sm" variant="outline" onClick={() => handleTest(endpoint.id)}>
                        <Send size={14} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(endpoint.id)}
                        className="text-red-500"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Delivery Log */}
      {selectedEndpoint && (
        <Card className="mt-6">
          <CardBody>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Recent Deliveries
            </h2>
            {loadingDeliveries ? (
              <Skeleton height={100} className="w-full rounded-lg" />
            ) : deliveries.length === 0 ? (
              <p className="text-sm text-gray-500 py-4 text-center">No deliveries yet.</p>
            ) : (
              <div className="space-y-2">
                {deliveries.map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center gap-4 p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    {d.status === "DELIVERED" ? (
                      <CheckCircle size={16} className="text-green-500" />
                    ) : d.status === "FAILED" ? (
                      <XCircle size={16} className="text-red-500" />
                    ) : (
                      <Clock size={16} className="text-yellow-500" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono">{d.eventType}</span>
                        {deliveryStatusBadge(d.status)}
                        {d.httpStatus && (
                          <span className="text-xs text-gray-400">HTTP {d.httpStatus}</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400">
                        {new Date(d.createdAt).toLocaleString()} — {d.attempts} attempt(s)
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      )}

      <Modal
        open={showCreateModal}
        onClose={() => !creating && setShowCreateModal(false)}
        title="Register Webhook Endpoint"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowCreateModal(false)} disabled={creating}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              loading={creating}
              disabled={!form.url || form.eventTypes.length === 0}
            >
              Register
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Endpoint URL
            </label>
            <input
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              placeholder="https://your-server.com/webhooks/aivo"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description (optional)
            </label>
            <input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="e.g., District data warehouse"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Event Types
            </label>
            <div className="space-y-2">
              {AVAILABLE_EVENT_TYPES.map((et) => (
                <label key={et} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.eventTypes.includes(et)}
                    onChange={() => toggleEventType(et)}
                    className="w-4 h-4 rounded border-gray-300 text-[#7C3AED] focus:ring-[#7C3AED]"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300 font-mono">{et}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
