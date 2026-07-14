import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateSlug } from '@/lib/utils/slugs';
import { logger } from '@/lib/utils/logger';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const partner = await prisma.partner.findUnique({
    where: { id },
    include: { logo: true },
  });

  if (!partner) {
    return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, partner });
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await request.json() as {
      name?: string;
      tagline?: string;
      overview?: string;
      partnership?: string;
      services?: string[];
      websiteUrl?: string;
      logoId?: string | null;
      displayOrder?: number;
      isActive?: boolean;
      showOnHome?: boolean;
      showOnAbout?: boolean;
      showOnFooter?: boolean;
    };

    const existing = await prisma.partner.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    
    if (body.name !== undefined) {
      const sanitizedName = sanitizeText(body.name);
      if (!sanitizedName) {
        return NextResponse.json({ error: 'Partner name cannot be empty' }, { status: 400 });
      }
      updateData.name = sanitizedName;
      updateData.slug = generateSlug(sanitizedName);
    }
    
    if (body.tagline !== undefined) {
      updateData.tagline = body.tagline ? sanitizeText(body.tagline) : null;
    }
    
    if (body.overview !== undefined) {
      const sanitizedOverview = sanitizeText(body.overview);
      if (!sanitizedOverview) {
        return NextResponse.json({ error: 'Overview cannot be empty' }, { status: 400 });
      }
      updateData.overview = sanitizedOverview;
    }
    
    if (body.partnership !== undefined) {
      const sanitizedPartnership = sanitizeText(body.partnership);
      if (!sanitizedPartnership) {
        return NextResponse.json({ error: 'Partnership description cannot be empty' }, { status: 400 });
      }
      updateData.partnership = sanitizedPartnership;
    }
    
    if (body.services !== undefined) {
      updateData.services = body.services.map(s => sanitizeText(s)).filter(Boolean);
    }
    
    if (body.websiteUrl !== undefined) {
      if (!body.websiteUrl.trim()) {
        return NextResponse.json({ error: 'Website URL cannot be empty' }, { status: 400 });
      }
      if (!isValidUrl(body.websiteUrl)) {
        return NextResponse.json({ error: 'Invalid Website URL. Must be a valid http or https URL.' }, { status: 400 });
      }
      updateData.websiteUrl = body.websiteUrl.trim();
    }
    
    if (body.logoId !== undefined) {
      if (body.logoId) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(body.logoId)) {
          return NextResponse.json({ error: 'Invalid Logo ID format' }, { status: 400 });
        }
        updateData.logoId = body.logoId;
      } else {
        updateData.logoId = null;
      }
    }
    
    if (body.displayOrder !== undefined) updateData.displayOrder = body.displayOrder;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    if (body.showOnHome !== undefined) updateData.showOnHome = body.showOnHome;
    if (body.showOnAbout !== undefined) updateData.showOnAbout = body.showOnAbout;
    if (body.showOnFooter !== undefined) updateData.showOnFooter = body.showOnFooter;

    const partner = await prisma.partner.update({
      where: { id },
      data: updateData,
      include: { logo: true },
    });

    return NextResponse.json({ success: true, partner });
  } catch (err) {
    logger.error('PUT /api/admin/partners/[id] failed', err);
    return NextResponse.json({ error: 'Failed to update partner' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const existing = await prisma.partner.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
  }

  await prisma.partner.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
