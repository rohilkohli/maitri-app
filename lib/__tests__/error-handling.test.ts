import {
  AppError,
  ValidationError,
  AuthError,
  RateLimitError,
  NotFoundError,
  formatErrorResponse,
  safeAsync,
  isNonNull,
  hasItems,
  clamp,
  safeJsonParse,
} from '../error-handling';

describe('Error Classes', () => {
  describe('AppError', () => {
    it('should create error with default status code', () => {
      const error = new AppError('Test error');
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(500);
      expect(error.name).toBe('AppError');
    });

    it('should create error with custom status code', () => {
      const error = new AppError('Bad request', 400, 'BAD_REQUEST');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('BAD_REQUEST');
    });
  });

  describe('ValidationError', () => {
    it('should have 400 status code', () => {
      const error = new ValidationError('Invalid input', 'email');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.field).toBe('email');
    });
  });

  describe('AuthError', () => {
    it('should have 401 status code', () => {
      const error = new AuthError();
      expect(error.statusCode).toBe(401);
      expect(error.message).toBe('Authentication required');
    });
  });

  describe('RateLimitError', () => {
    it('should have 429 status code', () => {
      const error = new RateLimitError();
      expect(error.statusCode).toBe(429);
    });
  });

  describe('NotFoundError', () => {
    it('should have 404 status code', () => {
      const error = new NotFoundError('User');
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe('User not found');
    });
  });
});

describe('formatErrorResponse', () => {
  it('should format AppError correctly', () => {
    const error = new ValidationError('Invalid email', 'email');
    const response = formatErrorResponse(error);

    expect(response.error).toBe('Invalid email');
    expect(response.code).toBe('VALIDATION_ERROR');
    expect(response.statusCode).toBe(400);
  });

  it('should format regular Error', () => {
    const error = new Error('Something went wrong');
    const response = formatErrorResponse(error);

    expect(response.error).toBe('Something went wrong');
    expect(response.statusCode).toBe(500);
  });

  it('should handle unknown errors', () => {
    const response = formatErrorResponse('string error');
    expect(response.error).toBe('An unexpected error occurred');
    expect(response.statusCode).toBe(500);
  });
});

describe('safeAsync', () => {
  it('should return result on success', async () => {
    const result = await safeAsync(async () => 42);
    expect(result).toBe(42);
  });

  it('should return undefined on error', async () => {
    const result = await safeAsync(async () => {
      throw new Error('Failed');
    });
    expect(result).toBeUndefined();
  });

  it('should return fallback on error', async () => {
    const result = await safeAsync(
      async () => {
        throw new Error('Failed');
      },
      'fallback'
    );
    expect(result).toBe('fallback');
  });
});

describe('Type Guards', () => {
  describe('isNonNull', () => {
    it('should return true for non-null values', () => {
      expect(isNonNull(0)).toBe(true);
      expect(isNonNull('')).toBe(true);
      expect(isNonNull(false)).toBe(true);
      expect(isNonNull({})).toBe(true);
    });

    it('should return false for null/undefined', () => {
      expect(isNonNull(null)).toBe(false);
      expect(isNonNull(undefined)).toBe(false);
    });
  });

  describe('hasItems', () => {
    it('should return true for non-empty arrays', () => {
      expect(hasItems([1, 2, 3])).toBe(true);
      expect(hasItems(['a'])).toBe(true);
    });

    it('should return false for empty arrays', () => {
      expect(hasItems([])).toBe(false);
    });

    it('should return false for null/undefined', () => {
      expect(hasItems(null)).toBe(false);
      expect(hasItems(undefined)).toBe(false);
    });
  });
});

describe('Utility Functions', () => {
  describe('clamp', () => {
    it('should clamp value within range', () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(-5, 0, 10)).toBe(0);
      expect(clamp(15, 0, 10)).toBe(10);
    });

    it('should handle edge cases', () => {
      expect(clamp(0, 0, 10)).toBe(0);
      expect(clamp(10, 0, 10)).toBe(10);
    });
  });

  describe('safeJsonParse', () => {
    it('should parse valid JSON', () => {
      const result = safeJsonParse('{"name":"test"}', {});
      expect(result).toEqual({ name: 'test' });
    });

    it('should return fallback for invalid JSON', () => {
      const fallback = { default: true };
      const result = safeJsonParse('invalid json', fallback);
      expect(result).toEqual(fallback);
    });

    it('should parse arrays', () => {
      const result = safeJsonParse('[1,2,3]', []);
      expect(result).toEqual([1, 2, 3]);
    });
  });
});
