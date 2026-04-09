"use client";

import React, { Component, ErrorInfo } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center p-8 text-center rounded-3xl border-2 border-dashed border-[#FFE0E0] bg-[#FFF5F5] dark:bg-[#991B1B]/10 dark:border-[#991B1B]/30">
          <div className="w-16 h-16 rounded-full bg-[#FFE0E0] flex items-center justify-center mb-4">
            <AlertTriangle className="text-[#F87171]" size={28} />
          </div>
          <h3 className="text-lg font-bold text-[#2D1B4E]  mb-1" style={{ fontFamily: "var(--font-display)" }}>
            Oops! Something went wrong
          </h3>
          <p className="text-sm text-[#6B5B7B] dark:text-[#B8A5D0] mb-5 max-w-md">
            {this.state.error?.message || "An unexpected error occurred."}
          </p>
          <button
            onClick={this.handleRetry}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-[#7C3AED] to-[#A855F7] hover:from-[#6D28D9] hover:to-[#9333EA] rounded-2xl transition-all shadow-[0_4px_14px_rgba(124,58,237,0.3)]"
          >
            <RefreshCw size={16} />
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export { ErrorBoundary };
