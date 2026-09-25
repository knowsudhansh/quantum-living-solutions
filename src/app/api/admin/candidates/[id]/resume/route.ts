import { NextResponse } from 'next/server';
import { prisma } from '../../../../../../lib/db';
import { readResume, ResumeStorageConfigurationError } from '../../../../../../lib/storage/resumes';
import { logger } from '../../../../../../lib/utils/logger';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type RouteContext = {
  params: Promise<{ id: string }>;
};

function contentDisposition(fileName: string, download: boolean) {
  const safeName = fileName.replace(/[\r\n"\\]/g, '_');
  const encodedName = encodeURIComponent(fileName);
  return `${download ? 'attachment' : 'inline'}; filename="${safeName}"; filename*=UTF-8''${encodedName}`;
}

export async function GET(request: Request, context: RouteContext) {
  const requestId = request.headers.get('x-request-id')?.slice(0, 64) || crypto.randomUUID();

  try {
    const { id } = await context.params;
    const candidate = await prisma.careerApplication.findUnique({
      where: { id },
      select: {
        resumeUrl: true,
        resumeFileName: true,
        resumeMimeType: true,
      },
    });

    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
    }

    if (candidate.resumeUrl.startsWith('/uploads/')) {
      return NextResponse.redirect(new URL(candidate.resumeUrl, request.url));
    }

    const result = await readResume(candidate.resumeUrl);
    if (!result || result.statusCode !== 200) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    const download = new URL(request.url).searchParams.get('download') === '1';
    const fileName = candidate.resumeFileName || 'resume';
    const headers = new Headers({
      'Content-Type': candidate.resumeMimeType || result.blob.contentType || 'application/octet-stream',
      'Content-Length': String(result.blob.size),
      'Content-Disposition': contentDisposition(fileName, download),
      'Cache-Control': 'private, no-store',
      ETag: result.blob.etag,
      'X-Content-Type-Options': 'nosniff',
    });

    return new Response(result.stream, { status: 200, headers });
  } catch (err) {
    logger.error('Admin resume download exception', { error: err }, requestId);

    if (err instanceof ResumeStorageConfigurationError) {
      return NextResponse.json({ error: 'Resume storage is not configured', requestId }, { status: 503 });
    }

    return NextResponse.json({ error: 'Unable to retrieve resume', requestId }, { status: 500 });
  }
}
