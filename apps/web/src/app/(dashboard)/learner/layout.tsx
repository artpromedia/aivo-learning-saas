"use client";

import React, { useState, useEffect } from "react";
import { useLearnerStore } from "@/stores/learner.store";
import { PinGate } from "./pin-gate";

const PIN_VERIFIED_KEY = "learner-pin-verified";

/**
 * Learner-specific layout that gates access behind a PIN entry.
 * Once verified within a browser session, subsequent navigations
 * within the learner dashboard do not re-prompt for the PIN.
 */
export default function LearnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const activeLearner = useLearnerStore((s) => s.activeLearner);
  const [pinVerified, setPinVerified] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!activeLearner?.id) {
      setChecking(false);
      return;
    }
    // Check sessionStorage for an existing PIN verification for this learner
    const storedId = sessionStorage.getItem(PIN_VERIFIED_KEY);
    if (storedId === activeLearner.id) {
      setPinVerified(true);
    }
    setChecking(false);
  }, [activeLearner?.id]);

  const handlePinSuccess = (_token: string) => {
    if (activeLearner?.id) {
      sessionStorage.setItem(PIN_VERIFIED_KEY, activeLearner.id);
    }
    setPinVerified(true);
  };

  // While we're checking sessionStorage, show nothing to avoid flash
  if (checking) return null;

  // If no active learner is selected, render children (the page will show its own guard)
  if (!activeLearner) {
    return <>{children}</>;
  }

  // If PIN has not been verified, show the PinGate
  if (!pinVerified) {
    return (
      <PinGate
        learnerId={activeLearner.id}
        learnerName={activeLearner.name}
        onSuccess={handlePinSuccess}
      />
    );
  }

  return <>{children}</>;
}
