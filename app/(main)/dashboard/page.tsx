"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/use-auth";
import { useTopics } from "@/lib/hooks/use-topics";
import { useLearnerState } from "@/lib/hooks/use-learner-state";
import { useFlashcards } from "@/lib/hooks/use-flashcards";
import { runDecisionEngine } from "@/lib/decision-engine";
import { getRecentAttempts } from "@/lib/firebase";
import { Attempt, Recommendation, TopicStatus } from "@/types";
import { WhyThisCard } from "@/components/why-this-card";
import { TopicStatusBadge } from "@/components/topic-status-badge";
import { MasteryBar } from "@/components/mastery-bar";
import { StatsRowSkeleton, RecommendationCardSkeleton, ChartSkeleton } from "@/components/loading-skeleton";
import { Button } from "@/components/ui/button";
import { formatRelativeDate } from "@/lib/utils";
import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  Clock,
  CreditCard,
  Flame,
  GraduationCap,
  Network,
  Sparkles,
  TrendingUp,
  XCircle,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function DashboardPage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const { topics, loading: topicsLoading } = useTopics(user?.id);
  const { topicStates, stats, loading: statesLoading } = useLearnerState(user?.id);
  const { dueFlashcards, loading: cardsLoading } = useFlashcards(user?.id);

  const [recentAttempts, setRecentAttempts] = useState<Attempt[]>([]);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [recLoading, setRecLoading] = useState(true);

  // Fetch recent attempts from Firestore
  useEffect(() => {
    async function loadRecent() {
      if (!user?.id) return;
      try {
        const raw = await getRecentAttempts(user.id, 5);
        if (raw && raw.length > 0) {
          const parsed: Attempt[] = raw.map((a: any) => ({
            id: a.id,
            userId: (a.userId as string) || user.id,
            questionId: (a.questionId as string) || "",
            topicId: (a.topicId as string) || "",
            submittedAnswer: (a.submittedAnswer as string) || "",
            correctAnswer: (a.correctAnswer as string) || "",
            isCorrect: !!a.isCorrect,
            responseTimeSeconds: (a.responseTimeSeconds as number) || 30,
            confidenceBefore: a.confidenceBefore || "somewhat_sure",
            errorTags: Array.isArray(a.errorTags) ? a.errorTags : [],
            createdAt: a.createdAt ? new Date(a.createdAt.toDate?.() || a.createdAt) : new Date(),
          }));
          setRecentAttempts(parsed);
        }
      } catch (err) {
        console.warn("Could not load recent attempts:", err);
      }
    }
    loadRecent();
  }, [user?.id]);

  // Compute recommendation via Decision Engine
  useEffect(() => {
    if (topicsLoading || statesLoading) return;

    setRecLoading(true);
    // Call decision engine API for refined natural reasoning
    fetch("/api/ai/recommend-next", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topics,
        topicStates,
        examDate: profile?.examDate || new Date("2026-11-15"),
        dueFlashcardsCount: dueFlashcards.length,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.topicId) {
          setRecommendation(data);
        } else {
          // Fallback to local engine
          setRecommendation(
            runDecisionEngine({
              topics,
              topicStates,
              examDate: profile?.examDate,
              dueFlashcardsCount: dueFlashcards.length,
            })
          );
        }
      })
      .catch(() => {
        setRecommendation(
          runDecisionEngine({
            topics,
            topicStates,
            examDate: profile?.examDate,
            dueFlashcardsCount: dueFlashcards.length,
          })
        );
      })
      .finally(() => {
        setRecLoading(false);
      });
  }, [topics, topicStates, dueFlashcards.length, profile?.examDate, topicsLoading, statesLoading]);

  // Generate 7-day mastery trend sample or real data
  const masteryTrendData = useMemo(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Today"];
    const base = Math.max(20, stats.overallMasteryPercentage);
    return days.map((day, i) => ({
      day,
      mastery: Math.min(100, Math.max(10, Math.round(base - (6 - i) * 3 + (i % 2 === 0 ? 2 : -1)))),
    }));
  }, [stats.overallMasteryPercentage]);

  const isLoading = topicsLoading || statesLoading;

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Top Greeting Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome back, {user?.displayName || "Learner"}
          </h1>
          <p className="text-sm text-slate-500">
            {profile?.examGoal ? `${profile.examGoal} &bull; ` : ""}Every answer changes your adaptive path.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/knowledge-map">
            <Button variant="outline" className="rounded-xl border-slate-300 text-slate-700 hover:bg-slate-50 gap-2 text-xs font-semibold">
              <Network className="h-4 w-4 text-primary" />
              <span>View Knowledge Map</span>
            </Button>
          </Link>
          <Link href="/exam">
            <Button className="rounded-xl bg-primary hover:bg-primary/90 text-white gap-2 text-xs font-semibold shadow-sm">
              <GraduationCap className="h-4 w-4" />
              <span>Simulate Exam</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Top Stats Row (4 Cards) */}
      {isLoading ? (
        <StatsRowSkeleton />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Card 1: Overall Mastery */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400">
              <span>Overall Mastery</span>
              <div className="h-8 w-8 rounded-lg bg-blue-50 text-primary flex items-center justify-center">
                <BrainCircuit className="h-4 w-4" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-slate-900">
                {stats.overallMasteryPercentage}%
              </div>
              <p className="text-xs text-slate-500 mt-1">Bayesian Curriculum Index</p>
            </div>
            <MasteryBar value={stats.overallMastery} size="sm" animate={false} />
          </div>

          {/* Card 2: Topics Mastered */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400">
              <span>Topics Mastered</span>
              <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-slate-900">
                {stats.mastered} <span className="text-lg font-normal text-slate-400">/ {topics.length}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {stats.developing} Developing &bull; {stats.weak} Needs Focus
              </p>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full"
                style={{ width: `${(stats.mastered / Math.max(1, topics.length)) * 100}%` }}
              />
            </div>
          </div>

          {/* Card 3: Study Streak */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400">
              <span>Study Streak</span>
              <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center">
                <Flame className="h-4 w-4 fill-amber-500" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-slate-900 flex items-baseline gap-1.5">
                <span>3</span>
                <span className="text-sm font-semibold text-amber-600">days active</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Goal: {profile?.studyTimePerDay || 45}m daily</p>
            </div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                <span
                  key={d}
                  className={`h-1.5 flex-1 rounded-full ${
                    d <= 3 ? "bg-amber-500" : "bg-slate-200"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Card 4: Due for Review */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400">
              <span>Due for Review</span>
              <div className="h-8 w-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <CreditCard className="h-4 w-4" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-slate-900">
                {dueFlashcards.length} <span className="text-sm font-normal text-slate-400">cards</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">SM-2 Spaced Retrieval</p>
            </div>
            <Link href="/flashcards">
              <span className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                Start recall session <ArrowRight className="h-3 w-3" />
              </span>
            </Link>
          </div>
        </div>
      )}

      {/* Main Grid: Recommended Next Card & Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Recommended Next & Recent Attempts */}
        <div className="lg:col-span-2 space-y-8">
          {/* Section: Decision Engine Recommendation */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <span>Recommended Next Activity</span>
              </h2>
            </div>

            {recLoading || !recommendation ? (
              <RecommendationCardSkeleton />
            ) : (
              <WhyThisCard
                recommendation={recommendation}
                onStart={() => {
                  if (recommendation.topicId) {
                    router.push(`/learn/${recommendation.topicId}`);
                  } else {
                    router.push("/diagnostic");
                  }
                }}
              />
            )}
          </div>

          {/* Section: Recent Interactions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Clock className="h-5 w-5 text-slate-500" />
                <span>Recent Learning Interactions</span>
              </h2>
              <span className="text-xs font-medium text-slate-400">Real-time attempt stream</span>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs divide-y divide-slate-100 overflow-hidden">
              {recentAttempts.length > 0 ? (
                recentAttempts.map((attempt) => {
                  const topic = topics.find((t) => t.id === attempt.topicId);
                  return (
                    <div
                      key={attempt.id}
                      className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        {attempt.isCorrect ? (
                          <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="h-4 w-4" />
                          </div>
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                            <XCircle className="h-4 w-4" />
                          </div>
                        )}

                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate">
                            {topic?.name || "Practice Problem"}
                          </p>
                          <p className="text-xs text-slate-500">
                            Latency: {attempt.responseTimeSeconds}s &bull;{" "}
                            {attempt.isCorrect ? "Mastery reinforced" : "Error classified"}
                          </p>
                        </div>
                      </div>

                      <span className="text-xs text-slate-400 shrink-0">
                        {formatRelativeDate(attempt.createdAt)}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-slate-500 space-y-2">
                  <BookOpen className="h-8 w-8 text-slate-300 mx-auto" />
                  <p className="text-sm font-medium">No recent attempts logged yet.</p>
                  <p className="text-xs text-slate-400">Start your recommended session above to begin generating evidence.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Mastery Trend Chart & Curriculum Snapshot */}
        <div className="space-y-8">
          {/* Mastery Trend Chart */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span>Mastery Trend (7 Days)</span>
              </h3>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                +12% this week
              </span>
            </div>

            <div className="h-52 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={masteryTrendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#FFFFFF",
                      borderRadius: "12px",
                      border: "1px solid #E2E8F0",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      fontSize: "12px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="mastery"
                    stroke="#1E3A8A"
                    strokeWidth={2.5}
                    dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: "#1E3A8A" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Topic Status Snapshot */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">
                Curriculum Topic Breakdown
              </h3>
              <Link href="/knowledge-map" className="text-xs font-semibold text-primary hover:underline">
                Full Map &rarr;
              </Link>
            </div>

            <div className="space-y-3">
              {topics.slice(0, 5).map((topic) => {
                const s = topicStates.find((st) => st.topicId === topic.id);
                const mastery = s?.mastery ?? 0;
                const status = s?.status ?? TopicStatus.NOT_ASSESSED;

                return (
                  <div
                    key={topic.id}
                    onClick={() => router.push(`/learn/${topic.id}`)}
                    className="p-2.5 rounded-xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50/70 transition-all cursor-pointer space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-800 truncate pr-2">
                        {topic.name}
                      </span>
                      <TopicStatusBadge status={status} />
                    </div>
                    <MasteryBar value={mastery} size="sm" animate={false} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
