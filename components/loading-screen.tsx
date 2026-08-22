"use client";

import React from "react";
import { BrainCircuit, BookOpen, Sparkles, Zap } from "lucide-react";

interface LoadingScreenProps {
  message?: string;
  submessage?: string;
  variant?: "default" | "generating" | "analyzing" | "loading";
}

export function LoadingScreen({
  message = "Loading...",
  submessage,
  variant = "default",
}: LoadingScreenProps) {
  const icons = {
    default: BrainCircuit,
    generating: Sparkles,
    analyzing: Zap,
    loading: BookOpen,
  };

  const Icon = icons[variant];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-sm">
        {/* Animated Icon */}
        <div className="relative">
          <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto">
            <Icon className="h-10 w-10 text-primary animate-pulse" />
          </div>

          {/* Orbiting dots */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-24 w-24 animate-spin" style={{ animationDuration: "3s" }}>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 h-2 w-2 rounded-full bg-primary" />
            </div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-28 w-28 animate-spin" style={{ animationDuration: "4s", animationDirection: "reverse" }}>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </div>
          </div>
        </div>

        {/* Text */}
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">{message}</h2>
          {submessage && (
            <p className="text-sm text-slate-500">{submessage}</p>
          )}
        </div>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-2 w-2 rounded-full bg-primary/60 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <div className={`${sizes[size]} animate-spin`}>
      <svg className="text-primary" viewBox="0 0 24 24" fill="none">
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-slate-200" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-200 rounded w-3/4" />
          <div className="h-3 bg-slate-100 rounded w-1/2" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-slate-100 rounded" />
        <div className="h-3 bg-slate-100 rounded w-5/6" />
      </div>
    </div>
  );
}

export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {children}
    </div>
  );
}
