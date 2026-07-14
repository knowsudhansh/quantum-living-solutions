import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { prisma } from '../../../../lib/db';
import { logger } from '../../../../lib/utils/logger';

export const dynamic = 'force-dynamic';

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

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB limit

function sanitizeOriginalFilename(fileName: string, extension: string) {
  const baseName = path.basename(fileName, path.extname(fileName))
    .normalize('NFKC')
    .replace(/[^a-zA-Z0-9._-]+/g, '_')
    .replace(/^[_\.]+|[_\.]+$/g, '')
    .slice(0, 120);

  return `${baseName || 'upload'}${extension}`;
}

export async function POST(request: Request) {
  try {
    // 1. Session verification check (Admin auth)
    // The middleware already guards this path and sets unauthorized if cookie is missing.

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file || file.size === 0) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // 2. File size validation
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File size exceeds 5MB limit' }, { status: 400 });
    }

    // 3. MIME type validation
    const uploadPolicy = UPLOAD_POLICIES[file.type as keyof typeof UPLOAD_POLICIES];
    if (!uploadPolicy) {
      return NextResponse.json({ error: 'Unsupported file type. Only JPEG, PNG, and PDF files are allowed' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // 4. MIME type and magic bytes must agree before a file reaches storage.
    if (!uploadPolicy.hasValidSignature(buffer)) {
      return NextResponse.json({ error: 'Security validation failed: File signature mismatch' }, { status: 400 });
    }

    // 5. Generate secure filename
    const uniqueId = crypto.randomUUID();
    const safeFilename = `${uniqueId}${uploadPolicy.extension}`;
    const safeOriginalFilename = sanitizeOriginalFilename(file.name, uploadPolicy.extension);

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    
    // Ensure directory exists
    await fs.mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, safeFilename);
    await fs.writeFile(filePath, buffer);

    const fileUrl = `/uploads/${safeFilename}`;

    // 6. Register file inside database
    const mediaItem = await prisma.mediaItem.create({
      data: {
        id: uniqueId,
        fileName: safeOriginalFilename,
        fileUrl,
        mimeType: file.type,
        fileSize: file.size,
      },
    });

    logger.info(`Admin uploaded file successfully: ${safeOriginalFilename} -> ${fileUrl}`);

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
    logger.error('Media upload endpoint exception', err instanceof Error ? err : new Error(String(err)));
    return NextResponse.json({ error: 'Internal server error occurred during upload' }, { status: 500 });
  }
}
