"use client";

import React, { useState } from "react";
import { Heart, CheckCircle, ArrowRight, Shield, Brain, Eye } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AivoLogo } from "@/components/brand/AivoLogo";

type Step = "welcome" | "pin" | "review" | "complete";

export default function AcceptInvitePage() {
  const [step, setStep] = useState<Step>("welcome");
  const [pin, setPin] = useState(["", "", "", ""]);
  const [confirmPin, setConfirmPin] = useState(["", "", "", ""]);
  const [pinError, setPinError] = useState("");
  const [loading, setLoading] = useState(false);

  const childName = "Alex Johnson";
  const inviterName = "Sarah Johnson";

  const handlePinChange = (idx: number, value: string, isConfirm = false) => {
    if (!/^\d?$/.test(value)) return;
    const setter = isConfirm ? setConfirmPin : setPin;
    const current = isConfirm ? [...confirmPin] : [...pin];
    current[idx] = value;
    setter(current);
    setPinError("");

    if (value && idx < 3) {
      const nextInput = document.getElementById(`${isConfirm ? "confirm-" : ""}pin-${idx + 1}`);
      nextInput?.focus();
    }
  };

  const handleSetPin = () => {
    const pinStr = pin.join("");
    const confirmStr = confirmPin.join("");
    if (pinStr.length < 4) {
      setPinError("Please enter a 4-digit PIN");
      return;
    }
    if (pinStr !== confirmStr) {
      setPinError("PINs do not match");
      return;
    }
    setStep("review");
  };

  const handleComplete = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setStep("complete");
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "var(--aivo-bg, #FFFBF7)" }}>
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <AivoLogo size="md" />
        </div>

        {step === "welcome" && (
          <div className="rounded-3xl p-8 text-center" style={{ backgroundColor: "var(--aivo-bg-card, white)", border: "1px solid var(--aivo-border, #E8DDF0)", boxShadow: "0 4px 24px rgba(124,58,237,0.08)" }}>
            <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center text-white" style={{ background: "linear-gradient(135deg, #7C3AED, #A855F7)" }}>
              <Heart size={36} />
            </div>
            <h1 className="text-2xl font-extrabold mb-2" style={{ color: "var(--aivo-text, #2D1B4E)" }}>You&apos;ve Been Invited!</h1>
            <p className="text-sm mb-6" style={{ color: "var(--aivo-text-secondary, #6B5A7D)" }}>
              <strong>{inviterName}</strong> has invited you to be a caregiver for <strong>{childName}</strong> on AIVO Learning.
            </p>

            <div className="space-y-3 text-left mb-8">
              <div className="flex items-start gap-3 p-3 rounded-xl" style={{ backgroundColor: "var(--aivo-bg, #FFFBF7)" }}>
                <Eye size={18} className="text-[#7C3AED] mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-bold" style={{ color: "var(--aivo-text, #2D1B4E)" }}>View-only access</p>
                  <p className="text-xs" style={{ color: "var(--aivo-text-muted, #A89BB5)" }}>See learning progress, brain profile, and IEP goals</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-xl" style={{ backgroundColor: "var(--aivo-bg, #FFFBF7)" }}>
                <Shield size={18} className="text-[#10B981] mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-bold" style={{ color: "var(--aivo-text, #2D1B4E)" }}>Privacy protected</p>
                  <p className="text-xs" style={{ color: "var(--aivo-text-muted, #A89BB5)" }}>FERPA & COPPA compliant. The parent controls your access.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-xl" style={{ backgroundColor: "var(--aivo-bg, #FFFBF7)" }}>
                <Brain size={18} className="text-[#3B82F6] mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-bold" style={{ color: "var(--aivo-text, #2D1B4E)" }}>Support the journey</p>
                  <p className="text-xs" style={{ color: "var(--aivo-text-muted, #A89BB5)" }}>Stay informed about how the child is learning and growing</p>
                </div>
              </div>
            </div>

            <Button size="lg" className="w-full" onClick={() => setStep("pin")} rightIcon={<ArrowRight size={16} />}>
              Accept Invitation
            </Button>
          </div>
        )}

        {step === "pin" && (
          <div className="rounded-3xl p-8 text-center" style={{ backgroundColor: "var(--aivo-bg-card, white)", border: "1px solid var(--aivo-border, #E8DDF0)", boxShadow: "0 4px 24px rgba(124,58,237,0.08)" }}>
            <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center text-white" style={{ background: "linear-gradient(135deg, #3B82F6, #2563EB)" }}>
              <Shield size={28} />
            </div>
            <h1 className="text-xl font-extrabold mb-2" style={{ color: "var(--aivo-text, #2D1B4E)" }}>Set Your PIN</h1>
            <p className="text-sm mb-6" style={{ color: "var(--aivo-text-secondary, #6B5A7D)" }}>
              Create a 4-digit PIN to secure your caregiver account
            </p>

            <div className="mb-4">
              <label className="block text-xs font-bold mb-2" style={{ color: "var(--aivo-text-muted, #A89BB5)" }}>Enter PIN</label>
              <div className="flex justify-center gap-3">
                {pin.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`pin-${idx}`}
                    type="password"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handlePinChange(idx, e.target.value)}
                    className="w-14 h-14 text-center text-2xl font-bold rounded-2xl border-2 focus:outline-none focus:border-[#7C3AED] transition-colors"
                    style={{ borderColor: "var(--aivo-border, #E8DDF0)", color: "var(--aivo-text, #2D1B4E)" }}
                  />
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-bold mb-2" style={{ color: "var(--aivo-text-muted, #A89BB5)" }}>Confirm PIN</label>
              <div className="flex justify-center gap-3">
                {confirmPin.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`confirm-pin-${idx}`}
                    type="password"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handlePinChange(idx, e.target.value, true)}
                    className="w-14 h-14 text-center text-2xl font-bold rounded-2xl border-2 focus:outline-none focus:border-[#7C3AED] transition-colors"
                    style={{ borderColor: "var(--aivo-border, #E8DDF0)", color: "var(--aivo-text, #2D1B4E)" }}
                  />
                ))}
              </div>
            </div>

            {pinError && <p className="text-sm text-red-500 mb-4">{pinError}</p>}

            <Button size="lg" className="w-full" onClick={handleSetPin} rightIcon={<ArrowRight size={16} />}>
              Continue
            </Button>
          </div>
        )}

        {step === "review" && (
          <div className="rounded-3xl p-8 text-center" style={{ backgroundColor: "var(--aivo-bg-card, white)", border: "1px solid var(--aivo-border, #E8DDF0)", boxShadow: "0 4px 24px rgba(124,58,237,0.08)" }}>
            <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center text-2xl font-extrabold text-white" style={{ background: "linear-gradient(135deg, #7C3AED, #A855F7)" }}>
              {childName.charAt(0)}
            </div>
            <h1 className="text-xl font-extrabold mb-2" style={{ color: "var(--aivo-text, #2D1B4E)" }}>Review</h1>
            <p className="text-sm mb-6" style={{ color: "var(--aivo-text-secondary, #6B5A7D)" }}>
              You&apos;re about to become a caregiver for:
            </p>

            <div className="rounded-2xl p-4 mb-6 text-left" style={{ backgroundColor: "var(--aivo-bg, #FFFBF7)", border: "1px solid var(--aivo-border, #E8DDF0)" }}>
              <div className="space-y-3">
                <div>
                  <span className="text-xs font-bold" style={{ color: "var(--aivo-text-muted, #A89BB5)" }}>Child</span>
                  <p className="text-sm font-bold" style={{ color: "var(--aivo-text, #2D1B4E)" }}>{childName}</p>
                </div>
                <div>
                  <span className="text-xs font-bold" style={{ color: "var(--aivo-text-muted, #A89BB5)" }}>Invited by</span>
                  <p className="text-sm font-bold" style={{ color: "var(--aivo-text, #2D1B4E)" }}>{inviterName}</p>
                </div>
                <div>
                  <span className="text-xs font-bold" style={{ color: "var(--aivo-text-muted, #A89BB5)" }}>Your access</span>
                  <p className="text-sm font-bold" style={{ color: "var(--aivo-text, #2D1B4E)" }}>View-only (brain profile, gradebook, IEP, sessions)</p>
                </div>
              </div>
            </div>

            <Button size="lg" className="w-full" loading={loading} onClick={handleComplete} rightIcon={<CheckCircle size={16} />}>
              Confirm & Start
            </Button>
          </div>
        )}

        {step === "complete" && (
          <div className="rounded-3xl p-8 text-center" style={{ backgroundColor: "var(--aivo-bg-card, white)", border: "1px solid var(--aivo-border, #E8DDF0)", boxShadow: "0 4px 24px rgba(124,58,237,0.08)" }}>
            <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center text-white" style={{ background: "linear-gradient(135deg, #10B981, #059669)" }}>
              <CheckCircle size={40} />
            </div>
            <h1 className="text-2xl font-extrabold mb-2" style={{ color: "var(--aivo-text, #2D1B4E)" }}>You&apos;re All Set!</h1>
            <p className="text-sm mb-6" style={{ color: "var(--aivo-text-secondary, #6B5A7D)" }}>
              You can now view {childName}&apos;s learning progress. Head to your dashboard to get started.
            </p>
            <Button size="lg" className="w-full" onClick={() => { window.location.href = "/api/test-login?role=caregiver"; }} rightIcon={<ArrowRight size={16} />}>
              Go to Dashboard
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
