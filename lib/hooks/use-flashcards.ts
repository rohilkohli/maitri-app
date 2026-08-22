"use client";

import { useEffect, useState, useMemo } from "react";
import { Flashcard } from "@/types";
import { getUserFlashcards, saveFlashcard } from "@/lib/firebase";
import { calculateSM2 } from "@/lib/spaced-repetition";

export const DEFAULT_SAMPLE_FLASHCARDS: Flashcard[] = [
  {
    id: "fc-1",
    userId: "demo",
    topicId: "topic-diff-rules",
    front: "What is the derivative of $\\ln(x)$ with respect to $x$?",
    back: "$\\frac{d}{dx}[\\ln(x)] = \\frac{1}{x}$ for $x > 0$.",
    interval: 1,
    easeFactor: 2.5,
    nextReviewAt: new Date(),
    lastReviewedAt: null,
    consecutiveCorrect: 0,
  },
  {
    id: "fc-2",
    userId: "demo",
    topicId: "topic-diff-rules",
    front: "State the Chain Rule formula for composite function $f(g(x))$.",
    back: "$\\frac{d}{dx}[f(g(x))] = f'(g(x)) \\cdot g'(x)$",
    interval: 1,
    easeFactor: 2.5,
    nextReviewAt: new Date(),
    lastReviewedAt: null,
    consecutiveCorrect: 0,
  },
  {
    id: "fc-3",
    userId: "demo",
    topicId: "topic-ftc",
    front: "State Fundamental Theorem of Calculus (Part 1) for $g(x) = \\int_{a}^{x} f(t) dt$.",
    back: "$g'(x) = \\frac{d}{dx}\\left[\\int_{a}^{x} f(t) dt\\right] = f(x)$ assuming $f$ is continuous on $[a, b]$.",
    interval: 1,
    easeFactor: 2.5,
    nextReviewAt: new Date(),
    lastReviewedAt: null,
    consecutiveCorrect: 0,
  },
  {
    id: "fc-4",
    userId: "demo",
    topicId: "topic-limits",
    front: "What is $\\lim_{x \\to 0} \\frac{\\sin(x)}{x}$?",
    back: "$\\lim_{x \\to 0} \\frac{\\sin(x)}{x} = 1$",
    interval: 1,
    easeFactor: 2.5,
    nextReviewAt: new Date(),
    lastReviewedAt: null,
    consecutiveCorrect: 0,
  },
  {
    id: "fc-5",
    userId: "demo",
    topicId: "topic-u-sub",
    front: "When performing $u$-substitution on $\\int 2x e^{x^2} dx$, what is the optimal choice for $u$?",
    back: "Set $u = x^2$, which gives $du = 2x\\,dx$. The integral simplifies directly to $\\int e^u du = e^{x^2} + C$.",
    interval: 1,
    easeFactor: 2.5,
    nextReviewAt: new Date(),
    lastReviewedAt: null,
    consecutiveCorrect: 0,
  },
];

export function useFlashcards(userId: string | null | undefined) {
  const [flashcards, setFlashcards] = useState<Flashcard[]>(DEFAULT_SAMPLE_FLASHCARDS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCards() {
      if (!userId) {
        setFlashcards(DEFAULT_SAMPLE_FLASHCARDS);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const raw = await getUserFlashcards(userId);
        if (raw && raw.length > 0) {
          const parsed: Flashcard[] = raw.map((d: any) => ({
            id: d.id,
            userId: d.userId as string,
            topicId: d.topicId as string,
            front: d.front as string,
            back: d.back as string,
            interval: (d.interval as number) || 1,
            easeFactor: (d.easeFactor as number) || 2.5,
            nextReviewAt: d.nextReviewAt ? new Date(d.nextReviewAt.toDate?.() || d.nextReviewAt) : new Date(),
            lastReviewedAt: d.lastReviewedAt ? new Date(d.lastReviewedAt.toDate?.() || d.lastReviewedAt) : null,
            consecutiveCorrect: (d.consecutiveCorrect as number) || 0,
          }));
          setFlashcards(parsed);
        } else {
          setFlashcards(DEFAULT_SAMPLE_FLASHCARDS);
        }
      } catch (e) {
        console.warn("Could not fetch user flashcards, using defaults:", e);
        setFlashcards(DEFAULT_SAMPLE_FLASHCARDS);
      } finally {
        setLoading(false);
      }
    }

    loadCards();
  }, [userId]);

  const dueFlashcards = useMemo(() => {
    const now = new Date();
    return flashcards.filter((c) => new Date(c.nextReviewAt) <= now);
  }, [flashcards]);

  const rateFlashcard = async (cardId: string, quality: 0 | 1 | 2 | 3) => {
    const card = flashcards.find((c) => c.id === cardId);
    if (!card) return;

    const sm2 = calculateSM2(
      quality,
      card.interval,
      card.easeFactor,
      card.consecutiveCorrect
    );

    const updatedCard: Flashcard = {
      ...card,
      interval: sm2.interval,
      easeFactor: sm2.easeFactor,
      consecutiveCorrect: sm2.consecutiveCorrect,
      nextReviewAt: sm2.nextReviewAt,
      lastReviewedAt: new Date(),
    };

    // Optimistic UI update
    setFlashcards((prev) => prev.map((c) => (c.id === cardId ? updatedCard : c)));

    if (userId) {
      try {
        await saveFlashcard(cardId, {
          userId,
          topicId: updatedCard.topicId,
          front: updatedCard.front,
          back: updatedCard.back,
          interval: updatedCard.interval,
          easeFactor: updatedCard.easeFactor,
          consecutiveCorrect: updatedCard.consecutiveCorrect,
          nextReviewAt: updatedCard.nextReviewAt,
          lastReviewedAt: updatedCard.lastReviewedAt,
        });
      } catch (err) {
        console.error("Failed to save flashcard rating to Firestore:", err);
      }
    }
  };

  return {
    flashcards,
    dueFlashcards,
    loading,
    rateFlashcard,
  };
}
