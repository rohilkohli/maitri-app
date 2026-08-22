import {
  cn,
  getMasteryColor,
  getMasteryGradient,
  getStatusFromMastery,
  formatDate,
  formatRelativeDate,
  formatDuration,
  generateId,
  calculateOverallMastery,
  daysUntil,
} from '../utils';
import { TopicStatus } from '@/types';

describe('Utils', () => {
  describe('cn (className merger)', () => {
    it('should merge class names', () => {
      expect(cn('bg-red-500', 'text-white')).toBe('bg-red-500 text-white');
    });

    it('should handle conditional classes', () => {
      expect(cn('base', false && 'hidden', true && 'visible')).toBe('base visible');
    });

    it('should resolve Tailwind conflicts', () => {
      expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500');
    });
  });

  describe('getMasteryColor', () => {
    it('should return green for high mastery', () => {
      expect(getMasteryColor(0.9)).toContain('160');
    });

    it('should return amber for medium mastery', () => {
      expect(getMasteryColor(0.5)).toContain('38');
    });

    it('should return red for low mastery', () => {
      expect(getMasteryColor(0.2)).toContain('0');
    });
  });

  describe('getMasteryGradient', () => {
    it('should return emerald gradient for mastered', () => {
      expect(getMasteryGradient(0.85)).toContain('emerald');
    });

    it('should return amber gradient for developing', () => {
      expect(getMasteryGradient(0.5)).toContain('amber');
    });

    it('should return red gradient for weak', () => {
      expect(getMasteryGradient(0.2)).toContain('red');
    });
  });

  describe('getStatusFromMastery', () => {
    it('should return MASTERED for 80%+', () => {
      expect(getStatusFromMastery(0.8)).toBe(TopicStatus.MASTERED);
      expect(getStatusFromMastery(0.95)).toBe(TopicStatus.MASTERED);
    });

    it('should return DEVELOPING for 40-79%', () => {
      expect(getStatusFromMastery(0.4)).toBe(TopicStatus.DEVELOPING);
      expect(getStatusFromMastery(0.79)).toBe(TopicStatus.DEVELOPING);
    });

    it('should return WEAK for 1-39%', () => {
      expect(getStatusFromMastery(0.1)).toBe(TopicStatus.WEAK);
      expect(getStatusFromMastery(0.39)).toBe(TopicStatus.WEAK);
    });

    it('should return NOT_ASSESSED for 0', () => {
      expect(getStatusFromMastery(0)).toBe(TopicStatus.NOT_ASSESSED);
    });
  });

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2024-03-15');
      const formatted = formatDate(date);
      expect(formatted).toContain('Mar');
      expect(formatted).toContain('15');
      expect(formatted).toContain('2024');
    });
  });

  describe('formatRelativeDate', () => {
    it('should return "just now" for recent dates', () => {
      const now = new Date();
      expect(formatRelativeDate(now)).toBe('just now');
    });

    it('should return minutes ago', () => {
      const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
      expect(formatRelativeDate(fiveMinAgo)).toBe('5m ago');
    });

    it('should return hours ago', () => {
      const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
      expect(formatRelativeDate(threeHoursAgo)).toBe('3h ago');
    });

    it('should return days ago', () => {
      const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
      expect(formatRelativeDate(twoDaysAgo)).toBe('2d ago');
    });
  });

  describe('formatDuration', () => {
    it('should format seconds only', () => {
      expect(formatDuration(45)).toBe('45s');
    });

    it('should format minutes and seconds', () => {
      expect(formatDuration(125)).toBe('2m 5s');
    });

    it('should handle exact minutes', () => {
      expect(formatDuration(120)).toBe('2m 0s');
    });
  });

  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
    });

    it('should generate non-empty strings', () => {
      const id = generateId();
      expect(id.length).toBeGreaterThan(0);
    });
  });

  describe('calculateOverallMastery', () => {
    it('should calculate average mastery', () => {
      expect(calculateOverallMastery([0.8, 0.6, 0.4])).toBeCloseTo(0.6);
    });

    it('should return 0 for empty array', () => {
      expect(calculateOverallMastery([])).toBe(0);
    });

    it('should handle single value', () => {
      expect(calculateOverallMastery([0.75])).toBe(0.75);
    });
  });

  describe('daysUntil', () => {
    it('should return positive days for future dates', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 10);
      expect(daysUntil(futureDate)).toBeGreaterThan(0);
    });

    it('should return negative days for past dates', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 5);
      expect(daysUntil(pastDate)).toBeLessThan(0);
    });

    it('should return approximately correct days', () => {
      const tenDaysLater = new Date();
      tenDaysLater.setDate(tenDaysLater.getDate() + 10);
      const days = daysUntil(tenDaysLater);
      expect(days).toBeGreaterThanOrEqual(9);
      expect(days).toBeLessThanOrEqual(11);
    });
  });
});
