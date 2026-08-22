"use client";

import { useEffect, useState, useMemo } from "react";
import { LearnerTopicState, TopicStatus } from "@/types";
import { subscribeLearnerTopicStates, saveLearnerTopicState } from "@/lib/firebase";
import { calculateOverallMastery } from "@/lib/utils";

export function useLearnerState(userId: string | null | undefined) {
  const [topicStates, setTopicStates] = useState<LearnerTopicState[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setTopicStates([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeLearnerTopicStates(userId, (data) => {
      const parsed: LearnerTopicState[] = data.map((d) => ({
        id: (d.id as string) || `${userId}_${d.topicId}`,
        userId: d.userId as string,
        topicId: d.topicId as string,
        mastery: typeof d.mastery === "number" ? d.mastery : 0,
        confidence: typeof d.confidence === "number" ? d.confidence : 0,
        status: (d.status as TopicStatus) || TopicStatus.NOT_ASSESSED,
        attemptCount: (d.attemptCount as number) || 0,
        correctAttempts: (d.correctAttempts as number) || 0,
        misconceptions: Array.isArray(d.misconceptions) ? d.misconceptions : [],
        lastReviewedAt: d.lastReviewedAt ? new Date(d.lastReviewedAt.toDate?.() || d.lastReviewedAt) : null,
        nextReviewAt: d.nextReviewAt ? new Date(d.nextReviewAt.toDate?.() || d.nextReviewAt) : null,
        evidenceIds: Array.isArray(d.evidenceIds) ? d.evidenceIds : [],
      }));

      setTopicStates(parsed);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  const stats = useMemo(() => {
    const total = topicStates.length;
    const mastered = topicStates.filter((s) => s.status === TopicStatus.MASTERED).length;
    const developing = topicStates.filter((s) => s.status === TopicStatus.DEVELOPING).length;
    const weak = topicStates.filter((s) => s.status === TopicStatus.WEAK).length;
    const notAssessed = topicStates.filter((s) => s.status === TopicStatus.NOT_ASSESSED).length;

    const masteries = topicStates.map((s) => s.mastery);
    const overallMastery = calculateOverallMastery(masteries);

    return {
      total,
      mastered,
      developing,
      weak,
      notAssessed,
      overallMastery: Number(overallMastery.toFixed(2)),
      overallMasteryPercentage: Math.round(overallMastery * 100),
    };
  }, [topicStates]);

  const updateTopicState = async (
    topicId: string,
    data: Partial<LearnerTopicState>
  ) => {
    if (!userId) return;
    await saveLearnerTopicState(userId, topicId, data);
  };

  return {
    topicStates,
    loading,
    stats,
    updateTopicState,
  };
}
