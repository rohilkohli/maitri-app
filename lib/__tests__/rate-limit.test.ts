import {
  checkRateLimit,
  resetRateLimit,
  clearAllRateLimits,
  RATE_LIMITS,
} from '../rate-limit';

describe('Rate Limiting', () => {
  beforeEach(() => {
    clearAllRateLimits();
  });

  describe('checkRateLimit', () => {
    it('should allow requests under limit', () => {
      const config = { limit: 5, windowMs: 60000 };
      const key = 'test-user-1';

      const result = checkRateLimit(key, config);

      expect(result.success).toBe(true);
      expect(result.remaining).toBe(4);
    });

    it('should track request count', () => {
      const config = { limit: 5, windowMs: 60000 };
      const key = 'test-user-2';

      checkRateLimit(key, config); // 1st
      checkRateLimit(key, config); // 2nd
      const result = checkRateLimit(key, config); // 3rd

      expect(result.success).toBe(true);
      expect(result.remaining).toBe(2);
    });

    it('should block requests over limit', () => {
      const config = { limit: 3, windowMs: 60000 };
      const key = 'test-user-3';

      checkRateLimit(key, config); // 1
      checkRateLimit(key, config); // 2
      checkRateLimit(key, config); // 3
      const result = checkRateLimit(key, config); // 4 - should fail

      expect(result.success).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should return reset time', () => {
      const config = { limit: 5, windowMs: 60000 };
      const key = 'test-user-4';

      const result = checkRateLimit(key, config);

      expect(result.resetAt).toBeInstanceOf(Date);
      expect(result.resetAt.getTime()).toBeGreaterThan(Date.now());
    });

    it('should handle different keys independently', () => {
      const config = { limit: 2, windowMs: 60000 };

      checkRateLimit('user-a', config);
      checkRateLimit('user-a', config);
      const resultA = checkRateLimit('user-a', config);

      const resultB = checkRateLimit('user-b', config);

      expect(resultA.success).toBe(false);
      expect(resultB.success).toBe(true);
    });
  });

  describe('resetRateLimit', () => {
    it('should reset rate limit for key', () => {
      const config = { limit: 2, windowMs: 60000 };
      const key = 'test-reset';

      checkRateLimit(key, config);
      checkRateLimit(key, config);
      checkRateLimit(key, config); // Over limit

      resetRateLimit(key);

      const result = checkRateLimit(key, config);
      expect(result.success).toBe(true);
      expect(result.remaining).toBe(1);
    });
  });

  describe('RATE_LIMITS presets', () => {
    it('should have standard limit', () => {
      expect(RATE_LIMITS.standard.limit).toBe(100);
      expect(RATE_LIMITS.standard.windowMs).toBe(60000);
    });

    it('should have AI limit', () => {
      expect(RATE_LIMITS.ai.limit).toBe(20);
    });

    it('should have auth limit', () => {
      expect(RATE_LIMITS.auth.limit).toBe(5);
      expect(RATE_LIMITS.auth.windowMs).toBe(15 * 60 * 1000);
    });
  });
});
