import { calculateMasteryUpdate, applyTimeDecay } from '../mastery-calculator';
import { ConfidenceLevel, TopicStatus } from '@/types';

describe('Mastery Calculator', () => {
  describe('calculateMasteryUpdate', () => {
    it('should increase mastery for correct answers', () => {
      const result = calculateMasteryUpdate({
        currentMastery: 0.5,
        isCorrect: true,
        confidenceBefore: ConfidenceLevel.SOMEWHAT_SURE,
      });

      expect(result.newMastery).toBeGreaterThan(0.5);
      expect(result.masteryDelta).toBeGreaterThan(0);
    });

    it('should decrease mastery for incorrect answers', () => {
      const result = calculateMasteryUpdate({
        currentMastery: 0.5,
        isCorrect: false,
        confidenceBefore: ConfidenceLevel.SOMEWHAT_SURE,
      });

      expect(result.newMastery).toBeLessThan(0.5);
      expect(result.masteryDelta).toBeLessThan(0);
    });

    it('should give larger gains when confident and correct', () => {
      const confidentResult = calculateMasteryUpdate({
        currentMastery: 0.5,
        isCorrect: true,
        confidenceBefore: ConfidenceLevel.CONFIDENT,
      });

      const unsureResult = calculateMasteryUpdate({
        currentMastery: 0.5,
        isCorrect: true,
        confidenceBefore: ConfidenceLevel.SOMEWHAT_SURE,
      });

      expect(confidentResult.masteryDelta).toBeGreaterThan(unsureResult.masteryDelta);
    });

    it('should give larger penalty when confident and incorrect', () => {
      const confidentResult = calculateMasteryUpdate({
        currentMastery: 0.5,
        isCorrect: false,
        confidenceBefore: ConfidenceLevel.CONFIDENT,
      });

      const guessingResult = calculateMasteryUpdate({
        currentMastery: 0.5,
        isCorrect: false,
        confidenceBefore: ConfidenceLevel.GUESSING,
      });

      expect(Math.abs(confidentResult.masteryDelta)).toBeGreaterThan(
        Math.abs(guessingResult.masteryDelta)
      );
    });

    it('should cap mastery at 1.0', () => {
      const result = calculateMasteryUpdate({
        currentMastery: 0.95,
        isCorrect: true,
        confidenceBefore: ConfidenceLevel.CONFIDENT,
        difficulty: 0.9,
      });

      expect(result.newMastery).toBeLessThanOrEqual(1.0);
    });

    it('should not go below 0', () => {
      const result = calculateMasteryUpdate({
        currentMastery: 0.1,
        isCorrect: false,
        confidenceBefore: ConfidenceLevel.CONFIDENT,
        difficulty: 0.2,
      });

      expect(result.newMastery).toBeGreaterThanOrEqual(0);
    });

    it('should return MASTERED status for high mastery', () => {
      const result = calculateMasteryUpdate({
        currentMastery: 0.78,
        isCorrect: true,
        confidenceBefore: ConfidenceLevel.CONFIDENT,
      });

      expect(result.newStatus).toBe(TopicStatus.MASTERED);
    });

    it('should return DEVELOPING status for medium mastery', () => {
      const result = calculateMasteryUpdate({
        currentMastery: 0.5,
        isCorrect: true,
        confidenceBefore: ConfidenceLevel.SOMEWHAT_SURE,
      });

      expect(result.newStatus).toBe(TopicStatus.DEVELOPING);
    });

    it('should return WEAK status for low mastery', () => {
      const result = calculateMasteryUpdate({
        currentMastery: 0.5,
        isCorrect: false,
        confidenceBefore: ConfidenceLevel.CONFIDENT,
      });

      expect(result.newStatus).toBe(TopicStatus.WEAK);
    });

    it('should apply difficulty factor correctly', () => {
      const hardCorrect = calculateMasteryUpdate({
        currentMastery: 0.5,
        isCorrect: true,
        confidenceBefore: ConfidenceLevel.SOMEWHAT_SURE,
        difficulty: 0.9,
      });

      const easyCorrect = calculateMasteryUpdate({
        currentMastery: 0.5,
        isCorrect: true,
        confidenceBefore: ConfidenceLevel.SOMEWHAT_SURE,
        difficulty: 0.2,
      });

      expect(hardCorrect.masteryDelta).toBeGreaterThan(easyCorrect.masteryDelta);
    });

    it('should apply speed bonus for quick correct answers', () => {
      const quickResult = calculateMasteryUpdate({
        currentMastery: 0.5,
        isCorrect: true,
        confidenceBefore: ConfidenceLevel.SOMEWHAT_SURE,
        responseTimeSeconds: 20,
        expectedTimeSeconds: 45,
      });

      const slowResult = calculateMasteryUpdate({
        currentMastery: 0.5,
        isCorrect: true,
        confidenceBefore: ConfidenceLevel.SOMEWHAT_SURE,
        responseTimeSeconds: 60,
        expectedTimeSeconds: 45,
      });

      expect(quickResult.masteryDelta).toBeGreaterThan(slowResult.masteryDelta);
    });
  });

  describe('applyTimeDecay', () => {
    it('should not decay mastery within 2 days', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const result = applyTimeDecay(0.8, yesterday);
      expect(result).toBe(0.8);
    });

    it('should decay mastery after grace period', () => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const result = applyTimeDecay(0.8, weekAgo);
      expect(result).toBeLessThan(0.8);
    });

    it('should not decay below minimum threshold', () => {
      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 60);

      const result = applyTimeDecay(0.8, monthAgo);
      expect(result).toBeGreaterThanOrEqual(0.1);
    });

    it('should return original mastery if never reviewed', () => {
      const result = applyTimeDecay(0.5, null);
      expect(result).toBe(0.5);
    });

    it('should return 0 for 0 mastery regardless of time', () => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const result = applyTimeDecay(0, weekAgo);
      expect(result).toBe(0);
    });
  });
});
