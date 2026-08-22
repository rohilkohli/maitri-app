"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/use-auth";
import { useTopics } from "@/lib/hooks/use-topics";
import { useLearnerState } from "@/lib/hooks/use-learner-state";
import { useFlashcards } from "@/lib/hooks/use-flashcards";
import {
  ConfidenceLevel,
  Flashcard,
  Question,
  QuestionType,
  SessionPhase,
  TopicStatus,
} from "@/types";
import { ExplanationCard } from "@/components/explanation-card";
import { QuestionCard } from "@/components/question-card";
import { FeedbackCard } from "@/components/feedback-card";
import { FlipCard } from "@/components/flip-card";
import { TopicStatusBadge } from "@/components/topic-status-badge";
import { MasteryBar } from "@/components/mastery-bar";
import { SessionSkeleton } from "@/components/loading-skeleton";
import { Button } from "@/components/ui/button";
import { saveAttempt, saveLearnerTopicState } from "@/lib/firebase";
import { generateId } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  GraduationCap,
  Layers,
  Sparkles,
  TrendingUp,
} from "lucide-react";

export default function LearnSessionPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const topicId = params?.topicId as string;
  const { topics, loading: topicsLoading } = useTopics(user?.id);
  const { topicStates, updateTopicState } = useLearnerState(user?.id);
  const { dueFlashcards, rateFlashcard } = useFlashcards(user?.id);

  const topic = topics.find((t) => t.id === topicId) || topics[0];
  const topicState = topicStates.find((s) => s.topicId === topic?.id);

  // Session State
  const [phase, setPhase] = useState<SessionPhase>(SessionPhase.EXPLANATION);
  const [loading, setLoading] = useState(true);

  // Phase a) Flashcard Retrieval
  const [sessionCard, setSessionCard] = useState<Flashcard | null>(null);

  // Phase b & c) AI Explanation & Worked Example
  const [explanationData, setExplanationData] = useState<{
    explanation: string;
    simplifiedExplanation?: string;
    example?: string;
    workedExampleSteps?: { stepNumber: number; title: string; description: string; mathExpression?: string }[];
    hints?: string[];
    sourceReference?: string;
  }>({
    explanation: "Loading dynamic explanation...",
    hints: [],
  });

  // Phase d) Practice Question
  const [practiceQuestion, setPracticeQuestion] = useState<Question | null>(null);
  const [evaluating, setEvaluating] = useState(false);

  // Phase f) Feedback State
  const [feedbackData, setFeedbackData] = useState<{
    isCorrect: boolean;
    explanation: string;
    errorType?: string;
    misconceptions?: string[];
    masteryDelta?: number;
  } | null>(null);

  // Initialize session data & AI generation
  useEffect(() => {
    if (!topic) return;

    async function initSession() {
      setLoading(true);
      const mastery = topicState?.mastery ?? 0.5;

      // 1. Check for relevant due flashcards for retrieval warm-up
      const matchingCard = dueFlashcards.find((c) => c.topicId === topic.id);
      if (matchingCard) {
        setSessionCard(matchingCard);
        setPhase(SessionPhase.FLASHCARD_RETRIEVAL);
      } else {
        setPhase(SessionPhase.EXPLANATION);
      }

      // 2. Fetch adaptive explanation from AI
      try {
        const expRes = await fetch("/api/ai/generate-explanation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topicName: topic.name,
            subtopics: topic.subtopics,
            masteryLevel: mastery,
            misconceptions: topicState?.misconceptions || [],
          }),
        });

        if (expRes.ok) {
          const expJson = await expRes.json();
          setExplanationData(expJson);
        }
      } catch (err) {
        console.warn("Could not generate AI explanation, using fallback:", err);
        setExplanationData({
          explanation: `In this unit, we explore **${topic.name}**. Key competencies include understanding ${topic.subtopics.join(", ")}. Focus on applying rules systematically to avoid algebraic errors.`,
          example: "Find the derivative of $f(x) = x^2 \\sin(x)$.",
          workedExampleSteps: [
            {
              stepNumber: 1,
              title: "Apply Product Rule",
              description: "Let $u = x^2$ and $v = \\sin(x)$. The formula is $u'v + uv'$.",
              mathExpression: "f'(x) = (2x)(\\sin(x)) + (x^2)(\\cos(x))",
            },
          ],
          hints: ["Watch for composite terms requiring the Chain Rule."],
          sourceReference: "Calculus Foundations, Chapter 3",
        });
      }

      // 3. Prepare adaptive practice question
      setPracticeQuestion({
        id: `q-${topic.id}-${Date.now()}`,
        topicId: topic.id,
        question: `Given $f(x) = x^3 - 3x + 1$, find the coordinates of any local extrema.`,
        type: QuestionType.MCQ,
        options: [
          "Local max at $(-1, 3)$, local min at $(1, -1)$",
          "Local max at $(1, -1)$, local min at $(-1, 3)$",
          "Inflection point at $(0, 1)$ only",
          "No real extrema exist",
        ],
        correctAnswer: "Local max at $(-1, 3)$, local min at $(1, -1)$",
        difficulty: 0.5,
        hints: [
          "Set $f'(x) = 3x^2 - 3 = 0$ to find critical values $x = \\pm 1$.",
          "Use the Second Derivative Test: $f''(x) = 6x$.",
        ],
        explanation: "$f'(x) = 3(x-1)(x+1) = 0 \\implies x = \\pm 1$. $f''(1) = 6 > 0$ (min at $(1, -1)$); $f''(-1) = -6 < 0$ (max at $(-1, 3)$).",
      });

      setLoading(false);
    }

    initSession();
  }, [topic?.id]);

  // Handle Flashcard warmup completion
  const handleCardRated = async (quality: 0 | 1 | 2 | 3) => {
    if (sessionCard) {
      await rateFlashcard(sessionCard.id, quality);
    }
    setPhase(SessionPhase.EXPLANATION);
    toast({
      title: "Warmup Complete",
      description: "Moving to concept explanation.",
    });
  };

  // Handle Practice Answer Submission
  const handlePracticeSubmit = async (
    submittedAnswer: string,
    confidence: ConfidenceLevel,
    reasoning?: string
  ) => {
    if (!practiceQuestion || !topic) return;

    setEvaluating(true);
    const userId = user?.id || "demo-user";
    const startTime = Date.now();

    try {
      // Call AI evaluation API
      const res = await fetch("/api/ai/evaluate-attempt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: practiceQuestion.question,
          correctAnswer: practiceQuestion.correctAnswer,
          learnerAnswer: submittedAnswer,
          learnerExplanation: reasoning,
          currentMastery: topicState?.mastery ?? 0.5,
          confidenceBefore: confidence,
          difficulty: practiceQuestion.difficulty,
          responseTimeSeconds: 25,
        }),
      });

      let evalData = {
        isCorrect: submittedAnswer.trim() === practiceQuestion.correctAnswer.trim(),
        errorCategory: "Calculation Gap",
        feedback: practiceQuestion.explanation || "Problem evaluated.",
        misconceptions: [] as string[],
        newMastery: (topicState?.mastery ?? 0.5) + 0.1,
        masteryDelta: 0.1,
        newStatus: TopicStatus.DEVELOPING,
      };

      if (res.ok) {
        evalData = await res.json();
      }

      setFeedbackData({
        isCorrect: evalData.isCorrect,
        explanation: evalData.feedback,
        errorType: evalData.errorCategory,
        misconceptions: evalData.misconceptions,
        masteryDelta: evalData.masteryDelta,
      });

      // Persist attempt
      const attemptId = generateId();
      await saveAttempt(attemptId, {
        userId,
        questionId: practiceQuestion.id,
        topicId: topic.id,
        submittedAnswer,
        correctAnswer: practiceQuestion.correctAnswer,
        isCorrect: evalData.isCorrect,
        responseTimeSeconds: Math.round((Date.now() - startTime) / 1000),
        confidenceBefore: confidence,
        reasoning,
        errorTags: evalData.misconceptions || [],
      });

      // Update topic state in Firestore
      await updateTopicState(topic.id, {
        mastery: evalData.newMastery,
        status: evalData.newStatus,
        attemptCount: (topicState?.attemptCount || 0) + 1,
        correctAttempts: (topicState?.correctAttempts || 0) + (evalData.isCorrect ? 1 : 0),
        misconceptions: [
          ...(topicState?.misconceptions || []),
          ...(evalData.misconceptions || []),
        ].slice(0, 5),
        lastReviewedAt: new Date(),
      });

      setPhase(SessionPhase.FEEDBACK);
    } catch (err) {
      console.error("Evaluation error:", err);
      setFeedbackData({
        isCorrect: submittedAnswer.trim() === practiceQuestion.correctAnswer.trim(),
        explanation: practiceQuestion.explanation || "Checked against solution key.",
        masteryDelta: 0.08,
      });
      setPhase(SessionPhase.FEEDBACK);
    } finally {
      setEvaluating(false);
    }
  };

  const handleNextAction = () => {
    toast({
      title: "Session Completed!",
      description: `Mastery updated for ${topic.name}.`,
    });
    router.push("/dashboard");
  };

  const handleTrySimilar = () => {
    setPracticeQuestion({
      id: `q-similar-${Date.now()}`,
      topicId: topic.id,
      question: `Find the critical points of $g(x) = 2x^3 - 9x^2 + 12x$.`,
      type: QuestionType.MCQ,
      options: ["$x = 1$ and $x = 2$", "$x = -1$ and $x = -2$", "$x = 0$ only", "$x = 3$ and $x = 4$"],
      correctAnswer: "$x = 1$ and $x = 2$",
      difficulty: 0.5,
      hints: ["Set $g'(x) = 6x^2 - 18x + 12 = 0$."],
      explanation: "$6(x^2 - 3x + 2) = 6(x-1)(x-2) = 0 \\implies x=1, x=2$.",
    });
    setPhase(SessionPhase.PRACTICE);
  };

  if (loading || topicsLoading) {
    return <SessionSkeleton />;
  }

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Session Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/dashboard")}
            className="h-9 w-9 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Adaptive Learning Session
              </span>
              <TopicStatusBadge status={topicState?.status ?? TopicStatus.NOT_ASSESSED} />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {topic.name}
            </h1>
          </div>
        </div>

        {/* Phase Stepper Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-xl text-xs font-semibold text-slate-500">
          <span
            className={`px-3 py-1 rounded-lg transition-all ${
              phase === SessionPhase.FLASHCARD_RETRIEVAL
                ? "bg-white text-primary shadow-xs"
                : ""
            }`}
          >
            Warmup
          </span>
          <span
            className={`px-3 py-1 rounded-lg transition-all ${
              phase === SessionPhase.EXPLANATION
                ? "bg-white text-primary shadow-xs"
                : ""
            }`}
          >
            Explanation
          </span>
          <span
            className={`px-3 py-1 rounded-lg transition-all ${
              phase === SessionPhase.PRACTICE
                ? "bg-white text-primary shadow-xs"
                : ""
            }`}
          >
            Practice
          </span>
          <span
            className={`px-3 py-1 rounded-lg transition-all ${
              phase === SessionPhase.FEEDBACK
                ? "bg-white text-primary shadow-xs"
                : ""
            }`}
          >
            Feedback
          </span>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Active Session Card */}
        <div className="lg:col-span-2 space-y-6">
          {/* Phase a) Flashcard Retrieval */}
          {phase === SessionPhase.FLASHCARD_RETRIEVAL && sessionCard && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs font-semibold text-amber-900 flex items-center justify-between">
                <span>Active Recall Warmup: Review this prerequisite card before advancing.</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPhase(SessionPhase.EXPLANATION)}
                  className="text-xs text-amber-800 underline p-0 h-auto"
                >
                  Skip Warmup &rarr;
                </Button>
              </div>

              <FlipCard
                front={sessionCard.front}
                back={sessionCard.back}
                onRate={handleCardRated}
              />
            </div>
          )}

          {/* Phase b & c) Explanation & Worked Example */}
          {phase === SessionPhase.EXPLANATION && (
            <div className="space-y-6 animate-in fade-in">
              <ExplanationCard
                explanation={explanationData.explanation}
                simplifiedExplanation={explanationData.simplifiedExplanation}
                example={explanationData.example}
                workedExampleSteps={explanationData.workedExampleSteps}
                hints={explanationData.hints}
                sourceReference={explanationData.sourceReference}
              />

              <div className="flex justify-end">
                <Button
                  onClick={() => setPhase(SessionPhase.PRACTICE)}
                  className="rounded-xl bg-primary hover:bg-primary/90 text-white font-bold px-8 py-6 shadow-sm gap-2 text-base"
                >
                  <span>Ready for Adaptive Practice</span>
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
          )}

          {/* Phase d & e) Practice Question with Explain-Back */}
          {phase === SessionPhase.PRACTICE && practiceQuestion && (
            <div className="space-y-6 animate-in fade-in">
              <QuestionCard
                question={practiceQuestion}
                onSubmit={handlePracticeSubmit}
                loading={evaluating}
                showConfidence={true}
                showHints={true}
              />
            </div>
          )}

          {/* Phase f) Feedback Card with Error Classification */}
          {phase === SessionPhase.FEEDBACK && feedbackData && (
            <FeedbackCard
              isCorrect={feedbackData.isCorrect}
              explanation={feedbackData.explanation}
              errorType={feedbackData.errorType}
              misconceptions={feedbackData.misconceptions}
              masteryDelta={feedbackData.masteryDelta}
              onNextAction={handleNextAction}
              onTrySimilar={handleTrySimilar}
              onReviewPrereq={() => {
                if (topic.prerequisites.length > 0) {
                  router.push(`/learn/${topic.prerequisites[0]}`);
                } else {
                  setPhase(SessionPhase.EXPLANATION);
                }
              }}
              nextActionLabel="Complete Session"
            />
          )}
        </div>

        {/* Right 1 Col: Topic Knowledge Insights Sidebar */}
        <div className="space-y-6">
          {/* Current Mastery Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span>Topic Mastery</span>
              </h3>
              <span className="text-xs font-bold text-slate-600">
                {Math.round((topicState?.mastery ?? 0.5) * 100)}%
              </span>
            </div>

            <MasteryBar value={topicState?.mastery ?? 0.5} size="md" animate={false} />

            <div className="grid grid-cols-2 gap-2 text-center text-xs pt-2">
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-400 block">Total Attempts</span>
                <span className="font-bold text-slate-800 text-sm">
                  {topicState?.attemptCount ?? 0}
                </span>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-400 block">Accuracy</span>
                <span className="font-bold text-emerald-600 text-sm">
                  {topicState?.attemptCount
                    ? `${Math.round(((topicState.correctAttempts || 0) / topicState.attemptCount) * 100)}%`
                    : "100%"}
                </span>
              </div>
            </div>
          </div>

          {/* Subtopics Checklist */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-3">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              <span>Covered Concepts</span>
            </h3>
            <div className="space-y-2">
              {topic.subtopics.map((sub, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-xs font-medium text-slate-700 p-2.5 bg-slate-50/80 rounded-xl border border-slate-100"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span>{sub}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
