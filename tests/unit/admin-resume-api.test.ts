import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  findUnique: vi.fn(),
  readResume: vi.fn(),
}));

vi.mock('../../src/lib/db', () => ({
  prisma: { careerApplication: { findUnique: mocks.findUnique } },
}));

vi.mock('../../src/lib/storage/resumes', () => ({
  readResume: mocks.readResume,
  ResumeStorageConfigurationError: class ResumeStorageConfigurationError extends Error {},
}));

vi.mock('../../src/lib/utils/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn() },
}));

import { GET } from '../../src/app/api/admin/candidates/[id]/resume/route';

const context = { params: Promise.resolve({ id: 'candidate-id' }) };

describe('GET /api/admin/candidates/[id]/resume', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('streams a private Blob without exposing its URL', async () => {
    mocks.findUnique.mockResolvedValue({
      resumeUrl: 'https://store.private.blob.vercel-storage.com/resumes/id.pdf',
      resumeFileName: 'candidate.pdf',
      resumeMimeType: 'application/pdf',
    });
    mocks.readResume.mockResolvedValue({
      statusCode: 200,
      stream: new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode('%PDF-test'));
          controller.close();
        },
      }),
      blob: {
        contentType: 'application/pdf',
        size: 9,
        etag: 'resume-etag',
      },
    });

    const response = await GET(
      new Request('http://localhost/api/admin/candidates/candidate-id/resume?download=1'),
      context,
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('content-disposition')).toContain('attachment');
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(await response.text()).toBe('%PDF-test');
  });

  it('returns 404 when the candidate does not exist', async () => {
    mocks.findUnique.mockResolvedValue(null);

    const response = await GET(
      new Request('http://localhost/api/admin/candidates/missing/resume'),
      context,
    );

    expect(response.status).toBe(404);
    expect(mocks.readResume).not.toHaveBeenCalled();
  });

  it('keeps legacy local resume records readable during migration', async () => {
    mocks.findUnique.mockResolvedValue({
      resumeUrl: '/uploads/resumes/legacy.pdf',
      resumeFileName: 'legacy.pdf',
      resumeMimeType: 'application/pdf',
    });

    const response = await GET(
      new Request('http://localhost/api/admin/candidates/candidate-id/resume'),
      context,
    );

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://localhost/uploads/resumes/legacy.pdf');
  });
});
