import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const blobMocks = vi.hoisted(() => ({
  del: vi.fn(),
  get: vi.fn(),
  put: vi.fn(),
}));

vi.mock('@vercel/blob', () => blobMocks);

import {
  readResume,
  ResumeStorageConfigurationError,
  uploadResume,
} from '../../src/lib/storage/resumes';

describe('private resume storage', () => {
  const originalStoreId = process.env.RESUME_BLOB_STORE_ID;
  const originalToken = process.env.RESUME_BLOB_READ_WRITE_TOKEN;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.RESUME_BLOB_STORE_ID = 'store_test_private';
    delete process.env.RESUME_BLOB_READ_WRITE_TOKEN;
  });

  afterEach(() => {
    if (originalStoreId === undefined) {
      delete process.env.RESUME_BLOB_STORE_ID;
    } else {
      process.env.RESUME_BLOB_STORE_ID = originalStoreId;
    }

    if (originalToken === undefined) {
      delete process.env.RESUME_BLOB_READ_WRITE_TOKEN;
    } else {
      process.env.RESUME_BLOB_READ_WRITE_TOKEN = originalToken;
    }
  });

  it('uploads with private access and deletes the same blob during cleanup', async () => {
    blobMocks.put.mockResolvedValue({ url: 'https://store.private.blob.vercel-storage.com/resumes/id.pdf' });
    blobMocks.del.mockResolvedValue(undefined);

    const stored = await uploadResume('resumes/id.pdf', Buffer.from('%PDF-'), 'application/pdf');

    expect(blobMocks.put).toHaveBeenCalledWith(
      'resumes/id.pdf',
      expect.any(Buffer),
      {
        access: 'private',
        contentType: 'application/pdf',
        storeId: 'store_test_private',
      },
    );
    expect(stored.reference).toContain('store.private.blob.vercel-storage.com');

    await stored.cleanup();
    expect(blobMocks.del).toHaveBeenCalledWith(stored.reference, { storeId: 'store_test_private' });
  });

  it('rejects uploads when private storage is not configured', async () => {
    delete process.env.RESUME_BLOB_STORE_ID;
    delete process.env.RESUME_BLOB_READ_WRITE_TOKEN;

    await expect(uploadResume('resumes/id.pdf', Buffer.from('%PDF-'), 'application/pdf'))
      .rejects.toBeInstanceOf(ResumeStorageConfigurationError);
    expect(blobMocks.put).not.toHaveBeenCalled();
  });

  it('reads a private resume with the server-only token', async () => {
    const result = { statusCode: 200, stream: new ReadableStream(), headers: new Headers(), blob: {} };
    blobMocks.get.mockResolvedValue(result);

    await expect(readResume('https://store.private.blob.vercel-storage.com/resumes/id.pdf')).resolves.toBe(result);
    expect(blobMocks.get).toHaveBeenCalledWith(
      'https://store.private.blob.vercel-storage.com/resumes/id.pdf',
      { access: 'private', storeId: 'store_test_private' },
    );
  });

  it('supports legacy read-write token connections as a fallback', async () => {
    delete process.env.RESUME_BLOB_STORE_ID;
    process.env.RESUME_BLOB_READ_WRITE_TOKEN = 'test-private-token';
    blobMocks.put.mockResolvedValue({ url: 'https://store.private.blob.vercel-storage.com/resumes/id.pdf' });

    await uploadResume('resumes/id.pdf', Buffer.from('%PDF-'), 'application/pdf');

    expect(blobMocks.put).toHaveBeenCalledWith(
      'resumes/id.pdf',
      expect.any(Buffer),
      expect.objectContaining({ token: 'test-private-token' }),
    );
  });
});
