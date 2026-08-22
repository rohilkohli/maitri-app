import { Flashcard } from "@/types";

/**
 * SuperMemo-2 (SM-2) Spaced Repetition Algorithm
 * Quality ratings:
 * 0: Again (complete blackout)
 * 1: Hard (correct response with hesitation/struggle)
 * 2: Good (correct response with modest effort)
 * 3: Easy (perfect response)
 */
export interface SM2Result {
  interval: number; // in days
  easeFactor: number;
  consecutiveCorrect: number;
  nextReviewAt: Date;
}

export function calculateSM2(
  quality: 0 | 1 | 2 | 3,
  currentInterval: number = 0,
  currentEaseFactor: number = 2.5,
  currentConsecutiveCorrect: number = 0
): SM2Result {
  // Ease factor formula: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  // We map quality [0, 1, 2, 3] to SM-2 scale [0, 3, 4, 5]
  const qMap = [0, 3, 4, 5];
  const q = qMap[quality];

  let easeFactor = currentEaseFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  if (easeFactor < 1.3) {
    easeFactor = 1.3; // minimum floor
  }

  let interval: number;
  let consecutiveCorrect: number;

  if (quality === 0) {
    // Again: reset consecutive streak and short interval
    consecutiveCorrect = 0;
    interval = 0.01; // ~15 minutes
  } else if (quality === 1) {
    // Hard: repeat sooner
    consecutiveCorrect = currentConsecutiveCorrect + 1;
    interval = Math.max(1, Math.round(currentInterval * 1.2));
  } else {
    // Good or Easy
    consecutiveCorrect = currentConsecutiveCorrect + 1;
    if (consecutiveCorrect === 1) {
      interval = 1;
    } else if (consecutiveCorrect === 2) {
      interval = quality === 3 ? 6 : 4;
    } else {
      const multiplier = quality === 3 ? easeFactor * 1.3 : easeFactor;
      interval = Math.round(currentInterval * multiplier);
    }
  }

  const nextReviewAt = new Date();
  if (interval < 1) {
    nextReviewAt.setMinutes(nextReviewAt.getMinutes() + Math.round(interval * 24 * 60));
  } else {
    nextReviewAt.setDate(nextReviewAt.getDate() + interval);
  }

  return {
    interval,
    easeFactor: Number(easeFactor.toFixed(2)),
    consecutiveCorrect,
    nextReviewAt,
  };
}

export function formatIntervalLabel(interval: number): string {
  if (interval < 0.05) return "10 min";
  if (interval < 1) return `${Math.round(interval * 24)} hours`;
  if (interval === 1) return "1 day";
  if (interval < 30) return `${Math.round(interval)} days`;
  const months = Math.round(interval / 30);
  return `${months} month${months > 1 ? "s" : ""}`;
}
