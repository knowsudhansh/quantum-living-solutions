import 'server-only';

import { del, get, put } from '@vercel/blob';

export class ResumeStorageConfigurationError extends Error {
  constructor() {
    super('Private resume storage is not configured');
    this.name = 'ResumeStorageConfigurationError';
  }
}

function getResumeStorageAuth() {
  const storeId = process.env.RESUME_BLOB_STORE_ID?.trim();
  if (storeId) return { storeId };

  const token = process.env.RESUME_BLOB_READ_WRITE_TOKEN?.trim();
  if (token) return { token };

  throw new ResumeStorageConfigurationError();
}

export async function uploadResume(pathname: string, body: Buffer, contentType: string) {
  const auth = getResumeStorageAuth();
  const blob = await put(pathname, body, {
    access: 'private',
    contentType,
    ...auth,
  });

  return {
    reference: blob.url,
    cleanup: () => del(blob.url, auth),
  };
}

export async function readResume(reference: string) {
  return get(reference, {
    access: 'private',
    ...getResumeStorageAuth(),
  });
}
