"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Plus, CheckCircle, XCircle, Trash2, ExternalLink, Key,
} from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { PurpleGradientHeader } from "@/components/brand/PurpleGradientHeader";
import { PageWrapper, BackLink, EmptyState, AnimatedCard } from "@/components/ui/PageDesign";
import { apiFetch } from "@/lib/api";

interface LtiPlatform {
  id: string;
  name: string;
  platformId: string;
  clientId: string;
  deploymentId?: string;
  authLoginUrl: string;
  authTokenUrl: string;
  jwksUrl: string;
  enabled: boolean;
  createdAt: string;
}

interface NewPlatformForm {
  name: string;
  platformId: string;
  clientId: string;
  deploymentId: string;
  authLoginUrl: string;
  authTokenUrl: string;
  jwksUrl: string;
}

const EMPTY_FORM: NewPlatformForm = {
  name: "", platformId: "", clientId: "", deploymentId: "", authLoginUrl: "", authTokenUrl: "", jwksUrl: "",
};

export default function LtiConfigPage() {
  const [platforms, setPlatforms] = useState<LtiPlatform[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [form, setForm] = useState<NewPlatformForm>(EMPTY_FORM);
  const [registering, setRegistering] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, "success" | "failed">>({});

  const fetchPlatforms = useCallback(async () => {
    try {
      const result = await apiFetch<{ platforms: LtiPlatform[] }>("/api/integrations/lti/platforms");
      setPlatforms(result.platforms ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load LTI platforms");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPlatforms(); }, [fetchPlatforms]);

  async function handleRegister() {
    setRegistering(true);
    setError(null);
    try {
      await apiFetch("/api/integrations/lti/platforms", { method: "POST", body: JSON.stringify(form) });
      setShowRegisterModal(false);
      setForm(EMPTY_FORM);
      await fetchPlatforms();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to register platform");
    } finally {
      setRegistering(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await apiFetch(`/api/integrations/lti/platforms/${id}`, { method: "DELETE" });
      await fetchPlatforms();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete platform");
    }
  }

  async function handleTestConnection(id: string) {
    setTesting(id);
    try {
      const result = await apiFetch<{ success: boolean }>(`/api/integrations/lti/platforms/${id}/test`, { method: "POST" });
      setTestResults((prev) => ({ ...prev, [id]: result.success ? "success" : "failed" }));
    } catch {
      setTestResults((prev) => ({ ...prev, [id]: "failed" }));
    } finally {
      setTesting(null);
    }
  }

  const inputClass =
    "w-full px-4 py-2.5 rounded-3xl border border-[#E8DDF0] dark:border-[#3D2D5C] bg-white dark:bg-[#2A1E45] text-[var(--aivo-text)] focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent outline-none text-sm";

  return (
    <PageWrapper>
      <BackLink href="/admin/district/integrations">Back to Integrations</BackLink>

      <PurpleGradientHeader className="rounded-3xl mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/20">
            <Key size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">LTI 1.3 Configuration</h1>
            <p className="mt-0.5 text-white/80 text-sm">Register and manage LTI platform connections</p>
          </div>
        </div>
      </PurpleGradientHeader>

      {error && (
        <div className="mb-6 p-4 rounded-3xl bg-[#FFE0E0] dark:bg-[#991B1B]/10 border border-[#FECACA] dark:border-[#991B1B]/30 text-[#991B1B] dark:text-[#F87171]">
          {error}
        </div>
      )}

      <div className="mb-6">
        <Button leftIcon={<Plus size={16} />} onClick={() => setShowRegisterModal(true)}>
          Register Platform
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (<Skeleton key={i} height={120} className="w-full rounded-3xl" />))}
        </div>
      ) : platforms.length === 0 ? (
        <EmptyState
          icon={<Key size={32} />}
          title="No LTI platforms registered"
          description="Register one to enable LTI 1.3 launches."
          delay={200}
        />
      ) : (
        <div className="space-y-4">
          {platforms.map((platform, idx) => (
            <AnimatedCard key={platform.id} delay={200 + idx * 80}>
              <Card>
                <CardBody>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold" style={{ color: "var(--aivo-text)" }}>{platform.name}</h3>
                        <Badge variant={platform.enabled ? "success" : "secondary"}>
                          {platform.enabled ? "Active" : "Disabled"}
                        </Badge>
                        {testResults[platform.id] === "success" && <Badge variant="success">Connection OK</Badge>}
                        {testResults[platform.id] === "failed" && <Badge variant="error">Connection Failed</Badge>}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm" style={{ color: "var(--aivo-text-secondary)" }}>
                        <p><span className="font-medium">Issuer:</span> {platform.platformId}</p>
                        <p><span className="font-medium">Client ID:</span> {platform.clientId}</p>
                        <p className="flex items-center gap-1">
                          <span className="font-medium">JWKS:</span>
                          <span className="truncate">{platform.jwksUrl}</span>
                          <ExternalLink size={12} className="shrink-0" />
                        </p>
                        <p><span className="font-medium">Registered:</span> {new Date(platform.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button size="sm" variant="outline" onClick={() => handleTestConnection(platform.id)} loading={testing === platform.id}>Test</Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(platform.id)} className="text-red-500 hover:text-red-700">
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </AnimatedCard>
          ))}
        </div>
      )}

      <Modal
        open={showRegisterModal}
        onClose={() => { if (!registering) { setShowRegisterModal(false); setForm(EMPTY_FORM); } }}
        title="Register LTI Platform"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowRegisterModal(false)} disabled={registering}>Cancel</Button>
            <Button onClick={handleRegister} loading={registering} disabled={!form.name || !form.platformId || !form.clientId || !form.jwksUrl}>Register</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--aivo-text)" }}>Platform Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g., Canvas, Schoology" className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--aivo-text)" }}>Issuer URL (Platform ID)</label>
            <input value={form.platformId} onChange={(e) => setForm({ ...form, platformId: e.target.value })} placeholder="https://canvas.instructure.com" className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--aivo-text)" }}>Client ID</label>
              <input value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })} placeholder="10000000000001" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--aivo-text)" }}>Deployment ID (optional)</label>
              <input value={form.deploymentId} onChange={(e) => setForm({ ...form, deploymentId: e.target.value })} placeholder="1" className={inputClass} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--aivo-text)" }}>Auth Login URL</label>
            <input value={form.authLoginUrl} onChange={(e) => setForm({ ...form, authLoginUrl: e.target.value })} placeholder="https://sso.canvaslms.com/api/lti/authorize_redirect" className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--aivo-text)" }}>Auth Token URL</label>
            <input value={form.authTokenUrl} onChange={(e) => setForm({ ...form, authTokenUrl: e.target.value })} placeholder="https://sso.canvaslms.com/login/oauth2/token" className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--aivo-text)" }}>JSON Web Key Set URL</label>
            <input value={form.jwksUrl} onChange={(e) => setForm({ ...form, jwksUrl: e.target.value })} placeholder="https://sso.canvaslms.com/api/lti/security/jwks" className={inputClass} />
          </div>
        </div>
      </Modal>
    </PageWrapper>
  );
}
