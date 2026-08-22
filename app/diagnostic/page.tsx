"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/use-auth";
import { ConfidenceLevel, Question, TopicStatus } from "@/types";
import { getUserProfile, saveAttempt, saveLearnerTopicState } from "@/lib/firebase";
import { generateDynamicQuestions } from "@/lib/ai-question-generator";
import { generateId } from "@/lib/utils";
import { LoadingScreen } from "@/components/loading-screen";
import { KaTeXMath } from "@/components/katex-math";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  Flame,
  Lightbulb,
  Target,
  TrendingUp,
  XCircle,
  Zap,
} from "lucide-react";

export default function DiagnosticPage() {
  const router = useRouter();
  const { user } = useAuth();

  // Profile state
  const [subject, setSubject] = useState("Mathematics");
  const [classLevel, setClassLevel] = useState("10th Class");
  const [board, setBoard] = useState("CBSE");
  const [examGoal, setExamGoal] = useState("Board Exam");
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Preparing your diagnostic test...");

  // Question state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<ConfidenceLevel>(ConfidenceLevel.SOMEWHAT_SURE);
  const [showHint, setShowHint] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);

  // Timing
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [timeSpent, setTimeSpent] = useState(0);

  // Feedback state
  const [evaluating, setEvaluating] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [lastResult, setLastResult] = useState<{ isCorrect: boolean; explanation: string } | null>(null);

  // Results
  const [results, setResults] = useState<{
    correctCount: number;
    totalTime: number;
    streak: number;
    maxStreak: number;
    topicScores: Record<string, { correct: number; total: number }>;
  }>({
    correctCount: 0,
    totalTime: 0,
    streak: 0,
    maxStreak: 0,
    topicScores: {},
  });

  const [isCompleted, setIsCompleted] = useState(false);

  // Timer effect
  useEffect(() => {
    if (!showFeedback && !isCompleted && questions.length > 0) {
      const interval = setInterval(() => {
        setTimeSpent(Math.floor((Date.now() - questionStartTime) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [questionStartTime, showFeedback, isCompleted, questions.length]);

  // Load profile and generate questions
  useEffect(() => {
    async function loadProfileAndGenerateQuestions() {
      const userId = user?.id || "demo-user";
      setQuestionsLoading(true);

      try {
        const profile = await getUserProfile(userId);
        if (profile) {
          setSubject(profile.subject || "Mathematics");
          setClassLevel((profile as any).classLevel || "10th Class");
          setBoard((profile as any).board || "CBSE");
          setExamGoal(profile.examGoal || "Board Exam");
        }
        setProfileLoaded(true);

        setLoadingMessage(`Generating ${profile?.subject || "Mathematics"} questions for ${(profile as any)?.classLevel || "10th Class"}...`);

        const generatedQuestions = await generateDynamicQuestions({
          subject: profile?.subject || "Mathematics",
          classLevel: (profile as any)?.classLevel || "10th Class",
          board: (profile as any)?.board || "CBSE",
          examGoal: profile?.examGoal,
          count: 6,
          difficulty: "mixed",
        });

        setQuestions(generatedQuestions);
        setQuestionStartTime(Date.now());
      } catch (e) {
        console.warn("Error loading profile/questions:", e);
        setProfileLoaded(true);
      } finally {
        setQuestionsLoading(false);
      }
    }

    loadProfileAndGenerateQuestions();
  }, [user]);

  const currentQuestion = questions[currentIndex];

  const handleAnswerSelect = (answer: string) => {
    if (evaluating || showFeedback) return;
    setSelectedAnswer(answer);
  };

  const handleSubmit = async () => {
    if (!currentQuestion || !selectedAnswer || evaluating) return;

    setEvaluating(true);
    const userId = user?.id || "demo-user";
    const responseTime = Math.floor((Date.now() - questionStartTime) / 1000);

    // Check correctness
    const isCorrect = selectedAnswer.trim().toLowerCase() === currentQuestion.correctAnswer.trim().toLowerCase();

    // Update results
    setResults((prev) => {
      const topicId = currentQuestion.topicId;
      const currentTopic = prev.topicScores[topicId] || { correct: 0, total: 0 };
      const newStreak = isCorrect ? prev.streak + 1 : 0;
      return {
        correctCount: isCorrect ? prev.correctCount + 1 : prev.correctCount,
        totalTime: prev.totalTime + responseTime,
        streak: newStreak,
        maxStreak: Math.max(prev.maxStreak, newStreak),
        topicScores: {
          ...prev.topicScores,
          [topicId]: {
            correct: isCorrect ? currentTopic.correct + 1 : currentTopic.correct,
            total: currentTopic.total + 1,
          },
        },
      };
    });

    // Show feedback
    setLastResult({
      isCorrect,
      explanation: currentQuestion.explanation || "",
    });
    setShowFeedback(true);

    // Save to Firestore
    try {
      const attemptId = generateId();
      await saveAttempt(attemptId, {
        userId,
        questionId: currentQuestion.id,
        topicId: currentQuestion.topicId,
        submittedAnswer: selectedAnswer,
        correctAnswer: currentQuestion.correctAnswer,
        isCorrect,
        responseTimeSeconds: responseTime,
        confidenceBefore: confidence,
        errorTags: isCorrect ? [] : ["diagnostic_gap"],
      });

      const initialMastery = isCorrect ? 0.7 : 0.3;
      const initialStatus = isCorrect ? TopicStatus.DEVELOPING : TopicStatus.WEAK;

      await saveLearnerTopicState(userId, currentQuestion.topicId, {
        mastery: initialMastery,
        confidence: confidence === ConfidenceLevel.CONFIDENT ? 0.8 : 0.5,
        status: initialStatus,
        attemptCount: 1,
        correctAttempts: isCorrect ? 1 : 0,
        misconceptions: isCorrect ? [] : ["diagnostic_gap"],
        lastReviewedAt: new Date(),
      });
    } catch (e) {
      console.warn("Save error:", e);
    }

    setEvaluating(false);
  };

  const handleNext = () => {
    setShowFeedback(false);
    setLastResult(null);
    setSelectedAnswer(null);
    setShowHint(false);
    setConfidence(ConfidenceLevel.SOMEWHAT_SURE);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((i) => i + 1);
      setQuestionStartTime(Date.now());
      setTimeSpent(0);
    } else {
      setIsCompleted(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  // Loading state
  if (!profileLoaded || questionsLoading || questions.length === 0) {
    return (
      <LoadingScreen
        message={loadingMessage}
        submessage={`AI is creating personalized ${subject} questions for ${classLevel} • ${board}`}
        variant="generating"
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Target className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-slate-900">Baseline Diagnostic</h1>
                <p className="text-xs text-slate-500">{subject} • {classLevel} • {board}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Timer */}
              <div className="flex items-center gap-1.5 text-slate-600">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-mono">{formatTime(timeSpent)}</span>
              </div>

              {/* Streak */}
              {results.streak > 0 && (
                <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 rounded-full">
                  <Flame className="h-4 w-4 text-orange-500" />
                  <span className="text-xs font-bold text-orange-700">{results.streak}</span>
                </div>
              )}

              {/* Progress */}
              <div className="text-xs font-semibold text-slate-500">
                {currentIndex + 1}/{questions.length}
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div
            className="mt-3 w-full bg-slate-200 h-1.5 rounded-full overflow-hidden"
            role="progressbar"
            aria-valuenow={currentIndex + 1}
            aria-valuemin={1}
            aria-valuemax={questions.length}
            aria-label={`Question ${currentIndex + 1} of ${questions.length}`}
          >
            <div
              className="h-full bg-gradient-to-r from-primary to-emerald-500 transition-all duration-500"
              style={{ width: `${((currentIndex + (showFeedback ? 1 : 0)) / questions.length) * 100}%` }}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        {!isCompleted ? (
          <div className="w-full max-w-2xl space-y-6">
            {/* Question Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
              {/* Topic Badge */}
              <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <span className="text-xs font-medium text-slate-600">
                    {currentQuestion.topicId.replace(/-/g, " ").replace(/^[a-z]+\s/, "").split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                  </span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  currentQuestion.difficulty < 0.4 ? "bg-green-100 text-green-700" :
                  currentQuestion.difficulty < 0.6 ? "bg-amber-100 text-amber-700" :
                  "bg-red-100 text-red-700"
                }`}>
                  {currentQuestion.difficulty < 0.4 ? "Easy" : currentQuestion.difficulty < 0.6 ? "Medium" : "Hard"}
                </span>
              </div>

              {/* Question */}
              <div className="p-6">
                <div className="text-lg font-semibold text-slate-900 leading-relaxed">
                  <KaTeXMath text={currentQuestion.question} />
                </div>
              </div>

              {/* Options */}
              <div className="px-6 pb-6 space-y-3" role="radiogroup" aria-label="Answer options">
                {currentQuestion.options?.map((option, idx) => {
                  const isSelected = selectedAnswer === option;
                  const letter = String.fromCharCode(65 + idx);

                  let optionStyle = "border-slate-200 hover:border-primary/50 hover:bg-primary/5";
                  if (showFeedback) {
                    if (option === currentQuestion.correctAnswer) {
                      optionStyle = "border-emerald-500 bg-emerald-50";
                    } else if (isSelected && option !== currentQuestion.correctAnswer) {
                      optionStyle = "border-red-500 bg-red-50";
                    }
                  } else if (isSelected) {
                    optionStyle = "border-primary bg-primary/5 ring-2 ring-primary/20";
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleAnswerSelect(option)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleAnswerSelect(option);
                        }
                      }}
                      disabled={showFeedback || evaluating}
                      role="radio"
                      aria-checked={isSelected}
                      aria-label={`Option ${letter}: ${option}`}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-primary/50 ${optionStyle}`}
                    >
                      <span className={`h-8 w-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${
                        isSelected && !showFeedback ? "bg-primary text-white" : "bg-slate-100 text-slate-600"
                      }`}>
                        {letter}
                      </span>
                      <span className="text-sm text-slate-800">
                        <KaTeXMath text={option} />
                      </span>
                      {showFeedback && option === currentQuestion.correctAnswer && (
                        <CheckCircle2 className="h-5 w-5 text-emerald-600 ml-auto shrink-0" />
                      )}
                      {showFeedback && isSelected && option !== currentQuestion.correctAnswer && (
                        <XCircle className="h-5 w-5 text-red-600 ml-auto shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Hint */}
              {!showFeedback && currentQuestion.hints && currentQuestion.hints.length > 0 && (
                <div className="px-6 pb-4">
                  {showHint ? (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Lightbulb className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                        <p className="text-sm text-amber-800">{currentQuestion.hints[0]}</p>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setShowHint(true); setHintsUsed(h => h + 1); }}
                      className="text-xs text-amber-600 hover:text-amber-700 flex items-center gap-1"
                    >
                      <Lightbulb className="h-3.5 w-3.5" />
                      Need a hint?
                    </button>
                  )}
                </div>
              )}

              {/* Feedback */}
              {showFeedback && lastResult && (
                <div className={`px-6 pb-6 pt-2`}>
                  <div className={`p-4 rounded-xl ${
                    lastResult.isCorrect ? "bg-emerald-50 border border-emerald-200" : "bg-red-50 border border-red-200"
                  }`}>
                    <div className="flex items-start gap-3">
                      {lastResult.isCorrect ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className={`text-sm font-bold ${lastResult.isCorrect ? "text-emerald-800" : "text-red-800"}`}>
                          {lastResult.isCorrect ? "Correct! Well done." : "Not quite right."}
                        </p>
                        <p className="text-xs text-slate-600 mt-1">
                          <KaTeXMath text={lastResult.explanation} />
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Confidence + Submit */}
            {!showFeedback ? (
              <div className="flex flex-col sm:flex-row items-center gap-4">
                {/* Confidence */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Confidence:</span>
                  {[
                    { level: ConfidenceLevel.GUESSING, label: "Guessing", color: "bg-red-500" },
                    { level: ConfidenceLevel.SOMEWHAT_SURE, label: "Unsure", color: "bg-amber-500" },
                    { level: ConfidenceLevel.CONFIDENT, label: "Sure", color: "bg-emerald-500" },
                  ].map((btn) => (
                    <button
                      key={btn.level}
                      onClick={() => setConfidence(btn.level)}
                      className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all ${
                        confidence === btn.level
                          ? `${btn.color} text-white`
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>

                {/* Submit */}
                <Button
                  onClick={handleSubmit}
                  disabled={!selectedAnswer || evaluating}
                  className="px-8 py-5 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold gap-2 ml-auto"
                >
                  {evaluating ? (
                    <span>Checking...</span>
                  ) : (
                    <>
                      <span>Submit Answer</span>
                      <Zap className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="flex justify-end">
                <Button
                  onClick={handleNext}
                  className="px-8 py-5 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold gap-2"
                >
                  <span>{currentIndex + 1 < questions.length ? "Next Question" : "See Results"}</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        ) : (
          /* Completion Screen */
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center space-y-6">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white flex items-center justify-center mx-auto shadow-lg">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-extrabold text-slate-900">Diagnostic Complete!</h1>
              <p className="text-sm text-slate-600">
                Your personalized learning roadmap for <span className="font-semibold text-primary">{subject}</span> is ready.
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                <Target className="h-5 w-5 text-primary mx-auto mb-1" />
                <span className="text-2xl font-black text-primary block">
                  {results.correctCount}/{questions.length}
                </span>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Correct</span>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                <TrendingUp className="h-5 w-5 text-emerald-600 mx-auto mb-1" />
                <span className="text-2xl font-black text-emerald-700 block">
                  {Math.round((results.correctCount / questions.length) * 100)}%
                </span>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Accuracy</span>
              </div>

              <div className="p-4 rounded-xl bg-orange-50 border border-orange-200">
                <Flame className="h-5 w-5 text-orange-600 mx-auto mb-1" />
                <span className="text-2xl font-black text-orange-700 block">{results.maxStreak}</span>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Best Streak</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <Clock className="h-5 w-5 text-slate-600 mx-auto mb-1" />
                <span className="text-2xl font-black text-slate-700 block">{formatTime(results.totalTime)}</span>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Total Time</span>
              </div>
            </div>

            {/* CTA */}
            <Button
              onClick={() => router.push("/dashboard")}
              className="w-full py-6 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-base shadow-lg gap-2"
            >
              <span>View Your Personalized Dashboard</span>
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-slate-400">
        Maitri AI • Adaptive Learning Intelligence
      </footer>
    </div>
  );
}
