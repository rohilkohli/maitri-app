"use client";

import React, { useState } from "react";
import { ConfidenceLevel, Question, QuestionType } from "@/types";
import { KaTeXMath } from "@/components/katex-math";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { HelpCircle, Send, Sparkles } from "lucide-react";

interface QuestionCardProps {
  question: Question;
  onSubmit: (answer: string, confidence: ConfidenceLevel, reasoning?: string) => Promise<void> | void;
  loading?: boolean;
  disabled?: boolean;
  showConfidence?: boolean;
  showHints?: boolean;
  className?: string;
}

export function QuestionCard({
  question,
  onSubmit,
  loading = false,
  disabled = false,
  showConfidence = true,
  showHints = false,
  className = "",
}: QuestionCardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [reasoning, setReasoning] = useState("");
  const [confidence, setConfidence] = useState<ConfidenceLevel>(ConfidenceLevel.SOMEWHAT_SURE);
  const [activeHintIndex, setActiveHintIndex] = useState(-1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAnswer.trim() || loading || disabled) return;
    onSubmit(selectedAnswer.trim(), confidence, reasoning.trim());
  };

  const handleNextHint = () => {
    if (question.hints && activeHintIndex < question.hints.length - 1) {
      setActiveHintIndex((prev) => prev + 1);
    }
  };

  return (
    <div className={`bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 md:p-8 space-y-6 ${className}`}>
      {/* Question Header & Body */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <span>{question.type === QuestionType.MCQ ? "Multiple Choice" : "Problem Solving"}</span>
          {question.difficulty && (
            <span className="flex items-center gap-1 text-slate-500">
              Difficulty: {Math.round(question.difficulty * 10)}/10
            </span>
          )}
        </div>

        <div className="text-lg md:text-xl font-medium text-slate-900 leading-relaxed">
          <KaTeXMath text={question.question} />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* MCQ Option Radio Group */}
        {question.type === QuestionType.MCQ && question.options && (
          <RadioGroup
            value={selectedAnswer}
            onValueChange={setSelectedAnswer}
            disabled={disabled || loading}
            className="space-y-3"
          >
            {question.options.map((option, idx) => {
              const optionLabel = String.fromCharCode(65 + idx); // A, B, C, D
              const isSelected = selectedAnswer === option;
              return (
                <Label
                  key={idx}
                  htmlFor={`option-${idx}`}
                  className={`flex items-center gap-3.5 p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? "border-primary bg-blue-50/50 text-slate-900 shadow-sm ring-1 ring-primary/30"
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/70 text-slate-700"
                  } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  <RadioGroupItem value={option} id={`option-${idx}`} className="text-primary" />
                  <span className="h-6 w-6 rounded-md bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center shrink-0">
                    {optionLabel}
                  </span>
                  <div className="text-sm md:text-base font-normal flex-1">
                    <KaTeXMath text={option} />
                  </div>
                </Label>
              );
            })}
          </RadioGroup>
        )}

        {/* Short Answer / Text Input */}
        {question.type === QuestionType.SHORT_ANSWER && (
          <div className="space-y-2">
            <Label htmlFor="short-answer" className="text-sm font-medium text-slate-700">
              Your Answer
            </Label>
            <Input
              id="short-answer"
              value={selectedAnswer}
              onChange={(e) => setSelectedAnswer(e.target.value)}
              placeholder="Type your calculated answer or formula here..."
              disabled={disabled || loading}
              className="text-base py-6 rounded-xl border-slate-300 focus-visible:ring-primary font-mono"
            />
          </div>
        )}

        {/* Explain Back text area if requested */}
        {question.type === QuestionType.EXPLAIN && (
          <div className="space-y-2">
            <Label htmlFor="explain-input" className="text-sm font-medium text-slate-700">
              Explain your reasoning
            </Label>
            <Textarea
              id="explain-input"
              value={selectedAnswer}
              onChange={(e) => setSelectedAnswer(e.target.value)}
              placeholder="Explain the step-by-step logic and why this method applies..."
              rows={4}
              disabled={disabled || loading}
              className="text-base rounded-xl border-slate-300 focus-visible:ring-primary"
            />
          </div>
        )}

        {/* Progressive Hints (if enabled) */}
        {showHints && question.hints && question.hints.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-slate-100">
            {activeHintIndex >= 0 && (
              <div className="space-y-2">
                {question.hints.slice(0, activeHintIndex + 1).map((h, i) => (
                  <div key={i} className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-sm text-amber-900 flex items-start gap-2 animate-in fade-in">
                    <Sparkles className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                    <span><KaTeXMath text={h} /></span>
                  </div>
                ))}
              </div>
            )}
            {activeHintIndex < question.hints.length - 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleNextHint}
                className="text-xs text-amber-700 hover:text-amber-800 hover:bg-amber-50 gap-1.5 p-0 h-auto"
              >
                <HelpCircle className="h-3.5 w-3.5" />
                {activeHintIndex === -1 ? "Show a hint" : "Show next hint"}
              </Button>
            )}
          </div>
        )}

        {/* Confidence Selector */}
        {showConfidence && (
          <div className="pt-4 border-t border-slate-100 space-y-2.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              How confident are you?
            </span>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { level: ConfidenceLevel.GUESSING, label: "Guessing", desc: "Low certainty", color: "hover:border-red-300 active:border-red-400" },
                { level: ConfidenceLevel.SOMEWHAT_SURE, label: "Somewhat Sure", desc: "Moderate", color: "hover:border-amber-300 active:border-amber-400" },
                { level: ConfidenceLevel.CONFIDENT, label: "Confident", desc: "High certainty", color: "hover:border-emerald-300 active:border-emerald-400" },
              ].map((item) => {
                const isSelected = confidence === item.level;
                return (
                  <button
                    key={item.level}
                    type="button"
                    onClick={() => setConfidence(item.level)}
                    disabled={disabled || loading}
                    className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center ${
                      isSelected
                        ? "border-primary bg-primary/5 text-primary font-semibold shadow-xs ring-1 ring-primary/30"
                        : "border-slate-200 bg-slate-50/50 text-slate-600 hover:bg-white"
                    } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
                  >
                    <span className="text-xs md:text-sm font-medium">{item.label}</span>
                    <span className="text-[10px] text-slate-400">{item.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={!selectedAnswer.trim() || loading || disabled}
          className="w-full py-6 rounded-xl text-base font-semibold bg-primary hover:bg-primary/90 text-white shadow-sm flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
              <span>Evaluating with Decision Engine...</span>
            </div>
          ) : (
            <>
              <span>Submit Answer</span>
              <Send className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
