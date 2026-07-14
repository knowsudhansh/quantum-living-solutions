import { afterEach, describe, expect, it, vi } from 'vitest';
import { getAdminSessionSecret } from '../../src/lib/security/session';

describe('getAdminSessionSecret', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('fails closed when the session secret is missing or too short', () => {
    vi.stubEnv('NEXTAUTH_SECRET', 'short-secret');

    expect(getAdminSessionSecret()).toBeNull();
  });

  it('returns a configured session secret that meets the minimum length', () => {
    const sessionSecret = 'a-secure-test-session-secret-with-32-chars';
    vi.stubEnv('NEXTAUTH_SECRET', sessionSecret);

    expect(getAdminSessionSecret()).toBe(sessionSecret);
  });
});
