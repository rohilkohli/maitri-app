import { ConfidenceLevel, TopicStatus } from "@/types";

export interface MasteryUpdateParams {
  currentMastery: number; // 0 - 1
  isCorrect: boolean;
  confidenceBefore: ConfidenceLevel;
  difficulty?: number; // 0 - 1 (default 0.5)
  responseTimeSeconds?: number;
  expectedTimeSeconds?: number;
}

export interface MasteryUpdateResult {
  newMastery: number;
  masteryDelta: number;
  newStatus: TopicStatus;
  confidenceScore: number;
}

/**
 * Bayesian-inspired Mastery Calculator
 * Accounts for correctness, learner confidence, question difficulty, and speed.
 */
export function calculateMasteryUpdate(params: MasteryUpdateParams): MasteryUpdateResult {
  const {
    currentMastery,
    isCorrect,
    confidenceBefore,
    difficulty = 0.5,
    responseTimeSeconds = 30,
    expectedTimeSeconds = 45,
  } = params;

  // Base learning rate
  const learningRate = 0.18;

  // Confidence weighting multiplier
  let confidenceWeight = 1.0;
  if (confidenceBefore === ConfidenceLevel.CONFIDENT) {
    confidenceWeight = 1.35; // high stake: larger gain if right, larger penalty if wrong
  } else if (confidenceBefore === ConfidenceLevel.SOMEWHAT_SURE) {
    confidenceWeight = 1.0;
  } else if (confidenceBefore === ConfidenceLevel.GUESSING) {
    confidenceWeight = 0.65; // lower stake: guessing right shouldn't grant full mastery
  }

  // Difficulty adjustment: solving hard problems gives more, failing easy ones penalizes more
  const difficultyFactor = isCorrect ? 0.8 + difficulty * 0.4 : 1.2 - difficulty * 0.4;

  // Speed factor: optimal speed bonus vs rushed/struggled penalty
  let speedFactor = 1.0;
  if (responseTimeSeconds < expectedTimeSeconds * 0.3 && !isCorrect) {
    // Rushed and got it wrong
    speedFactor = 1.15;
  } else if (responseTimeSeconds <= expectedTimeSeconds && isCorrect) {
    // Fluency bonus
    speedFactor = 1.05;
  }

  let delta = 0;
  if (isCorrect) {
    // Diminishing returns formula as mastery approaches 1.0
    const headroom = 1.0 - currentMastery;
    delta = headroom * learningRate * confidenceWeight * difficultyFactor * speedFactor;
  } else {
    // Drop proportional to current mastery and confidence
    delta = -1 * (currentMastery * 0.25 + 0.08) * confidenceWeight * difficultyFactor;
  }

  // Bound mastery between 0 and 1
  let newMastery = Math.max(0.0, Math.min(1.0, currentMastery + delta));
  newMastery = Number(newMastery.toFixed(3));
  const masteryDelta = Number((newMastery - currentMastery).toFixed(3));

  // Determine topic status
  let newStatus = TopicStatus.NOT_ASSESSED;
  if (newMastery >= 0.8) {
    newStatus = TopicStatus.MASTERED;
  } else if (newMastery >= 0.4) {
    newStatus = TopicStatus.DEVELOPING;
  } else {
    newStatus = TopicStatus.WEAK;
  }

  // Calculate meta-confidence score
  const confidenceScore = confidenceBefore === ConfidenceLevel.CONFIDENT ? 0.9 : confidenceBefore === ConfidenceLevel.SOMEWHAT_SURE ? 0.6 : 0.3;

  return {
    newMastery,
    masteryDelta,
    newStatus,
    confidenceScore,
  };
}

/**
 * Apply forgetting curve decay to topics not reviewed recently
 */
export function applyTimeDecay(mastery: number, lastReviewedAt: Date | null): number {
  if (!lastReviewedAt || mastery === 0) return mastery;

  const now = new Date();
  const daysSince = Math.max(0, (now.getTime() - lastReviewedAt.getTime()) / (1000 * 60 * 60 * 24));

  if (daysSince <= 2) return mastery;

  // Half-life decay model based on Ebbinghaus forgetting curve
  const decayRate = 0.015; // 1.5% decay per day after grace period
  const decayed = mastery * Math.exp(-decayRate * (daysSince - 2));

  return Number(Math.max(0.1, decayed).toFixed(3));
}
