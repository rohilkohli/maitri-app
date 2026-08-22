import { debounce, throttle, memoize } from '../performance';

describe('Performance Utilities', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('debounce', () => {
    it('should delay function execution', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn();
      expect(mockFn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should reset timer on subsequent calls', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn();
      jest.advanceTimersByTime(50);
      debouncedFn();
      jest.advanceTimersByTime(50);

      expect(mockFn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(50);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should pass arguments correctly', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn('arg1', 'arg2');
      jest.advanceTimersByTime(100);

      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
    });
  });

  describe('throttle', () => {
    it('should execute immediately on first call', () => {
      const mockFn = jest.fn();
      const throttledFn = throttle(mockFn, 100);

      throttledFn();
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should ignore calls within throttle period', () => {
      const mockFn = jest.fn();
      const throttledFn = throttle(mockFn, 100);

      throttledFn();
      throttledFn();
      throttledFn();

      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should allow calls after throttle period', () => {
      const mockFn = jest.fn();
      const throttledFn = throttle(mockFn, 100);

      throttledFn();
      jest.advanceTimersByTime(100);
      throttledFn();

      expect(mockFn).toHaveBeenCalledTimes(2);
    });
  });

  describe('memoize', () => {
    it('should cache function results', () => {
      const mockFn = jest.fn((x: number) => x * 2);
      const memoizedFn = memoize(mockFn);

      expect(memoizedFn(5)).toBe(10);
      expect(memoizedFn(5)).toBe(10);

      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should handle different arguments', () => {
      const mockFn = jest.fn((x: number) => x * 2);
      const memoizedFn = memoize(mockFn);

      expect(memoizedFn(5)).toBe(10);
      expect(memoizedFn(10)).toBe(20);

      expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it('should respect max cache size', () => {
      const mockFn = jest.fn((x: number) => x * 2);
      const memoizedFn = memoize(mockFn, 2);

      memoizedFn(1);
      memoizedFn(2);
      memoizedFn(3); // Should evict cache for 1

      expect(mockFn).toHaveBeenCalledTimes(3);

      memoizedFn(1); // Should recalculate
      expect(mockFn).toHaveBeenCalledTimes(4);
    });

    it('should handle multiple arguments', () => {
      const mockFn = jest.fn((a: number, b: number) => a + b);
      const memoizedFn = memoize(mockFn);

      expect(memoizedFn(1, 2)).toBe(3);
      expect(memoizedFn(1, 2)).toBe(3);
      expect(memoizedFn(2, 1)).toBe(3);

      expect(mockFn).toHaveBeenCalledTimes(2);
    });
  });
});
