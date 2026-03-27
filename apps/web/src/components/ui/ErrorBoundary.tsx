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
        <div className="flex flex-col items-center justify-center p-8 text-center rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-800">
          <AlertTriangle className="text-red-500 mb-3" size={40} />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            Something went wrong
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 max-w-md">
            {this.state.error?.message || "An unexpected error occurred."}
          </p>
          <button
            onClick={this.handleRetry}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#7C3AED] hover:bg-[#6B3FE8] rounded-lg transition-colors"
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
