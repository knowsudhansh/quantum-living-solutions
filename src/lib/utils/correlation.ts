import 'server-only';
import * as crypto from 'crypto';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function validateCorrelationId(id: string | null | undefined): string | null {
  if (!id) return null;
  if (id.length > 36) return null;
  if (UUID_REGEX.test(id)) {
    return id.toLowerCase();
  }
  return null;
}

export function getOrGenerateCorrelationId(incomingId?: string | null): string {
  const validated = validateCorrelationId(incomingId);
  if (validated) return validated;
  return crypto.randomUUID();
}
