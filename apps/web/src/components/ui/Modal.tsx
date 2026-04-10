"use client";

import React, { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

function Modal({ open, onClose, title, children, footer, className = "" }: ModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, handleKeyDown]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            className="fixed inset-0 bg-[#2D1B4E]/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.25, ease: [0.175, 0.885, 0.32, 1.275] }}
            className={`
              relative z-10 w-full max-w-lg
              bg-white dark:bg-[#2A1E45] rounded-3xl shadow-[var(--shadow-playful)]
              border border-[#E8DDF0] dark:border-[#3D2D5C]
              ${className}
            `}
          >
            {title && (
              <div className="flex items-center justify-between px-6 py-5 border-b border-[#E8DDF0] dark:border-[#3D2D5C]">
                <h2 className="text-lg font-bold text-[var(--aivo-text)]" style={{ fontFamily: "var(--font-display)" }}>
                  {title}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-2xl text-[#A89BB5] hover:text-[#7C3AED] hover:bg-[#F0E6FF] dark:hover:bg-[#3D2D5C] transition-colors"
                  aria-label="Close dialog"
                >
                  <X size={20} />
                </button>
              </div>
            )}
            {!title && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-2xl text-[#A89BB5] hover:text-[#7C3AED] hover:bg-[#F0E6FF] dark:hover:bg-[#3D2D5C] transition-colors"
                aria-label="Close dialog"
              >
                <X size={20} />
              </button>
            )}
            <div className="px-6 py-5">{children}</div>
            {footer && (
              <div className="px-6 py-4 border-t border-[#E8DDF0] dark:border-[#3D2D5C]">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export { Modal };
