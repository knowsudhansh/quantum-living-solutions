import { describe, it, expect } from 'vitest';
import { POST as logoutPost } from '../../src/app/api/admin/auth/logout/route';
import { GET as dashboardGet } from '../../src/app/api/admin/dashboard/route';
import { GET as leadsGet } from '../../src/app/api/admin/leads/route';
import { GET as bookingsGet } from '../../src/app/api/admin/demo-bookings/route';
import { GET as candidatesGet } from '../../src/app/api/admin/candidates/route';
import { GET as newsletterGet } from '../../src/app/api/admin/newsletter/route';

describe('Admin Dashboard API Route Handlers Integration Validation', () => {

  it('POST /api/admin/auth/logout should clear the secure session cookie', async () => {
    const logoutRes = await logoutPost();
    expect(logoutRes.status).toBe(200);
    const logoutBody = await logoutRes.json() as { success: boolean };
    expect(logoutBody.success).toBe(true);
    expect(logoutRes.headers.get('set-cookie')?.toLowerCase()).toContain('max-age=0');
  });

  it('GET /api/admin/dashboard should retrieve aggregate counts', async () => {
    const res = await dashboardGet();
    expect(res.status).toBe(200);

    const body = await res.json() as { success: boolean; stats: Record<string, number> };
    expect(body.success).toBe(true);
    expect(body.stats).toBeDefined();
    expect(body.stats.leads).toBeDefined();
    expect(body.stats.bookings).toBeDefined();
  });

  it('GET /api/admin/leads should return list records', async () => {
    const res = await leadsGet();
    expect(res.status).toBe(200);

    const body = await res.json() as { success: boolean; leads: unknown[] };
    expect(body.success).toBe(true);
    expect(body.leads).toBeInstanceOf(Array);
  });

  it('GET /api/admin/demo-bookings should return bookings ledger joined with slots and leads', async () => {
    const res = await bookingsGet();
    expect(res.status).toBe(200);

    const body = await res.json() as { success: boolean; bookings: unknown[] };
    expect(body.success).toBe(true);
    expect(body.bookings).toBeInstanceOf(Array);
  });

  it('GET /api/admin/candidates should return application register', async () => {
    const res = await candidatesGet(new Request('http://localhost/api/admin/candidates'));
    expect(res.status).toBe(200);

    const body = await res.json() as { success: boolean; candidates: unknown[] };
    expect(body.success).toBe(true);
    expect(body.candidates).toBeInstanceOf(Array);
  });

  it('GET /api/admin/newsletter should return subscribers registry', async () => {
    const res = await newsletterGet();
    expect(res.status).toBe(200);

    const body = await res.json() as { success: boolean; subscribers: unknown[] };
    expect(body.success).toBe(true);
    expect(body.subscribers).toBeInstanceOf(Array);
  });

});
