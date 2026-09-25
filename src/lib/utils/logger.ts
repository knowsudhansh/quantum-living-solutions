import 'server-only';

type LogLevel = 'INFO' | 'WARN' | 'ERROR';

const REDACT_KEYS = /(password|secret|token|key|cvv|card|mfa|email|phone|authorization|cookie|database.?url|direct.?url)/i;

function redactValue(value: unknown, visited = new WeakSet(), depth = 0): unknown {
  if (depth > 5) return '[Max Depth Exceeded]';
  if (value === null || value === undefined) return value;
  
  if (value instanceof Error) {
    return {
      name: value.name,
      ...('code' in value && typeof value.code === 'string' && /^P[0-9]{4}$/.test(value.code)
        ? { code: value.code } : {}),
      // Redact raw messages in production logs to prevent URL token leakages
      message: process.env.NODE_ENV === 'production' ? '[REDACTED_ERROR_DETAILS]' : value.message,
      stack: process.env.NODE_ENV === 'development' ? value.stack : undefined,
    };
  }

  if (typeof value === 'object') {
    if (visited.has(value as object)) return '[Circular]';
    visited.add(value as object);

    if (Array.isArray(value)) {
      return value.map(item => redactValue(item, visited, depth + 1));
    }

    const copy: Record<string, unknown> = {};
    for (const key in value) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        const item = (value as Record<string, unknown>)[key];
        if (REDACT_KEYS.test(key) || (process.env.NODE_ENV === 'production' && (/^(stack|message|errorMessage|cause)$/i.test(key) || (key === 'error' && !(item instanceof Error))))) {
          copy[key] = '[REDACTED]';
        } else {
          copy[key] = redactValue(item, visited, depth + 1);
        }
      }
    }
    visited.delete(value as object);
    return copy;
  }

  return value;
}

export function writeLog(level: LogLevel, message: string, context?: unknown, requestId?: string): void {
  const payload = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(requestId ? { requestId } : {}),
    ...(context !== undefined ? { context: redactValue(context) } : {}),
  };
  console.info(JSON.stringify(payload));
}

export const logger = {
  info(message: string, context?: unknown, requestId?: string) {
    writeLog('INFO', message, context, requestId);
  },
  warn(message: string, context?: unknown, requestId?: string) {
    writeLog('WARN', message, context, requestId);
  },
  error(message: string, context?: unknown, requestId?: string) {
    writeLog('ERROR', message, context, requestId);
  }
};
