"use client";

import React, { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Upload, FileText, CheckCircle, Loader2, X, AlertCircle, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { assessmentApiFetch } from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";

type UploadStatus = "idle" | "uploading" | "parsing" | "parsed" | "error";

interface ParsedIepData {
  goals: { area: string; description: string }[];
  accommodations: string[];
  services: string[];
  strengths: string[];
  concerns: string[];
}

export default function IepUploadPage() {
  const router = useRouter();
  const t = useTranslations("onboarding");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [uploadId, setUploadId] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<ParsedIepData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const handleFile = useCallback(async (f: File) => {
    if (!f.type.includes("pdf") && !f.name.endsWith(".pdf")) {
      setError(t("pdfOnly"));
      return;
    }
    if (f.size > 20 * 1024 * 1024) {
      setError(t("fileTooLarge"));
      return;
    }

    setFile(f);
    setError(null);
    setStatus("uploading");

    try {
      const formData = new FormData();
      formData.append("file", f);

      const uploadRes = await fetch(
        `/api${API_ROUTES.ONBOARDING.IEP_UPLOAD}`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        },
      );

      if (!uploadRes.ok) {
        const body = await uploadRes.json().catch(() => ({}));
        throw new Error(body.error ?? t("uploadFailed"));
      }

      const { id } = await uploadRes.json();
      setUploadId(id);
      setStatus("parsing");

      // Poll for parsing status
      let attempts = 0;
      const maxAttempts = 30;
      while (attempts < maxAttempts) {
        await new Promise((r) => setTimeout(r, 2000));
        attempts++;

        try {
          const statusRes = await assessmentApiFetch<{
            status: "processing" | "completed" | "error";
            data?: ParsedIepData;
            error?: string;
          }>(API_ROUTES.ONBOARDING.IEP_STATUS(id));

          if (statusRes.status === "completed" && statusRes.data) {
            setParsedData(statusRes.data);
            setStatus("parsed");
            return;
          }
          if (statusRes.status === "error") {
            throw new Error(statusRes.error ?? t("parsingFailed"));
          }
        } catch (err) {
          if (attempts === maxAttempts) throw err;
        }
      }
      throw new Error(t("parsingTimedOut"));
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : t("uploadFailed"));
    }
  }, [t]);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile],
  );

  const handleConfirm = async () => {
    if (!uploadId) return;
    setIsConfirming(true);
    try {
      await assessmentApiFetch(API_ROUTES.ONBOARDING.IEP_CONFIRM(uploadId), {
        method: "POST",
        body: JSON.stringify({ data: parsedData }),
      });
      router.push("/baseline-assessment");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("failedToConfirmIep"));
    } finally {
      setIsConfirming(false);
    }
  };

  const handleSkip = () => {
    router.push("/baseline-assessment");
  };

  const resetUpload = () => {
    setFile(null);
    setStatus("idle");
    setUploadId(null);
    setParsedData(null);
    setError(null);
  };

  return (
    <div>
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-[#7C3AED]/10 flex items-center justify-center mx-auto mb-4">
          <FileText className="text-[#7C3AED]" size={32} />
        </div>
        <h1 className="text-2xl font-extrabold text-(--aivo-text)">
          {t("uploadIepDocument")}
        </h1>
        <p className="mt-2 text-(--aivo-text-secondary)">
          {t("uploadIepSubtitle")}
        </p>
      </div>

      {(status === "idle" || status === "error") && (
        <Card>
          <CardBody>
            {error && (
              <div className="mb-4 p-3 rounded-2xl bg-[#FFE0E0] dark:bg-[#991B1B]/10 border border-[#FECACA] dark:border-[#991B1B]/30 text-[#991B1B] dark:text-[#F87171] text-sm flex items-center gap-2">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <button
              type="button"
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`w-full border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-colors ${
                isDragging
                  ? "border-[#7C3AED] bg-[#7C3AED]/5"
                  : "border-[#E8DDF0] dark:border-[#3D2D5C] hover:border-[#7C3AED] hover:bg-(--aivo-bg) dark:hover:bg-[#2A1E45]/50"
              }`}
            >
              <Upload
                className={`mx-auto mb-4 ${isDragging ? "text-[#7C3AED]" : "text-[#A89BB5]"}`}
                size={40}
              />
              <p className="text-lg font-medium text-(--aivo-text) mb-1">
                {t("dragDropIep")}
              </p>
              <p className="text-sm text-(--aivo-text-secondary)">
                {t("browseFiles")}
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
              />
            </button>

            <div className="mt-6 text-center">
              <button
                onClick={handleSkip}
                className="inline-flex items-center gap-2 text-sm text-(--aivo-text-secondary) hover:text-(--aivo-text) dark:text-(--aivo-text-muted) dark:hover:text-[#A89BB5] font-medium"
              >
                <SkipForward size={16} />
                {t("skipThisStep")}
              </button>
            </div>
          </CardBody>
        </Card>
      )}

      {(status === "uploading" || status === "parsing") && (
        <Card>
          <CardBody className="text-center py-12">
            <Loader2
              className="mx-auto mb-4 text-[#7C3AED] animate-spin"
              size={48}
            />
            <h2 className="text-lg font-bold text-(--aivo-text) mb-2">
              {status === "uploading" ? t("uploadingDocument") : t("analyzingIep")}
            </h2>
            <p className="text-sm text-(--aivo-text-secondary)">
              {status === "uploading"
                ? t("uploadingFile", { name: file?.name ?? "" })
                : t("aiAnalyzingIep")}
            </p>
          </CardBody>
        </Card>
      )}

      {status === "parsed" && parsedData && (
        <Card>
          <CardBody>
            <div className="flex items-center gap-3 mb-6">
              <CheckCircle className="text-green-500" size={24} />
              <div>
                <h2 className="text-lg font-bold text-(--aivo-text)">
                  {t("iepAnalyzedSuccessfully")}
                </h2>
                <p className="text-sm text-(--aivo-text-secondary)">
                  {t("reviewExtractedInfo")}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {parsedData.goals.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-(--aivo-text) mb-2 uppercase tracking-wide">
                    {t("iepGoals")}
                  </h3>
                  <div className="space-y-2">
                    {parsedData.goals.map((goal) => (
                      <div
                        key={`${goal.area}-${goal.description}`}
                        className="p-3 rounded-2xl bg-(--aivo-bg) border border-[#E8DDF0] dark:border-[#3D2D5C]"
                      >
                        <span className="text-xs font-medium text-[#7C3AED] uppercase">
                          {goal.area}
                        </span>
                        <p className="text-sm text-(--aivo-text) mt-1">
                          {goal.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {parsedData.accommodations.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-(--aivo-text) mb-2 uppercase tracking-wide">
                    {t("accommodations")}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {parsedData.accommodations.map((acc) => (
                      <span
                        key={acc}
                        className="px-3 py-1 rounded-full text-sm bg-[#7C3AED]/10 text-[#7C3AED] font-medium"
                      >
                        {acc}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {parsedData.strengths.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-(--aivo-text) mb-2 uppercase tracking-wide">
                    {t("strengths")}
                  </h3>
                  <ul className="list-disc list-inside text-sm text-(--aivo-text-secondary) space-y-1">
                    {parsedData.strengths.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 mt-8 pt-6 border-t border-[#E8DDF0] dark:border-[#3D2D5C]">
              <Button variant="ghost" onClick={resetUpload} leftIcon={<X size={16} />}>
                {t("reUpload")}
              </Button>
              <div className="flex-1" />
              <Button variant="outline" onClick={handleSkip}>
                {t("skip")}
              </Button>
              <Button onClick={handleConfirm} loading={isConfirming}>
                {t("confirmAndContinue")}
              </Button>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
