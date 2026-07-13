import { describe, it, expect } from 'vitest';
import { POST as loginPost } from '../../src/app/api/admin/auth/login/route';
import { POST as logoutPost } from '../../src/app/api/admin/auth/logout/route';
import { GET as dashboardGet } from '../../src/app/api/admin/dashboard/route';
import { GET as leadsGet } from '../../src/app/api/admin/leads/route';
import { GET as bookingsGet } from '../../src/app/api/admin/demo-bookings/route';
import { GET as candidatesGet } from '../../src/app/api/admin/candidates/route';
import { GET as newsletterGet } from '../../src/app/api/admin/newsletter/route';

describe('Admin Dashboard API Route Handlers Integration Validation', () => {

  it('POST /api/admin/auth/login and logout should authorize sessions and manage cookies', async () => {
    // 1. Trigger login with valid credentials (will auto-seed admin user)
    const payload = {
      email: 'admin@quantumlivingsolutions.com',
      password: 'QuantumAdmin2026!',
    };

    const req = new Request('http://localhost:3000/api/admin/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    const res = await loginPost(req);
    expect(res.status).toBe(200);

    const body = await res.json() as { success: boolean };
    expect(body.success).toBe(true);

    // Verify qls_admin_session cookie was set
    const setCookieHeader = res.headers.get('set-cookie');
    expect(setCookieHeader).toContain('qls_admin_session=');

    // 2. Trigger login with invalid password
    const badReq = new Request('http://localhost:3000/api/admin/auth/login', {
      method: 'POST',
      body: JSON.stringify({ ...payload, password: 'WrongPasswordPIN' }),
    });

    const badRes = await loginPost(badReq);
    expect(badRes.status).toBe(401);

    // 3. Trigger logout
    const logoutRes = await logoutPost();
    expect(logoutRes.status).toBe(200);
    const logoutBody = await logoutRes.json() as { success: boolean };
    expect(logoutBody.success).toBe(true);
    expect(logoutRes.headers.get('set-cookie')?.toLowerCase()).toContain('max-age=0');
  }, 15000); // 15s timeout for remote DB writes

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
    const res = await candidatesGet();
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
