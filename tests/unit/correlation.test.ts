import { describe, it, expect } from 'vitest';
import { validateCorrelationId, getOrGenerateCorrelationId } from '../../src/lib/utils/correlation';

describe('Correlation ID handling', () => {
  it('should accept valid UUID formats', () => {
    const validId = '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d';
    expect(validateCorrelationId(validId)).toBe(validId);
    expect(validateCorrelationId(validId.toUpperCase())).toBe(validId); // Checks lowercase conversions
  });

  it('should reject malformed or non-UUID inputs', () => {
    expect(validateCorrelationId('not-a-uuid')).toBeNull();
    expect(validateCorrelationId('9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d-extra')).toBeNull();
    expect(validateCorrelationId('<script>alert(1)</script>')).toBeNull();
  });

  it('should generate a new random UUID if validation fails', () => {
    const newId = getOrGenerateCorrelationId('invalid-id');
    expect(newId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
  });
});
