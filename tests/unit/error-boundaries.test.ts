import { afterEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ transaction: vi.fn() }));
vi.mock('../../src/lib/db', () => ({ prisma: { $transaction: mocks.transaction } }));
import { POST } from '../../src/app/api/book-demo/route';

afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });
describe('external error diagnostic safety', () => {
  it('keeps booking transaction errors out of production messages', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
    mocks.transaction.mockRejectedValue(new Error('private-database-detail'));
    const response = await POST(new Request('http://localhost/api/book-demo', { method: 'POST', body: JSON.stringify({
      slotId: 'test-slot', name: 'Test', email: 'test@example.com', phone: '+919999999999',
      location: 'Gorakhpur', automationCategory: 'Home Automation', automationSelections: ['Audio / Video'],
    }) }));
    expect(response.status).toBe(500);
    expect(await response.text()).not.toContain('private-database-detail');
    expect(JSON.stringify(spy.mock.calls)).not.toContain('private-database-detail');
    expect(JSON.stringify(spy.mock.calls)).toContain('Booking transaction failed');
  });
  it('logs Resend status without recording its raw response body', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('RESEND_API_KEY', 'dummy-email-test-credential');
    vi.resetModules();
    const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('private-provider-detail', { status: 403 })));
    const { sendEmail } = await import('../../src/lib/email');
    expect(await sendEmail({ to: 'test@example.com', subject: 'Test', html: '<p>Test</p>' })).toBe(false);
    expect(JSON.stringify(spy.mock.calls)).not.toContain('private-provider-detail');
    expect(JSON.stringify(spy.mock.calls)).toContain('403');
  });
});
