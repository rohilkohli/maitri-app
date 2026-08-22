"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/use-auth";
import { useTopics } from "@/lib/hooks/use-topics";
import { useLearnerState } from "@/lib/hooks/use-learner-state";
import { Question, QuestionType, TopicStatus } from "@/types";
import { KaTeXMath } from "@/components/katex-math";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { formatDuration } from "@/lib/utils";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Award,
  CheckCircle2,
  Clock,
  Flag,
  GraduationCap,
  RotateCcw,
  Sparkles,
  TrendingDown,
  TrendingUp,
  XCircle,
} from "lucide-react";

// Exam question bank
const EXAM_BANK: Question[] = [
  {
    id: "ex-1",
    topicId: "topic-limits",
    question: "Evaluate: $\\lim_{x \\to 0} \\frac{\\tan(3x)}{x}$.",
    type: QuestionType.MCQ,
    options: ["0", "1", "3", "Does not exist"],
    correctAnswer: "3",
    difficulty: 0.4,
    explanation: "$\\frac{\\tan(3x)}{x} = \\frac{\\sin(3x)}{x} \\cdot \\frac{1}{\\cos(3x)} = 3 \\cdot \\frac{\\sin(3x)}{3x} \\cdot \\frac{1}{\\cos(3x)} \\to 3(1)(1) = 3$.",
  },
  {
    id: "ex-2",
    topicId: "topic-diff-rules",
    question: "If $f(x) = x^4 e^{2x}$, find $f'(x)$.",
    type: QuestionType.MCQ,
    options: [
      "$4x^3 e^{2x}$",
      "$2x^4 e^{2x} + 4x^3 e^{2x}$",
      "$8x^3 e^{2x}$",
      "$x^4 e^{2x} + 4x^3 e^{2x}$",
    ],
    correctAnswer: "$2x^4 e^{2x} + 4x^3 e^{2x}$",
    difficulty: 0.5,
    explanation: "By Product Rule: $f'(x) = (x^4)' e^{2x} + x^4 (e^{2x})' = 4x^3 e^{2x} + 2x^4 e^{2x}$.",
  },
  {
    id: "ex-3",
    topicId: "topic-curve-sketching",
    question: "For $f(x) = x^3 - 6x^2 + 9x$, where does the inflection point occur?",
    type: QuestionType.MCQ,
    options: ["$x = 1$", "$x = 2$", "$x = 3$", "$x = 0$"],
    correctAnswer: "$x = 2$",
    difficulty: 0.6,
    explanation: "$f'(x) = 3x^2 - 12x + 9$, $f''(x) = 6x - 12 = 0 \\implies x = 2$.",
  },
  {
    id: "ex-4",
    topicId: "topic-u-sub",
    question: "Evaluate $\\int_0^1 x \\sqrt{1 - x^2}\\, dx$.",
    type: QuestionType.MCQ,
    options: ["$\\frac{1}{3}$", "$\\frac{2}{3}$", "$\\frac{1}{2}$", "0"],
    correctAnswer: "$\\frac{1}{3}$",
    difficulty: 0.7,
    explanation: "Let $u = 1 - x^2$, $du = -2x\\,dx$. Boundaries: $x=0 \\to u=1, x=1 \\to u=0$. $\\int_0^1 \\frac{1}{2} \\sqrt{u} du = \\frac{1}{2} \\left[\\frac{2}{3} u^{3/2}\\right]_0^1 = \\frac{1}{3}$.",
  },
  {
    id: "ex-5",
    topicId: "topic-ftc",
    question: "If $H(x) = \\int_{x}^{x^2} \\cos(t)\\, dt$, find $H'(x)$.",
    type: QuestionType.MCQ,
    options: [
      "$2x\\cos(x^2) - \\cos(x)$",
      "$\\cos(x^2) - \\cos(x)$",
      "$2x\\cos(x^2)$",
      "$\\sin(x^2) - \\sin(x)$",
    ],
    correctAnswer: "$2x\\cos(x^2) - \\cos(x)$",
    difficulty: 0.8,
    explanation: "By Leibniz Rule / FTC with Chain Rule: $H'(x) = \\cos(x^2) \\cdot (x^2)' - \\cos(x) \\cdot (x)' = 2x\\cos(x^2) - \\cos(x)$.",
  },
];

export default function ExamPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { topics } = useTopics(user?.id);
  const { topicStates } = useLearnerState(user?.id);

  // Settings State
  const [settingsOpen, setSettingsOpen] = useState(true);
  const [questionCount, setQuestionCount] = useState<10 | 20 | 30>(10);
  const [hasTimeLimit, setHasTimeLimit] = useState(true);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(15);
  const [focusWeak, setFocusWeak] = useState(true);

  // Exam Run State
  const [questions, setQuestions] = useState<Question[]>(EXAM_BANK);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [flagged, setFlagged] = useState<Record<number, boolean>>({});
  const [secondsRemaining, setSecondsRemaining] = useState(15 * 60);
  const [examStarted, setExamStarted] = useState(false);
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);

  // Timer countdown
  useEffect(() => {
    if (!examStarted || examSubmitted || !hasTimeLimit) return;

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
      setTimeElapsed((e) => e + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [examStarted, examSubmitted, hasTimeLimit]);

  const handleStartExam = () => {
    setSettingsOpen(false);
    setExamStarted(true);
    setSecondsRemaining(timeLimitMinutes * 60);
    setTimeElapsed(0);
  };

  const handleAnswerSelect = (option: string) => {
    setAnswers((prev) => ({ ...prev, [currentIndex]: option }));
  };

  const toggleFlag = (idx: number) => {
    setFlagged((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleSubmitExam = () => {
    setExamSubmitted(true);
  };

  const currentQ = questions[currentIndex];
  const selectedAnswer = answers[currentIndex] || "";

  // Results Computation
  const correctCount = Object.keys(answers).reduce((acc, idxStr) => {
    const idx = parseInt(idxStr, 10);
    const q = questions[idx];
    if (q && answers[idx] === q.correctAnswer) {
      return acc + 1;
    }
    return acc;
  }, 0);

  const percentage = Math.round((correctCount / questions.length) * 100);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in">
      {/* Settings Modal */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl p-6 md:p-8 space-y-6">
          <DialogHeader className="space-y-2">
            <div className="h-12 w-12 rounded-xl bg-blue-100 text-primary flex items-center justify-center mx-auto">
              <GraduationCap className="h-6 w-6" />
            </div>
            <DialogTitle className="text-xl font-bold text-center text-slate-900">
              Exam Simulator Configuration
            </DialogTitle>
            <DialogDescription className="text-center text-xs text-slate-500">
              Simulate realistic exam conditions calibrated against your current topic states.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Number of Questions
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {[10, 20, 30].map((num) => (
                  <Button
                    key={num}
                    type="button"
                    variant={questionCount === num ? "default" : "outline"}
                    onClick={() => setQuestionCount(num as 10 | 20 | 30)}
                    className="rounded-xl py-5"
                  >
                    {num} Questions
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-sm font-semibold text-slate-800 block">
                  Enable Timed Exam
                </span>
                <span className="text-xs text-slate-500">
                  {timeLimitMinutes} minutes total
                </span>
              </div>
              <Switch checked={hasTimeLimit} onCheckedChange={setHasTimeLimit} />
            </div>

            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-sm font-semibold text-slate-800 block">
                  Focus on Weak Topics
                </span>
                <span className="text-xs text-slate-500">
                  Prioritize topics with &lt;70% mastery
                </span>
              </div>
              <Switch checked={focusWeak} onCheckedChange={setFocusWeak} />
            </div>

            <Button
              type="button"
              onClick={handleStartExam}
              className="w-full py-6 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-base shadow-sm gap-2"
            >
              <span>Begin Exam Simulation</span>
              <Sparkles className="h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Active Exam Interface */}
      {examStarted && !examSubmitted && currentQ && (
        <div className="space-y-6">
          {/* Top Bar: Progress, Timer, Flag */}
          <div className="flex items-center justify-between bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 sm:px-6">
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-slate-800">
                Question {currentIndex + 1} of {questions.length}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleFlag(currentIndex)}
                className={`text-xs gap-1.5 rounded-lg ${
                  flagged[currentIndex]
                    ? "bg-amber-100 text-amber-900 font-bold"
                    : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                <Flag className="h-3.5 w-3.5" />
                <span>{flagged[currentIndex] ? "Flagged for Review" : "Flag"}</span>
              </Button>
            </div>

            {hasTimeLimit && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 font-mono text-sm font-bold">
                <Clock className="h-4 w-4 text-primary" />
                <span>
                  {Math.floor(secondsRemaining / 60)}:
                  {String(secondsRemaining % 60).padStart(2, "0")}
                </span>
              </div>
            )}
          </div>

          {/* Question Navigation Dots */}
          <div className="flex flex-wrap items-center gap-2 p-3 bg-white rounded-xl border border-slate-200">
            {questions.map((_, idx) => {
              const isAnswered = answers[idx] !== undefined;
              const isFlag = flagged[idx];
              const isCurrent = currentIndex === idx;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-8 w-8 rounded-lg text-xs font-bold transition-all relative ${
                    isCurrent
                      ? "ring-2 ring-primary ring-offset-1 bg-primary text-white"
                      : isAnswered
                      ? "bg-blue-100 text-primary"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {idx + 1}
                  {isFlag && (
                    <span className="h-2 w-2 rounded-full bg-amber-500 absolute -top-0.5 -right-0.5" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Center Question Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 md:p-8 space-y-6">
            <div className="text-lg md:text-xl font-semibold text-slate-900 leading-relaxed">
              <KaTeXMath text={currentQ.question} />
            </div>

            {currentQ.options && (
              <RadioGroup
                value={selectedAnswer}
                onValueChange={handleAnswerSelect}
                className="space-y-3"
              >
                {currentQ.options.map((opt, i) => {
                  const label = String.fromCharCode(65 + i);
                  const isSelected = selectedAnswer === opt;
                  return (
                    <Label
                      key={i}
                      htmlFor={`exam-opt-${i}`}
                      className={`flex items-center gap-3.5 p-4 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? "border-primary bg-blue-50/50 text-slate-900 shadow-sm ring-1 ring-primary/30"
                          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/70 text-slate-700"
                      }`}
                    >
                      <RadioGroupItem value={opt} id={`exam-opt-${i}`} />
                      <span className="h-6 w-6 rounded-md bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center shrink-0">
                        {label}
                      </span>
                      <div className="text-sm md:text-base font-normal flex-1">
                        <KaTeXMath text={opt} />
                      </div>
                    </Label>
                  );
                })}
              </RadioGroup>
            )}

            {/* Nav and Submit Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((i) => i - 1)}
                className="rounded-xl border-slate-300"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              {currentIndex < questions.length - 1 ? (
                <Button
                  type="button"
                  onClick={() => setCurrentIndex((i) => i + 1)}
                  className="rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold gap-2"
                >
                  <span>Next</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSubmitExam}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 shadow-sm gap-2"
                >
                  <span>Submit Exam</span>
                  <CheckCircle2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Results Page */}
      {examSubmitted && (
        <div className="space-y-8 bg-white rounded-2xl border border-slate-200/90 shadow-md p-8 md:p-10 animate-in fade-in">
          {/* Header Score Banner */}
          <div className="text-center space-y-3 border-b border-slate-100 pb-6">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <Award className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Exam Simulation Results
            </h1>
            <p className="text-sm text-slate-500">
              Completed in {formatDuration(timeElapsed)} &bull; {questions.length} Questions Evaluated
            </p>
          </div>

          {/* Stats Callout Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-bold uppercase text-slate-500 block">Total Score</span>
              <span className="text-3xl font-black text-slate-900">{correctCount} / {questions.length}</span>
            </div>

            <div className="p-5 rounded-xl bg-blue-50 border border-blue-200">
              <span className="text-xs font-bold uppercase text-blue-700 block">Accuracy</span>
              <span className="text-3xl font-black text-primary">{percentage}%</span>
            </div>

            <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="text-xs font-bold uppercase text-emerald-700 block">Readiness Index</span>
              <span className="text-3xl font-black text-emerald-600">
                {percentage >= 80 ? "Mastery" : percentage >= 50 ? "Developing" : "Needs Review"}
              </span>
            </div>
          </div>

          {/* Question Breakdown */}
          <div className="space-y-4 pt-2">
            <h3 className="text-base font-bold text-slate-900">Question Item Review</h3>
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
              {questions.map((q, idx) => {
                const userAns = answers[idx];
                const isRight = userAns === q.correctAnswer;

                return (
                  <div key={idx} className="p-4 flex items-start gap-3.5 bg-white">
                    {isRight ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                    )}

                    <div className="space-y-1.5 flex-1 min-w-0 text-sm">
                      <div className="font-semibold text-slate-800">
                        <KaTeXMath text={`#${idx + 1}: ${q.question}`} />
                      </div>
                      <div className="text-xs text-slate-600 flex flex-wrap gap-3">
                        <span>Your Answer: <span className="font-bold">{userAns || "Skipped"}</span></span>
                        <span>Correct: <span className="font-bold text-emerald-700">{q.correctAnswer}</span></span>
                      </div>
                      {q.explanation && (
                        <p className="text-xs text-slate-500 pt-1">
                          <KaTeXMath text={q.explanation} />
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              variant="outline"
              onClick={() => {
                setExamStarted(false);
                setExamSubmitted(false);
                setSettingsOpen(true);
                setAnswers({});
                setFlagged({});
              }}
              className="rounded-xl border-slate-300 gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Simulate Another Exam</span>
            </Button>

            <Button
              onClick={() => router.push("/dashboard")}
              className="rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold gap-2 px-6"
            >
              <span>Return to Roadmap</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
