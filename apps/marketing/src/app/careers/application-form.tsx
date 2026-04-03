"use client";

import { useState, useRef, type FormEvent } from "react";
import { Upload, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

interface ApplicationFormProps {
  positions: { id: string; title: string }[];
}

type FormStatus = "idle" | "submitting" | "success" | "error";

const API_URL =
  process.env.NEXT_PUBLIC_COMMS_API_URL ?? "http://localhost:3007";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export function ApplicationForm({ positions }: ApplicationFormProps) {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [fileName, setFileName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    const form = e.currentTarget;
    const formData = new FormData(form);

    // Client-side file validation
    const file = formData.get("resume") as File | null;
    if (!file || file.size === 0) {
      setStatus("error");
      setErrorMessage("Please attach your resume.");
      return;
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      setStatus("error");
      setErrorMessage("Only PDF and Word documents (.pdf, .doc, .docx) are accepted.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setStatus("error");
      setErrorMessage("File size must be under 5 MB.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/comms/careers/apply`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(
          body?.error ?? `Request failed with status ${res.status}`
        );
      }

      setStatus("success");
      form.reset();
      setFileName("");
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setFileName(file?.name ?? "");
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-10 text-center">
        <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
        <h3 className="mt-4 text-xl font-bold text-green-800">
          Application Received!
        </h3>
        <p className="mt-2 text-green-700">
          Thank you for your interest in joining AIVO. We&apos;ll review your
          application and get back to you within 5 business days.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-6 inline-flex items-center rounded-lg bg-green-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-green-700"
        >
          Submit Another Application
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-aivo-navy-100 bg-white p-8 shadow-sm"
    >
      {/* Name */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-semibold text-aivo-navy-700"
        >
          Full Name <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          minLength={2}
          maxLength={200}
          placeholder="Your full name"
          className="mt-2 block w-full rounded-lg border border-aivo-navy-200 bg-white px-4 py-3 text-sm text-aivo-navy-800 placeholder-aivo-navy-300 outline-none transition-colors focus:border-aivo-purple-400 focus:ring-2 focus:ring-aivo-purple-100"
        />
      </div>

      {/* Email */}
      <div className="mt-6">
        <label
          htmlFor="email"
          className="block text-sm font-semibold text-aivo-navy-700"
        >
          Email Address <span className="text-red-500">*</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          maxLength={320}
          placeholder="you@example.com"
          className="mt-2 block w-full rounded-lg border border-aivo-navy-200 bg-white px-4 py-3 text-sm text-aivo-navy-800 placeholder-aivo-navy-300 outline-none transition-colors focus:border-aivo-purple-400 focus:ring-2 focus:ring-aivo-purple-100"
        />
      </div>

      {/* Position */}
      <div className="mt-6">
        <label
          htmlFor="position"
          className="block text-sm font-semibold text-aivo-navy-700"
        >
          Position <span className="text-red-500">*</span>
        </label>
        <select
          id="position"
          name="position"
          required
          className="mt-2 block w-full rounded-lg border border-aivo-navy-200 bg-white px-4 py-3 text-sm text-aivo-navy-800 outline-none transition-colors focus:border-aivo-purple-400 focus:ring-2 focus:ring-aivo-purple-100"
          defaultValue=""
        >
          <option value="" disabled>
            Select a position
          </option>
          {positions.map((p) => (
            <option key={p.id} value={p.title}>
              {p.title}
            </option>
          ))}
          <option value="General Application">
            General Application
          </option>
        </select>
      </div>

      {/* Resume Upload */}
      <div className="mt-6">
        <label className="block text-sm font-semibold text-aivo-navy-700">
          Resume <span className="text-red-500">*</span>
        </label>
        <div
          className="mt-2 flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-aivo-navy-200 bg-aivo-navy-50/50 py-8 transition-colors hover:border-aivo-purple-300 hover:bg-aivo-purple-50/30"
          onClick={() => fileRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") fileRef.current?.click();
          }}
        >
          <div className="text-center">
            <Upload className="mx-auto h-8 w-8 text-aivo-navy-300" />
            <p className="mt-2 text-sm text-aivo-navy-500">
              {fileName ? (
                <span className="font-medium text-aivo-purple-600">
                  {fileName}
                </span>
              ) : (
                <>
                  <span className="font-medium text-aivo-purple-600">
                    Click to upload
                  </span>{" "}
                  your resume
                </>
              )}
            </p>
            <p className="mt-1 text-xs text-aivo-navy-400">
              PDF or Word document, up to 5 MB
            </p>
          </div>
        </div>
        <input
          ref={fileRef}
          type="file"
          name="resume"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={handleFileChange}
          className="sr-only"
        />
      </div>

      {/* Error Message */}
      {status === "error" && errorMessage && (
        <div className="mt-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-500 mt-0.5" />
          <p className="text-sm text-red-700">{errorMessage}</p>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={status === "submitting"}
        className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-aivo-purple-600 px-8 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-aivo-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "submitting" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          "Submit Application"
        )}
      </button>
    </form>
  );
}
