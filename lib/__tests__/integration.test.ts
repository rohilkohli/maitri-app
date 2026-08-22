/**
 * Integration tests for the adaptive learning system
 * Tests the interaction between multiple modules
 */

import { calculateMasteryUpdate } from '../mastery-calculator';
import { calculateSM2 } from '../spaced-repetition';
import { runDecisionEngine } from '../decision-engine';
import { getStatusFromMastery } from '../utils';
import { validateProfileData, sanitizeInput } from '../validation';
import { ConfidenceLevel, TopicStatus, ActivityType } from '@/types';

describe('Integration: Learning Flow', () => {
  describe('Complete learning session simulation', () => {
    it('should correctly update mastery through multiple attempts', () => {
      let mastery = 0.3;

      // Attempt 1: Correct with medium confidence
      const result1 = calculateMasteryUpdate({
        currentMastery: mastery,
        isCorrect: true,
        confidenceBefore: ConfidenceLevel.SOMEWHAT_SURE,
      });
      mastery = result1.newMastery;
      expect(mastery).toBeGreaterThan(0.3);

      // Attempt 2: Correct with high confidence
      const result2 = calculateMasteryUpdate({
        currentMastery: mastery,
        isCorrect: true,
        confidenceBefore: ConfidenceLevel.CONFIDENT,
      });
      mastery = result2.newMastery;
      expect(mastery).toBeGreaterThan(result1.newMastery);

      // Attempt 3: Incorrect
      const result3 = calculateMasteryUpdate({
        currentMastery: mastery,
        isCorrect: false,
        confidenceBefore: ConfidenceLevel.SOMEWHAT_SURE,
      });
      mastery = result3.newMastery;
      expect(mastery).toBeLessThan(result2.newMastery);

      // Status should reflect current mastery
      const status = getStatusFromMastery(mastery);
      expect([TopicStatus.WEAK, TopicStatus.DEVELOPING]).toContain(status);
    });

    it('should integrate mastery with spaced repetition scheduling', () => {
      // Student answers correctly with good confidence
      const masteryResult = calculateMasteryUpdate({
        currentMastery: 0.5,
        isCorrect: true,
        confidenceBefore: ConfidenceLevel.CONFIDENT,
      });

      // Based on performance, schedule next review
      const quality = masteryResult.newMastery >= 0.7 ? 3 : 2; // Easy if high mastery
      const sm2Result = calculateSM2(quality, 1, 2.5, 1);

      expect(sm2Result.interval).toBeGreaterThan(0);
      expect(sm2Result.nextReviewAt).toBeInstanceOf(Date);
    });
  });

  describe('Decision engine with real data', () => {
    it('should recommend appropriate activities based on mastery levels', () => {
      const topics = [
        { id: 't1', name: 'Basics', prerequisites: [], subtopics: [], importance: 0.9, description: '' },
        { id: 't2', name: 'Intermediate', prerequisites: ['t1'], subtopics: [], importance: 0.8, description: '' },
        { id: 't3', name: 'Advanced', prerequisites: ['t2'], subtopics: [], importance: 0.7, description: '' },
      ];

      // Scenario 1: All topics weak
      const result1 = runDecisionEngine({
        topics,
        topicStates: [
          { topicId: 't1', mastery: 0.2, status: TopicStatus.WEAK, attemptCount: 2, correctAttempts: 0, misconceptions: [], lastReviewedAt: new Date() },
        ],
      });
      expect(result1.topicId).toBe('t1'); // Should focus on basics first

      // Scenario 2: Basics mastered
      const result2 = runDecisionEngine({
        topics,
        topicStates: [
          { topicId: 't1', mastery: 0.9, status: TopicStatus.MASTERED, attemptCount: 10, correctAttempts: 9, misconceptions: [], lastReviewedAt: new Date() },
        ],
      });
      expect(['t2', 't3']).toContain(result2.topicId); // Should move to next topics
    });
  });

  describe('Input validation integration', () => {
    it('should sanitize and validate user profile data', () => {
      const rawInput = '  <script>alert("xss")</script>Mathematics  ';
      const sanitized = sanitizeInput(rawInput);

      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('</script>');

      const validation = validateProfileData({
        subject: sanitized,
        classLevel: '10th Class',
        board: 'CBSE',
      });

      expect(validation.isValid).toBe(true);
    });

    it('should reject malicious inputs', () => {
      const validation = validateProfileData({
        subject: 'a', // Too short
        classLevel: '',
        board: null as any,
      });

      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });
  });
});

describe('Integration: Edge Cases', () => {
  it('should handle mastery at boundaries', () => {
    // At minimum
    const minResult = calculateMasteryUpdate({
      currentMastery: 0,
      isCorrect: true,
      confidenceBefore: ConfidenceLevel.GUESSING,
    });
    expect(minResult.newMastery).toBeGreaterThan(0);
    expect(minResult.newMastery).toBeLessThanOrEqual(1);

    // At maximum
    const maxResult = calculateMasteryUpdate({
      currentMastery: 1,
      isCorrect: false,
      confidenceBefore: ConfidenceLevel.CONFIDENT,
    });
    expect(maxResult.newMastery).toBeLessThan(1);
    expect(maxResult.newMastery).toBeGreaterThanOrEqual(0);
  });

  it('should handle empty topic lists gracefully', () => {
    const result = runDecisionEngine({
      topics: [],
      topicStates: [],
    });

    expect(result.activityType).toBe(ActivityType.DIAGNOSTIC);
    expect(result.reason).toBeTruthy();
  });

  it('should handle rapid consecutive updates', () => {
    let mastery = 0.5;
    const results = [];

    for (let i = 0; i < 10; i++) {
      const result = calculateMasteryUpdate({
        currentMastery: mastery,
        isCorrect: i % 2 === 0, // Alternating correct/incorrect
        confidenceBefore: ConfidenceLevel.SOMEWHAT_SURE,
      });
      mastery = result.newMastery;
      results.push(result);
    }

    // All results should be valid
    results.forEach(r => {
      expect(r.newMastery).toBeGreaterThanOrEqual(0);
      expect(r.newMastery).toBeLessThanOrEqual(1);
    });
  });
});

describe('Integration: Performance', () => {
  it('should handle large topic lists efficiently', () => {
    const topics = Array.from({ length: 100 }, (_, i) => ({
      id: `topic-${i}`,
      name: `Topic ${i}`,
      prerequisites: i > 0 ? [`topic-${i - 1}`] : [],
      subtopics: [`Sub ${i}`],
      importance: 0.5 + (i / 200),
      description: `Description ${i}`,
    }));

    const topicStates = topics.slice(0, 50).map(t => ({
      topicId: t.id,
      mastery: Math.random() * 0.8,
      status: TopicStatus.DEVELOPING,
      attemptCount: 5,
      correctAttempts: 3,
      misconceptions: [],
      lastReviewedAt: new Date(),
    }));

    const start = Date.now();
    const result = runDecisionEngine({ topics, topicStates });
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(100); // Should complete in under 100ms
    expect(result.topicId).toBeTruthy();
  });
});
