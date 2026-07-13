import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from '../../src/lib/security/password';
import { signToken, verifyToken } from '../../src/lib/security/auth';
import { prisma } from '../../src/lib/db';

describe('Cryptographic Password Utility Tests', () => {
  it('should successfully hash a password and match correctly', () => {
    const rawPass = 'SecretAdminPassword123!';
    const hash = hashPassword(rawPass);
    
    expect(hash).toContain(':');
    expect(verifyPassword(rawPass, hash)).toBe(true);
  });

  it('should reject invalid password inputs', () => {
    const rawPass = 'SecretAdminPassword123!';
    const hash = hashPassword(rawPass);
    
    expect(verifyPassword('WrongPassword', hash)).toBe(false);
  });
});

describe('Web Crypto JWT Token Utility Tests', () => {
  const secretKey = 'test-security-secret-signing-key-32-bytes';

  it('should sign and verify active JWT tokens', async () => {
    const payload = { userId: '100', role: 'admin', email: 'admin@test.com' };
    const token = await signToken(payload, secretKey, 60);
    
    expect(token.split('.').length).toBe(3);
    
    const verified = await verifyToken(token, secretKey);
    expect(verified).not.toBeNull();
    expect(verified?.email).toBe('admin@test.com');
    expect(verified?.role).toBe('admin');
  });

  it('should reject verification if wrong secret key is applied', async () => {
    const payload = { userId: '100', role: 'admin', email: 'admin@test.com' };
    const token = await signToken(payload, secretKey, 60);
    
    const invalidVerified = await verifyToken(token, 'wrong-secret-key-signature');
    expect(invalidVerified).toBeNull();
  });
});

describe('Prisma Database & PostgreSQL Table Integration Checks', () => {
  it('should connect to database and query all operational models', async () => {
    // 1. Demo Slots checks
    const slots = await prisma.demoSlot.findMany({ take: 1 });
    expect(slots).toBeInstanceOf(Array);

    // 2. Leads check
    const leads = await prisma.lead.findMany({ take: 1 });
    expect(leads).toBeInstanceOf(Array);

    // 3. Bookings checks
    const bookings = await prisma.booking.findMany({ take: 1 });
    expect(bookings).toBeInstanceOf(Array);

    // 4. Candidate checks
    const candidates = await prisma.careerApplication.findMany({ take: 1 });
    expect(candidates).toBeInstanceOf(Array);

    // 5. Subscriber checks
    const subscribers = await prisma.newsletterSubscriber.findMany({ take: 1 });
    expect(subscribers).toBeInstanceOf(Array);

    // 6. Security Log checks
    const logs = await prisma.activityLog.findMany({ take: 1 });
    expect(logs).toBeInstanceOf(Array);
  }, 15000);
});
