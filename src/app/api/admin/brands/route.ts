import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import { logger } from '../../../../lib/utils/logger';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const brands = await prisma.brand.findMany({
      orderBy: { displayOrder: 'asc' },
      include: {
        logo: true
      }
    });
    return NextResponse.json({ success: true, brands });
  } catch (err) {
    logger.error('Brands GET exception', err instanceof Error ? err : new Error(String(err)));
    return NextResponse.json({ error: 'Internal server error occurred' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { name?: string; websiteUrl?: string; logoId?: string; displayOrder?: number };
    const { name, websiteUrl, logoId, displayOrder } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Brand name is required' }, { status: 400 });
    }

    const brand = await prisma.brand.create({
      data: {
        name: name.trim(),
        websiteUrl: websiteUrl || null,
        logoId: logoId || null,
        displayOrder: displayOrder || 0,
        isActive: true
      }
    });

    logger.info(`Brand registered successfully: ${brand.name}`);

    return NextResponse.json({ success: true, brand }, { status: 201 });
  } catch (err) {
    logger.error('Brand POST exception', err instanceof Error ? err : new Error(String(err)));
    return NextResponse.json({ error: 'Internal server error occurred' }, { status: 500 });
  }
}
