import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ put: vi.fn(), del: vi.fn(), create: vi.fn(), mkdir: vi.fn(), writeFile: vi.fn(), rm: vi.fn() }));
vi.mock('@vercel/blob', () => ({ put: mocks.put, del: mocks.del }));
vi.mock('../../src/lib/db', () => ({ prisma: { mediaItem: { create: mocks.create } } }));
vi.mock('fs', () => ({ promises: { mkdir: mocks.mkdir, writeFile: mocks.writeFile, rm: mocks.rm } }));
import { POST } from '../../src/app/api/admin/media/route';
import { MAX_MEDIA_FILE_SIZE, MEDIA_FILE_SIZE_ERROR } from '../../src/lib/config/uploads';

function request(size = 10, type = 'application/pdf', signature = '%PDF-') {
  const bytes = new Uint8Array(size);
  bytes.set(new TextEncoder().encode(signature).subarray(0, size));
  const form = new FormData();
  form.set('file', new File([bytes], 'document.pdf', { type }));
  return new Request('http://localhost/api/admin/media', { method: 'POST', body: form });
}

describe('media upload safety', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('BLOB_READ_WRITE_TOKEN', 'dummy-upload-credential');
    vi.spyOn(console, 'info').mockImplementation(() => {});
    mocks.put.mockResolvedValue({ url: 'https://store.public.blob.vercel-storage.com/file.pdf' });
    mocks.create.mockImplementation(async ({ data }) => data);
  });
  afterEach(() => { vi.unstubAllEnvs(); vi.restoreAllMocks(); });

  it('accepts 4 MiB and leaves room for multipart overhead below 4.5 MB', async () => {
    const req = request(MAX_MEDIA_FILE_SIZE);
    expect((await req.clone().arrayBuffer()).byteLength).toBeLessThan(4_500_000);
    expect((await POST(req)).status).toBe(201);
    expect(mocks.put).toHaveBeenCalledWith(expect.any(String), expect.any(Buffer), expect.objectContaining({ access: 'public' }));
    expect(mocks.create).toHaveBeenCalledWith({ data: expect.objectContaining({ fileSize: MAX_MEDIA_FILE_SIZE, fileUrl: 'https://store.public.blob.vercel-storage.com/file.pdf' }) });
    expect(mocks.del).not.toHaveBeenCalled();
    expect(mocks.writeFile).not.toHaveBeenCalled();
  });
  it('rejects one byte over the limit before upload or database work', async () => {
    const response = await POST(request(MAX_MEDIA_FILE_SIZE + 1));
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: MEDIA_FILE_SIZE_ERROR });
    expect(mocks.put).not.toHaveBeenCalled();
    expect(mocks.create).not.toHaveBeenCalled();
  });
  it.each([[0, 'application/pdf', ''], [10, 'text/plain', 'hello'], [10, 'image/png', '%PDF-']])('rejects invalid input (%s, %s)', async (size, type, signature) => {
    expect((await POST(request(size, type, signature))).status).toBe(400);
    expect(mocks.put).not.toHaveBeenCalled();
  });
  it('fails closed without production storage', async () => {
    vi.stubEnv('BLOB_READ_WRITE_TOKEN', '');
    expect((await POST(request())).status).toBe(503);
    expect(mocks.writeFile).not.toHaveBeenCalled();
    expect(mocks.create).not.toHaveBeenCalled();
  });
  it('cleans up after database failure and keeps diagnostics out of responses/logs', async () => {
    const err = Object.assign(new Error('sensitive-infrastructure-detail'), { code: 'P2002' });
    mocks.create.mockRejectedValue(err);
    const response = await POST(request());
    expect(response.status).toBe(500);
    expect(mocks.del).toHaveBeenCalledOnce();
    expect(await response.text()).not.toContain('sensitive-infrastructure-detail');
    const output = JSON.stringify(vi.mocked(console.info).mock.calls);
    expect(output).not.toContain('sensitive-infrastructure-detail');
    expect(output).toContain('database.mediaItem.create');
    expect(output).toContain('P2002');
  });
  it('records cleanup failure without leaking provider details', async () => {
    mocks.create.mockRejectedValue(new Error('private-db-detail'));
    mocks.del.mockRejectedValue(new Error('private-blob-detail'));
    expect((await POST(request())).status).toBe(500);
    const output = JSON.stringify(vi.mocked(console.info).mock.calls);
    expect(output).toContain('storage.cleanup');
    expect(output).not.toContain('private-db-detail');
    expect(output).not.toContain('private-blob-detail');
  });
  it('does not create metadata when Blob upload fails', async () => {
    mocks.put.mockRejectedValue(new Error('private-provider-detail'));
    expect((await POST(request())).status).toBe(500);
    expect(mocks.create).not.toHaveBeenCalled();
    expect(mocks.del).not.toHaveBeenCalled();
  });
  it('preserves local development storage and failure cleanup', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    mocks.create.mockRejectedValue(new Error('test failure'));
    expect((await POST(request())).status).toBe(500);
    expect(mocks.writeFile).toHaveBeenCalledOnce();
    expect(mocks.rm).toHaveBeenCalledOnce();
    expect(mocks.put).not.toHaveBeenCalled();
  });
});
