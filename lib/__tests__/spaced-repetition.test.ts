import { calculateSM2, formatIntervalLabel } from '../spaced-repetition';

describe('Spaced Repetition (SM-2 Algorithm)', () => {
  describe('calculateSM2', () => {
    it('should reset interval for quality 0 (Again)', () => {
      const result = calculateSM2(0, 10, 2.5, 5);

      expect(result.interval).toBe(0.01);
      expect(result.consecutiveCorrect).toBe(0);
    });

    it('should increase interval for quality 1 (Hard)', () => {
      const result = calculateSM2(1, 5, 2.5, 2);

      expect(result.interval).toBe(6); // 5 * 1.2 = 6
      expect(result.consecutiveCorrect).toBe(3);
    });

    it('should set interval to 1 for first correct answer', () => {
      const result = calculateSM2(2, 0, 2.5, 0);

      expect(result.interval).toBe(1);
      expect(result.consecutiveCorrect).toBe(1);
    });

    it('should set interval to 4-6 days for second consecutive correct', () => {
      const goodResult = calculateSM2(2, 1, 2.5, 1);
      const easyResult = calculateSM2(3, 1, 2.5, 1);

      expect(goodResult.interval).toBe(4);
      expect(easyResult.interval).toBe(6);
    });

    it('should multiply interval by ease factor for subsequent reviews', () => {
      const result = calculateSM2(2, 4, 2.5, 2);

      expect(result.interval).toBe(10); // 4 * 2.5 = 10
    });

    it('should apply higher multiplier for Easy responses', () => {
      const goodResult = calculateSM2(2, 10, 2.5, 3);
      const easyResult = calculateSM2(3, 10, 2.5, 3);

      expect(easyResult.interval).toBeGreaterThan(goodResult.interval);
    });

    it('should not let ease factor go below 1.3', () => {
      const result = calculateSM2(0, 5, 1.5, 3);

      expect(result.easeFactor).toBeGreaterThanOrEqual(1.3);
    });

    it('should increase ease factor for Easy responses', () => {
      const result = calculateSM2(3, 5, 2.5, 3);

      expect(result.easeFactor).toBeGreaterThan(2.5);
    });

    it('should decrease ease factor for Hard responses', () => {
      const result = calculateSM2(1, 5, 2.5, 3);

      expect(result.easeFactor).toBeLessThan(2.5);
    });

    it('should return a valid nextReviewAt date', () => {
      const result = calculateSM2(2, 5, 2.5, 3);

      expect(result.nextReviewAt).toBeInstanceOf(Date);
      expect(result.nextReviewAt.getTime()).toBeGreaterThan(Date.now());
    });

    it('should set nextReviewAt in minutes for short intervals', () => {
      const result = calculateSM2(0, 5, 2.5, 3);
      const now = new Date();

      // Should be within a few hours, not days
      const diffHours = (result.nextReviewAt.getTime() - now.getTime()) / (1000 * 60 * 60);
      expect(diffHours).toBeLessThan(1);
    });
  });

  describe('formatIntervalLabel', () => {
    it('should format very short intervals as minutes', () => {
      expect(formatIntervalLabel(0.01)).toBe('10 min');
    });

    it('should format sub-day intervals as hours', () => {
      expect(formatIntervalLabel(0.5)).toBe('12 hours');
    });

    it('should format 1 day correctly', () => {
      expect(formatIntervalLabel(1)).toBe('1 day');
    });

    it('should format multiple days correctly', () => {
      expect(formatIntervalLabel(5)).toBe('5 days');
      expect(formatIntervalLabel(14)).toBe('14 days');
    });

    it('should format months correctly', () => {
      expect(formatIntervalLabel(30)).toBe('1 month');
      expect(formatIntervalLabel(60)).toBe('2 months');
      expect(formatIntervalLabel(90)).toBe('3 months');
    });
  });
});
