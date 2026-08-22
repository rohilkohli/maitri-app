"use client";

import React from "react";
import { KaTeXMath } from "@/components/katex-math";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  GitPullRequest,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  XCircle,
} from "lucide-react";

interface FeedbackCardProps {
  isCorrect: boolean;
  explanation: string;
  errorType?: string | null;
  misconceptions?: string[];
  masteryDelta?: number;
  onNextAction: () => void;
  onTrySimilar?: () => void;
  onReviewPrereq?: () => void;
  nextActionLabel?: string;
  className?: string;
}

export function FeedbackCard({
  isCorrect,
  explanation,
  errorType,
  misconceptions = [],
  masteryDelta,
  onNextAction,
  onTrySimilar,
  onReviewPrereq,
  nextActionLabel = "Continue to Next",
  className = "",
}: FeedbackCardProps) {
  return (
    <div
      className={`rounded-2xl border p-6 md:p-8 space-y-6 shadow-sm animate-in fade-in-up ${
        isCorrect
          ? "bg-emerald-50/50 border-emerald-200 text-slate-900"
          : "bg-red-50/50 border-red-200 text-slate-900"
      } ${className}`}
    >
      {/* Status Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {isCorrect ? (
            <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          ) : (
            <div className="h-10 w-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
              <XCircle className="h-6 w-6" />
            </div>
          )}

          <div>
            <h3 className="text-lg md:text-xl font-bold">
              {isCorrect ? "Correct! Excellent Reasoning" : "Incorrect — Let's Break It Down"}
            </h3>
            <p className="text-xs md:text-sm text-slate-600">
              {isCorrect
                ? "Your knowledge model has been reinforced."
                : "Every answer adapts the learning path."}
            </p>
          </div>
        </div>

        {/* Mastery Delta Indicator */}
        {masteryDelta !== undefined && (
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shrink-0 ${
              masteryDelta >= 0
                ? "bg-emerald-100 text-emerald-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {masteryDelta >= 0 ? (
              <>
                <TrendingUp className="h-3.5 w-3.5" />
                <span>+{(masteryDelta * 100).toFixed(1)}% Mastery</span>
              </>
            ) : (
              <>
                <TrendingDown className="h-3.5 w-3.5" />
                <span>{(masteryDelta * 100).toFixed(1)}% Mastery</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Error Category & Misconceptions (if incorrect) */}
      {!isCorrect && (errorType || misconceptions.length > 0) && (
        <div className="p-4 bg-white/90 rounded-xl border border-red-100 space-y-2">
          {errorType && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Error Classification:
              </span>
              <Badge variant="destructive" className="bg-red-600 font-semibold text-xs">
                {errorType}
              </Badge>
            </div>
          )}

          {misconceptions.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                <AlertTriangle className="h-3 w-3 text-amber-500" />
                Flagged Gaps:
              </span>
              {misconceptions.map((tag, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="bg-amber-50 text-amber-900 border-amber-200 text-[11px]"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Detailed Feedback & Explanation */}
      <div className="p-4 md:p-5 bg-white rounded-xl border border-slate-200/80 text-sm md:text-base leading-relaxed text-slate-800 space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
          Explanation & Solution:
        </span>
        <KaTeXMath text={explanation} />
      </div>

      {/* Adaptive Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
        {!isCorrect && onTrySimilar && (
          <Button
            type="button"
            variant="outline"
            onClick={onTrySimilar}
            className="w-full sm:w-auto rounded-xl border-slate-300 hover:bg-slate-50 text-slate-700 font-medium gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Try Similar Problem
          </Button>
        )}

        {!isCorrect && onReviewPrereq && (
          <Button
            type="button"
            variant="outline"
            onClick={onReviewPrereq}
            className="w-full sm:w-auto rounded-xl border-amber-300 bg-amber-50/70 text-amber-900 hover:bg-amber-100 font-medium gap-2"
          >
            <GitPullRequest className="h-4 w-4" />
            Review Prerequisite
          </Button>
        )}

        <Button
          type="button"
          onClick={onNextAction}
          className="w-full sm:w-auto rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold gap-2 px-6 shadow-sm"
        >
          <span>{nextActionLabel}</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
