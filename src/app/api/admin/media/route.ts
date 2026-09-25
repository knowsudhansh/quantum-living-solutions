import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { prisma } from '../../../../lib/db';
import { logger } from '../../../../lib/utils/logger';
import { MAX_MEDIA_FILE_SIZE, MEDIA_FILE_SIZE_ERROR } from '../../../../lib/config/uploads';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const UPLOAD_POLICIES = {
  'image/jpeg': {
    extension: '.jpg',
    hasValidSignature: (buffer: Buffer) => buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff,
  },
  'image/png': {
    extension: '.png',
    hasValidSignature: (buffer: Buffer) => buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  },
  'application/pdf': {
    extension: '.pdf',
    hasValidSignature: (buffer: Buffer) => buffer.length >= 5 && buffer.subarray(0, 5).toString('ascii') === '%PDF-',
  },
} as const;


class StorageConfigurationError extends Error {
  constructor() {
    super('Production media storage is not configured');
    this.name = 'StorageConfigurationError';
  }
}

type StoredUpload = {
  fileUrl: string;
  cleanup: () => Promise<void>;
};

function sanitizeOriginalFilename(fileName: string, extension: string) {
  const baseName = path.basename(fileName, path.extname(fileName))
    .normalize('NFKC')
    .replace(/[^a-zA-Z0-9._-]+/g, '_')
    .replace(/^[_\.]+|[_\.]+$/g, '')
    .slice(0, 120);

  return `${baseName || 'upload'}${extension}`;
}

async function storeUpload(
  buffer: Buffer,
  safeFilename: string,
  mimeType: string,
): Promise<StoredUpload> {
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN?.trim();

  if (process.env.NODE_ENV === 'production') {
    if (!blobToken) {
      throw new StorageConfigurationError();
    }

    const { put, del } = await import('@vercel/blob');
    const blob = await put(`uploads/${safeFilename}`, buffer, {
      access: 'public',
      contentType: mimeType,
      token: blobToken,
    });

    return {
      fileUrl: blob.url,
      cleanup: async () => {
        await del(blob.url, { token: blobToken });
      },
    };
  }

  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  await fs.mkdir(uploadDir, { recursive: true });

  const filePath = path.join(uploadDir, safeFilename);
  await fs.writeFile(filePath, buffer);

  return {
    fileUrl: `/uploads/${safeFilename}`,
    cleanup: async () => {
      await fs.rm(filePath, { force: true });
    },
  };
}

export async function POST(request: Request) {
  const requestId = request.headers.get('x-request-id')?.slice(0, 64) || crypto.randomUUID();
  let operation = 'request.formData';
  let cleanup: (() => Promise<void>) | undefined;

  try {
    const formData = await request.formData();
    const file = formData.get('file');

    operation = 'validate.file';
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // 2. File size validation
    if (file.size > MAX_MEDIA_FILE_SIZE) {
      return NextResponse.json({ error: MEDIA_FILE_SIZE_ERROR }, { status: 400 });
    }

    // 3. MIME type validation
    const uploadPolicy = UPLOAD_POLICIES[file.type as keyof typeof UPLOAD_POLICIES];
    if (!uploadPolicy) {
      return NextResponse.json({ error: 'Unsupported file type. Only JPEG, PNG, and PDF files are allowed' }, { status: 400 });
    }

    operation = 'validate.fileContents';
    const buffer = Buffer.from(await file.arrayBuffer());

    // 4. MIME type and magic bytes must agree before a file reaches storage.
    if (!uploadPolicy.hasValidSignature(buffer)) {
      return NextResponse.json({ error: 'Security validation failed: File signature mismatch' }, { status: 400 });
    }

    // 5. Generate secure filename
    const uniqueId = crypto.randomUUID();
    const safeFilename = `${uniqueId}${uploadPolicy.extension}`;
    const safeOriginalFilename = sanitizeOriginalFilename(file.name, uploadPolicy.extension);

    operation = 'storage.upload';
    const storedUpload = await storeUpload(buffer, safeFilename, file.type);
    cleanup = storedUpload.cleanup;

    operation = 'database.mediaItem.create';
    const mediaItem = await prisma.mediaItem.create({
      data: {
        id: uniqueId,
        fileName: safeOriginalFilename,
        fileUrl: storedUpload.fileUrl,
        mimeType: file.type,
        fileSize: file.size,
      },
    });

    cleanup = undefined;
    logger.info(`Admin uploaded file successfully: ${safeOriginalFilename} -> ${storedUpload.fileUrl}`, undefined, requestId);

    return NextResponse.json({
      success: true,
      media: {
        id: mediaItem.id,
        fileName: mediaItem.fileName,
        fileUrl: mediaItem.fileUrl,
        mimeType: mediaItem.mimeType,
        fileSize: mediaItem.fileSize,
      }
    }, { status: 201 });

  } catch (err) {
    if (cleanup) {
      try {
        await cleanup();
      } catch (cleanupError) {
        logger.error('Media upload cleanup failed', {
          operation: 'storage.cleanup',
          error: cleanupError,
        }, requestId);
      }
    }

    logger.error('Media upload endpoint exception', {
      operation,
      error: err,
    }, requestId);

    if (err instanceof StorageConfigurationError) {
      return NextResponse.json({ error: 'Media storage is not configured' }, { status: 503 });
    }

    return NextResponse.json({
      error: process.env.NODE_ENV === 'development' && err instanceof Error
        ? err.message
        : 'Internal server error occurred during upload',
      requestId,
    }, { status: 500 });
  }
}
