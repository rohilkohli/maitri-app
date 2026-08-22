"use client";

import React, { useState } from "react";
import { KaTeXMath } from "@/components/katex-math";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  Lightbulb,
  Sparkles,
} from "lucide-react";

interface StepItem {
  stepNumber: number;
  title: string;
  description: string;
  mathExpression?: string;
}

interface ExplanationCardProps {
  explanation: string;
  simplifiedExplanation?: string;
  example?: string;
  workedExampleSteps?: StepItem[];
  hints?: string[];
  sourceReference?: string;
  className?: string;
}

export function ExplanationCard({
  explanation,
  simplifiedExplanation,
  example,
  workedExampleSteps = [],
  hints = [],
  sourceReference,
  className = "",
}: ExplanationCardProps) {
  const [showSimpler, setShowSimpler] = useState(false);
  const [showWorkedExample, setShowWorkedExample] = useState(false);
  const [expandedSteps, setExpandedSteps] = useState<Record<number, boolean>>({ 1: true });

  const toggleStep = (stepNum: number) => {
    setExpandedSteps((prev) => ({ ...prev, [stepNum]: !prev[stepNum] }));
  };

  return (
    <div className={`bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 md:p-8 space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2.5 text-primary">
          <GraduationCap className="h-5 w-5" />
          <h3 className="font-semibold text-base md:text-lg text-slate-900">
            {showSimpler ? "Intuitive Mental Model" : "Concept Explanation"}
          </h3>
        </div>

        {simplifiedExplanation && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowSimpler(!showSimpler)}
            className="text-xs rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 gap-1.5"
          >
            <Sparkles className="h-3.5 w-3.5 text-secondary" />
            {showSimpler ? "Show Standard View" : "Show Simpler Explanation"}
          </Button>
        )}
      </div>

      {/* Main Explanation Body */}
      <div className="text-slate-800 text-base md:text-lg leading-relaxed space-y-4">
        <KaTeXMath text={showSimpler && simplifiedExplanation ? simplifiedExplanation : explanation} />
      </div>

      {/* Hints & Key Takeaways if present */}
      {hints.length > 0 && (
        <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-900">
            <Lightbulb className="h-4 w-4 text-blue-600" />
            <span>Key Takeaways & Problem Hints</span>
          </div>
          <ul className="list-disc list-inside space-y-1.5 text-sm text-blue-950">
            {hints.map((hint, i) => (
              <li key={i} className="leading-snug">
                <KaTeXMath text={hint} />
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Worked Example Section */}
      {(example || workedExampleSteps.length > 0) && (
        <div className="pt-2 border-t border-slate-100 space-y-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setShowWorkedExample(!showWorkedExample)}
            className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 text-slate-800 font-semibold"
          >
            <span className="flex items-center gap-2 text-sm md:text-base">
              <BookOpen className="h-4 w-4 text-primary" />
              Step-by-Step Worked Example
            </span>
            {showWorkedExample ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>

          {showWorkedExample && (
            <div className="p-4 md:p-6 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-4 animate-in fade-in">
              {example && (
                <div className="p-3 bg-white rounded-lg border border-slate-200 text-slate-900 font-medium text-sm md:text-base">
                  <span className="font-bold text-primary block mb-1">Problem Statement:</span>
                  <KaTeXMath text={example} />
                </div>
              )}

              {workedExampleSteps.length > 0 && (
                <div className="space-y-2.5">
                  {workedExampleSteps.map((step) => {
                    const isExpanded = !!expandedSteps[step.stepNumber];
                    return (
                      <div
                        key={step.stepNumber}
                        className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs"
                      >
                        <button
                          type="button"
                          onClick={() => toggleStep(step.stepNumber)}
                          className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-50"
                        >
                          <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-800">
                            <span className="h-5 w-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">
                              {step.stepNumber}
                            </span>
                            <span>{step.title}</span>
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="h-3.5 w-3.5 text-slate-400" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                          )}
                        </button>

                        {isExpanded && (
                          <div className="px-4 pb-4 pt-1 text-sm text-slate-700 space-y-2 border-t border-slate-100">
                            <div>
                              <KaTeXMath text={step.description} />
                            </div>
                            {step.mathExpression && (
                              <div className="p-2.5 bg-slate-100/80 rounded-md font-mono text-center overflow-x-auto text-slate-900">
                                <KaTeXMath text={`$$${step.mathExpression}$$`} />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Source Citation Badge */}
      {sourceReference && (
        <div className="flex items-center gap-2 text-xs text-slate-500 pt-3 border-t border-slate-100 font-medium">
          <BookOpen className="h-3.5 w-3.5 text-slate-400" />
          <span>Curriculum Source: {sourceReference}</span>
        </div>
      )}
    </div>
  );
}
