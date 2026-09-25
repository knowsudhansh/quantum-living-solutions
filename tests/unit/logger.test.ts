import { afterEach, describe, it, expect, vi } from 'vitest';
import { writeLog } from '../../src/lib/utils/logger';

describe('Structured JSON logger redaction', () => {
  it('should redact sensitive keys case-insensitively', () => {
    const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    const sensitiveData = {
      password: 'myPassword123',
      Secret_Key: 'supersecret',
      token: 'sessiontoken',
      cvv: '123',
      card: '1234-5678-9012-3456',
      mfa: 'otp',
      email: 'user@example.com',
      phone: '1234567890',
      normalProp: 'normalValue'
    };

    writeLog('INFO', 'Test log', sensitiveData);
    expect(consoleSpy).toHaveBeenCalled();
    const logOutput = JSON.parse(consoleSpy.mock.calls[0][0] as string);
    
    expect(logOutput.context.password).toBe('[REDACTED]');
    expect(logOutput.context.Secret_Key).toBe('[REDACTED]');
    expect(logOutput.context.token).toBe('[REDACTED]');
    expect(logOutput.context.cvv).toBe('[REDACTED]');
    expect(logOutput.context.card).toBe('[REDACTED]');
    expect(logOutput.context.mfa).toBe('[REDACTED]');
    expect(logOutput.context.email).toBe('[REDACTED]');
    expect(logOutput.context.phone).toBe('[REDACTED]');
    expect(logOutput.context.normalProp).toBe('normalValue');

    consoleSpy.mockRestore();
  });

  it('should not mutate original input object parameters', () => {
    const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    const input = { password: '123', safe: 'abc' };
    writeLog('INFO', 'test', input);
    expect(input.password).toBe('123'); // Original remains unchanged
    consoleSpy.mockRestore();
  });

  it('should handle nested structures and arrays without crashing', () => {
    const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    const complexObj = {
      nested: { password: '123', token: 'abc' },
      list: [{ card: '1111' }, 'safe_item'],
      simple: 'value'
    };
    writeLog('INFO', 'test', complexObj);
    const parsed = JSON.parse(consoleSpy.mock.calls[0][0] as string);
    expect(parsed.context.nested.password).toBe('[REDACTED]');
    expect(parsed.context.nested.token).toBe('[REDACTED]');
    expect(parsed.context.list[0].card).toBe('[REDACTED]');
    expect(parsed.context.list[1]).toBe('safe_item');
    expect(parsed.context.simple).toBe('value');
    consoleSpy.mockRestore();
  });

  it('should resolve circular loops safely', () => {
    const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    const circularObj: Record<string, unknown> = { name: 'Node' };
    circularObj.self = circularObj;
    
    expect(() => writeLog('INFO', 'test', circularObj)).not.toThrow();
    const parsed = JSON.parse(consoleSpy.mock.calls[0][0] as string);
    expect(parsed.context.self).toBe('[Circular]');
    consoleSpy.mockRestore();
  });

  it('should restrict depth levels past maximum limit (5)', () => {
    const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    const deeplyNested = {
      level1: {
        level2: {
          level3: {
            level4: {
              level5: {
                level6: 'tooDeep'
              }
            }
          }
        }
      }
    };
    writeLog('INFO', 'test', deeplyNested);
    const parsed = JSON.parse(consoleSpy.mock.calls[0][0] as string);
    expect(parsed.context.level1.level2.level3.level4.level5.level6).toBe('[Max Depth Exceeded]');
    consoleSpy.mockRestore();
  });

  it('should format and redact Error objects safely', () => {
    const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    const err = new Error('Sensitive database trace message');
    
    // Test in default environment (testing/dev)
    writeLog('ERROR', 'Error occurred', err);
    let parsed = JSON.parse(consoleSpy.mock.calls[0][0] as string);
    expect(parsed.context.name).toBe('Error');
    expect(parsed.context.message).toBe('Sensitive database trace message');

    // Test in production environment (redacted message)
    const prevEnv = process.env.NODE_ENV;
    (process.env as Record<string, string | undefined>).NODE_ENV = 'production';
    writeLog('ERROR', 'Error occurred in prod', err);
    parsed = JSON.parse(consoleSpy.mock.calls[1][0] as string);
    expect(parsed.context.message).toBe('[REDACTED_ERROR_DETAILS]');
    expect(parsed.context.stack).toBeUndefined(); // Stack excluded in prod

    // Restore env
    (process.env as Record<string, string | undefined>).NODE_ENV = prevEnv;
    consoleSpy.mockRestore();
  });
});


describe('production diagnostic boundaries', () => {
  afterEach(() => { vi.unstubAllEnvs(); vi.restoreAllMocks(); });
  it('redacts plain-object diagnostic text while retaining operation and Prisma code', () => {
    vi.stubEnv('NODE_ENV', 'production');
    const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
    writeLog('ERROR', 'Upload failed', {
      operation: 'database.mediaItem.create',
      stack: 'private-path', errorMessage: 'private-url', cause: 'private-cause',
      authorization: 'private-auth', databaseUrl: 'private-db',
      error: Object.assign(new Error('private-message'), { code: 'P2002' }),
    }, 'request-123');
    const output = spy.mock.calls[0][0] as string;
    expect(output).not.toContain('private-');
    expect(JSON.parse(output)).toMatchObject({ requestId: 'request-123', context: { operation: 'database.mediaItem.create', error: { name: 'Error', code: 'P2002' } } });
  });
});
