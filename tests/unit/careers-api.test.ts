import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  cleanup: vi.fn(),
  create: vi.fn(),
  notifyAdmin: vi.fn(),
  sendAutoReply: vi.fn(),
  upload: vi.fn(),
}));

vi.mock('../../src/lib/db', () => ({
  prisma: { careerApplication: { create: mocks.create } },
}));

vi.mock('../../src/lib/email', () => ({
  notifyAdminOfCareer: mocks.notifyAdmin,
  sendCareerAutoReply: mocks.sendAutoReply,
}));

vi.mock('../../src/lib/storage/resumes', () => ({
  ResumeStorageConfigurationError: class ResumeStorageConfigurationError extends Error {},
  uploadResume: mocks.upload,
}));

vi.mock('../../src/lib/utils/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn() },
}));

import { POST } from '../../src/app/api/careers/route';

function validApplicationRequest() {
  const form = new FormData();
  form.set('name', 'Test Applicant');
  form.set('email', 'applicant@example.com');
  form.set('phone', '+919999999999');
  form.set('role', 'IoT Expert');
  form.set('positionSlug', 'iot-expert');
  form.set('resume', new File(['%PDF-1.7 test'], 'candidate.pdf', { type: 'application/pdf' }));
  return new Request('http://localhost/api/careers', { method: 'POST', body: form });
}

describe('POST /api/careers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.cleanup.mockResolvedValue(undefined);
    mocks.upload.mockResolvedValue({
      reference: 'https://store.private.blob.vercel-storage.com/resumes/id.pdf',
      cleanup: mocks.cleanup,
    });
    mocks.create.mockResolvedValue({
      id: 'application-id',
      name: 'Test Applicant',
      email: 'applicant@example.com',
      phone: '+919999999999',
      role: 'IoT Expert',
      resumeUrl: 'https://store.private.blob.vercel-storage.com/resumes/id.pdf',
    });
    mocks.notifyAdmin.mockResolvedValue(true);
    mocks.sendAutoReply.mockResolvedValue(true);
  });

  it('stores the private Blob reference in Neon metadata', async () => {
    const response = await POST(validApplicationRequest());

    expect(response.status).toBe(201);
    expect(mocks.upload).toHaveBeenCalledWith(
      expect.stringMatching(/^resumes\/[a-f0-9-]+\.pdf$/),
      expect.any(Buffer),
      'application/pdf',
    );
    expect(mocks.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        resumeUrl: 'https://store.private.blob.vercel-storage.com/resumes/id.pdf',
        resumeMimeType: 'application/pdf',
      }),
    }));
    expect(mocks.cleanup).not.toHaveBeenCalled();
  });

  it('validates applicant fields before uploading the resume', async () => {
    const request = validApplicationRequest();
    const form = await request.formData();
    form.set('email', 'invalid-email');

    const response = await POST(new Request(request.url, { method: 'POST', body: form }));

    expect(response.status).toBe(400);
    expect(mocks.upload).not.toHaveBeenCalled();
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it('deletes the uploaded Blob when the Neon insert fails', async () => {
    mocks.create.mockRejectedValue(new Error('database unavailable'));

    const response = await POST(validApplicationRequest());

    expect(response.status).toBe(500);
    expect(mocks.cleanup).toHaveBeenCalledOnce();
  });

  it('rejects URL-only JSON submissions', async () => {
    const response = await POST(new Request('http://localhost/api/careers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resumeUrl: 'https://example.com/untrusted.pdf' }),
    }));

    expect(response.status).toBe(415);
    expect(mocks.upload).not.toHaveBeenCalled();
  });
});
