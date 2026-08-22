"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/use-auth";
import { useFlashcards } from "@/lib/hooks/use-flashcards";
import { useTopics } from "@/lib/hooks/use-topics";
import { FlipCard } from "@/components/flip-card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Flame,
  RotateCcw,
  Sparkles,
  Zap,
} from "lucide-react";

export default function FlashcardsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const { flashcards, dueFlashcards, rateFlashcard, loading } = useFlashcards(user?.id);
  const { topics } = useTopics(user?.id);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [streak, setStreak] = useState(4);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  const activeQueue = dueFlashcards.length > 0 ? dueFlashcards : flashcards;
  const currentCard = activeQueue[currentIndex];
  const cardTopic = topics.find((t) => t.id === currentCard?.topicId);

  const handleRate = async (quality: 0 | 1 | 2 | 3) => {
    if (!currentCard) return;

    await rateFlashcard(currentCard.id, quality);

    if (quality >= 2) {
      setStreak((s) => s + 1);
    } else {
      setStreak(0);
    }

    setIsFlipped(false);

    if (currentIndex + 1 < activeQueue.length) {
      setCurrentIndex((i) => i + 1);
    } else {
      setIsCompleted(true);
      toast({
        title: "Active Recall Complete!",
        description: "All due flashcards reviewed with SM-2 spaced intervals.",
      });
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setIsCompleted(false);
    setIsFlipped(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
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
                Spaced Repetition Engine
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-xs font-semibold">
                SM-2 Active Recall
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {dueFlashcards.length} Cards Scheduled for Today
            </h1>
          </div>
        </div>

        {/* Streak Counter */}
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 font-bold text-sm shadow-xs self-start sm:self-auto">
          <Flame className="h-5 w-5 text-amber-500 fill-amber-500 animate-pulse" />
          <span>{streak} Streak</span>
        </div>
      </div>

      {/* Main Flashcard Arena */}
      {!isCompleted && currentCard ? (
        <div className="space-y-6">
          {/* Progress row */}
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>
              Card {currentIndex + 1} of {activeQueue.length} &bull; {cardTopic?.name || "Calculus Core"}
            </span>
            <span>{activeQueue.length - currentIndex} Remaining</span>
          </div>

          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-primary to-secondary h-full transition-all duration-300 ease-out"
              style={{ width: `${((currentIndex + 1) / activeQueue.length) * 100}%` }}
            />
          </div>

          {/* 3D Flip Card */}
          <FlipCard
            front={currentCard.front}
            back={currentCard.back}
            isFlippedControlled={isFlipped}
            onFlipChange={setIsFlipped}
            onRate={handleRate}
          />

          <div className="flex justify-center pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard")}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              End Session Early &rarr;
            </Button>
          </div>
        </div>
      ) : (
        /* Completion State */
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-md p-8 md:p-12 text-center space-y-6 max-w-lg mx-auto animate-in fade-in">
          <div className="h-16 w-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">
              All Caught Up!
            </h2>
            <p className="text-sm text-slate-600">
              You reviewed {activeQueue.length} cards today. Your memory intervals have been recalculated according to the forgetting curve.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 flex items-center justify-center gap-2">
            <Sparkles className="h-4 w-4 text-primary shrink-0" />
            <span>Next spaced retrieval batch will unlock tomorrow morning.</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              variant="outline"
              onClick={handleReset}
              className="w-full sm:w-auto rounded-xl border-slate-300 gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Review Again</span>
            </Button>

            <Button
              onClick={() => router.push("/dashboard")}
              className="w-full sm:w-auto rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold gap-2"
            >
              <span>Back to Dashboard</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
