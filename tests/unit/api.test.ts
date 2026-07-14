import { describe, it, expect } from 'vitest';
import { POST as contactPost } from '../../src/app/api/contact/route';
import { POST as newsletterPost } from '../../src/app/api/newsletter/route';
import { POST as careersPost } from '../../src/app/api/careers/route';
import { GET as slotsGet } from '../../src/app/api/book-demo/slots/route';
import { POST as bookDemoPost } from '../../src/app/api/book-demo/route';
import { prisma } from '../../src/lib/db';

describe('Public API Route Handlers Integration Validation', () => {
  
  it('POST /api/contact should record contact inquiries and reject invalid parameters', async () => {
    // 1. Success path
    const payload = {
      name: 'Integration Test Candidate',
      email: 'candidate@test.com',
      phone: '+919999999999',
      interest: 'Lighting Automation',
      message: 'This is a test contact inquiry log.',
    };

    const req = new Request('http://localhost:3000/api/contact', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    const res = await contactPost(req);
    expect(res.status).toBe(201);

    const body = await res.json() as { success: boolean; leadId: string };
    expect(body.success).toBe(true);
    expect(body.leadId).toBeDefined();

    // Cleanup generated lead
    await prisma.lead.delete({
      where: { id: body.leadId },
    }).catch(() => {});

    // 2. Missing parameter path
    const reqMissing = new Request('http://localhost:3000/api/contact', {
      method: 'POST',
      body: JSON.stringify({ name: 'Shorty' }),
    });
    const resMissing = await contactPost(reqMissing);
    expect(resMissing.status).toBe(400);

    // 3. Bad email path
    const reqBadEmail = new Request('http://localhost:3000/api/contact', {
      method: 'POST',
      body: JSON.stringify({ ...payload, email: 'bademailaddress' }),
    });
    const resBadEmail = await contactPost(reqBadEmail);
    expect(resBadEmail.status).toBe(400);
  });

  it('POST /api/newsletter should subscribe emails and reject malformed inputs', async () => {
    const email = `sub-${Date.now()}@test.com`;
    const req = new Request('http://localhost:3000/api/newsletter', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });

    const res = await newsletterPost(req);
    expect(res.status).toBe(201);

    const body = await res.json() as { success: boolean; subscriberId: string };
    expect(body.success).toBe(true);

    // Cleanup
    await prisma.newsletterSubscriber.delete({
      where: { id: body.subscriberId },
    }).catch(() => {});

    // Bad input check
    const reqBad = new Request('http://localhost:3000/api/newsletter', {
      method: 'POST',
      body: JSON.stringify({ email: 'not-an-email' }),
    });
    const resBad = await newsletterPost(reqBad);
    expect(resBad.status).toBe(400);
  });

  it('POST /api/careers should accept files and store candidate applications', async () => {
    const payload = {
      name: 'Tester Applicant',
      email: 'applicant@test.com',
      phone: '+918888888888',
      role: 'Programmer',
      message: 'I want to write automation rules.',
      resumeUrl: 'https://dropbox.com/s/123/resume.pdf',
    };

    const req = new Request('http://localhost:3000/api/careers', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    const res = await careersPost(req);
    expect(res.status).toBe(201);

    const body = await res.json() as { success: boolean; applicationId: string };
    expect(body.success).toBe(true);

    // Cleanup
    await prisma.careerApplication.delete({
      where: { id: body.applicationId },
    }).catch(() => {});
  });

  it('GET /api/book-demo/slots and POST /api/book-demo should lock and book demo sessions', async () => {
    // 1. Fetch available slots
    const resSlots = await slotsGet();
    expect(resSlots.status).toBe(200);

    const dataSlots = await resSlots.json() as { success: boolean; slots: Array<{ id: string }> };
    expect(dataSlots.success).toBe(true);
    expect(dataSlots.slots).toBeInstanceOf(Array);

    if (dataSlots.slots.length > 0) {
      const slot = dataSlots.slots[0];
      expect(slot).toBeDefined();
      const slotId = slot.id;

      // 2. Perform booking checkout on that slot
      const payload = {
        slotId,
        name: 'Demo Book Tester',
        email: 'demobooker@test.com',
        phone: '+917777777777',
        location: 'Gorakhpur, Uttar Pradesh',
        automationCategory: 'Home Automation',
        automationSelections: ['Audio / Video'],
      };

      const req = new Request('http://localhost:3000/api/book-demo', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const resBook = await bookDemoPost(req);
      // Can be 201 or 409 if slots capacity exceeded, both are valid logic statuses
      expect([201, 409]).toContain(resBook.status);

      if (resBook.status === 201) {
        const bodyBook = await resBook.json() as { success: boolean; bookingId: string; visitPrice: number };
        expect(bodyBook.success).toBe(true);
        expect(bodyBook.visitPrice).toBe(1000);

        // Revert increment and clean up booking
        await prisma.booking.delete({
          where: { id: bodyBook.bookingId },
        }).catch(() => {});

        await prisma.demoSlot.update({
          where: { id: slotId },
          data: { currentBookings: { decrement: 1 } },
        }).catch(() => {});
      }
    }
  });

  it('POST /api/book-demo should require a category-specific automation requirement and location', async () => {
    const request = new Request('http://localhost:3000/api/book-demo', {
      method: 'POST',
      body: JSON.stringify({
        slotId: '00000000-0000-0000-0000-000000000000',
        name: 'Visit Tester',
        email: 'visit@test.com',
        phone: '+917777777777',
        location: 'Gorakhpur',
        automationCategory: 'Home Automation',
        automationSelections: [],
      }),
    });

    const response = await bookDemoPost(request);
    expect(response.status).toBe(400);
  });

});
