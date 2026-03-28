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

export default function UploadIepPage() {
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
      setError("Please upload a PDF or Word document (.pdf, .doc, .docx).");
      return;
    }
    if (f.size > 20 * 1024 * 1024) {
      setError("File size must be under 20 MB.");
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
      const formData = new FormData();
      formData.append("file", file);

      const API_BASE =
        process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
      const res = await fetch(
        `${API_BASE}/api/teacher/learners/${learnerId}/iep`,
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

      setSuccess(true);
      setTimeout(() => {
        router.push(`/teacher/learners/${learnerId}`);
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
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
        <PurpleGradientHeader className="rounded-xl mb-8">
          <h1 className="text-2xl font-bold">Upload IEP</h1>
        </PurpleGradientHeader>

        <Card className="max-w-lg mx-auto">
          <CardBody className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-green-600" size={32} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              IEP Uploaded Successfully
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              IEP uploaded. The parent will be asked to review and confirm.
            </p>
            <p className="text-sm text-gray-400">
              Redirecting back to learner view...
            </p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PurpleGradientHeader className="rounded-xl mb-8">
        <Link
          href={`/teacher/learners/${learnerId}`}
          className="inline-flex items-center gap-1 text-white/80 hover:text-white text-sm mb-3 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Learner
        </Link>
        <h1 className="text-2xl font-bold">Upload IEP</h1>
        <p className="mt-1 text-white/80">
          Upload an IEP document for review.
        </p>
      </PurpleGradientHeader>

      <Card className="max-w-lg mx-auto">
        <CardBody>
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
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
              border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
              ${
                dragging
                  ? "border-[#7C3AED] bg-[#7C3AED]/5"
                  : "border-gray-300 dark:border-gray-600 hover:border-[#7C3AED] hover:bg-[#7C3AED]/5"
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
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Drag and drop your IEP file here
            </p>
            <p className="text-xs text-gray-500 mt-1">
              or click to browse. PDF, DOC, DOCX up to 20 MB.
            </p>
          </div>

          {/* Selected file */}
          {file && (
            <div className="mt-4 flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <FileText size={20} className="text-[#7C3AED] shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                  {file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile();
                }}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 mt-6">
            <Link href={`/teacher/learners/${learnerId}`}>
              <Button variant="ghost" size="sm">
                Cancel
              </Button>
            </Link>
            <Button
              size="sm"
              disabled={!file}
              loading={uploading}
              leftIcon={<Upload size={14} />}
              onClick={handleUpload}
            >
              Upload IEP
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
