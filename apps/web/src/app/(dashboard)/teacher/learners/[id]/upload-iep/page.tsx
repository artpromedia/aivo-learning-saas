"use client";

import React, { useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Upload,
  FileText,
  CheckCircle,
  X,
} from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PurpleGradientHeader } from "@/components/brand/PurpleGradientHeader";
import { useTranslations } from "next-intl";
import { API_ROUTES } from "@/lib/api-routes";

export default function UploadIepPage() {
  const t = useTranslations("teacher");
  const params = useParams();
  const router = useRouter();
  const learnerId = params.id as string;

  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    setError(null);
    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowed.includes(f.type)) {
      setError(t("invalidFileType"));
      return;
    }
    if (f.size > 20 * 1024 * 1024) {
      setError(t("fileTooLarge"));
      return;
    }
    setFile(f);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFile(droppedFile);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
  }, []);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);

    try {
      const isMock = document.cookie.includes("user_role=");
      if (isMock) {
        await new Promise((r) => setTimeout(r, 2000));
      } else {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch(
          `${API_ROUTES.TEACHER.LEARNER_IEP_UPLOAD(learnerId)}`,
          {
            method: "POST",
            credentials: "include",
            body: formData,
          },
        );

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? `Upload failed: ${res.status}`);
        }
      }

      setSuccess(true);
      setTimeout(() => {
        router.push(`/teacher/learners/${learnerId}`);
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("uploadFailed"));
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (success) {
    return (
      <div>
        <PurpleGradientHeader className="rounded-3xl mb-8">
          <h1 className="text-2xl font-extrabold">{t("uploadIepTitle")}</h1>
        </PurpleGradientHeader>

        <Card className="max-w-lg mx-auto">
          <CardBody className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-green-600" size={32} />
            </div>
            <h3 className="text-lg font-bold text-[var(--aivo-text)] mb-2">
              {t("iepUploadedTitle")}
            </h3>
            <p className="text-[var(--aivo-text-secondary)] mb-6">
              {t("iepUploadedDesc")}
            </p>
            <p className="text-sm text-[#A89BB5]">
              {t("redirecting")}
            </p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PurpleGradientHeader className="rounded-3xl mb-8">
        <Link
          href={`/teacher/learners/${learnerId}`}
          className="inline-flex items-center gap-1 text-white/80 hover:text-white text-sm mb-3 transition-colors"
        >
          <ArrowLeft size={16} />
          {t("backToLearner")}
        </Link>
        <h1 className="text-2xl font-extrabold">{t("uploadIepTitle")}</h1>
        <p className="mt-1 text-white/80">
          {t("uploadIepDesc")}
        </p>
      </PurpleGradientHeader>

      <Card className="max-w-lg mx-auto">
        <CardBody>
          {error && (
            <div className="mb-4 p-3 rounded-2xl bg-[#FFE0E0] dark:bg-[#991B1B]/10 border border-[#FECACA] dark:border-[#991B1B]/30 text-[#991B1B] dark:text-[#F87171] text-sm">
              {error}
            </div>
          )}

          {/* Drop zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`
              border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors
              ${
                dragging
                  ? "border-[#7C3AED] bg-[#7C3AED]/5"
                  : "border-[#E8DDF0] dark:border-[#3D2D5C] hover:border-[#7C3AED] hover:bg-[#7C3AED]/5"
              }
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-full bg-[#7C3AED]/10 flex items-center justify-center mx-auto mb-3">
              <Upload className="text-[#7C3AED]" size={24} />
            </div>
            <p className="text-sm font-medium text-[var(--aivo-text)]">
              {t("dragDropIep")}
            </p>
            <p className="text-xs text-[var(--aivo-text-secondary)] mt-1">
              {t("orClickToBrowse")}
            </p>
          </div>

          {/* Selected file */}
          {file && (
            <div className="mt-4 flex items-center gap-3 p-3 bg-[var(--aivo-bg)] rounded-2xl">
              <FileText size={20} className="text-[#7C3AED] shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--aivo-text)] dark:text-[#C4B5D0] truncate">
                  {file.name}
                </p>
                <p className="text-xs text-[var(--aivo-text-secondary)]">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile();
                }}
                className="text-[var(--aivo-text-muted)] hover:text-red-500 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 mt-6">
            <Link href={`/teacher/learners/${learnerId}`}>
              <Button variant="ghost" size="sm">
                {t("cancel")}
              </Button>
            </Link>
            <Button
              size="sm"
              disabled={!file}
              loading={uploading}
              leftIcon={<Upload size={14} />}
              onClick={handleUpload}
            >
              {t("uploadIep")}
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
