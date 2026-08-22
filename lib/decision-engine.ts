import {
  ActivityType,
  LearnerTopicState,
  Recommendation,
  Topic,
  TopicStatus,
} from "@/types";
import { daysUntil } from "@/lib/utils";

export interface DecisionEngineInput {
  topics: Topic[];
  topicStates: LearnerTopicState[];
  examDate?: Date | null;
  dueFlashcardsCount?: number;
  recentAttemptCount?: number;
}

/**
 * Maitri Decision Engine
 * "Every answer changes the path."
 *
 * Evaluates knowledge graph, prerequisite chains, mastery levels,
 * memory decay, and upcoming deadlines to determine optimal next study action.
 */
export function runDecisionEngine(input: DecisionEngineInput): Recommendation {
  const {
    topics,
    topicStates,
    examDate,
    dueFlashcardsCount = 0,
  } = input;

  if (!topics || topics.length === 0) {
    return {
      activityType: ActivityType.DIAGNOSTIC,
      topicId: "",
      topicName: "Initial Assessment",
      reason: "No topics configured yet. Complete the onboarding diagnostic to build your baseline roadmap.",
      priority: 1.0,
      evidence: ["No baseline evaluation found", "Diagnostic required to build prerequisite map"],
    };
  }

  // Create state map for O(1) lookup
  const stateMap = new Map<string, LearnerTopicState>();
  for (const s of topicStates) {
    stateMap.set(s.topicId, s);
  }

  // 1. Spaced Repetition Priority: If > 5 flashcards are overdue, prioritize active recall review
  if (dueFlashcardsCount >= 5) {
    return {
      activityType: ActivityType.FLASHCARD,
      topicId: topics[0]?.id || "",
      topicName: "Spaced Retrieval Review",
      reason: `You have ${dueFlashcardsCount} flashcards due for review. Active recall before new learning reinforces synaptic retention.`,
      priority: 0.95,
      evidence: [
        `${dueFlashcardsCount} cards scheduled past optimal forgetting curve`,
        "SM-2 interval maintenance required",
      ],
    };
  }

  // 2. Build Prerequisite Health Map
  const prerequisiteBlockers = new Map<string, string[]>();
  for (const topic of topics) {
    const unmasteredPrereqs: string[] = [];
    for (const prereqId of topic.prerequisites) {
      const pState = stateMap.get(prereqId);
      const mastery = pState?.mastery ?? 0;
      if (mastery < 0.6) {
        const prereqTopic = topics.find((t) => t.id === prereqId);
        unmasteredPrereqs.push(prereqTopic?.name || prereqId);
      }
    }
    if (unmasteredPrereqs.length > 0) {
      prerequisiteBlockers.set(topic.id, unmasteredPrereqs);
    }
  }

  // 3. Check for Prerequisite Bottlenecks
  // If a user is struggling with a topic, check if its prerequisite is weak
  for (const topic of topics) {
    const s = stateMap.get(topic.id);
    if (s && s.status === TopicStatus.WEAK && s.attemptCount >= 2) {
      for (const prereqId of topic.prerequisites) {
        const pState = stateMap.get(prereqId);
        if (!pState || pState.mastery < 0.7) {
          const prereqTopic = topics.find((t) => t.id === prereqId);
          return {
            activityType: ActivityType.LESSON,
            topicId: prereqId,
            topicName: prereqTopic?.name || "Prerequisite Review",
            reason: `You missed ${s.attemptCount - s.correctAttempts}/${s.attemptCount} recent questions on "${topic.name}". Mastering "${prereqTopic?.name || 'Prerequisite'}" first is essential for clarity.`,
            priority: 0.92,
            evidence: [
              `Target topic "${topic.name}" mastery is at ${Math.round(s.mastery * 100)}%`,
              `Prerequisite "${prereqTopic?.name}" has mastery ${Math.round((pState?.mastery ?? 0) * 100)}% (< 70% threshold)`,
              `${s.misconceptions.length} misconceptions flagged in downstream attempts`,
            ],
          };
        }
      }
    }
  }

  // 4. Candidate Scoring Algorithm
  interface ScoredCandidate {
    topic: Topic;
    state?: LearnerTopicState;
    score: number;
    activityType: ActivityType;
    reasons: string[];
    evidence: string[];
  }

  const candidates: ScoredCandidate[] = [];
  const daysToExam = examDate ? Math.max(1, daysUntil(new Date(examDate))) : 30;

  for (const topic of topics) {
    const state = stateMap.get(topic.id);
    const mastery = state?.mastery ?? 0;
    const blockers = prerequisiteBlockers.get(topic.id) || [];

    // If heavily blocked by prerequisites, reduce score
    if (blockers.length > 0) {
      continue;
    }

    let score = 0;
    let activityType = ActivityType.PRACTICE;
    const reasons: string[] = [];
    const evidence: string[] = [];

    // Importance weighting (0 to 1)
    const importance = topic.importance ?? 0.5;
    score += importance * 30;

    // Exam urgency multiplier
    const urgency = Math.min(2.0, 45 / daysToExam);

    if (!state || state.status === TopicStatus.NOT_ASSESSED) {
      // Unassessed topic
      score += 50 * urgency;
      activityType = ActivityType.LESSON;
      reasons.push(`You haven't assessed "${topic.name}" yet.`);
      evidence.push("0 diagnostic attempts recorded", `Topic weight: ${(importance * 100).toFixed(0)}%`);
    } else if (state.status === TopicStatus.WEAK) {
      // Weak topic (< 40%) - needs structured lesson + remedial practice
      score += (80 - mastery * 50) * urgency;
      activityType = state.attemptCount > 3 ? ActivityType.LESSON : ActivityType.PRACTICE;
      reasons.push(`Mastery on "${topic.name}" is currently at ${Math.round(mastery * 100)}%.`);
      evidence.push(
        `Accuracy: ${state.correctAttempts}/${state.attemptCount} (${Math.round((state.correctAttempts / Math.max(1, state.attemptCount)) * 100)}%)`,
        state.misconceptions.length > 0 ? `Misconceptions detected: ${state.misconceptions.slice(0, 2).join(", ")}` : "Needs foundational reinforcement"
      );
    } else if (state.status === TopicStatus.DEVELOPING) {
      // Developing topic (40% - 79%) - Zone of Proximal Development (ZPD) sweet spot!
      score += 70 * urgency;
      activityType = ActivityType.PRACTICE;
      reasons.push(`You are making great progress on "${topic.name}" (${Math.round(mastery * 100)}%). Targeted practice will push it to Mastery.`);
      evidence.push(
        `Current mastery: ${Math.round(mastery * 100)}% (Developing)`,
        `${state.attemptCount} practice attempts logged`,
        "All prerequisites are satisfied"
      );
    } else if (state.status === TopicStatus.MASTERED) {
      // Mastered topic - maintenance review if days elapsed
      const lastReviewed = state.lastReviewedAt ? new Date(state.lastReviewedAt) : null;
      const daysSinceReview = lastReviewed ? (Date.now() - lastReviewed.getTime()) / (86400000) : 0;
      if (daysSinceReview > 5) {
        score += 25 + daysSinceReview * 2;
        activityType = ActivityType.REVIEW;
        reasons.push(`Maintain retention for mastered topic "${topic.name}".`);
        evidence.push(`Last practiced ${Math.round(daysSinceReview)} days ago`, `Mastery: ${Math.round(mastery * 100)}%`);
      }
    }

    candidates.push({
      topic,
      state,
      score,
      activityType,
      reasons,
      evidence,
    });
  }

  // Sort descending by score
  candidates.sort((a, b) => b.score - a.score);

  if (candidates.length > 0) {
    const top = candidates[0];
    return {
      activityType: top.activityType,
      topicId: top.topic.id,
      topicName: top.topic.name,
      reason: top.reasons.join(" "),
      priority: Math.min(1.0, top.score / 100),
      evidence: top.evidence,
    };
  }

  // Fallback
  return {
    activityType: ActivityType.PRACTICE,
    topicId: topics[0]?.id || "",
    topicName: topics[0]?.name || "Practice Session",
    reason: "Continue your personalized curriculum to build mastery.",
    priority: 0.7,
    evidence: ["Standard study queue progression"],
  };
}
