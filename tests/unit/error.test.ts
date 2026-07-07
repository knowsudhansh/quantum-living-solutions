import { describe, it, expect } from 'vitest';
import { AppError } from '../../src/lib/errors/app-error';

describe('AppError serialization', () => {
  it('should serialize standard validation errors with message intact', () => {
    const err = new AppError('VALIDATION_ERROR', 'Internal diagnostic msg', 400, true, null, 'req-123', 'Safe public validation message');
    const result = err.serialize();
    expect(result.success).toBe(false);
    expect(result.error.code).toBe('VALIDATION_ERROR');
    expect(result.error.message).toBe('Safe public validation message');
    expect(result.error.requestId).toBe('req-123');
    // Ensure raw message and cause are NOT exposed
    expect((result.error as Record<string, unknown>).cause).toBeUndefined();
    expect((result as Record<string, unknown>).stack).toBeUndefined();
  });

  it('should redact internal server errors (500) to generic messages', () => {
    const err = new AppError('INTERNAL_SERVER_ERROR', 'Database connection timeout', 500);
    const result = err.serialize();
    expect(result.error.message).toBe('An unexpected error occurred.');
  });
});
