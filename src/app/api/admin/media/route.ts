import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { prisma } from '../../../../lib/db';
import { logger } from '../../../../lib/utils/logger';

export const dynamic = 'force-dynamic';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/svg+xml',
  'application/pdf'
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB limit

export async function POST(request: Request) {
  try {
    // 1. Session verification check (Admin auth)
    // The middleware already guards this path and sets unauthorized if cookie is missing.

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // 2. File size validation
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File size exceeds 5MB limit' }, { status: 400 });
    }

    // 3. MIME type validation
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Unsupported file type. Only JPEG, PNG, SVG, and PDF allowed' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // 4. Validate magic bytes (signatures verification)
    const fileHeader = buffer.slice(0, 4).toString('hex');
    const isPDF = fileHeader === '25504446'; // %PDF
    const isPNG = fileHeader === '89504e47'; // PNG
    const isJPG = fileHeader.startsWith('ffd8'); // JPEG/JPG
    
    // SVG is XML text, can check starting character
    const isSVG = file.type === 'image/svg+xml' && buffer.toString('utf-8', 0, 100).includes('<svg');

    if (!isPDF && !isPNG && !isJPG && !isSVG) {
      return NextResponse.json({ error: 'Security validation failed: File signature mismatch' }, { status: 400 });
    }

    // 5. Generate secure filename
    const fileExt = path.extname(file.name).toLowerCase() || (isPDF ? '.pdf' : isPNG ? '.png' : isSVG ? '.svg' : '.jpg');
    const uniqueId = crypto.randomUUID();
    const safeFilename = `${uniqueId}${fileExt}`;

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
        fileName: file.name,
        fileUrl,
        mimeType: file.type,
        fileSize: file.size,
      },
    });

    logger.info(`Admin uploaded file successfully: ${file.name} -> ${fileUrl}`);

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
