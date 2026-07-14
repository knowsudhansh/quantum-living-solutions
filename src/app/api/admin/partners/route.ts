import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateSlug } from '@/lib/utils/slugs';
import { ensureDefaultPartners } from '@/lib/partners/initializer';
import { logger } from '@/lib/utils/logger';

export const dynamic = 'force-dynamic';

export async function GET() {
  // Ensure default partners are initialized
  await ensureDefaultPartners();

  const partners = await prisma.partner.findMany({
    include: { logo: true },
    orderBy: { displayOrder: 'asc' },
  });

  return NextResponse.json({ success: true, partners });
}

function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function sanitizeText(text: string): string {
  return text.replace(/<[^>]*>/g, '').trim();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      name: string;
      tagline?: string;
      overview: string;
      partnership: string;
      services?: string[];
      websiteUrl: string;
      logoId?: string;
      displayOrder?: number;
      isActive?: boolean;
      showOnHome?: boolean;
      showOnAbout?: boolean;
      showOnFooter?: boolean;
    };

    if (!body.name?.trim()) {
      return NextResponse.json({ error: 'Partner name is required' }, { status: 400 });
    }
    if (!body.overview?.trim()) {
      return NextResponse.json({ error: 'Overview is required' }, { status: 400 });
    }
    if (!body.partnership?.trim()) {
      return NextResponse.json({ error: 'Partnership description is required' }, { status: 400 });
    }
    if (!body.websiteUrl?.trim()) {
      return NextResponse.json({ error: 'Website URL is required' }, { status: 400 });
    }

    // Security Hardening: Validate URL format and protocol
    if (!isValidUrl(body.websiteUrl)) {
      return NextResponse.json({ error: 'Invalid Website URL. Must be a valid http or https URL.' }, { status: 400 });
    }

    // Security Hardening: HTML/XSS Sanitization for text fields
    const sanitizedName = sanitizeText(body.name);
    const sanitizedTagline = body.tagline ? sanitizeText(body.tagline) : null;
    const sanitizedOverview = sanitizeText(body.overview);
    const sanitizedPartnership = sanitizeText(body.partnership);
    const sanitizedServices = (body.services || []).map(s => sanitizeText(s)).filter(Boolean);

    // Validate UUID format of logoId if provided
    let cleanLogoId: string | null = null;
    if (body.logoId) {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(body.logoId)) {
        cleanLogoId = body.logoId;
      } else {
        return NextResponse.json({ error: 'Invalid Logo ID format' }, { status: 400 });
      }
    }

    const slug = generateSlug(sanitizedName);

    const partner = await prisma.partner.create({
      data: {
        name: sanitizedName,
        slug,
        tagline: sanitizedTagline,
        overview: sanitizedOverview,
        partnership: sanitizedPartnership,
        services: sanitizedServices,
        websiteUrl: body.websiteUrl.trim(),
        logoId: cleanLogoId,
        displayOrder: body.displayOrder ?? 0,
        isActive: body.isActive ?? true,
        showOnHome: body.showOnHome ?? true,
        showOnAbout: body.showOnAbout ?? true,
        showOnFooter: body.showOnFooter ?? false,
      },
      include: { logo: true },
    });

    return NextResponse.json({ success: true, partner }, { status: 201 });
  } catch (err) {
    logger.error('POST /api/admin/partners failed', err);
    if (err instanceof Error && err.message.includes('Unique constraint')) {
      return NextResponse.json({ error: 'A partner with this name already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create partner' }, { status: 500 });
  }
}
