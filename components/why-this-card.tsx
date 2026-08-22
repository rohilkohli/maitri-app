"use client";

import React, { useState } from "react";
import { ActivityType, Recommendation } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CreditCard,
  GraduationCap,
  Info,
  Sparkles,
} from "lucide-react";

interface WhyThisCardProps {
  recommendation: Recommendation;
  onStart: () => void;
  loading?: boolean;
  className?: string;
}

export function WhyThisCard({
  recommendation,
  onStart,
  loading = false,
  className = "",
}: WhyThisCardProps) {
  const [isWhyExpanded, setIsWhyExpanded] = useState(false);

  const getActivityBadge = (type: ActivityType) => {
    switch (type) {
      case ActivityType.LESSON:
        return {
          label: "Core Lesson & Concept",
          icon: GraduationCap,
          color: "bg-blue-50 text-blue-700 border-blue-200",
        };
      case ActivityType.PRACTICE:
        return {
          label: "Adaptive Practice",
          icon: BrainCircuit,
          color: "bg-purple-50 text-purple-700 border-purple-200",
        };
      case ActivityType.FLASHCARD:
        return {
          label: "Active Recall Flashcards",
          icon: CreditCard,
          color: "bg-amber-50 text-amber-700 border-amber-200",
        };
      case ActivityType.REVIEW:
        return {
          label: "Mastery Maintenance",
          icon: BookOpen,
          color: "bg-emerald-50 text-emerald-700 border-emerald-200",
        };
      default:
        return {
          label: "Diagnostic Assessment",
          icon: Sparkles,
          color: "bg-slate-50 text-slate-700 border-slate-200",
        };
    }
  };

  const badge = getActivityBadge(recommendation.activityType);
  const Icon = badge.icon;

  return (
    <div
      className={`rounded-2xl bg-gradient-to-br from-white via-white to-blue-50/40 border border-blue-100/80 shadow-md p-6 md:p-8 space-y-5 relative overflow-hidden ${className}`}
    >
      <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl -z-0 pointer-events-none" />

      {/* Top row: Activity Badge & Decision Engine Tag */}
      <div className="flex flex-wrap items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full ${badge.color}`}
          >
            <Icon className="h-3.5 w-3.5" />
            <span>{badge.label}</span>
          </Badge>
          <span className="text-[11px] font-medium text-slate-400">
            Priority: {Math.round((recommendation.priority ?? 0.8) * 100)}%
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-primary font-semibold">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Decision Engine Pick</span>
        </div>
      </div>

      {/* Target Topic & Primary Headline */}
      <div className="space-y-1.5 relative z-10">
        <h3 className="text-xl md:text-2xl font-bold text-slate-900 leading-snug">
          {recommendation.topicName || "Continue Learning"}
        </h3>
        <p className="text-sm md:text-base text-slate-600 leading-relaxed">
          {recommendation.reason}
        </p>
      </div>

      {/* Expandable "Why this recommendation?" section with evidence */}
      <div className="pt-2 border-t border-slate-100 space-y-3 relative z-10">
        <button
          type="button"
          onClick={() => setIsWhyExpanded(!isWhyExpanded)}
          className="flex items-center gap-2 text-xs md:text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
        >
          <Info className="h-4 w-4" />
          <span>Why this recommendation? (Decision Evidence)</span>
          {isWhyExpanded ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
        </button>

        {isWhyExpanded && (
          <div className="p-4 bg-slate-50/90 rounded-xl border border-slate-200/80 space-y-2 animate-in fade-in">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Active Evidence Points:
            </span>
            <ul className="space-y-1.5">
              {recommendation.evidence && recommendation.evidence.length > 0 ? (
                recommendation.evidence.map((item, idx) => (
                  <li
                    key={idx}
                    className="text-xs md:text-sm text-slate-700 flex items-start gap-2 leading-relaxed"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))
              ) : (
                <li className="text-xs text-slate-500">
                  Computed based on prerequisite readiness and target mastery goals.
                </li>
              )}
            </ul>
          </div>
        )}
      </div>

      {/* Start Button */}
      <div className="pt-1 relative z-10">
        <Button
          type="button"
          onClick={onStart}
          disabled={loading}
          className="w-full sm:w-auto px-8 py-6 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold text-base shadow-sm gap-2 flex items-center justify-center transition-all"
        >
          <span>Start Session</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
