import { runDecisionEngine, DecisionEngineInput } from '../decision-engine';
import { ActivityType, TopicStatus, Topic, LearnerTopicState } from '@/types';

const mockTopics: Topic[] = [
  {
    id: 'topic-1',
    name: 'Basic Algebra',
    prerequisites: [],
    subtopics: ['Variables', 'Expressions'],
    importance: 0.9,
    description: 'Foundation algebra',
  },
  {
    id: 'topic-2',
    name: 'Linear Equations',
    prerequisites: ['topic-1'],
    subtopics: ['Solving', 'Graphing'],
    importance: 0.85,
    description: 'Linear equations',
  },
  {
    id: 'topic-3',
    name: 'Quadratics',
    prerequisites: ['topic-2'],
    subtopics: ['Factoring', 'Formula'],
    importance: 0.8,
    description: 'Quadratic equations',
  },
];

describe('Decision Engine', () => {
  describe('runDecisionEngine', () => {
    it('should recommend diagnostic when no topics exist', () => {
      const result = runDecisionEngine({
        topics: [],
        topicStates: [],
      });

      expect(result.activityType).toBe(ActivityType.DIAGNOSTIC);
      expect(result.priority).toBe(1.0);
    });

    it('should prioritize flashcards when many are due', () => {
      const result = runDecisionEngine({
        topics: mockTopics,
        topicStates: [],
        dueFlashcardsCount: 10,
      });

      expect(result.activityType).toBe(ActivityType.FLASHCARD);
      expect(result.priority).toBe(0.95);
    });

    it('should recommend lesson for unassessed topics', () => {
      const result = runDecisionEngine({
        topics: mockTopics,
        topicStates: [],
      });

      expect(result.activityType).toBe(ActivityType.LESSON);
      expect(result.topicId).toBe('topic-1');
    });

    it('should recommend practice for developing topics', () => {
      const states: LearnerTopicState[] = [
        {
          topicId: 'topic-1',
          mastery: 0.6,
          status: TopicStatus.DEVELOPING,
          attemptCount: 5,
          correctAttempts: 3,
          misconceptions: [],
          lastReviewedAt: new Date(),
        },
      ];

      const result = runDecisionEngine({
        topics: mockTopics,
        topicStates: states,
      });

      expect(result.activityType).toBe(ActivityType.PRACTICE);
    });

    it('should recommend prerequisite when downstream topic is weak', () => {
      const states: LearnerTopicState[] = [
        {
          topicId: 'topic-1',
          mastery: 0.4,
          status: TopicStatus.WEAK,
          attemptCount: 2,
          correctAttempts: 1,
          misconceptions: [],
          lastReviewedAt: new Date(),
        },
        {
          topicId: 'topic-2',
          mastery: 0.2,
          status: TopicStatus.WEAK,
          attemptCount: 3,
          correctAttempts: 0,
          misconceptions: ['confusion'],
          lastReviewedAt: new Date(),
        },
      ];

      const result = runDecisionEngine({
        topics: mockTopics,
        topicStates: states,
      });

      expect(result.topicId).toBe('topic-1');
      expect(result.activityType).toBe(ActivityType.LESSON);
    });

    it('should skip topics with unmastered prerequisites', () => {
      const states: LearnerTopicState[] = [
        {
          topicId: 'topic-1',
          mastery: 0.3,
          status: TopicStatus.WEAK,
          attemptCount: 2,
          correctAttempts: 1,
          misconceptions: [],
          lastReviewedAt: new Date(),
        },
      ];

      const result = runDecisionEngine({
        topics: mockTopics,
        topicStates: states,
      });

      // Should recommend topic-1 (the prerequisite), not topic-2 or topic-3
      expect(result.topicId).toBe('topic-1');
    });

    it('should recommend review for mastered topics not reviewed recently', () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 10);

      const states: LearnerTopicState[] = [
        {
          topicId: 'topic-1',
          mastery: 0.9,
          status: TopicStatus.MASTERED,
          attemptCount: 10,
          correctAttempts: 9,
          misconceptions: [],
          lastReviewedAt: oldDate,
        },
      ];

      const result = runDecisionEngine({
        topics: [mockTopics[0]],
        topicStates: states,
      });

      expect(result.activityType).toBe(ActivityType.REVIEW);
    });

    it('should consider exam urgency in scoring', () => {
      const nearExamDate = new Date();
      nearExamDate.setDate(nearExamDate.getDate() + 7);

      const farExamDate = new Date();
      farExamDate.setDate(farExamDate.getDate() + 60);

      const nearResult = runDecisionEngine({
        topics: mockTopics,
        topicStates: [],
        examDate: nearExamDate,
      });

      const farResult = runDecisionEngine({
        topics: mockTopics,
        topicStates: [],
        examDate: farExamDate,
      });

      expect(nearResult.priority).toBeGreaterThanOrEqual(farResult.priority);
    });

    it('should return valid evidence array', () => {
      const result = runDecisionEngine({
        topics: mockTopics,
        topicStates: [],
      });

      expect(Array.isArray(result.evidence)).toBe(true);
      expect(result.evidence.length).toBeGreaterThan(0);
    });

    it('should return fallback when all topics are mastered', () => {
      const states: LearnerTopicState[] = mockTopics.map((t) => ({
        topicId: t.id,
        mastery: 0.95,
        status: TopicStatus.MASTERED,
        attemptCount: 20,
        correctAttempts: 19,
        misconceptions: [],
        lastReviewedAt: new Date(),
      }));

      const result = runDecisionEngine({
        topics: mockTopics,
        topicStates: states,
      });

      expect(result.activityType).toBeDefined();
      expect(result.topicId).toBeDefined();
    });
  });
});
