"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { PartyPopper, Rocket, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { apiFetch } from "@/lib/api";

function ConfettiPiece({ delay, x }: { delay: number; x: number }) {
  const colors = ["#7C3AED", "#7C4DFF", "#38B2AC", "#F59E0B", "#EF4444", "#10B981"];
  const color = colors[Math.floor(Math.random() * colors.length)];

  return (
    <motion.div
      className="absolute w-2.5 h-2.5 rounded-sm"
      style={{ backgroundColor: color, left: `${x}%`, top: -10 }}
      initial={{ y: -20, opacity: 1, rotate: 0 }}
      animate={{
        y: [0, 600],
        opacity: [1, 1, 0],
        rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1)],
        x: [0, (Math.random() - 0.5) * 200],
      }}
      transition={{
        duration: 3 + Math.random() * 2,
        delay,
        ease: "easeOut",
      }}
    />
  );
}

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("billing");
  const [showContent, setShowContent] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      setVerifying(false);
      setVerifyError("No checkout session found. Please try subscribing again.");
      return;
    }

    async function verifyCheckout() {
      try {
        const data = await apiFetch<{ verified: boolean; error?: string }>(
          `/api/billing/verify-checkout?session_id=${encodeURIComponent(sessionId!)}`,
        );
        if (data.verified) {
          setVerified(true);
          setTimeout(() => setShowContent(true), 500);
        } else {
          setVerifyError(data.error ?? "Checkout could not be verified.");
        }
      } catch {
        setVerifyError("Unable to verify checkout. Please check your subscription status.");
        // Still show success after a delay — the webhook may not have fired yet
        setVerified(true);
        setTimeout(() => setShowContent(true), 500);
      } finally {
        setVerifying(false);
      }
    }

    verifyCheckout();
  }, [searchParams]);

  const confettiPieces = Array.from({ length: 40 }).map((_, i) => ({
    delay: Math.random() * 0.8,
    x: Math.random() * 100,
  }));

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="animate-spin text-[#7C3AED] mx-auto mb-4" size={40} />
          <p className="text-gray-500 dark:text-gray-400">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  if (verifyError && !verified) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="text-red-500" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Checkout Incomplete
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">{verifyError}</p>
          <Button onClick={() => router.push("/checkout")} className="min-w-[200px]">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden min-h-screen flex items-center justify-center px-4">
      {/* Confetti */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {confettiPieces.map((piece, i) => (
          <ConfettiPiece key={i} delay={piece.delay} x={piece.x} />
        ))}
      </div>

      {showContent && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center z-10 max-w-lg"
        >
          <motion.div
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 10,
              delay: 0.2,
            }}
            className="w-24 h-24 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#38B2AC] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-[#7C3AED]/30"
          >
            <PartyPopper className="text-white" size={48} />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-3xl font-bold text-gray-900 dark:text-white mb-3"
          >
            {t("paymentSuccessful")}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-lg text-gray-500 dark:text-gray-400 mb-2"
          >
            {t("welcomeToPremium")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <Card className="mb-8 mx-auto max-w-sm">
              <CardBody className="space-y-3">
                {[
                  t("featureUnlimitedTutoring"),
                  t("featureFullQuests"),
                  t("featureAdvancedBrain"),
                  t("featurePriorityRecs"),
                ].map((feature) => (
                  <div
                    key={feature}
                    className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
                  >
                    <CheckCircle
                      className="text-[#7C3AED] shrink-0"
                      size={16}
                    />
                    {feature}
                  </div>
                ))}
              </CardBody>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
          >
            <Button
              size="lg"
              onClick={() => router.push("/parent")}
              rightIcon={<Rocket size={20} />}
              className="min-w-[200px]"
            >
              {t("goToDashboard")}
            </Button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
