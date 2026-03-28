"use client";

import React, { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText, CheckCircle, Loader2, X, AlertCircle, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { apiFetch, assessmentApiFetch } from "@/lib/api";
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
      setError("Please upload a PDF file.");
      return;
    }
    if (f.size > 20 * 1024 * 1024) {
      setError("File size must be under 20MB.");
      return;
    }

    setFile(f);
    setError(null);
    setStatus("uploading");

    try {
      const formData = new FormData();
      formData.append("file", f);

      const uploadRes = await fetch(
        `${process.env.NEXT_PUBLIC_ASSESSMENT_API_URL ?? "http://localhost:3012"}${API_ROUTES.ONBOARDING.IEP_UPLOAD}`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        },
      );

      if (!uploadRes.ok) {
        const body = await uploadRes.json().catch(() => ({}));
        throw new Error(body.error ?? "Upload failed");
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
            throw new Error(statusRes.error ?? "Parsing failed");
          }
        } catch (err) {
          if (attempts === maxAttempts) throw err;
        }
      }
      throw new Error("Parsing timed out. Please try again.");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Upload failed");
    }
  }, []);

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
      setError(err instanceof Error ? err.message : "Failed to confirm IEP data");
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Upload IEP Document
        </h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Upload your child&apos;s IEP to help us better understand their needs.
          This is optional.
        </p>
      </div>

      {(status === "idle" || status === "error") && (
        <Card>
          <CardBody>
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm flex items-center gap-2">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
                isDragging
                  ? "border-[#7C3AED] bg-[#7C3AED]/5"
                  : "border-gray-300 dark:border-gray-600 hover:border-[#7C3AED] hover:bg-gray-50 dark:hover:bg-gray-800/50"
              }`}
            >
              <Upload
                className={`mx-auto mb-4 ${isDragging ? "text-[#7C3AED]" : "text-gray-400"}`}
                size={40}
              />
              <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-1">
                Drag and drop your IEP here
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                or click to browse. PDF files up to 20MB.
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
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={handleSkip}
                className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 font-medium"
              >
                <SkipForward size={16} />
                Skip this step
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
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {status === "uploading" ? "Uploading document..." : "Analyzing IEP..."}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {status === "uploading"
                ? `Uploading ${file?.name}`
                : "Our AI is reading and extracting key information from your child's IEP. This may take a minute."}
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
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  IEP Analyzed Successfully
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Review the extracted information below. You can edit before confirming.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {parsedData.goals.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                    IEP Goals
                  </h3>
                  <div className="space-y-2">
                    {parsedData.goals.map((goal, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                      >
                        <span className="text-xs font-medium text-[#7C3AED] uppercase">
                          {goal.area}
                        </span>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                          {goal.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {parsedData.accommodations.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                    Accommodations
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {parsedData.accommodations.map((acc, i) => (
                      <span
                        key={i}
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
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                    Strengths
                  </h3>
                  <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    {parsedData.strengths.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button variant="ghost" onClick={resetUpload} leftIcon={<X size={16} />}>
                Re-upload
              </Button>
              <div className="flex-1" />
              <Button variant="outline" onClick={handleSkip}>
                Skip
              </Button>
              <Button onClick={handleConfirm} loading={isConfirming}>
                Confirm & Continue
              </Button>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
